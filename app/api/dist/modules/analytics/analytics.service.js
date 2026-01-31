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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const analytics_filters_dto_1 = require("./dto/analytics-filters.dto");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(filters) {
        const { startDate, endDate, analyticAccountId, budgetType } = filters;
        const budgetWhere = {
            status: client_1.BudgetStatus.CONFIRMED,
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
        };
        if (analyticAccountId) {
            budgetWhere.analyticAccountId = analyticAccountId;
        }
        if (budgetType && budgetType !== analytics_filters_dto_1.BudgetTypeFilter.ALL) {
            budgetWhere.budgetType = budgetType;
        }
        const budgets = await this.prisma.budget.findMany({
            where: budgetWhere,
            select: {
                id: true,
                budgetedAmount: true,
                analyticAccountId: true,
            },
        });
        const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budgetedAmount), 0);
        const totalActual = await this.calculateActuals(budgets.map((b) => b.analyticAccountId), new Date(startDate), new Date(endDate));
        const remaining = totalBudget - totalActual;
        const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
        return {
            totalBudget,
            totalActual,
            remaining,
            utilization: Math.round(utilization * 100) / 100,
        };
    }
    async getByAnalytic(filters) {
        const { startDate, endDate, analyticAccountId, budgetType, status } = filters;
        const budgetWhere = {
            status: client_1.BudgetStatus.CONFIRMED,
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
        };
        if (analyticAccountId) {
            budgetWhere.analyticAccountId = analyticAccountId;
        }
        if (budgetType && budgetType !== analytics_filters_dto_1.BudgetTypeFilter.ALL) {
            budgetWhere.budgetType = budgetType;
        }
        const budgets = await this.prisma.budget.findMany({
            where: budgetWhere,
            include: {
                analyticAccount: true,
            },
        });
        const accountMap = new Map();
        for (const budget of budgets) {
            const accountId = budget.analyticAccountId;
            if (!accountMap.has(accountId)) {
                accountMap.set(accountId, {
                    analyticAccountId: accountId,
                    analyticAccountName: budget.analyticAccount.name,
                    analyticAccountCode: budget.analyticAccount.code,
                    budgeted: 0,
                    actual: 0,
                });
            }
            const account = accountMap.get(accountId);
            account.budgeted += Number(budget.budgetedAmount);
        }
        const results = [];
        for (const [accountId, data] of accountMap.entries()) {
            const actual = await this.calculateActuals([accountId], new Date(startDate), new Date(endDate));
            const remaining = data.budgeted - actual;
            const utilization = data.budgeted > 0 ? (actual / data.budgeted) * 100 : 0;
            const isOverBudget = utilization > 100;
            if (status === analytics_filters_dto_1.StatusFilter.WITHIN_BUDGET && isOverBudget)
                continue;
            if (status === analytics_filters_dto_1.StatusFilter.OVER_BUDGET && !isOverBudget)
                continue;
            results.push(Object.assign(Object.assign({}, data), { actual,
                remaining, utilization: Math.round(utilization * 100) / 100, isOverBudget }));
        }
        results.sort((a, b) => b.utilization - a.utilization);
        return results;
    }
    async getDrilldown(analyticId, filters) {
        const { startDate, endDate } = filters;
        const invoiceLines = await this.prisma.invoiceLine.findMany({
            where: {
                analyticAccountId: analyticId,
                invoice: {
                    status: "POSTED",
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
            },
            include: {
                invoice: {
                    include: {
                        partner: true,
                    },
                },
            },
            orderBy: {
                invoice: {
                    date: "desc",
                },
            },
        });
        return invoiceLines.map((line) => ({
            id: line.id,
            invoiceNumber: line.invoice.number,
            date: line.invoice.date.toISOString(),
            partnerName: line.invoice.partner.name,
            amount: Number(line.subtotal),
            description: line.label,
        }));
    }
    async calculateActuals(analyticAccountIds, startDate, endDate) {
        if (analyticAccountIds.length === 0)
            return 0;
        const result = await this.prisma.invoiceLine.aggregate({
            where: {
                analyticAccountId: { in: analyticAccountIds },
                invoice: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                    status: "POSTED",
                },
            },
            _sum: {
                subtotal: true,
            },
        });
        return Number(result._sum.subtotal || 0);
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map