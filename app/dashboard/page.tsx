"use client";

import { KPICard } from "@/components/dashboard/kpi-card";
import { BudgetVsActualChart } from "@/components/charts/budget-vs-actual";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyFlowChart } from "@/components/charts/money-flow-chart";
import { BudgetDonutChart } from "@/components/charts/budget-donut-chart";
import { RecentTransactionsList } from "@/components/dashboard/recent-transactions";

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, Admin!
          </h1>
          <p className="text-muted-foreground mt-1">
            It is the best time to manage your finances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full px-6 h-12 bg-background border-border hover:bg-secondary"
          >
            <Calendar className="mr-2 h-4 w-4" /> This Month
          </Button>
          <Button className="rounded-full px-6 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            <Plus className="mr-2 h-4 w-4" /> Add New Widget
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Balance"
          value="$15,700.00"
          trend="12.1%"
          trendUp={true}
        />
        <KPICard title="Income" value="$8,500.00" trend="6.3%" trendUp={true} />
        <KPICard
          title="Expense"
          value="$6,222.00"
          trend="2.4%"
          trendUp={false}
        />
        <KPICard
          title="Total Savings"
          value="$32,913.00"
          trend="12.1%"
          trendUp={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7">
        <MoneyFlowChart />
        <BudgetDonutChart />
      </div>

      {/* Recent Transactions List */}
      <RecentTransactionsList />
    </div>
  );
}
