"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Archive, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { budgetsApi } from "@/lib/api/client";

interface BudgetDetailPageProps {
  params: { id: string };
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
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
        const budgetData = await budgetsApi.getById(params.id);
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

  }, [params.id]);

  const handleConfirm = async () => {
    try {
      await budgetsApi.approve(budget.id);
      const updated = await budgetsApi.getById(params.id);
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
  getStatusBadge: (status: string) => JSX.Element;
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

budgetType: "EXPENSE",
  budgetedAmount: "",
  });
const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
  {},
);

useEffect(() => {
  if (isEdit) {
    fetchBudgetData();
  }
  fetchAnalyticAccounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [budgetId]);

const fetchAnalyticAccounts = async () => {
  try {
    const response = await fetch(
      "http://localhost:4000/analytical-accounts",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    if (response.ok) {
      const data = await response.json();
      setAnalyticAccounts(data);
    }
  } catch (error) {
    console.error("Failed to fetch analytic accounts:", error);
  }
};

const fetchBudgetData = async () => {
  try {
    setLoading(true);
    const data = await fetchBudget(budgetId);
    setBudget(data);
    setFormData({
      name: data.name,
      startDate: data.startDate.split("T")[0],
      endDate: data.endDate.split("T")[0],
      analyticAccountId: data.analyticAccountId,
      budgetType: data.budgetType,
      budgetedAmount: data.budgetedAmount.toString(),
    });
  } catch (error) {
    console.error("Failed to load budget:", error);
    alert("Failed to load budget");
    router.push("/dashboard/budgets");
  } finally {
    setLoading(false);
  }
};

const validateForm = (): boolean => {
  const newErrors: Partial<Record<keyof FormData, string>> = {};

  if (!formData.name.trim()) {
    newErrors.name = "Budget name is required";
  }

  if (!formData.startDate) {
    newErrors.startDate = "Start date is required";
  }

  if (!formData.endDate) {
    newErrors.endDate = "End date is required";
  }

  if (formData.startDate && formData.endDate) {
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
  }

  if (!formData.analyticAccountId) {
    newErrors.analyticAccountId = "Analytic account is required";
  }

  if (!formData.budgetedAmount || parseFloat(formData.budgetedAmount) <= 0) {
    newErrors.budgetedAmount = "Budgeted amount must be greater than 0";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    alert("Please fix the errors in the form");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      ...formData,
      budgetedAmount: parseFloat(formData.budgetedAmount),
    };

    if (isEdit) {
      await updateBudget(budgetId, payload);
      alert("Budget updated successfully");
    } else {
      const newBudget = await createBudget(payload);
      alert("Budget created successfully");
      router.push(`/dashboard/budgets/${newBudget.id}`);
      return;
    }

    fetchBudgetData();
  } catch (error) {
    console.error("Failed to save budget:", error);
    alert("Failed to save budget");
  } finally {
    setSaving(false);
  }
};

const handleConfirm = async () => {
  if (
    !confirm(
      "Confirm this budget? It will be locked for editing and actuals will start computing.",
    )
  )
    return;

  try {
    await confirmBudget(budgetId);
    alert("Budget confirmed successfully");
    fetchBudgetData();
  } catch (error) {
    console.error("Failed to confirm budget:", error);
    alert("Failed to confirm budget");
  }
};

const handleRevise = async () => {
  if (
    !confirm(
      "Create a revision of this budget? The current budget will be marked as REVISED.",
    )
  )
    return;

  try {
    const newBudget = await reviseBudget(budgetId);
    alert("Budget revision created successfully");
    router.push(`/dashboard/budgets/${newBudget.id}`);
  } catch (error) {
    console.error("Failed to revise budget:", error);
    alert("Failed to revise budget");
  }
};

const handleArchive = async () => {
  if (!confirm("Are you sure you want to archive this budget?")) return;

  try {
    await archiveBudget(budgetId);
    alert("Budget archived successfully");
    router.push("/dashboard/budgets");
  } catch (error) {
    console.error("Failed to archive budget:", error);
    alert("Failed to archive budget");
  }
};

const handleChange = (field: keyof FormData, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }
};

