import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateVendorBillDto } from './dto/create-vendor-bill.dto';
import { UpdateVendorBillDto } from './dto/update-vendor-bill.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';

@Injectable()
export class VendorBillsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateVendorBillDto, userId: string) {
    // Verify vendor exists and is type VENDOR
    const vendor = await this.prisma.contact.findUnique({
      where: { id: createDto.vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (vendor.type !== 'VENDOR') {
      throw new BadRequestException('Contact must be of type VENDOR');
    }

    // If PO is provided, verify it exists and is confirmed
    if (createDto.purchaseOrderId) {
      const po = await (this.prisma as any).purchaseOrder.findUnique({
        where: { id: createDto.purchaseOrderId },
      });

      if (!po) {
        throw new NotFoundException('Purchase Order not found');
      }

      if (po.status !== 'CONFIRMED') {
        throw new BadRequestException('Can only create bills from confirmed Purchase Orders');
      }
    }

    // Generate bill number
    const count = await this.prisma.invoice.count({
      where: { type: 'IN_INVOICE' },
    });
    const billNumber = `BILL${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    const subtotal = createDto.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );

    const bill = await this.prisma.invoice.create({
      data: {
        number: billNumber,
        type: 'IN_INVOICE',
        partnerId: createDto.vendorId,
        date: createDto.billDate,
        dueDate: createDto.dueDate,
        status: 'DRAFT',
        paymentState: 'NOT_PAID',
        totalAmount: subtotal,
        taxAmount: 0,
        purchaseOrderId: createDto.purchaseOrderId,
        lines: {
          create: createDto.lines.map((line) => ({
            productId: line.productId,
            label: line.description,
            quantity: line.quantity,
            priceUnit: line.unitPrice,
            subtotal: line.quantity * line.unitPrice,
            taxRate: 0,
            analyticAccountId: line.analyticalAccountId,
          })),
        },
      },
      include: {
        partner: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        purchaseOrder: true,
      },
    });

    return bill;
  }

  async findAll(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    vendorId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const { page, limit, search, status, vendorId, startDate, endDate } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      type: 'IN_INVOICE', // Only vendor bills
    };

    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { partner: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      if (status === 'DRAFT' || status === 'POSTED') {
        where.status = status;
      } else if (status === 'PAID' || status === 'PARTIAL' || status === 'NOT_PAID') {
        where.paymentState = status;
      }
    }

    if (vendorId) {
      where.partnerId = vendorId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    const [bills, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          partner: {
            select: {
              id: true,
              name: true,
            },
          },
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: bills,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const bill = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        partner: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        purchaseOrder: {
          include: {
            lines: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!bill || bill.type !== 'IN_INVOICE') {
      throw new NotFoundException('Vendor Bill not found');
    }

    return bill;
  }

  async update(id: string, updateDto: UpdateVendorBillDto) {
    const existing = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!existing || existing.type !== 'IN_INVOICE') {
      throw new NotFoundException('Vendor Bill not found');
    }

    if (existing.status === 'POSTED') {
      throw new BadRequestException('Cannot edit posted Vendor Bill');
    }

    // Calculate new totals if lines provided
    let subtotal = existing.totalAmount;
    if (updateDto.lines) {
      subtotal = updateDto.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0
      );

      // Delete existing lines and create new ones
      await this.prisma.invoiceLine.deleteMany({
        where: { invoiceId: id },
      });
    }

    const bill = await this.prisma.invoice.update({
      where: { id },
      data: {
        partnerId: updateDto.vendorId,
        date: updateDto.billDate,
        dueDate: updateDto.dueDate,
        totalAmount: subtotal,
        ...(updateDto.lines && {
          lines: {
            create: updateDto.lines.map((line) => ({
              productId: line.productId,
              label: line.description,
              quantity: line.quantity,
              priceUnit: line.unitPrice,
              subtotal: line.quantity * line.unitPrice,
              taxRate: 0,
              analyticAccountId: line.analyticalAccountId,
            })),
          },
        }),
      },
      include: {
        partner: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        purchaseOrder: true,
      },
    });

    return bill;
  }

  async postBill(id: string, userId: string) {
    const bill = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            analyticAccount: true,
            product: true,
          },
        },
        partner: true,
      },
    });

    if (!bill || bill.type !== 'IN_INVOICE') {
      throw new NotFoundException('Vendor Bill not found');
    }

    if (bill.status === 'POSTED') {
      throw new BadRequestException('Bill is already posted');
    }

    // CRITICAL: Validate all lines have analytic accounts
    const linesWithoutAnalytics = bill.lines.filter(line => !line.analyticAccountId);
    if (linesWithoutAnalytics.length > 0) {
      throw new BadRequestException(
        `Cannot post bill: ${linesWithoutAnalytics.length} line(s) missing Analytic Account. All lines must have an analytic account before posting.`
      );
    }

    // Update budget actuals for each line
    const budgetUpdates = [];
    for (const line of bill.lines) {
      if (line.analyticAccountId) {
        // Find active budget for this analytic account and date
        const budget = await this.prisma.budget.findFirst({
          where: {
            departmentId: line.analyticAccountId,
            fiscalYear: bill.date.getFullYear(),
            status: 'APPROVED',
          },
          include: {
            lines: {
              where: {
                productId: line.productId,
              },
            },
          },
        });

        if (budget && budget.lines.length > 0) {
          const budgetLine = budget.lines[0];
          const currentActual = Number(budgetLine.plannedAmount || 0);
          const newActual = currentActual + Number(line.subtotal);
          
          budgetUpdates.push({
            budgetId: budget.id,
            lineId: budgetLine.id,
            newActual,
            isOverBudget: newActual > Number(budgetLine.plannedAmount),
          });
        }
      }
    }

    // Create journal entry for accounting
    const journalEntry = await this.prisma.journalEntry.create({
      data: {
        date: bill.date,
        reference: bill.number,
        state: 'POSTED',
        lines: {
          create: [
            // Debit: Expense accounts (one per analytic)
            ...bill.lines.map(line => ({
              accountId: '00000000-0000-0000-0000-000000000001', // Mock expense account
              partnerId: bill.partnerId,
              label: line.label,
              debit: Number(line.subtotal),
              credit: 0,
              analyticAccountId: line.analyticAccountId,
            })),
            // Credit: Accounts Payable
            {
              accountId: '00000000-0000-0000-0000-000000000002', // Mock AP account
              partnerId: bill.partnerId,
              label: `Vendor Bill ${bill.number}`,
              debit: 0,
              credit: Number(bill.totalAmount),
            },
          ],
        },
      },
    });

    // Update bill status
    const updatedBill = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'POSTED',
        journalEntryId: journalEntry.id,
      },
      include: {
        partner: true,
        lines: {
          include: {
            product: true,
            analyticAccount: true,
          },
        },
        journalEntry: true,
        purchaseOrder: true,
      },
    });

    return {
      ...updatedBill,
      budgetImpact: budgetUpdates,
    };
  }

  async registerPayment(id: string, paymentDto: RegisterPaymentDto, userId: string) {
    const bill = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: true,
      },
    });

    if (!bill || bill.type !== 'IN_INVOICE') {
      throw new NotFoundException('Vendor Bill not found');
    }

    if (bill.status !== 'POSTED') {
      throw new BadRequestException('Can only register payments for posted bills');
    }

    // Calculate outstanding amount
    const totalPaid = bill.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const outstanding = Number(bill.totalAmount) - totalPaid;

    if (paymentDto.amount > outstanding) {
      throw new BadRequestException(`Payment amount (₹${paymentDto.amount}) exceeds outstanding amount (₹${outstanding})`);
    }

    // Generate payment reference
    const paymentCount = await this.prisma.payment.count();
    const paymentReference = `PAY${String(paymentCount + 1).padStart(6, '0')}`;

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        reference: paymentReference,
        partnerId: bill.partnerId,
        date: paymentDto.paymentDate,
        amount: paymentDto.amount,
        type: 'OUTBOUND',
        method: paymentDto.paymentMethod,
        status: 'POSTED',
        allocations: {
          create: {
            invoiceId: bill.id,
            amount: paymentDto.amount,
          },
        },
      },
    });

    // Update bill payment state
    const newTotalPaid = totalPaid + paymentDto.amount;
    let paymentState: 'NOT_PAID' | 'PARTIAL' | 'PAID' = 'NOT_PAID';
    
    if (newTotalPaid >= Number(bill.totalAmount)) {
      paymentState = 'PAID';
    } else if (newTotalPaid > 0) {
      paymentState = 'PARTIAL';
    }

    const updatedBill = await this.prisma.invoice.update({
      where: { id },
      data: {
        paymentState,
      },
      include: {
        partner: true,
        payments: {
          include: {
            payment: true,
          },
        },
      },
    });

    return {
      bill: updatedBill,
      payment,
      outstanding: outstanding - paymentDto.amount,
    };
  }

  async remove(id: string) {
    const bill = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!bill || bill.type !== 'IN_INVOICE') {
      throw new NotFoundException('Vendor Bill not found');
    }

    if (bill.status === 'POSTED') {
      throw new BadRequestException('Cannot delete posted Vendor Bill');
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Vendor Bill deleted successfully' };
  }
}
