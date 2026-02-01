"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { budgetsApi } from "@/lib/api/client";
import { apiRequest } from "@/lib/api";

interface BudgetLine {
    analyticName: string;
    analyticAccountId: string;
    type: "INCOME" | "EXPENSE";
    budgetedAmount: number;
}

interface BudgetFormData {
    name: string;
    startDate: string;
    endDate: string;
    lines: BudgetLine[];
}

export default function NewBudgetPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<any[]>([]);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BudgetFormData>({
        defaultValues: {
            name: "",
            startDate: "",
            endDate: "",
            lines: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines",
    });

    // Fetch analytical accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await apiRequest("/analytical-accounts");
                setAnalyticalAccounts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load analytical accounts:", err);
            }
        };
        fetchAccounts();
    }, []);

    const onSubmit = async (data: BudgetFormData) => {
        try {
            setLoading(true);
            setError(null);

            // Create each budget line as a separate budget entry
            const budgetPromises = data.lines.map((line) =>
                budgetsApi.create({
                    name: data.name,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    analyticAccountId: line.analyticAccountId,
                    budgetType: line.type,
                    budgetedAmount: line.budgetedAmount,
                })
            );

            await Promise.all(budgetPromises);

            // Redirect to budgets list
            router.push("/dashboard/budgets");
        } catch (err: any) {
            console.error("Failed to create budget:", err);
            setError(err.message || "Failed to create budget");
        } finally {
            setLoading(false);
        }
    };

    const addLine = () => {
        append({
            analyticName: "",
            analyticAccountId: "",
            type: "EXPENSE",
            budgetedAmount: 0,
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/dashboard/budgets")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">New Budget</h1>
                    <p className="text-gray-600 mt-1">Create a new budget</p>
                </div>
            </div>

            {error && (
                <Card className="p-4 bg-red-50 border-red-200">
                    <p className="text-red-800">{error}</p>
                </Card>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card className="p-6 space-y-6">
                    {/* Budget Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-3">
                                <Label htmlFor="name">Budget Name *</Label>
                                <Input
                                    id="name"
                                    {...register("name", {
                                        required: "Budget name is required",
                                    })}
                                    placeholder="e.g., January 2026"
                                    disabled={loading}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    {...register("startDate", {
                                        required: "Start date is required",
                                    })}
                                    disabled={loading}
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.startDate.message}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="endDate">End Date *</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    {...register("endDate", {
                                        required: "End date is required",
                                    })}
                                    disabled={loading}
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.endDate.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Budget Lines */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold">Budget Lines</Label>
                            <Button
                                type="button"
                                onClick={addLine}
                                variant="outline"
                                size="sm"
                                disabled={loading}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Line
                            </Button>
                        </div>

                        {fields.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No budget lines added. Click "Add Line" to start.
                            </div>
                        )}

                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg"
                                >
                                    <div className="col-span-4">
                                        <Label>Analytic Account *</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                const account = analyticalAccounts.find(
                                                    (a) => a.id === value
                                                );
                                                setValue(`lines.${index}.analyticAccountId`, value);
                                                setValue(
                                                    `lines.${index}.analyticName`,
                                                    account?.name || ""
                                                );
                                            }}
                                            disabled={loading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {analyticalAccounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        {account.code} - {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-3">
                                        <Label>Type *</Label>
                                        <Select
                                            onValueChange={(value: "INCOME" | "EXPENSE") =>
                                                setValue(`lines.${index}.type`, value)
                                            }
                                            defaultValue="EXPENSE"
                                            disabled={loading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INCOME">Income</SelectItem>
                                                <SelectItem value="EXPENSE">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="col-span-4">
                                        <Label>Budgeted Amount *</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...register(`lines.${index}.budgetedAmount`, {
                                                required: true,
                                                valueAsNumber: true,
                                            })}
                                            placeholder="0.00"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            disabled={loading}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/budgets")}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || fields.length === 0}>
                        {loading ? "Creating..." : "Create Budget"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