const isDraft = budget?.status === "DRAFT";
const isConfirmed = budget?.status === "CONFIRMED";
const isRevised = budget?.status === "REVISED";
const canEdit = !isEdit || isDraft;

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

return (
  <div className="p-6 max-w-4xl mx-auto space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/budgets")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Budget" : "New Budget"}
            </h1>
            {budget && <BudgetStatusBadge status={budget.status} />}
          </div>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Update budget information" : "Create a new budget"}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {isEdit && (
          <>
            {isDraft && (
              <Button variant="outline" onClick={handleConfirm}>
                <Check className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            )}
            {isConfirmed && (
              <Button variant="outline" onClick={handleRevise}>
                <GitBranch className="mr-2 h-4 w-4" />
                Revise
              </Button>
            )}
            {!isRevised && (
              <Button variant="outline" onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
          </>
        )}
        {canEdit && (
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </div>

    {/* Revision Info */}
    {budget?.revisionOf && (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-4">
          <p className="text-sm text-yellow-800">
            This budget is a revision of{" "}
            <button
              onClick={() =>
                router.push(`/dashboard/budgets/${budget.revisionOf?.id}`)
              }
              className="underline font-medium"
            >
              {budget.revisionOf.name}
            </button>
          </p>
        </CardContent>
      </Card>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Budget Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter budget name"
                disabled={!canEdit}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetType">
                Budget Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="budgetType"
                value={formData.budgetType}
                onChange={(e) =>
                  handleChange(
                    "budgetType",
                    e.target.value as "INCOME" | "EXPENSE",
                  )
                }
                disabled={!canEdit}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                disabled={!canEdit}
                className={errors.startDate ? "border-destructive" : ""}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                disabled={!canEdit}
                className={errors.endDate ? "border-destructive" : ""}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="analyticAccountId">
                Analytic Account <span className="text-destructive">*</span>
              </Label>
              <select
                id="analyticAccountId"
                value={formData.analyticAccountId}
                onChange={(e) =>
                  handleChange("analyticAccountId", e.target.value)
                }
                disabled={!canEdit}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.analyticAccountId ? "border-destructive" : ""
                  }`}
              >
                <option value="">Select an analytic account</option>
                {analyticAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
              {errors.analyticAccountId && (
                <p className="text-sm text-destructive">
                  {errors.analyticAccountId}
                </p>
              )}
              {analyticAccounts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No analytic accounts found. Please create one first at{" "}
                  <a
                    href="/dashboard/master-data/analytical-accounts"
                    className="text-primary underline"
                  >
                    Master Data → Analytical Accounts
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetedAmount">
                Budgeted Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="budgetedAmount"
                type="number"
                step="0.01"
                value={formData.budgetedAmount}
                onChange={(e) =>
                  handleChange("budgetedAmount", e.target.value)
                }
                placeholder="0.00"
                disabled={!canEdit}
                className={errors.budgetedAmount ? "border-destructive" : ""}
              />
              {errors.budgetedAmount && (
                <p className="text-sm text-destructive">
                  {errors.budgetedAmount}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actuals (only for CONFIRMED budgets) */}
      {isConfirmed && budget && budget.actualAmount !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Budgeted Amount
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(budget.budgetedAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actual Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(budget.actualAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Achieved</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(budget.achievedPercentage || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p
                  className={`text-2xl font-bold ${budget.isOverBudget ? "text-red-600" : ""}`}
                >
                  {formatCurrency(budget.remainingAmount || 0)}
                </p>
              </div>
            </div>

            {budget.isOverBudget && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ This budget is over by{" "}
                  {formatCurrency(Math.abs(budget.remainingAmount || 0))}
                </p>
              </div>
            )}

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/budgets/${budgetId}/drill-down`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  </div>
);
}
