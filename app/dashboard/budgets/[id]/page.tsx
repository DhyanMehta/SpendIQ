"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Check, Archive, GitBranch, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchBudget,
  createBudget,
  updateBudget,
  confirmBudget,
  reviseBudget,
  archiveBudget,
  type Budget,
} from "@/lib/budgets/api";
import {
  formatCurrency,
  formatPercentage,
  computeBudgetActuals,
} from "@/lib/budgets/calculations";
import BudgetStatusBadge from "@/components/budgets/BudgetStatusBadge";

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  analyticAccountId: string;
  budgetType: "INCOME" | "EXPENSE";
  budgetedAmount: string;
}

export default function BudgetFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id && params.id !== "new";
  const budgetId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [analyticAccounts, setAnalyticAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    startDate: "",
    endDate: "",
    analyticAccountId: "",
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
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.analyticAccountId ? "border-destructive" : ""
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
