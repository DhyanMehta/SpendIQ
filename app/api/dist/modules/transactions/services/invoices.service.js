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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const client_1 = require("@prisma/client");
const journal_entries_service_1 = require("../../accounting/services/journal-entries.service");
let InvoicesService = class InvoicesService {
    constructor(prisma, journalEntriesService) {
        this.prisma = prisma;
        this.journalEntriesService = journalEntriesService;
    }
    async create(dto, userId) {
        let totalAmount = 0;
        const linesData = dto.lines.map((line) => {
            const subtotal = line.quantity * line.priceUnit;
            totalAmount += subtotal;
            return {
                productId: line.productId,
                label: line.label,
                quantity: line.quantity,
                priceUnit: line.priceUnit,
                subtotal: subtotal,
                analyticAccountId: line.analyticAccountId,
            };
        });
        return this.prisma.invoice.create({
            data: {
                number: dto.number,
                creator: userId ? { connect: { id: userId } } : undefined,
                type: dto.type,
                partner: { connect: { id: dto.partnerId } },
                date: new Date(dto.date),
                dueDate: new Date(dto.dueDate),
                status: client_1.InvoiceStatus.DRAFT,
                totalAmount: totalAmount,
                lines: { create: linesData },
            },
            include: { lines: true },
        });
    }
    async findAll(type, partnerId, userId) {
        return this.prisma.invoice.findMany({
            where: {
                type: type ? type : undefined,
                partnerId: partnerId ? partnerId : undefined,
                createdById: userId || undefined,
            },
            include: { partner: true },
            orderBy: { date: "desc" },
        });
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                lines: { include: { product: true, analyticAccount: true } },
                partner: true,
            },
        });
        if (!invoice)
            throw new common_1.NotFoundException("Invoice not found");
        return invoice;
    }
    async post(id, userId) {
        const invoice = await this.findOne(id);
        if (invoice.status === client_1.InvoiceStatus.POSTED) {
            throw new common_1.BadRequestException("Invoice already posted");
        }
        const arAccount = await this.prisma.account.findFirst({
            where: { code: "1200" },
        });
        const salesAccount = await this.prisma.account.findFirst({
            where: { code: "4000" },
        });
        if (!arAccount || !salesAccount) {
            throw new common_1.BadRequestException("Accounting Error: Default Accounts (1200, 4000) not found. Please create them in General Ledger.");
        }
        const lines = [];
        lines.push({
            accountId: arAccount.id,
            partnerId: invoice.partnerId,
            label: `Invoice ${invoice.number}`,
            debit: Number(invoice.totalAmount),
            credit: 0,
        });
        for (const line of invoice.lines) {
            lines.push({
                accountId: salesAccount.id,
                partnerId: invoice.partnerId,
                label: line.label,
                debit: 0,
                credit: Number(line.subtotal),
                analyticAccountId: line.analyticAccountId,
            });
        }
        const entry = await this.journalEntriesService.create({
            date: invoice.date,
            reference: invoice.number || `INV/${invoice.id}`,
            lines: lines,
        }, userId);
        return this.prisma.invoice.update({
            where: { id },
            data: {
                status: client_1.InvoiceStatus.POSTED,
                journalEntryId: entry.id,
            },
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        journal_entries_service_1.JournalEntriesService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map