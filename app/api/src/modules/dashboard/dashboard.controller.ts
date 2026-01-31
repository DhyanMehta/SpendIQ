import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";

/**
 * Dashboard Controller
 * 
 * Provides aggregated metrics and visualizations for the main dashboard.
 * All endpoints require JWT authentication.
 */
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  /**
   * Get main dashboard KPI metrics
   * @returns Object containing balance, income, expense, savings, and savingsRate
   */
  @Get("metrics")
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }

  /**
   * Get income vs expense data for money flow chart
   * @returns Array of monthly income/expense data for visualization
   */
  @Get("money-flow")
  async getMoneyFlow() {
    return this.dashboardService.getMoneyFlow();
  }

  /**
   * Get the 5 most recent transactions
   * @returns Array of recent invoices with partner details
   */
  @Get("recent-transactions")
  async getRecentTransactions() {
    return this.dashboardService.getRecentTransactions();
  }

  /**
   * Get budget utilization data for charts
   * @param req - Request object containing authenticated user
   * @returns Array of budget usage data for donut chart visualization
   */
  @Get("budget-usage")
  async getBudgetUsage(@Request() req) {
    return this.dashboardService.getBudgetUtilization(req.user.id);
  }
}
