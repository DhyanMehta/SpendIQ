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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto) {
        const vendor = await this.prisma.contact.findUnique({
            where: { id: createDto.vendorId },
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        if (vendor.type !== 'VENDOR') {
            throw new common_1.BadRequestException('Contact must be of type VENDOR');
        }
        const count = await this.prisma.purchaseOrder.count();
        const poNumber = `PO${String(count + 1).padStart(6, '0')}`;
        const subtotal = createDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
        const purchaseOrder = await this.prisma.purchaseOrder.create({
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
    async findAll(filters) {
        const { page, limit, search, status, vendorId } = filters;
        const skip = (page - 1) * limit;
        const where = {};
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
            this.prisma.purchaseOrder.findMany({
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
            this.prisma.purchaseOrder.count({ where }),
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
    async findOne(id) {
        const purchaseOrder = await this.prisma.purchaseOrder.findUnique({
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
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        return purchaseOrder;
    }
    async update(id, updateDto) {
        const existing = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        if (existing.status === 'CONFIRMED') {
            throw new common_1.BadRequestException('Cannot edit confirmed Purchase Order');
        }
        if (existing.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Cannot edit cancelled Purchase Order');
        }
        let subtotal = existing.subtotal;
        if (updateDto.lines) {
            subtotal = updateDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
            await this.prisma.purchaseOrderLine.deleteMany({
                where: { purchaseOrderId: id },
            });
        }
        const purchaseOrder = await this.prisma.purchaseOrder.update({
            where: { id },
            data: Object.assign({ vendorId: updateDto.vendorId, orderDate: updateDto.orderDate, subtotal, totalAmount: subtotal }, (updateDto.lines && {
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
            })),
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
    async confirm(id) {
        const existing = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        if (existing.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Only draft orders can be confirmed');
        }
        return this.prisma.purchaseOrder.update({
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
    async cancel(id) {
        const existing = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        if (existing.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Order is already cancelled');
        }
        return this.prisma.purchaseOrder.update({
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
    async remove(id) {
        const existing = await this.prisma.purchaseOrder.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Purchase Order not found');
        }
        if (existing.status === 'CONFIRMED') {
            throw new common_1.BadRequestException('Cannot delete confirmed Purchase Order');
        }
        await this.prisma.purchaseOrder.delete({
            where: { id },
        });
        return { message: 'Purchase Order deleted successfully' };
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map