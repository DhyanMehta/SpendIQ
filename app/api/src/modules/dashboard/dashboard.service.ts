import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { InvoiceType, InvoiceStatus } from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    // 1. Calculate Income (Sales)
    const incomeAgg = await this.prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        type: InvoiceType.OUT_INVOICE,
        status: InvoiceStatus.POSTED,
      },
    });
    const income = Number(incomeAgg._sum.totalAmount || 0);

    // 2. Calculate Expenses (Vendor Bills)
    const expenseAgg = await this.prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: {
        type: InvoiceType.IN_INVOICE,
        status: InvoiceStatus.POSTED,
      },
    });
    const expense = Number(expenseAgg._sum.totalAmount || 0);

    // 3. Balance
    const balance = income - expense;

    // 4. Savings %
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return {
      balance,
      income,
      expense,
      savings: balance, // simplified
      savingsRate: Math.round(savingsRate * 10) / 10,
    };
  }

  async getMoneyFlow() {
    // Get last 6 months data
    // For MVP, just grouping purely by DB data might be sparse.
    // We will query all posted invoices and group by month in JS for simplicity.
    const allInvoices = await this.prisma.invoice.findMany({
      where: { status: InvoiceStatus.POSTED },
      select: { date: true, type: true, totalAmount: true },
    });

    // Grouping logic (simplified)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const groups: Record<
      string,
      { name: string; income: number; expense: number }
    > = {};

    // Initialize data for last 6 months (optional, skipping for brevity, doing sparse map)

    allInvoices.forEach((inv) => {
      const date = new Date(inv.date);
      const key = `${months[date.getMonth()]}`;

      if (!groups[key]) groups[key] = { name: key, income: 0, expense: 0 };

      const amt = Number(inv.totalAmount);
      if (inv.type === InvoiceType.OUT_INVOICE) {
        groups[key].income += amt;
      } else if (inv.type === InvoiceType.IN_INVOICE) {
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

  async getBudgetUtilization(userId: string) {
    // Added userId parameter
    // Get budgets and compute usage
    const budgets = await this.prisma.budget.findMany({
      where: { createdBy: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Transform for Donut Chart (Top 5 categories by planned amount)
    return budgets
      .map((b) => {
        return {
          name: b.name,
          value: Number(b.budgetedAmount), // Use budgetedAmount directly
          color: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color for now
        };
      })
      .slice(0, 5);
  }
}
