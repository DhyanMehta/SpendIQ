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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const journal_entries_service_1 = require("../accounting/services/journal-entries.service");
const sales_service_1 = require("../sales/sales.service");
const client_1 = require("@prisma/client");
let InvoicesService = class InvoicesService {
    constructor(prisma, journalEntriesService, salesService) {
        this.prisma = prisma;
        this.journalEntriesService = journalEntriesService;
        this.salesService = salesService;
    }
    async create(createDto, userId) {
        const count = await this.prisma.invoice.count({
            where: { type: createDto.type },
        });
        const prefix = createDto.type === "OUT_INVOICE" ? "INV" : "BILL";
        const number = `${prefix}/${new Date().getFullYear()}/${String(count + 1).padStart(4, "0")}`;
        const totalAmount = createDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
        const invoice = await this.prisma.invoice.create({
            data: {
                number,
                createdById: userId,
                partnerId: createDto.partnerId,
                date: createDto.date,
                dueDate: createDto.dueDate,
                type: createDto.type,
                status: "DRAFT",
                paymentState: "NOT_PAID",
                totalAmount,
                taxAmount: 0,
                lines: {
                    create: createDto.lines.map((line) => ({
                        productId: line.productId,
                        label: line.description,
                        quantity: line.quantity,
                        priceUnit: line.unitPrice,
                        subtotal: line.quantity * line.unitPrice,
                        analyticAccountId: line.analyticalAccountId,
                    })),
                },
            },
            include: {
                partner: true,
                lines: {
                    include: { product: true },
                },
            },
        });
        return invoice;
    }
    async findAll(filters) {
        const { page, limit, type, state, partnerId, userId } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (state)
            where.status = state;
        if (partnerId)
            where.partnerId = partnerId;
        if (userId)
            where.createdById = userId;
        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                include: {
                    partner: true,
                },
                orderBy: { date: "desc" },
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return {
            data: invoices,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                partner: true,
                lines: {
                    include: { product: true },
                },
                journalEntry: true,
                payments: {
                    include: {
                        payment: true,
                    },
                },
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException("Invoice not found");
        }
        return invoice;
    }
    async update(id, updateDto) {
        const existing = await this.findOne(id);
        if (existing.state !== "DRAFT") {
            throw new common_1.BadRequestException("Only draft invoices can be modified");
        }
        let totalAmount = existing.totalAmount;
        if (updateDto.lines) {
            await this.prisma.invoiceLine.deleteMany({
                where: { invoiceId: id },
            });
            totalAmount = updateDto.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
        }
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: Object.assign({ partnerId: updateDto.partnerId, date: updateDto.date, dueDate: updateDto.dueDate, totalAmount, amountDue: totalAmount }, (updateDto.lines && {
                lines: {
                    create: updateDto.lines.map((line) => ({
                        productId: line.productId,
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        subtotal: line.quantity * line.unitPrice,
                        analyticAccountId: line.analyticalAccountId,
                    })),
                },
            })),
            include: {
                partner: true,
                lines: true,
            },
        });
        return updated;
    }
    async post(id, userId) {
        const invoice = await this.findOne(id);
        if (invoice.state !== "DRAFT") {
            throw new common_1.BadRequestException("Invoice is already posted");
        }
        const arAccount = await this.prisma.account.findFirst({
            where: { code: "121000" },
        });
        const incomeAccount = await this.prisma.account.findFirst({
            where: { code: "400000" },
        });
        if (!arAccount || !incomeAccount) {
        }
        const lines = [];
        lines.push({
            accountId: (arAccount === null || arAccount === void 0 ? void 0 : arAccount.id) || "missing-ar-id",
            partnerId: invoice.partnerId,
            label: `Invoice ${invoice.number}`,
            debit: Number(invoice.totalAmount),
            credit: 0,
        });
        for (const line of invoice.lines) {
            lines.push({
                accountId: (incomeAccount === null || incomeAccount === void 0 ? void 0 : incomeAccount.id) || "missing-income-id",
                analyticAccountId: line.analyticAccountId,
                label: line.description,
                debit: 0,
                credit: Number(line.subtotal),
            });
        }
        let journalEntry;
        try {
            if (arAccount && incomeAccount) {
                journalEntry = await this.journalEntriesService.create({
                    date: invoice.date,
                    reference: invoice.number,
                    lines,
                }, userId);
                await this.journalEntriesService.post(journalEntry.id);
            }
        }
        catch (e) {
            console.warn("Could not create Journal Entry:", e);
        }
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: {
                status: client_1.InvoiceStatus.POSTED,
                journalEntryId: journalEntry === null || journalEntry === void 0 ? void 0 : journalEntry.id,
            },
        });
        return updated;
    }
    async registerPayment(id, data) {
        const invoice = await this.findOne(id);
        if (invoice.state !== "POSTED") {
            throw new common_1.BadRequestException("Can only register payment for posted invoices");
        }
        if (invoice.paymentState === "PAID") {
            throw new common_1.BadRequestException("Invoice is already paid");
        }
        const payment = await this.prisma.payment.create({
            data: {
                partnerId: invoice.partnerId,
                amount: data.amount,
                date: data.date,
                reference: data.reference,
                journalId: data.journalId,
                paymentType: "INBOUND",
                state: "POSTED",
            },
        });
        await this.prisma.paymentAllocation.create({
            data: {
                paymentId: payment.id,
                invoiceId: invoice.id,
                amount: data.amount,
            },
        });
        const newAmountDue = Number(invoice.amountDue) - data.amount;
        let newPaymentState = invoice.paymentState;
        if (newAmountDue <= 0) {
            newPaymentState = "PAID";
        }
        else if (newAmountDue < Number(invoice.totalAmount)) {
            newPaymentState = "PARTIAL";
        }
        const updatedInvoice = await this.prisma.invoice.update({
            where: { id },
            data: {
                amountDue: newAmountDue < 0 ? 0 : newAmountDue,
                paymentState: newPaymentState,
            },
        });
        return { payment, invoice: updatedInvoice };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => journal_entries_service_1.JournalEntriesService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => sales_service_1.SalesService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        journal_entries_service_1.JournalEntriesService,
        sales_service_1.SalesService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map