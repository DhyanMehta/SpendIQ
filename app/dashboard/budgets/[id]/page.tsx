"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Archive, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { budgetsApi } from "@/lib/api/client";

interface BudgetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [budget, setBudget] = useState<any>(null);
  const [relatedBudgets, setRelatedBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch budget details
        const budgetData = await budgetsApi.getById(id);
        setBudget(budgetData);

        // Fetch all budgets to find related ones (same name/period)
        const allBudgets = await budgetsApi.getAll();
        const related = Array.isArray(allBudgets)
          ? allBudgets.filter(
            (b: any) =>
              b.name === budgetData.name &&
              b.startDate === budgetData.startDate &&
              b.endDate === budgetData.endDate
          )
          : [];
        setRelatedBudgets(related);
      } catch (err: any) {
        console.error("Failed to load budget:", err);
        setError(err.message || "Failed to load budget");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleConfirm = async () => {
    try {
      await budgetsApi.approve(budget.id);
      const updated = await budgetsApi.getById(id);
      setBudget(updated);
      // Refresh related budgets
      const allBudgets = await budgetsApi.getAll();
      const related = Array.isArray(allBudgets)
        ? allBudgets.filter(
          (b: any) =>
            b.name === updated.name &&
            b.startDate === updated.startDate &&
            b.endDate === updated.endDate
        )
        : [];
      setRelatedBudgets(related);
    } catch (err: any) {
      alert("Failed to confirm budget: " + err.message);
    }
  };

  const handleRevise = () => {
    router.push("/dashboard/budgets/new");
  };

  const handleArchive = async () => {
    try {
      await budgetsApi.archive(budget.id);
      router.push("/dashboard/budgets");
    } catch (err: any) {
      alert("Failed to archive budget: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading budget...</div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-red-800 font-semibold">Error Loading Budget</h3>
          <p className="text-red-600 mt-2">{error || "Budget not found"}</p>
          <Button
            onClick={() => router.push("/dashboard/budgets")}
            className="mt-4"
            variant="outline"
          >
            Back to Budgets
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: any; label: string; color: string }
    > = {
      DRAFT: { variant: "secondary", label: "Draft", color: "bg-gray-100" },
      CONFIRMED: {
        variant: "default",
        label: "Confirm",
        color: "bg-purple-100",
      },
      REVISED: {
        variant: "outline",
        label: "Revised",
        color: "bg-orange-100",
      },
      ARCHIVED: {
        variant: "outline",
        label: "Archived",
        color: "bg-slate-100",
      },
      CANCELLED: {
        variant: "outline",
        label: "Cancelled",
        color: "bg-red-100",
      },
    };
    const config = variants[status] || variants.DRAFT;
    return (
      <Badge className={config.color} variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/budgets")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Budget</h1>
            <p className="text-gray-600 mt-1">{budget.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {budget.status === "DRAFT" && (
            <Button onClick={handleConfirm}>
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          )}
          {budget.status === "CONFIRMED" && (
            <Button onClick={handleRevise} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Revise
            </Button>
          )}
          <Button onClick={handleArchive} variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={budget.status.toLowerCase()} className="space-y-6">
        <TabsList>
          <TabsTrigger value="draft">New</TabsTrigger>
          <TabsTrigger value="confirmed">Confirm</TabsTrigger>
          <TabsTrigger value="revised">Revise</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="draft" className="space-y-4">
          <BudgetView
            budgets={relatedBudgets.filter((b) => b.status === "DRAFT")}
            status="DRAFT"
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          <BudgetView
            budgets={relatedBudgets.filter((b) => b.status === "CONFIRMED")}
            status="CONFIRMED"
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="revised" className="space-y-4">
          <BudgetView
            budgets={relatedBudgets.filter((b) => b.status === "REVISED")}
            status="REVISED"
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <BudgetView
            budgets={relatedBudgets.filter((b) => b.status === "ARCHIVED")}
            status="ARCHIVED"
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BudgetView({
  budgets,
  status,
  formatDate,
  formatCurrency,
  getStatusBadge,
}: {
  budgets: any[];
  status: string;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusBadge: (status: string) => React.ReactElement;
}) {
  if (budgets.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          No budgets with status: {status}
        </div>
      </Card>
    );
  }

  const firstBudget = budgets[0];

  return (
    <Card className="p-6 space-y-6">
      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Form View of {status === "REVISED" ? "Revised Budget" : "Original Budget"}
            </h3>
            {firstBudget.revisionOfId && (
              <p className="text-sm text-orange-600 mt-1">
                Revised with: Revised Budget
              </p>
            )}
            {firstBudget.revisedBy && (
              <p className="text-sm text-orange-600 mt-1">
                Revision of: Original Budget
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {getStatusBadge(status)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Budget Name:</span>
            <p className="font-medium">{firstBudget.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Budget Period:</span>
            <p className="font-medium">
              {formatDate(firstBudget.startDate)} to{" "}
              {formatDate(firstBudget.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Lines Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Analytic Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Type
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Budgeted Amount
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Achieved Amount
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Achieved %
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                Amount to Achieve
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {budgets.map((budget, index) => {
              const achieved = budget.actualAmount || 0;
              const budgeted = Number(budget.budgetedAmount);
              const percentage = budgeted > 0 ? (achieved / budgeted) * 100 : 0;
              const remaining = budgeted - achieved;

              return (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {budget.analyticAccount?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {budget.budgetType === "INCOME" ? "Income" : "Expense"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(budgeted)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {status === "CONFIRMED" ? formatCurrency(achieved) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {status === "CONFIRMED" ? `${percentage.toFixed(2)}%` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {status === "CONFIRMED" ? formatCurrency(remaining) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
