import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import {
  AnalyticsFiltersDto,
  BudgetTypeFilter,
  StatusFilter,
} from "./dto/analytics-filters.dto";
import { BudgetStatus, BudgetType } from "@prisma/client";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get aggregate KPIs across all analytic accounts
   */
  async getSummary(filters: AnalyticsFiltersDto) {
    const { startDate, endDate, analyticAccountId, budgetType } = filters;

    // Build budget filter
    const budgetWhere: any = {
      status: BudgetStatus.CONFIRMED,
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) },
    };

    if (analyticAccountId) {
      budgetWhere.analyticAccountId = analyticAccountId;
    }

    if (budgetType && budgetType !== BudgetTypeFilter.ALL) {
      budgetWhere.budgetType = budgetType as BudgetType;
    }

    // Fetch confirmed budgets
    const budgets = await this.prisma.budget.findMany({
      where: budgetWhere,
      select: {
        id: true,
        budgetedAmount: true,
        analyticAccountId: true,
      },
    });

    // Calculate total budget
    const totalBudget = budgets.reduce(
      (sum, b) => sum + Number(b.budgetedAmount),
      0,
    );

    // Calculate actuals from posted invoices
    const totalActual = await this.calculateActuals(
      budgets.map((b) => b.analyticAccountId),
      new Date(startDate),
      new Date(endDate),
    );

    const remaining = totalBudget - totalActual;
    const utilization = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalActual,
      remaining,
      utilization: Math.round(utilization * 100) / 100,
    };
  }

  /**
   * Get performance data by analytic account
   */
  async getByAnalytic(filters: AnalyticsFiltersDto) {
    const { startDate, endDate, analyticAccountId, budgetType, status } =
      filters;

    // Build budget filter
    const budgetWhere: any = {
      status: BudgetStatus.CONFIRMED,
      startDate: { lte: new Date(endDate) },
      endDate: { gte: new Date(startDate) },
    };

    if (analyticAccountId) {
      budgetWhere.analyticAccountId = analyticAccountId;
    }

    if (budgetType && budgetType !== BudgetTypeFilter.ALL) {
      budgetWhere.budgetType = budgetType as BudgetType;
    }

    // Fetch budgets with analytic account info
    const budgets = await this.prisma.budget.findMany({
      where: budgetWhere,
      include: {
        analyticAccount: true,
      },
    });

    // Group by analytic account
    const accountMap = new Map<string, any>();

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

    // Calculate actuals for each account
    const results = [];
    for (const [accountId, data] of accountMap.entries()) {
      const actual = await this.calculateActuals(
        [accountId],
        new Date(startDate),
        new Date(endDate),
      );

      const remaining = data.budgeted - actual;
      const utilization =
        data.budgeted > 0 ? (actual / data.budgeted) * 100 : 0;
      const isOverBudget = utilization > 100;

      // Apply status filter
      if (status === StatusFilter.WITHIN_BUDGET && isOverBudget) continue;
      if (status === StatusFilter.OVER_BUDGET && !isOverBudget) continue;

      results.push({
        ...data,
        actual,
        remaining,
        utilization: Math.round(utilization * 100) / 100,
        isOverBudget,
      });
    }

    // Sort by utilization descending (highest first)
    results.sort((a, b) => b.utilization - a.utilization);

    return results;
  }

  /**
   * Get drill-down transaction details for specific analytic account
   */
  async getDrilldown(analyticId: string, filters: AnalyticsFiltersDto) {
    const { startDate, endDate } = filters;

    // Fetch posted invoice lines for this analytic account
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

  /**
   * Calculate actuals from posted invoices for given analytic accounts
   */
  private async calculateActuals(
    analyticAccountIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    if (analyticAccountIds.length === 0) return 0;

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
}
