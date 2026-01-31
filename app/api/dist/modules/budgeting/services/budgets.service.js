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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/database/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
var BudgetStatus;
(function (BudgetStatus) {
    BudgetStatus["DRAFT"] = "DRAFT";
    BudgetStatus["CONFIRMED"] = "CONFIRMED";
    BudgetStatus["REVISED"] = "REVISED";
    BudgetStatus["ARCHIVED"] = "ARCHIVED";
})(BudgetStatus || (BudgetStatus = {}));
let BudgetsService = class BudgetsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.budget.create({
            data: {
                name: dto.name,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                analyticAccountId: dto.analyticAccountId,
                budgetType: dto.budgetType,
                budgetedAmount: new library_1.Decimal(dto.budgetedAmount),
                createdBy: userId,
                status: BudgetStatus.DRAFT,
            },
            include: {
                analyticAccount: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findAll(status, analyticAccountId, userId) {
        const budgets = await this.prisma.budget.findMany({
            where: {
                status: status,
                analyticAccountId: analyticAccountId || undefined,
                createdBy: userId || undefined,
            },
            include: {
                analyticAccount: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return budgets;
    }
    async findOne(id) {
        const budget = await this.prisma.budget.findUnique({
            where: { id },
            include: {
                analyticAccount: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                revisionOf: true,
                revisedBy: true,
            },
        });
        if (!budget)
            throw new common_1.NotFoundException("Budget not found");
        return budget;
    }
    async approve(id) {
        return this.prisma.budget.update({
            where: { id },
            data: { status: BudgetStatus.CONFIRMED },
        });
    }
    async update(id, dto) {
        const existingBudget = await this.findOne(id);
        if (existingBudget.status !== BudgetStatus.DRAFT) {
            throw new common_1.BadRequestException("Can only update draft budgets. Use revise endpoint for confirmed budgets.");
        }
        return this.prisma.budget.update({
            where: { id },
            data: {
                name: dto.name,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                analyticAccountId: dto.analyticAccountId,
                budgetType: dto.budgetType,
                budgetedAmount: new library_1.Decimal(dto.budgetedAmount),
            },
            include: {
                analyticAccount: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async createRevision(id, userId, dto) {
        const oldBudget = await this.findOne(id);
        if (oldBudget.status !== BudgetStatus.CONFIRMED) {
            throw new common_1.BadRequestException("Can only revise confirmed budgets. Edit the draft directly.");
        }
        return this.prisma.$transaction(async (tx) => {
            const newBudget = await tx.budget.create({
                data: {
                    name: `${dto.name} (Rev ${new Date().toLocaleDateString()})`,
                    startDate: new Date(dto.startDate),
                    endDate: new Date(dto.endDate),
                    analyticAccountId: dto.analyticAccountId,
                    budgetType: dto.budgetType,
                    budgetedAmount: new library_1.Decimal(dto.budgetedAmount),
                    createdBy: userId,
                    status: BudgetStatus.DRAFT,
                    revisionOfId: oldBudget.id,
                },
            });
            await tx.budget.update({
                where: { id: oldBudget.id },
                data: { status: BudgetStatus.REVISED },
            });
            return newBudget;
        });
    }
    async checkBudgetAvailability(analyticAccountId, amount, date) {
        const budget = await this.prisma.budget.findFirst({
            where: {
                analyticAccountId,
                status: BudgetStatus.CONFIRMED,
                startDate: { lte: date },
                endDate: { gte: date },
            },
        });
        if (!budget) {
            return { available: true, remaining: 0, message: "No budget configured for this category" };
        }
        const actualSpent = await this.prisma.invoiceLine.aggregate({
            where: {
                analyticAccountId,
                invoice: {
                    status: "POSTED",
                    date: {
                        gte: budget.startDate,
                        lte: budget.endDate,
                    },
                },
            },
            _sum: {
                subtotal: true,
            },
        });
        const spent = Number(actualSpent._sum.subtotal || 0);
        const budgetedAmount = Number(budget.budgetedAmount);
        const remaining = budgetedAmount - spent;
        return {
            available: remaining >= amount,
            remaining,
            budgetId: budget.id,
            message: remaining >= amount
                ? `Budget available: ₹${remaining.toFixed(2)} remaining`
                : `Budget exceeded: Only ₹${remaining.toFixed(2)} available, requested ₹${amount.toFixed(2)}`,
        };
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map