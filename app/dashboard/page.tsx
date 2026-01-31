"use client";

import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { MoneyFlowChart } from "@/components/charts/money-flow-chart";
import { BudgetDonutChart } from "@/components/charts/budget-donut-chart";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions";
import { apiRequest } from "@/lib/api";
import { AddWidgetDialog } from "@/components/dashboard/add-widget-dialog";

export default function DashboardPage() {
  const [showAddWidgetDialog, setShowAddWidgetDialog] = useState(false);
  // Initialize with stored name to prevent flash of "User"
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userName") || "User";
    }
    return "User";
  });
  const [metrics, setMetrics] = useState<any>({
    balance: 0,
    income: 0,
    expense: 0,
    savings: 0,
    savingsRate: 0,
  });
  const [dataFlow, setDataFlow] = useState<any[]>([]);
  const [dataBudget, setDataBudget] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [metricsData, flowData, budgetData, recentTx, profileData] =
          await Promise.all([
            apiRequest("/dashboard/metrics"),
            apiRequest("/dashboard/money-flow"),
            apiRequest("/dashboard/budget-usage"),
            apiRequest("/dashboard/recent-transactions"),
            apiRequest("/auth/profile"),
          ]);

        if (metricsData) setMetrics(metricsData);
        if (flowData) setDataFlow(flowData);
        if (budgetData) setDataBudget(budgetData);
        if (recentTx) setTransactions(recentTx);
        if (profileData && profileData.name) {
          setUserName(profileData.name);
          // Keep localStorage in sync
          localStorage.setItem("userName", profileData.name);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your financial performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="rounded-full px-6 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            onClick={() => setShowAddWidgetDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Widget
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Balance"
          value={`₹${metrics.balance.toLocaleString()}`}
          trend={`${metrics.savingsRate}%`} // Using savings rate as trend for now
          trendUp={metrics.balance >= 0}
        />
        <KPICard
          title="Income"
          value={`₹${metrics.income.toLocaleString()}`}
          trend="0%"
          trendUp={true}
        />
        <KPICard
          title="Expense"
          value={`₹${metrics.expense.toLocaleString()}`}
          trend="0%"
          trendUp={false}
        />
        <KPICard
          title="Total Savings"
          value={`₹${metrics.savings.toLocaleString()}`}
          trend={`${metrics.savingsRate}%`}
          trendUp={metrics.savings >= 0}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7">
        <MoneyFlowChart data={dataFlow} />
        <BudgetDonutChart data={dataBudget} />
      </div>

      {/* Recent Transactions List */}
      <RecentTransactionsList transactions={transactions} />

      <AddWidgetDialog
        open={showAddWidgetDialog}
        onOpenChange={setShowAddWidgetDialog}
        onAddWidget={(widgetId) => {
          console.log("Adding widget:", widgetId);
          // TODO: Implement widget addition logic
        }}
      />
    </div>
  );
}
