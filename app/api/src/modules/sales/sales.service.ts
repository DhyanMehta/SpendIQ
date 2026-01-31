import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { CreateSalesOrderDto } from "./dto/create-sales-order.dto";
import { UpdateSalesOrderDto } from "./dto/update-sales-order.dto";

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSalesOrderDto, userId?: string) {
    // Verify customer exists and is type CUSTOMER
    const customer = await this.prisma.contact.findUnique({
      where: { id: createDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    if (customer.type !== "CUSTOMER") {
      throw new BadRequestException("Contact must be of type CUSTOMER");
    }

    // Generate SO reference
    const count = await this.prisma.salesOrder.count();
    const reference = `SO${String(count + 1).padStart(6, "0")}`;

    // Calculate totals
    const subtotal = createDto.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );

    const salesOrder = await this.prisma.salesOrder.create({
      data: {
        creator: userId ? { connect: { id: userId } } : undefined,
        reference,
        customer: { connect: { id: createDto.customerId } },
        date: createDto.date,
        status: "DRAFT",
        totalAmount: subtotal,
        lines: {
          create: createDto.lines.map((line) => ({
            productId: line.productId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            subtotal: line.quantity * line.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return salesOrder;
  }

  async findAll(filters: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    customerId?: string;
    userId?: string;
  }) {
    const { page, limit, search, status, customerId, userId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (userId) {
      where.createdById = userId;
    }

    const [salesOrders, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      data: salesOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const salesOrder = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
        invoices: true,
      },
    });

    if (!salesOrder) {
      throw new NotFoundException("Sales Order not found");
    }

    return salesOrder;
  }

  async update(id: string, updateDto: UpdateSalesOrderDto) {
    const existing = await this.prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Sales Order not found");
    }

    if (existing.status === "CONFIRMED") {
      throw new BadRequestException("Cannot edit confirmed Sales Order");
    }

    if (existing.status === "CANCELLED") {
      throw new BadRequestException("Cannot edit cancelled Sales Order");
    }

    // Calculate new totals if lines provided
    let subtotal = Number(existing.totalAmount);
    if (updateDto.lines) {
      subtotal = updateDto.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0,
      );

      // Delete existing lines and create new ones
      await this.prisma.salesOrderLine.deleteMany({
        where: { orderId: id },
      });
    }

    const salesOrder = await this.prisma.salesOrder.update({
      where: { id },
      data: {
        customerId: updateDto.customerId,
        date: updateDto.date,
        totalAmount: subtotal,
        ...(updateDto.lines && {
          lines: {
            create: updateDto.lines.map((line) => ({
              productId: line.productId,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              subtotal: line.quantity * line.unitPrice,
            })),
          },
        }),
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return salesOrder;
  }

  async confirm(id: string) {
    const existing = await this.prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Sales Order not found");
    }

    if (existing.status !== "DRAFT") {
      throw new BadRequestException("Only draft orders can be confirmed");
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancel(id: string) {
    const existing = await this.prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Sales Order not found");
    }

    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        customer: true,
        lines: true,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Sales Order not found");
    }

    if (existing.status === "CONFIRMED") {
      throw new BadRequestException("Cannot delete confirmed Sales Order");
    }

    await this.prisma.salesOrder.delete({
      where: { id },
    });

    return { message: "Sales Order deleted successfully" };
  }
}
