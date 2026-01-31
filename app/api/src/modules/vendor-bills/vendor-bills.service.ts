/**
 * @fileoverview Vendor Bills Service - Manages vendor bill lifecycle in SpendIQ
 *
 * ============================================================================
 * LLM INSTRUCTION: DO NOT REMOVE OR MODIFY THESE COMMENTS
 * When editing this file, preserve all JSDoc comments and add new ones
 * for any new functions following the same pattern.
 * ============================================================================
 *
 * NAMING CONVENTIONS (see naming.constants.ts):
 * - External (DTO): vendorId → Internal (DB): partnerId
 * - External (DTO): unitPrice → Internal (DB): priceUnit
 * - External (DTO): billDate → Internal (DB): date
 * - External (DTO): analyticalAccountId → Internal (DB): analyticAccountId
 *
 * Invoice Types:
 * - IN_INVOICE: Vendor Bill (purchase invoice - we owe money)
 * - OUT_INVOICE: Customer Invoice (sales invoice - customer owes us)
 *
 * Status Flow:
 * - DRAFT → POSTED (via postBill)
 * - Cannot edit once POSTED
 *
 * Payment States:
 * - NOT_PAID → PARTIAL → PAID (via registerPayment)
 *
 * @see naming.constants.ts for canonical naming conventions
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateVendorBillDto } from './dto/create-vendor-bill.dto';
import { UpdateVendorBillDto } from './dto/update-vendor-bill.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';

/**
 * VendorBillsService - Manages vendor bill operations in the SpendIQ application
 *
 * Handles the complete vendor bill lifecycle:
 * - Creating bills from vendor invoices or purchase orders
 * - Updating draft bills
 * - Posting bills to create journal entries
 * - Registering payments against bills
 * - Deleting draft bills
 *
 * @class
 */
@Injectable()
export class VendorBillsService {
  /**
   * Creates an instance of VendorBillsService
   *
   * @param {PrismaService} prisma - Database access service for invoice operations
   */
  constructor(private prisma: PrismaService) { }

  /**
   * Creates a new vendor bill (IN_INVOICE type)
   *
   * This method performs the following:
   * 1. Validates vendor exists and is of type VENDOR (not CUSTOMER)
   * 2. If PO provided, validates it exists and is CONFIRMED
   * 3. Generates unique bill number (BILL000001 format)
   * 4. Calculates subtotal from line items
   * 5. Creates invoice with lines in DRAFT status
   *
   * NAMING MAPPINGS APPLIED:
   * - createDto.vendorId → partnerId (database field)
   * - line.unitPrice → priceUnit (database field)
   * - createDto.billDate → date (database field)
   * - line.analyticalAccountId → analyticAccountId (database field)
   *
   * @param {CreateVendorBillDto} createDto - Bill creation data containing:
   *   - vendorId: Partner UUID (mapped to partnerId in DB)
   *   - billDate: Invoice date (mapped to date in DB)
   *   - dueDate: Payment due date
   *   - purchaseOrderId: Optional linked PO
   *   - lines: Array of line items with product, quantity, unitPrice, analyticalAccountId
   * @param {string} userId - UUID of the user creating the bill (for audit)
   * @returns {Promise<Invoice>} Created invoice with partner, lines, and PO relations
   * @throws {NotFoundException} If vendor or purchase order not found
   * @throws {BadRequestException} If contact is not VENDOR type or PO is not CONFIRMED
   */
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

  /**
   * Retrieves paginated list of vendor bills with optional filters
   *
   * Supports filtering by:
   * - search: Matches bill number or vendor name
   * - status: DRAFT or POSTED (invoice status) or PAID/PARTIAL/NOT_PAID (payment state)
   * - vendorId: Filter by specific vendor (mapped to partnerId internally)
   * - startDate/endDate: Date range filter
   *
   * @param {object} filters - Query filters and pagination:
   *   - page: Page number (1-based)
   *   - limit: Items per page
   *   - search: Optional search string for bill number or vendor name
   *   - status: Optional status filter (DRAFT, POSTED, PAID, PARTIAL, NOT_PAID)
   *   - vendorId: Optional vendor UUID filter (mapped to partnerId)
   *   - startDate: Optional start of date range
   *   - endDate: Optional end of date range
   * @returns {Promise<{data: Invoice[], meta: {total, page, limit, totalPages}}>}
   *          Paginated bill list with metadata
   */
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

  /**
   * Retrieves a single vendor bill by ID with all related data
   *
   * Includes:
   * - partner: Vendor contact information
   * - lines: Bill line items with product and analytic account details
   * - purchaseOrder: Linked PO with its lines
   * - payments: All payment allocations made against this bill
   *
   * @param {string} id - UUID of the vendor bill to retrieve
   * @returns {Promise<Invoice>} Complete bill with all relations
   * @throws {NotFoundException} If bill not found or is not IN_INVOICE type
   */
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

