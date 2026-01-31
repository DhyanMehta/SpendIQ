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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetrics() {
        const incomeAgg = await this.prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                type: client_1.InvoiceType.OUT_INVOICE,
                status: client_1.InvoiceStatus.POSTED,
            },
        });
        const income = Number(incomeAgg._sum.totalAmount || 0);
        const expenseAgg = await this.prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: {
                type: client_1.InvoiceType.IN_INVOICE,
                status: client_1.InvoiceStatus.POSTED,
            },
        });
        const expense = Number(expenseAgg._sum.totalAmount || 0);
        const balance = income - expense;
        const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
        return {
            balance,
            income,
            expense,
            savings: balance,
            savingsRate: Math.round(savingsRate * 10) / 10,
        };
    }
    async getMoneyFlow() {
        const allInvoices = await this.prisma.invoice.findMany({
            where: { status: client_1.InvoiceStatus.POSTED },
            select: { date: true, type: true, totalAmount: true },
        });
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        const groups = {};
        allInvoices.forEach((inv) => {
            const date = new Date(inv.date);
            const key = `${months[date.getMonth()]}`;
            if (!groups[key])
                groups[key] = { name: key, income: 0, expense: 0 };
            const amt = Number(inv.totalAmount);
            if (inv.type === client_1.InvoiceType.OUT_INVOICE) {
                groups[key].income += amt;
            }
            else if (inv.type === client_1.InvoiceType.IN_INVOICE) {
                groups[key].expense += amt;
            }
        });
        return Object.values(groups);
    }
    async getRecentTransactions() {
        return this.prisma.invoice.findMany({
            take: 5,
            orderBy: { date: "desc" },
            include: { partner: true },
        });
    }
    async getBudgetUtilization(userId) {
        const budgets = await this.prisma.budget.findMany({
            where: { createdBy: userId },
            take: 5,
            orderBy: { createdAt: "desc" },
        });
        const colors = ["#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
        return budgets.map((b, index) => ({
            name: b.name,
            value: Number(b.budgetedAmount),
            color: colors[index % colors.length],
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map