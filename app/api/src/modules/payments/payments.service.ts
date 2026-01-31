/**
 * @fileoverview Payments Service - Manages vendor payment lifecycle in SpendIQ
 *
 * ============================================================================
 * LLM INSTRUCTION: DO NOT REMOVE OR MODIFY THESE COMMENTS
 * When editing this file, preserve all JSDoc comments and add new ones
 * for any new functions following the same pattern.
 * ============================================================================
 *
 * NAMING CONVENTIONS (see naming.constants.ts):
 * - External (DTO): vendorId → Internal (DB): partnerId
 * - External (DTO): paymentDate → Internal (DB): date
 * - External (DTO): paymentAmount → Internal (DB): amount
 * - External (DTO): paymentMethod → Internal (DB): method
 * - External (DTO): allocatedAmount → Internal (DB): amount (on PaymentAllocation)
 * - External (DTO): billId → Internal (DB): invoiceId (on PaymentAllocation)
 *
 * Payment Types:
 * - OUTBOUND: Vendor payments (we pay money out)
 * - INBOUND: Customer receipts (we receive money)
 *
 * Status Flow:
 * - DRAFT → POSTED (via postPayment)
 * - Cannot edit or delete once POSTED
 *
 * Allocation Logic:
 * - Each payment can be split across multiple bills
 * - Total allocated must equal payment amount
 * - Cannot allocate more than outstanding on any bill
 *
 * @see naming.constants.ts for canonical naming conventions
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

/**
 * PaymentsService - Manages vendor payment operations in the SpendIQ application
 *
 * Handles the complete payment lifecycle:
 * - Creating draft payments with bill allocations
 * - Updating draft payments
 * - Posting payments to update bill payment states
 * - Creating accounting journal entries
 * - Deleting draft payments
 *
 * @class
 */
@Injectable()
export class PaymentsService {
  /**
   * Creates an instance of PaymentsService
   *
   * @param {PrismaService} prisma - Database access service for payment operations
   */
  constructor(private prisma: PrismaService) { }

