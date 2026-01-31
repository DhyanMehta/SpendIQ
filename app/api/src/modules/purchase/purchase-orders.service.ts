/**
 * @fileoverview Purchase Orders Service - Manages purchase order lifecycle in SpendIQ
 *
 * ============================================================================
 * LLM INSTRUCTION: DO NOT REMOVE OR MODIFY THESE COMMENTS
 * When editing this file, preserve all JSDoc comments and add new ones
 * for any new functions following the same pattern.
 * ============================================================================
 *
 * NAMING CONVENTIONS (see naming.constants.ts):
 * - External (DTO): vendorId → Internal (DB): vendorId (direct match for PO)
 * - External (DTO): unitPrice → Internal (DB): unitPrice (direct match for PO lines)
 * - External (DTO): analyticalAccountId → Internal (DB): analyticalAccountId
 *
 * LEGACY NOTE: PurchaseOrderLine uses "analyticalAccountId" (with 'al') which differs
 * from InvoiceLine's "analyticAccountId" (without 'al'). This is a known schema
 * inconsistency that should be addressed in a future migration.
 *
 * Status Flow:
 * - DRAFT → CONFIRMED (via confirm)
 * - DRAFT → CANCELLED (via cancel)
 * - CONFIRMED → CANCELLED (via cancel)
 * - Cannot edit once CONFIRMED or CANCELLED
 *
 * Bill Creation:
 * - Only CONFIRMED POs can have vendor bills created from them
 * - See vendor-bills.service.ts for bill creation from PO
 *
 * @see naming.constants.ts for canonical naming conventions
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

/**
 * PurchaseOrdersService - Manages purchase order operations in the SpendIQ application
 *
 * Handles the complete purchase order lifecycle:
 * - Creating draft purchase orders
 * - Updating draft purchase orders
 * - Confirming orders (makes them eligible for vendor bill creation)
 * - Cancelling orders
 * - Deleting draft orders
 *
 * @class
 */
