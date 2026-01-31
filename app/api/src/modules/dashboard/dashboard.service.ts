import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { InvoiceType, InvoiceStatus } from "@prisma/client";

/**
 * Dashboard Service
 * 
 * Provides aggregated business metrics and chart data for the main dashboard.
 * Queries invoices and budgets to compute KPIs and visualizations.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Calculate main dashboard KPI metrics
   * 
   * Computes:
   * - Income: Sum of all posted customer invoices (OUT_INVOICE)
   * - Expense: Sum of all posted vendor bills (IN_INVOICE)
   * - Balance: Income minus Expense
   * - Savings Rate: Percentage of income retained as profit
   * 
   * @returns Object with balance, income, expense, savings, and savingsRate
   */
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

  /**
   * Get monthly income vs expense data for money flow chart
   * 
   * Groups all posted invoices by month and separates into:
   * - Income: Customer invoices (OUT_INVOICE)
   * - Expense: Vendor bills (IN_INVOICE)
   * 
   * @returns Array of objects with { name: monthName, income: number, expense: number }
   */
  async getMoneyFlow() {
    // Get all posted invoices
    const allInvoices = await this.prisma.invoice.findMany({
      where: { status: InvoiceStatus.POSTED },
      select: { date: true, type: true, totalAmount: true },
    });

    // Month name mapping
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Group by month
    const groups: Record<string, { name: string; income: number; expense: number }> = {};

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

  /**
   * Get the 5 most recent transactions
   * 
   * Returns recent invoices (both sales and purchases) with partner details.
   * Ordered by date descending.
   * 
   * @returns Array of Invoice objects with partner relation
   */
  async getRecentTransactions() {
    return this.prisma.invoice.findMany({
      take: 5,
      orderBy: { date: "desc" },
      include: { partner: true },
    });
  }

  /**
   * Get budget utilization data for donut chart
   * 
   * Returns the user's budgets formatted for visualization.
   * Each budget becomes a slice with name, value (budgeted amount), and color.
   * 
   * @param userId - The authenticated user's ID
   * @returns Array of objects with { name, value, color } for chart rendering
   */
  async getBudgetUtilization(userId: string) {
    // Get budgets created by this user
    const budgets = await this.prisma.budget.findMany({
      where: { createdBy: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Define consistent colors for budget visualization
    const colors = ["#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];

    // Transform for Donut Chart
    return budgets.map((b, index) => ({
      name: b.name,
      value: Number(b.budgetedAmount),
      color: colors[index % colors.length],
    }));
  }
}
