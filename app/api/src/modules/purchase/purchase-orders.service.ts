import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

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