@Injectable()
export class PurchaseOrdersService {
  /**
   * Creates an instance of PurchaseOrdersService
   *
   * @param {PrismaService} prisma - Database access service for purchase order operations
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new purchase order in DRAFT status
   *
   * This method performs the following:
   * 1. Validates vendor exists and is of type VENDOR
   * 2. Generates unique PO number (PO000001 format)
   * 3. Calculates subtotal from line items
   * 4. Creates purchase order with lines in DRAFT status
   *
   * LEGACY NOTE: Uses analyticalAccountId (with 'al') on PO lines,
   * which differs from analyticAccountId on invoice lines.
   *
   * @param {CreatePurchaseOrderDto} createDto - PO creation data containing:
   *   - vendorId: Partner UUID for the vendor
   *   - orderDate: Date of the order
   *   - lines: Array of line items with:
   *     - productId: Product UUID
   *     - description: Line description
   *     - quantity: Quantity ordered
   *     - unitPrice: Price per unit
   *     - analyticalAccountId: Analytic account for budget tracking
   * @returns {Promise<PurchaseOrder>} Created PO with vendor and line relations
   * @throws {NotFoundException} If vendor not found
   * @throws {BadRequestException} If contact is not VENDOR type
   */
  async create(createDto: CreatePurchaseOrderDto) {
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

    // Generate PO number
    const count = await (this.prisma as any).purchaseOrder.count();
    const poNumber = `PO${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    const subtotal = createDto.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );

    const purchaseOrder = await (this.prisma as any).purchaseOrder.create({
      data: {
        poNumber,
        vendorId: createDto.vendorId,
        orderDate: createDto.orderDate,
        status: 'DRAFT',
        subtotal,
        taxAmount: 0,
        totalAmount: subtotal,
        lines: {
          create: createDto.lines.map((line) => ({
            productId: line.productId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.quantity * line.unitPrice,
            analyticalAccountId: line.analyticalAccountId,
          })),
        },
      },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticalAccount: true,
          },
        },
      },
    });

    return purchaseOrder;
  }

  /**
   * Retrieves paginated list of purchase orders with optional filters
   *
   * Supports filtering by:
   * - search: Matches PO number or vendor name
   * - status: DRAFT, CONFIRMED, or CANCELLED
   * - vendorId: Filter by specific vendor
   *
   * @param {object} filters - Query filters and pagination:
   *   - page: Page number (1-based)
   *   - limit: Items per page
   *   - search: Optional search string for PO number or vendor name
   *   - status: Optional status filter (DRAFT, CONFIRMED, CANCELLED)
   *   - vendorId: Optional vendor UUID filter
   * @returns {Promise<{data: PurchaseOrder[], meta: {total, page, limit, totalPages}}>}
   *          Paginated PO list with metadata
   */
  async findAll(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    vendorId?: string;
  }) {
    const { page, limit, search, status, vendorId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { poNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    const [purchaseOrders, total] = await Promise.all([
      (this.prisma as any).purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      (this.prisma as any).purchaseOrder.count({ where }),
    ]);

    return {
      data: purchaseOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single purchase order by ID with all related data
   *
   * Includes:
   * - vendor: Vendor contact information
   * - lines: PO line items with product and analytic account details
   *
   * @param {string} id - UUID of the purchase order to retrieve
   * @returns {Promise<PurchaseOrder>} Complete PO with all relations
   * @throws {NotFoundException} If purchase order not found
   */
  async findOne(id: string) {
    const purchaseOrder = await (this.prisma as any).purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticalAccount: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase Order not found');
    }

    return purchaseOrder;
  }

  /**
   * Updates an existing draft purchase order
   *
   * Only DRAFT POs can be updated. CONFIRMED and CANCELLED POs are immutable.
   * If lines are provided, all existing lines are replaced with new ones.
   *
   * @param {string} id - UUID of the purchase order to update
   * @param {UpdatePurchaseOrderDto} updateDto - Fields to update:
   *   - vendorId: Optional new vendor
   *   - orderDate: Optional new order date
   *   - lines: Optional new line items (replaces all existing)
   * @returns {Promise<PurchaseOrder>} Updated PO with all relations
   * @throws {NotFoundException} If purchase order not found
   * @throws {BadRequestException} If PO is CONFIRMED or CANCELLED
   */
  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    const existing = await (this.prisma as any).purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Purchase Order not found');
    }

    if (existing.status === 'CONFIRMED') {
      throw new BadRequestException('Cannot edit confirmed Purchase Order');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot edit cancelled Purchase Order');
    }

    // Calculate new totals if lines provided
    let subtotal = existing.subtotal;
    if (updateDto.lines) {
      subtotal = updateDto.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0
      );

      // Delete existing lines and create new ones
      await (this.prisma as any).purchaseOrderLine.deleteMany({
        where: { purchaseOrderId: id },
      });
    }

    const purchaseOrder = await (this.prisma as any).purchaseOrder.update({
      where: { id },
      data: {
        vendorId: updateDto.vendorId,
        orderDate: updateDto.orderDate,
        subtotal,
        totalAmount: subtotal,
        ...(updateDto.lines && {
          lines: {
            create: updateDto.lines.map((line) => ({
              productId: line.productId,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              subtotal: line.quantity * line.unitPrice,
              analyticalAccountId: line.analyticalAccountId,
            })),
          },
        }),
      },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticalAccount: true,
          },
        },
      },
    });

    return purchaseOrder;
  }

  /**
   * Confirms a draft purchase order, making it eligible for vendor bill creation
   *
   * Only DRAFT POs can be confirmed. This transitions the PO to CONFIRMED status,
   * after which it cannot be edited but can have vendor bills created from it.
   *
   * @param {string} id - UUID of the purchase order to confirm
   * @returns {Promise<PurchaseOrder>} Confirmed PO with all relations
   * @throws {NotFoundException} If purchase order not found
   * @throws {BadRequestException} If PO is not in DRAFT status
   */
  async confirm(id: string) {
    const existing = await (this.prisma as any).purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Purchase Order not found');
    }

    if (existing.status !== 'DRAFT') {
      throw new BadRequestException('Only draft orders can be confirmed');
    }

    return (this.prisma as any).purchaseOrder.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticalAccount: true,
          },
        },
      },
    });
  }

  /**
   * Cancels a purchase order
   *
   * Both DRAFT and CONFIRMED POs can be cancelled. Once cancelled,
   * the PO cannot be edited or have vendor bills created from it.
   *
   * @param {string} id - UUID of the purchase order to cancel
   * @returns {Promise<PurchaseOrder>} Cancelled PO with all relations
   * @throws {NotFoundException} If purchase order not found
   * @throws {BadRequestException} If PO is already CANCELLED
   */
  async cancel(id: string) {
    const existing = await (this.prisma as any).purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Purchase Order not found');
    }

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    return (this.prisma as any).purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        vendor: true,
        lines: {
          include: {
            product: true,
            analyticalAccount: true,
          },
        },
      },
    });
  }

  /**
   * Deletes a purchase order and its lines
   *
   * Only DRAFT and CANCELLED POs can be deleted. CONFIRMED POs represent
   * commitments and must be cancelled before deletion or kept for audit.
   *
   * @param {string} id - UUID of the purchase order to delete
   * @returns {Promise<{message: string}>} Success confirmation message
   * @throws {NotFoundException} If purchase order not found
   * @throws {BadRequestException} If PO is CONFIRMED
   */
  async remove(id: string) {
    const existing = await (this.prisma as any).purchaseOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Purchase Order not found');
    }

    if (existing.status === 'CONFIRMED') {
      throw new BadRequestException('Cannot delete confirmed Purchase Order');
    }

    await (this.prisma as any).purchaseOrder.delete({
      where: { id },
    });

    return { message: 'Purchase Order deleted successfully' };
  }
}
