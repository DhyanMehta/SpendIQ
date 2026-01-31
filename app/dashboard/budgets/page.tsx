"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchBudgets, type Budget } from "@/lib/budgets/api";
import { formatCurrency, formatPercentage } from "@/lib/budgets/calculations";
import BudgetChart from "@/components/budgets/BudgetChart";
import BudgetStatusBadge from "@/components/budgets/BudgetStatusBadge";

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters: any = {};

      if (search) filters.search = search;
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.budgetType = typeFilter;

      const response = await fetchBudgets(filters);
      setBudgets(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Failed to load budgets:", error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter]);

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/budgets/${id}`);
  };

  const getTypeBadgeColor = (type: string) => {
    return type === "INCOME"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Master</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage budgets against actual performance
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/budgets/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by budget name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "DRAFT" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("DRAFT")}
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("CONFIRMED")}
              >
                Confirmed
              </Button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <div className="flex gap-2">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
              >
                All
              </Button>
              <Button
                variant={typeFilter === "INCOME" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("INCOME")}
              >
                Income
              </Button>
              <Button
                variant={typeFilter === "EXPENSE" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("EXPENSE")}
              >
                Expense
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Analytic Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Budgeted</TableHead>
                <TableHead className="text-right">Achieved</TableHead>
                <TableHead className="text-right">%</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : budgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-lg font-medium">No budgets found</p>
                      <p className="text-sm mt-1">
                        Get started by creating your first budget
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => router.push("/dashboard/budgets/new")}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Budget
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                budgets.map((budget) => {
                  const isOverBudget = budget.isOverBudget || false;
                  const rowClass = isOverBudget
                    ? "cursor-pointer hover:bg-red-50 bg-red-50/30 transition-colors"
                    : "cursor-pointer hover:bg-muted/50 transition-colors";

                  return (
                    <TableRow
                      key={budget.id}
                      className={rowClass}
                      onClick={() => handleRowClick(budget.id)}
                    >
                      <TableCell className="font-medium">
                        {budget.name}
                      </TableCell>
                      <TableCell>
                        {budget.analyticAccount?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(budget.budgetType)}>
                          {budget.budgetType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(budget.startDate).toLocaleDateString()} -{" "}
                        {new Date(budget.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(budget.budgetedAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {budget.actualAmount !== undefined
                          ? formatCurrency(budget.actualAmount)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {budget.achievedPercentage !== undefined
                          ? formatPercentage(budget.achievedPercentage)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <BudgetStatusBadge status={budget.status} />
                      </TableCell>
                      <TableCell>
                        {budget.actualAmount !== undefined && (
                          <BudgetChart
                            budgeted={budget.budgetedAmount}
                            actual={budget.actualAmount}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Results Count */}
      {!loading && budgets.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {budgets.length} budget{budgets.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
