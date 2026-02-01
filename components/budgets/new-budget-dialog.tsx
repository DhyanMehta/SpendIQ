"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { Loader2, Plus, Trash2 } from "lucide-react";

const budgetLineSchema = z.object({
  description: z.string().optional(),
  plannedAmount: z.number().min(0, "Amount must be positive"),
  productId: z.string().optional(),
});

const budgetSchema = z.object({
  name: z.string().min(3, "Budget name must be at least 3 characters"),
  fiscalYear: z.number().min(2020).max(2100),
  departmentId: z.string().optional(),
  lines: z.array(budgetLineSchema),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface NewBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewBudgetDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewBudgetDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      fiscalYear: new Date().getFullYear(),
      departmentId: "",
      lines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  async function onSubmit(values: BudgetFormData) {
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        name: values.name,
        fiscalYear: values.fiscalYear,
        departmentId:
          values.departmentId && values.departmentId.trim() !== ""
            ? values.departmentId
            : undefined,
        lines: values.lines.map((line) => ({
          description: line.description || "",
          plannedAmount: line.plannedAmount,
          productId: line.productId || undefined,
        })),
      };

      const response = await apiRequest("/budgets", {
        method: "POST",
        body: payload,
      });

      // Close dialog and refresh
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }

      // Navigate to the budgets list page
      router.push("/dashboard/budgets");
    } catch (e: any) {
      console.error("[NewBudget] Failed:", e);
      console.error("[NewBudget] Error details:", {
        message: e?.message,
        response: e?.response,
        stack: e?.stack,
      });

      // Show more specific error messages
      let errorMessage = "Failed to create budget. Please try again.";
      if (e?.message) {
        if (e.message.includes("401") || e.message.includes("Unauthorized")) {
          errorMessage = "You are not authorized. Please log in again.";
        } else if (
          e.message.includes("400") ||
          e.message.includes("Bad Request")
        ) {
          errorMessage = "Invalid budget data. Please check your inputs.";
        } else {
          errorMessage = e.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set up a new budget for tracking departmental allocations. You can
            add budget line items to specify planned amounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              placeholder="e.g., Marketing Q1 2024"
              disabled={isLoading}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscalYear">Fiscal Year</Label>
            <Input
              id="fiscalYear"
              type="number"
              placeholder="2024"
              disabled={isLoading}
              {...form.register("fiscalYear", { valueAsNumber: true })}
            />
            {form.formState.errors.fiscalYear && (
              <p className="text-xs text-destructive">
                {form.formState.errors.fiscalYear.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId">Department ID (Optional)</Label>
            <Input
              id="departmentId"
              placeholder="Leave empty for general budget"
              disabled={isLoading}
              {...form.register("departmentId")}
            />
            {form.formState.errors.departmentId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.departmentId.message}
              </p>
            )}
          </div>

          {/* Budget Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Budget Line Items (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", plannedAmount: 0 })}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Line
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No budget lines yet. Click &quot;Add Line&quot; to create one.
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 items-start p-3 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Description (e.g., Office Supplies)"
                    disabled={isLoading}
                    {...form.register(`lines.${index}.description`)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Planned Amount"
                    disabled={isLoading}
                    {...form.register(`lines.${index}.plannedAmount`, {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.lines?.[index]?.plannedAmount && (
                    <p className="text-xs text-destructive">
                      {
                        form.formState.errors.lines[index]?.plannedAmount
                          ?.message
                      }
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