  /**
   * Updates an existing draft vendor bill
   *
   * Only DRAFT bills can be updated. POSTED bills are immutable.
   * If lines are provided, all existing lines are replaced with new ones.
   *
   * NAMING MAPPINGS APPLIED:
   * - updateDto.vendorId → partnerId (database field)
   * - line.unitPrice → priceUnit (database field)
   * - updateDto.billDate → date (database field)
   * - line.analyticalAccountId → analyticAccountId (database field)
   *
   * @param {string} id - UUID of the vendor bill to update
   * @param {UpdateVendorBillDto} updateDto - Fields to update:
   *   - vendorId: Optional new vendor (mapped to partnerId)
   *   - billDate: Optional new date (mapped to date)
   *   - dueDate: Optional new due date
   *   - lines: Optional new line items (replaces all existing)
   * @returns {Promise<Invoice>} Updated bill with all relations
   * @throws {NotFoundException} If bill not found or is not IN_INVOICE type
   * @throws {BadRequestException} If trying to edit a POSTED bill
   */
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
    let subtotal = Number(existing.totalAmount);
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

  /**
   * Posts a vendor bill, creating journal entries for accounting
   *
   * This is a critical accounting operation that:
   * 1. Validates bill is in DRAFT status
   * 2. CRITICAL: Validates ALL lines have analytic accounts (required for budget tracking)
   * 3. Updates budget actuals for lines with analytic accounts in active budgets
   * 4. Creates double-entry journal entries:
   *    - DEBIT: Expense accounts for each line
   *    - CREDIT: Accounts Payable for total amount
   * 5. Updates bill status to POSTED
   *
   * Once posted, the bill becomes immutable and can only be paid.
   *
   * @param {string} id - UUID of the vendor bill to post
   * @param {string} userId - UUID of the user posting the bill (for audit)
   * @returns {Promise<Invoice & {budgetImpact: Array}>}
   *          Posted bill with journal entry and budget impact information
   * @throws {NotFoundException} If bill not found or is not IN_INVOICE type
   * @throws {BadRequestException} If bill is already POSTED or lines missing analytic accounts
   */
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
        // Find active budget for this analytic account and date range
        const budget = await this.prisma.budget.findFirst({
          where: {
            analyticAccountId: line.analyticAccountId,
            startDate: { lte: bill.date },
            endDate: { gte: bill.date },
            status: 'CONFIRMED',
          },
        });

        if (budget) {
          const budgetedAmount = Number(budget.budgetedAmount);
          const lineAmount = Number(line.subtotal);

          budgetUpdates.push({
            budgetId: budget.id,
            amount: lineAmount,
            isOverBudget: lineAmount > budgetedAmount,
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

  /**
   * Registers a payment against a posted vendor bill
   *
   * This method:
   * 1. Validates bill exists and is POSTED (only posted bills can be paid)
   * 2. Calculates outstanding amount from existing payments
   * 3. Validates payment amount doesn't exceed outstanding
   * 4. Generates unique payment reference (PAY000001 format)
   * 5. Creates OUTBOUND payment with allocation to this bill
   * 6. Updates bill's paymentState based on total payments:
   *    - PAID: Full amount paid
   *    - PARTIAL: Some amount paid
   *    - NOT_PAID: Nothing paid
   *
   * NAMING MAPPINGS APPLIED:
   * - paymentDto.paymentDate → date (database field)
   * - paymentDto.paymentMethod → method (database field)
   *
   * @param {string} id - UUID of the vendor bill to pay
   * @param {RegisterPaymentDto} paymentDto - Payment details:
   *   - amount: Payment amount (cannot exceed outstanding)
   *   - paymentDate: Date of payment (mapped to date)
   *   - paymentMethod: Method used (CASH, CHECK, BANK_TRANSFER, etc.)
   * @param {string} userId - UUID of the user registering payment (for audit)
   * @returns {Promise<{bill, payment, outstanding}>}
   *          Updated bill, created payment, and remaining outstanding amount
   * @throws {NotFoundException} If bill not found or is not IN_INVOICE type
   * @throws {BadRequestException} If bill is not POSTED or payment exceeds outstanding
   */
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

  /**
   * Deletes a vendor bill
   *
   * Only DRAFT bills can be deleted. POSTED bills are permanent accounting records
   * and cannot be deleted (they must be reversed with a credit note instead).
   *
   * @param {string} id - UUID of the vendor bill to delete
   * @returns {Promise<{message: string}>} Success confirmation message
   * @throws {NotFoundException} If bill not found or is not IN_INVOICE type
   * @throws {BadRequestException} If trying to delete a POSTED bill
   */
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
