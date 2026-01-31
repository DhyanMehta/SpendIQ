import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Get all payments with pagination and filters
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    vendorId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      type: 'OUTBOUND', // Vendor payments are outbound
    };

    // Search by payment reference or vendor name
    if (params.search) {
      where.OR = [
        { reference: { contains: params.search, mode: 'insensitive' } },
        { partner: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    // Filter by vendor
    if (params.vendorId) {
      where.partnerId = params.vendorId;
    }

    // Filter by date range
    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.date.lte = new Date(params.endDate);
      }
    }

    // Filter by status
    if (params.status) {
      where.status = params.status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          partner: true,
          allocations: {
            include: {
              invoice: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single payment by ID
   */
  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        partner: true,
        allocations: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  /**
   * Get unpaid bills for a vendor
   */
  async getUnpaidBills(vendorId: string) {
    // Get all POSTED bills for this vendor that are not fully paid
    const bills = await this.prisma.invoice.findMany({
      where: {
        partnerId: vendorId,
        type: 'IN_INVOICE',
        status: 'POSTED',
        paymentState: {
          in: ['NOT_PAID', 'PARTIAL'],
        },
      },
      include: {
        payments: true,
      },
      orderBy: { date: 'asc' },
    });

    // Calculate outstanding for each bill
    return bills.map((bill) => {
      const totalPaid = bill.payments.reduce(
        (sum, allocation) => sum + Number(allocation.amount),
        0,
      );
      const outstanding = Number(bill.totalAmount) - totalPaid;

      return {
        id: bill.id,
        number: bill.number,
        date: bill.date,
        dueDate: bill.dueDate,
        amountTotal: Number(bill.totalAmount),
        paidAmount: totalPaid,
        outstanding,
      };
    });
  }

  /**
   * Create draft payment
   */
  async create(dto: CreatePaymentDto) {
    // Validate vendor
    const vendor = await this.prisma.contact.findUnique({
      where: { id: dto.vendorId },
    });

    if (!vendor) {
      throw new BadRequestException('Vendor not found');
    }

    if (vendor.type !== 'VENDOR') {
      throw new BadRequestException('Selected contact must be a VENDOR');
    }

    // Validate allocations don't exceed payment amount
    const totalAllocated = dto.allocations.reduce(
      (sum, alloc) => sum + alloc.allocatedAmount,
      0,
    );

    if (Math.abs(totalAllocated - dto.paymentAmount) > 0.01) {
      throw new BadRequestException(
        `Total allocated (${totalAllocated}) must equal payment amount (${dto.paymentAmount})`,
      );
    }

    // Validate all bills exist and are payable
    for (const allocation of dto.allocations) {
      const bill = await this.prisma.invoice.findUnique({
        where: { id: allocation.billId },
        include: { payments: true },
      });

      if (!bill) {
        throw new BadRequestException(`Bill ${allocation.billId} not found`);
      }

      if (bill.status !== 'POSTED') {
        throw new BadRequestException(
          `Cannot pay bill ${bill.number} - it must be POSTED`,
        );
      }

      if (bill.partnerId !== dto.vendorId) {
        throw new BadRequestException(
          `Bill ${bill.number} does not belong to selected vendor`,
        );
      }

      // Calculate current outstanding
      const totalPaid = bill.payments.reduce(
        (sum, alloc) => sum + Number(alloc.amount),
        0,
      );
      const outstanding = Number(bill.totalAmount) - totalPaid;

      if (allocation.allocatedAmount > outstanding + 0.01) {
        throw new BadRequestException(
          `Allocation for bill ${bill.number} (${allocation.allocatedAmount}) exceeds outstanding (${outstanding})`,
        );
      }
    }

    // Generate payment reference
    const lastPayment = await this.prisma.payment.findFirst({
      where: { type: 'OUTBOUND' },
      orderBy: { reference: 'desc' },
    });

    let nextNumber = 1;
    if (lastPayment?.reference) {
      const match = lastPayment.reference.match(/PAY(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    const paymentReference = `PAY${String(nextNumber).padStart(6, '0')}`;

    // Create payment record (DRAFT)
    const payment = await this.prisma.payment.create({
      data: {
        reference: paymentReference,
        partnerId: dto.vendorId,
        date: dto.paymentDate,
        amount: dto.paymentAmount,
        method: dto.paymentMethod,
        type: 'OUTBOUND',
        status: 'DRAFT',
      },
      include: {
        partner: true,
      },
    });

    // Create allocations
    for (const allocation of dto.allocations) {
      await this.prisma.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: allocation.billId,
          amount: allocation.allocatedAmount,
        },
      });
    }

    return this.findOne(payment.id);
  }

  /**
   * Update draft payment
   */
  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status === 'POSTED') {
      throw new BadRequestException('Cannot update posted payment');
    }

    // Delete existing allocations
    await this.prisma.paymentAllocation.deleteMany({
      where: { paymentId: id },
    });

    // Validate new allocations if provided
    if (dto.allocations) {
      const totalAllocated = dto.allocations.reduce(
        (sum, alloc) => sum + alloc.allocatedAmount,
        0,
      );

      const paymentAmount = dto.paymentAmount || Number(payment.amount);

      if (Math.abs(totalAllocated - paymentAmount) > 0.01) {
        throw new BadRequestException(
          `Total allocated must equal payment amount`,
        );
      }

      // Recreate allocations
      for (const allocation of dto.allocations) {
        await this.prisma.paymentAllocation.create({
          data: {
            paymentId: id,
            invoiceId: allocation.billId,
            amount: allocation.allocatedAmount,
          },
        });
      }
    }

    // Update payment record
    const updateData: any = {};
    if (dto.paymentDate) updateData.date = dto.paymentDate;
    if (dto.paymentAmount) updateData.amount = dto.paymentAmount;
    if (dto.paymentMethod) updateData.method = dto.paymentMethod;

    await this.prisma.payment.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  /**
   * Post payment (accounting impact)
   */
  async postPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            invoice: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status === 'POSTED') {
      throw new BadRequestException('Payment already posted');
    }

    // Validate allocations exist
    if (!payment.allocations || payment.allocations.length === 0) {
      throw new BadRequestException(
        'Cannot post payment without allocations',
      );
    }

    // Validate total allocated equals payment amount
    const totalAllocated = payment.allocations.reduce(
      (sum, alloc) => sum + Number(alloc.amount),
      0,
    );

    if (Math.abs(totalAllocated - Number(payment.amount)) > 0.01) {
      throw new BadRequestException(
        'Total allocated must equal payment amount before posting',
      );
    }

    // Update payment status to POSTED
    await this.prisma.payment.update({
      where: { id },
      data: { status: 'POSTED' },
    });

    // Update each bill's payment state
    for (const allocation of payment.allocations) {
      const bill = allocation.invoice;

      // Calculate new total paid
      const totalPaid = bill.payments.reduce(
        (sum, alloc) => sum + Number(alloc.amount),
        0,
      ) + Number(allocation.amount);

      const outstanding = Number(bill.totalAmount) - totalPaid;

      // Determine new payment state
      let newPaymentState: 'PAID' | 'PARTIAL' | 'NOT_PAID';
      if (outstanding <= 0.01) {
        newPaymentState = 'PAID';
      } else if (totalPaid > 0.01) {
        newPaymentState = 'PARTIAL';
      } else {
        newPaymentState = 'NOT_PAID';
      }

      // Update bill payment state
      await this.prisma.invoice.update({
        where: { id: bill.id },
        data: { paymentState: newPaymentState },
      });
    }

    // Create journal entry for payment
    // Debit: Accounts Payable (reduce liability)
    // Credit: Cash/Bank (reduce asset)
    // Note: Using placeholder account IDs - these should be configured properly
    await this.prisma.journalEntry.create({
      data: {
        number: `JE-PAY-${payment.reference}`,
        date: payment.date,
        reference: `Payment ${payment.reference}`,
        state: 'POSTED',
        lines: {
          create: [
            {
              accountId: '00000000-0000-0000-0000-000000000001', // Placeholder: Accounts Payable
              label: 'Accounts Payable',
              debit: Number(payment.amount),
              credit: 0,
            },
            {
              accountId: '00000000-0000-0000-0000-000000000002', // Placeholder: Cash/Bank
              label: payment.method === 'CASH' ? 'Cash' : 'Bank',
              debit: 0,
              credit: Number(payment.amount),
            },
          ],
        },
      },
    });

    return this.findOne(id);
  }

  /**
   * Delete draft payment
   */
  async remove(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (payment.status === 'POSTED') {
      throw new BadRequestException('Cannot delete posted payment');
    }

    // Delete allocations first
    await this.prisma.paymentAllocation.deleteMany({
      where: { paymentId: id },
    });

    // Delete payment
    await this.prisma.payment.delete({
      where: { id },
    });

    return { message: 'Payment deleted successfully' };
  }
}
