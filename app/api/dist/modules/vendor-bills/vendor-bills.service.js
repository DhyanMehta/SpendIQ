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
let VendorBillsService = class VendorBillsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDto, userId) {
        const vendor = await this.prisma.contact.findUnique({
            where: { id: createDto.vendorId },
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        if (vendor.type !== 'VENDOR') {
            throw new common_1.BadRequestException('Contact must be of type VENDOR');
        }
        if (createDto.purchaseOrderId) {
            const po = await this.prisma.purchaseOrder.findUnique({
                where: { id: createDto.purchaseOrderId },
            });
            if (!po) {
                throw new common_1.NotFoundException('Purchase Order not found');
            }
            if (po.status !== 'CONFIRMED') {
                throw new common_1.BadRequestException('Can only create bills from confirmed Purchase Orders');
            }
        }
        const count = await this.prisma.invoice.count({
            where: { type: 'IN_INVOICE' },
        });
        const billNumber = `BILL${String(count + 1).padStart(6, '0')}`;
        const subtotal = createDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
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
    async findAll(filters) {
        const { page, limit, search, status, vendorId, startDate, endDate } = filters;
        const skip = (page - 1) * limit;
        const where = {
            type: 'IN_INVOICE',
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
            }
            else if (status === 'PAID' || status === 'PARTIAL' || status === 'NOT_PAID') {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Vendor Bill not found');
        }
        return bill;
    }
    async update(id, updateDto) {
        const existing = await this.prisma.invoice.findUnique({
            where: { id },
        });
        if (!existing || existing.type !== 'IN_INVOICE') {
            throw new common_1.NotFoundException('Vendor Bill not found');
        }
        if (existing.status === 'POSTED') {
            throw new common_1.BadRequestException('Cannot edit posted Vendor Bill');
        }
        let subtotal = Number(existing.totalAmount);
        if (updateDto.lines) {
            subtotal = updateDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
            await this.prisma.invoiceLine.deleteMany({
                where: { invoiceId: id },
            });
        }
        const bill = await this.prisma.invoice.update({
            where: { id },
            data: Object.assign({ partnerId: updateDto.vendorId, date: updateDto.billDate, dueDate: updateDto.dueDate, totalAmount: subtotal }, (updateDto.lines && {
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
            })),
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
    async postBill(id, userId) {
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
            throw new common_1.NotFoundException('Vendor Bill not found');
        }
        if (bill.status === 'POSTED') {
            throw new common_1.BadRequestException('Bill is already posted');
        }
        const linesWithoutAnalytics = bill.lines.filter(line => !line.analyticAccountId);
        if (linesWithoutAnalytics.length > 0) {
            throw new common_1.BadRequestException(`Cannot post bill: ${linesWithoutAnalytics.length} line(s) missing Analytic Account. All lines must have an analytic account before posting.`);
        }
        const budgetUpdates = [];
        for (const line of bill.lines) {
            if (line.analyticAccountId) {
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
        const journalEntry = await this.prisma.journalEntry.create({
            data: {
                date: bill.date,
                reference: bill.number,
                state: 'POSTED',
                lines: {
                    create: [
                        ...bill.lines.map(line => ({
                            accountId: '00000000-0000-0000-0000-000000000001',
                            partnerId: bill.partnerId,
                            label: line.label,
                            debit: Number(line.subtotal),
                            credit: 0,
                            analyticAccountId: line.analyticAccountId,
                        })),
                        {
                            accountId: '00000000-0000-0000-0000-000000000002',
                            partnerId: bill.partnerId,
                            label: `Vendor Bill ${bill.number}`,
                            debit: 0,
                            credit: Number(bill.totalAmount),
                        },
                    ],
                },
            },
        });
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
        return Object.assign(Object.assign({}, updatedBill), { budgetImpact: budgetUpdates });
    }
    async registerPayment(id, paymentDto, userId) {
        const bill = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                payments: true,
            },
        });
        if (!bill || bill.type !== 'IN_INVOICE') {
            throw new common_1.NotFoundException('Vendor Bill not found');
        }
        if (bill.status !== 'POSTED') {
            throw new common_1.BadRequestException('Can only register payments for posted bills');
        }
        const totalPaid = bill.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const outstanding = Number(bill.totalAmount) - totalPaid;
        if (paymentDto.amount > outstanding) {
            throw new common_1.BadRequestException(`Payment amount (₹${paymentDto.amount}) exceeds outstanding amount (₹${outstanding})`);
        }
        const paymentCount = await this.prisma.payment.count();
        const paymentReference = `PAY${String(paymentCount + 1).padStart(6, '0')}`;
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
        const newTotalPaid = totalPaid + paymentDto.amount;
        let paymentState = 'NOT_PAID';
        if (newTotalPaid >= Number(bill.totalAmount)) {
            paymentState = 'PAID';
        }
        else if (newTotalPaid > 0) {
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
    async remove(id) {
        const bill = await this.prisma.invoice.findUnique({
            where: { id },
        });
        if (!bill || bill.type !== 'IN_INVOICE') {
            throw new common_1.NotFoundException('Vendor Bill not found');
        }
        if (bill.status === 'POSTED') {
            throw new common_1.BadRequestException('Cannot delete posted Vendor Bill');
        }
        await this.prisma.invoice.delete({
            where: { id },
        });
        return { message: 'Vendor Bill deleted successfully' };
    }
};
exports.VendorBillsService = VendorBillsService;
exports.VendorBillsService = VendorBillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorBillsService);
//# sourceMappingURL=vendor-bills.service.js.map