  /**
   * Retrieves paginated list of vendor payments (OUTBOUND type) with optional filters
   *
   * Supports filtering by:
   * - search: Matches payment reference or vendor name
   * - vendorId: Filter by specific vendor (mapped to partnerId internally)
   * - startDate/endDate: Date range filter
   * - status: DRAFT or POSTED
   *
   * NAMING MAPPINGS APPLIED:
   * - params.vendorId → partnerId (database field)
   *
   * @param {object} params - Query filters and pagination:
   *   - page: Page number (1-based, defaults to 1)
   *   - limit: Items per page (defaults to 10)
   *   - search: Optional search string for reference or vendor name
   *   - vendorId: Optional vendor UUID filter (mapped to partnerId)
   *   - startDate: Optional start of date range (ISO string)
   *   - endDate: Optional end of date range (ISO string)
   *   - status: Optional status filter (DRAFT or POSTED)
   * @returns {Promise<{data: Payment[], pagination: {page, limit, total, totalPages}}>}
   *          Paginated payment list with metadata
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
   * Retrieves a single payment by ID with all related data
   *
   * Includes:
   * - partner: Vendor contact information
   * - allocations: Bill allocations with invoice details
   *
   * @param {string} id - UUID of the payment to retrieve
   * @returns {Promise<Payment>} Complete payment with all relations
   * @throws {NotFoundException} If payment not found
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
   * Retrieves all unpaid or partially paid bills for a specific vendor
   *
   * Used to populate the bill selection when creating a new payment.
   * Only returns POSTED bills with NOT_PAID or PARTIAL payment state.
   *
   * @param {string} vendorId - UUID of the vendor (mapped to partnerId internally)
   * @returns {Promise<Array<{id, number, date, dueDate, amountTotal, paidAmount, outstanding}>>}
   *          List of unpaid bills with calculated outstanding amounts
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
   * Creates a new draft payment with bill allocations
   *
   * This method performs the following:
   * 1. Validates vendor exists and is of type VENDOR
   * 2. Validates total allocated equals payment amount
   * 3. Validates all bills exist, are POSTED, and belong to the vendor
   * 4. Validates allocations don't exceed outstanding amounts
   * 5. Generates unique payment reference (PAY000001 format)
   * 6. Creates payment in DRAFT status with allocations
   *
   * NAMING MAPPINGS APPLIED:
   * - dto.vendorId → partnerId (database field)
   * - dto.paymentDate → date (database field)
   * - dto.paymentAmount → amount (database field)
   * - dto.paymentMethod → method (database field)
   * - allocation.billId → invoiceId (database field)
   * - allocation.allocatedAmount → amount (on PaymentAllocation)
   *
   * @param {CreatePaymentDto} dto - Payment creation data containing:
   *   - vendorId: Partner UUID (mapped to partnerId)
   *   - paymentDate: Payment date (mapped to date)
   *   - paymentAmount: Total payment amount (mapped to amount)
   *   - paymentMethod: Method (CASH, CHECK, BANK_TRANSFER, etc.)
   *   - allocations: Array of {billId, allocatedAmount} for each bill to pay
   * @returns {Promise<Payment>} Created payment with partner and allocations
   * @throws {BadRequestException} If vendor not found, not VENDOR type,
   *         allocations don't match payment amount, or allocation exceeds outstanding
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
   * Updates an existing draft payment
   *
   * Only DRAFT payments can be updated. POSTED payments are immutable.
   * If allocations are provided, all existing allocations are replaced.
   *
   * NAMING MAPPINGS APPLIED:
   * - dto.paymentDate → date (database field)
   * - dto.paymentAmount → amount (database field)
   * - dto.paymentMethod → method (database field)
   * - allocation.billId → invoiceId (database field)
   * - allocation.allocatedAmount → amount (on PaymentAllocation)
   *
   * @param {string} id - UUID of the payment to update
   * @param {UpdatePaymentDto} dto - Fields to update:
   *   - paymentDate: Optional new date
   *   - paymentAmount: Optional new amount
   *   - paymentMethod: Optional new method
   *   - allocations: Optional new allocations (replaces all existing)
   * @returns {Promise<Payment>} Updated payment with all relations
   * @throws {NotFoundException} If payment not found
   * @throws {BadRequestException} If payment is POSTED or allocations don't match amount
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
   * Posts a payment, creating accounting entries and updating bill payment states
   *
   * This is a critical accounting operation that:
   * 1. Validates payment is in DRAFT status
   * 2. Validates allocations exist and equal payment amount
   * 3. Updates payment status to POSTED
   * 4. Updates each allocated bill's paymentState:
   *    - PAID: Full amount paid (outstanding <= 0.01)
   *    - PARTIAL: Some amount paid
   *    - NOT_PAID: Nothing paid
   * 5. Creates double-entry journal entry:
   *    - DEBIT: Accounts Payable (reduce liability)
   *    - CREDIT: Cash/Bank (reduce asset)
   *
   * Once posted, the payment becomes immutable and cannot be edited or deleted.
   *
   * @param {string} id - UUID of the payment to post
   * @returns {Promise<Payment>} Posted payment with all relations
   * @throws {NotFoundException} If payment not found
   * @throws {BadRequestException} If payment is already POSTED, has no allocations,
   *         or allocations don't equal payment amount
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
   * Deletes a draft payment and its allocations
   *
   * Only DRAFT payments can be deleted. POSTED payments are permanent
   * accounting records and cannot be deleted.
   *
   * Cascade behavior:
   * 1. Deletes all payment allocations first
   * 2. Then deletes the payment record
   *
   * @param {string} id - UUID of the payment to delete
   * @returns {Promise<{message: string}>} Success confirmation message
   * @throws {NotFoundException} If payment not found
   * @throws {BadRequestException} If trying to delete a POSTED payment
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
