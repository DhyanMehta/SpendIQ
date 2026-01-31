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
exports.VendorBillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const budgets_service_1 = require("../budgeting/services/budgets.service");
const client_1 = require("@prisma/client");
let VendorBillsService = class VendorBillsService {
    constructor(prisma, budgetsService) {
        this.prisma = prisma;
        this.budgetsService = budgetsService;
    }
    async create(createVendorBillDto, userId) {
        const totalAmount = createVendorBillDto.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
        const count = await this.prisma.invoice.count({
            where: { type: client_1.InvoiceType.IN_INVOICE },
        });
        const invoiceNumber = `BILL/${new Date().getFullYear()}/${String(count + 1).padStart(4, "0")}`;
        return this.prisma.invoice.create({
            data: {
                type: client_1.InvoiceType.IN_INVOICE,
                number: invoiceNumber,
                partner: { connect: { id: createVendorBillDto.vendorId } },
                date: new Date(createVendorBillDto.billDate),
                dueDate: new Date(createVendorBillDto.dueDate),
                status: client_1.InvoiceStatus.DRAFT,
                paymentState: "NOT_PAID",
                totalAmount,
                taxAmount: 0,
                creator: { connect: { id: userId } },
                lines: {
                    create: createVendorBillDto.lines.map((l) => ({
                        product: l.productId ? { connect: { id: l.productId } } : undefined,
                        label: l.description,
                        quantity: l.quantity,
                        priceUnit: l.unitPrice,
                        subtotal: l.quantity * l.unitPrice,
                        taxRate: 0,
                        analyticAccount: l.analyticalAccountId
                            ? { connect: { id: l.analyticalAccountId } }
                            : undefined,
                    })),
                },
            },
            include: {
                lines: {
                    include: {
                        product: true,
                        analyticAccount: true,
                    },
                },
                partner: true,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.invoice.findMany({
            where: {
                type: client_1.InvoiceType.IN_INVOICE,
                createdById: userId,
            },
            include: {
                partner: true,
                lines: true,
            },
            orderBy: { date: "desc" },
        });
    }
    async findOne(id, userId) {
        const bill = await this.prisma.invoice.findFirst({
            where: {
                id,
                createdById: userId,
            },
            include: {
                lines: {
                    include: {
                        product: true,
                        analyticAccount: true,
                    },
                },
                partner: true,
            },
        });
        if (!bill)
            throw new common_1.NotFoundException(`Vendor Bill not found`);
        return bill;
    }
    async post(id, userId) {
        var _a;
        const bill = await this.findOne(id, userId);
        if (bill.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException("Only Draft bills can be posted");
        }
        const warnings = [];
        for (const line of bill.lines) {
            if (line.analyticAccountId) {
                const check = await this.budgetsService.checkBudgetAvailability(line.analyticAccountId, Number(line.subtotal), bill.date);
                if (!check.available) {
                    warnings.push({
                        lineId: line.id,
                        analytic: (_a = line.analyticAccount) === null || _a === void 0 ? void 0 : _a.name,
                        message: check.message || `Budget exceeded. Available: ₹${check.remaining < 0 ? 0 : check.remaining}`,
                    });
                }
            }
        }
        const updatedBill = await this.prisma.invoice.update({
            where: { id },
            data: { status: client_1.InvoiceStatus.POSTED },
        });
        return {
            bill: updatedBill,
            budgetWarnings: warnings,
        };
    }
    async simulatePost(id, userId) {
        var _a;
        const bill = await this.findOne(id, userId);
        const warnings = [];
        for (const line of bill.lines) {
            if (line.analyticAccountId) {
                const check = await this.budgetsService.checkBudgetAvailability(line.analyticAccountId, Number(line.subtotal), bill.date);
                if (!check.available) {
                    warnings.push({
                        lineId: line.id,
                        analytic: (_a = line.analyticAccount) === null || _a === void 0 ? void 0 : _a.name,
                        message: check.message || `Budget exceeded. Available: ₹${check.remaining < 0 ? 0 : check.remaining}`,
                    });
                }
            }
        }
        return warnings;
    }
    async update(id, dto, userId) {
        const bill = await this.findOne(id, userId);
        if (bill.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException("Only Draft bills can be updated");
        }
        return this.prisma.invoice.update({
            where: { id },
            data: {
                date: dto.billDate ? new Date(dto.billDate) : undefined,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            },
        });
    }
    async remove(id, userId) {
        const bill = await this.findOne(id, userId);
        if (bill.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.BadRequestException("Only Draft bills can be deleted");
        }
        return this.prisma.invoice.delete({
            where: { id },
        });
    }
};
exports.VendorBillsService = VendorBillsService;
exports.VendorBillsService = VendorBillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        budgets_service_1.BudgetsService])
], VendorBillsService);
//# sourceMappingURL=vendor-bills.service.js.map