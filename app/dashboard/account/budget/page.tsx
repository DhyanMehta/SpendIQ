"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { budgetsApi } from "@/lib/api/client";

export default function BudgetsPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await budgetsApi.getAll();
        setBudgets(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Failed to load budgets:", err);
        setError(err.message || "Failed to load budgets");
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading budgets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-red-800 font-semibold">Error Loading Budgets</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-gray-600 mt-1">Manage your budgets</p>
        </div>
        <Button onClick={() => router.push("/dashboard/account/budget/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Budget
        </Button>
      </div>

      {/* Budget List */}
      <Card className="p-6">
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No budgets found</p>
            <Button onClick={() => router.push("/dashboard/account/budget/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Found {budgets.length} budget{budgets.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4">
              {budgets.map((budget: any) => (
                <Card
                  key={budget.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/account/budget/${budget.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{budget.name}</h3>
                      <p className="text-sm text-gray-600">
                        {budget.analyticAccount?.code} -{" "}
                        {budget.analyticAccount?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{Number(budget.budgetedAmount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-gray-600">{budget.status}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
