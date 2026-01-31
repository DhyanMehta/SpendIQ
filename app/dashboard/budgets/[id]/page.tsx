"use client";

import { use, ElementRef, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Download, PenLine } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/dashboard/kpi-card"; // Reusing KPI card
import { Activity, DollarSign, PieChart } from "lucide-react";

// In a real app, strict params props for App Router
export default function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Next.js 15+ way, or await params in component if async

  // Mock data fetching based on ID
  const budget = {
    id,
    name: "IT Infrastructure Upgrade",
    department: "IT",
    allocated: 120000,
    spent: 115000,
    start: "2026-01-01",
    end: "2026-12-31",
    status: "Warning",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/budgets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{budget.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>{budget.department}</span>
              <span>•</span>
              <span>
                {budget.start} — {budget.end}
              </span>
              <Badge variant="warning" className="ml-2">
                At Risk
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button>
            <PenLine className="mr-2 h-4 w-4" /> Edit Budget
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Total Allocated"
          value={`$${budget.allocated.toLocaleString()}`}
          icon={DollarSign}
        />
        <KPICard
          title="Actual Spent"
          value={`$${budget.spent.toLocaleString()}`}
          icon={Activity}
        />
        <KPICard
          title="Remaining"
          value={`$${(budget.allocated - budget.spent).toLocaleString()}`}
          icon={PieChart}
          trend="-500 remaining"
          trendUp={false}
        />
      </div>

      {/* Transactions for this budget */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest expenses charged to this budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-center py-10 text-muted-foreground">
            Transaction table pending implementation in Transactions Module.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
