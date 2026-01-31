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
exports.JournalEntriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let JournalEntriesService = class JournalEntriesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, userId) {
        const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Unbalanced Journal Entry: Debit ${totalDebit} != Credit ${totalCredit}`);
        }
        return this.prisma.journalEntry.create({
            data: {
                createdById: userId,
                date: data.date,
                reference: data.reference,
                state: client_1.EntryState.DRAFT,
                lines: {
                    create: data.lines,
                },
            },
            include: { lines: true },
        });
    }
    async findAll(userId) {
        const where = {};
        if (userId)
            where.createdById = userId;
        return this.prisma.journalEntry.findMany({
            where,
            include: { lines: { include: { account: true, analyticAccount: true } } },
            orderBy: { date: "desc" },
        });
    }
    async findOne(id) {
        return this.prisma.journalEntry.findUnique({
            where: { id },
            include: { lines: { include: { account: true, analyticAccount: true } } },
        });
    }
    async post(id) {
        return this.prisma.journalEntry.update({
            where: { id },
            data: { state: client_1.EntryState.POSTED },
        });
    }
};
exports.JournalEntriesService = JournalEntriesService;
exports.JournalEntriesService = JournalEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JournalEntriesService);
//# sourceMappingURL=journal-entries.service.js.map