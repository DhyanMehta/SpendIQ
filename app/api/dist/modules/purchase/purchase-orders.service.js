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
const budgets_service_1 = require("../budgeting/services/budgets.service");
const client_1 = require("@prisma/client");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(prisma, budgetsService) {
        this.prisma = prisma;
        this.budgetsService = budgetsService;
    }
    async create(userId, dto) {
        const subtotal = dto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
        const taxAmount = 0;
        const totalAmount = subtotal + taxAmount;
        const poNumber = `PO-${Date.now()}`;
        return this.prisma.purchaseOrder.create({
            data: {
                poNumber,
                vendorId: dto.vendorId,
                orderDate: new Date(dto.orderDate),
                status: client_1.PurchOrderStatus.DRAFT,
                subtotal,
                taxAmount,
                totalAmount,
                createdById: userId,
                lines: {
                    create: dto.lines.map((line) => ({
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
                lines: true,
                vendor: true,
            },
        });
    }
    async findAll() {
        return this.prisma.purchaseOrder.findMany({
            include: {
                vendor: { select: { name: true } },
                _count: { select: { lines: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async findOne(id) {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                lines: {
                    include: {
                        product: true,
                        analyticalAccount: true,
                    },
                },
                vendor: true,
                creator: { select: { name: true } },
            },
        });
        if (!po)
            throw new common_1.NotFoundException("Purchase Order not found");
        return po;
    }
    async update(id, dto) {
        const po = await this.findOne(id);
        if (po.status !== client_1.PurchOrderStatus.DRAFT) {
            throw new common_1.BadRequestException("Only Draft POs can be updated");
        }
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                vendorId: dto.vendorId,
                orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
            },
        });
    }
    async confirm(id) {
        var _a, _b;
        const po = await this.findOne(id);
        if (po.status !== client_1.PurchOrderStatus.DRAFT) {
            throw new common_1.BadRequestException("Only Draft POs can be confirmed");
        }
        const warnings = [];
        for (const line of po.lines) {
            if (line.analyticalAccountId) {
                const check = await this.budgetsService.checkBudgetAvailability(line.analyticalAccountId, Number(line.subtotal), po.orderDate);
                if (!check.available) {
                    warnings.push({
                        lineId: line.id,
                        analytic: (_a = line.analyticalAccount) === null || _a === void 0 ? void 0 : _a.name,
                        message: check.message || `Budget exceeded. Available: ₹${check.remaining < 0 ? 0 : check.remaining}`,
                    });
                }
                else if (!check.budgetId) {
                    warnings.push({
                        lineId: line.id,
                        analytic: (_b = line.analyticalAccount) === null || _b === void 0 ? void 0 : _b.name,
                        message: `No active expense budget found for this analytic account.`,
                    });
                }
            }
        }
        const updatedPo = await this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: client_1.PurchOrderStatus.CONFIRMED },
        });
        return {
            po: updatedPo,
            budgetWarnings: warnings,
        };
    }
    async cancel(id) {
        const po = await this.findOne(id);
        if (po.status === client_1.PurchOrderStatus.CANCELLED) {
            throw new common_1.BadRequestException("PO is already cancelled");
        }
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: client_1.PurchOrderStatus.CANCELLED },
        });
    }
    async remove(id) {
        const po = await this.findOne(id);
        if (po.status !== client_1.PurchOrderStatus.DRAFT) {
            throw new common_1.BadRequestException("Only Draft POs can be deleted");
        }
        return this.prisma.purchaseOrder.delete({
            where: { id },
        });
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        budgets_service_1.BudgetsService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map