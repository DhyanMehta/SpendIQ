"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let SalesService = class SalesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, userId) {
        const customer = await this.prisma.contact.findUnique({
            where: { id: createDto.customerId },
        });
        if (!customer) {
            throw new common_1.NotFoundException("Customer not found");
        }
        if (customer.type !== "CUSTOMER") {
            throw new common_1.BadRequestException("Contact must be of type CUSTOMER");
        }
        const count = await this.prisma.salesOrder.count();
        const reference = `SO${String(count + 1).padStart(6, "0")}`;
        const subtotal = createDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
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
    async findAll(filters) {
        const { page, limit, search, status, customerId, userId } = filters;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
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
            throw new common_1.NotFoundException("Sales Order not found");
        }
        return salesOrder;
    }
    async update(id, updateDto) {
        const existing = await this.prisma.salesOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException("Sales Order not found");
        }
        if (existing.status === "CONFIRMED") {
            throw new common_1.BadRequestException("Cannot edit confirmed Sales Order");
        }
        if (existing.status === "CANCELLED") {
            throw new common_1.BadRequestException("Cannot edit cancelled Sales Order");
        }
        let subtotal = Number(existing.totalAmount);
        if (updateDto.lines) {
            subtotal = updateDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
            await this.prisma.salesOrderLine.deleteMany({
                where: { orderId: id },
            });
        }
        const salesOrder = await this.prisma.salesOrder.update({
            where: { id },
            data: Object.assign({ customerId: updateDto.customerId, date: updateDto.date, totalAmount: subtotal }, (updateDto.lines && {
                lines: {
                    create: updateDto.lines.map((line) => ({
                        productId: line.productId,
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        subtotal: line.quantity * line.unitPrice,
                    })),
                },
            })),
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
    async confirm(id) {
        const existing = await this.prisma.salesOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException("Sales Order not found");
        }
        if (existing.status !== "DRAFT") {
            throw new common_1.BadRequestException("Only draft orders can be confirmed");
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
    async cancel(id) {
        const existing = await this.prisma.salesOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException("Sales Order not found");
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
    async remove(id) {
        const existing = await this.prisma.salesOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException("Sales Order not found");
        }
        if (existing.status === "CONFIRMED") {
            throw new common_1.BadRequestException("Cannot delete confirmed Sales Order");
        }
        await this.prisma.salesOrder.delete({
            where: { id },
        });
        return { message: "Sales Order deleted successfully" };
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalesService);
//# sourceMappingURL=sales.service.js.map