"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useSalesOrder,
  useCreateSalesOrder,
  useUpdateSalesOrder,
  useConfirmSalesOrder,
  useCancelSalesOrder,
} from "@/lib/hooks/useSalesOrders";
import { useContacts } from "@/lib/hooks/useContacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ArrowLeft, Save, Check, X, FileText } from "lucide-react";
import { SalesLineItems } from "@/components/sale/SalesLineItems";
import { SalesSummary } from "@/components/sale/SalesSummary";
import { toast } from "sonner";
import { salesApi } from "@/lib/api/client";

interface SalesOrderFormProps {
  id?: string;
}

export default function SalesOrderForm({ id }: SalesOrderFormProps) {
  const router = useRouter();
  const isEditMode = !!id && id !== "create";

  const { data: salesOrder, isLoading: isLoadingSO } = useSalesOrder(id || "");
  const { data: contactsData } = useContacts();

  const createMutation = useCreateSalesOrder();
  const updateMutation = useUpdateSalesOrder();
  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();

  const [customerId, setCustomerId] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const customers =
    contactsData?.filter((c: any) => c.type === "CUSTOMER") || [];

  const isConfirmed = salesOrder?.status === "CONFIRMED";
  const isCancelled = salesOrder?.status === "CANCELLED";
  const isReadOnly = isConfirmed || isCancelled;

  // Load existing data in edit mode
  useEffect(() => {
    if (salesOrder && isEditMode) {
      setCustomerId(salesOrder.customerId);
      setOrderDate(salesOrder.date.split("T")[0]);
      setLines(salesOrder.lines || []);
    }
  }, [salesOrder, isEditMode]);

  // Initialize with one empty line for new SO
  useEffect(() => {
    if (!isEditMode && lines.length === 0) {
      setLines([
        {
          productId: "",
          quantity: 1,
          unitPrice: 0,
          analyticalAccountId: "",
        },
      ]);
    }
  }, [isEditMode, lines.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customer = "Customer is required";
    }

    if (!orderDate) {
      newErrors.orderDate = "Order date is required";
    }

    if (lines.length === 0) {
      newErrors.lines = "At least one line item is required";
    } else {
      lines.forEach((line, index) => {
        if (!line.productId) {
          newErrors[`line_${index}_product`] = "Product is required";
        }
        if (line.quantity <= 0) {
          newErrors[`line_${index}_quantity`] =
            "Quantity must be greater than 0";
        }
        if (line.unitPrice < 0) {
          newErrors[`line_${index}_unitPrice`] =
            "Unit price cannot be negative";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      return;
    }

    const dto = {
      customerId,
      date: new Date(orderDate),
      lines: lines.map((line) => ({
        productId: line.productId,
        quantity: parseFloat(line.quantity),
        unitPrice: parseFloat(line.unitPrice),
        analyticalAccountId: line.analyticalAccountId || undefined,
      })),
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, data: dto });
        toast.success("Sales Order updated successfully");
      } else {
        const result = await createMutation.mutateAsync(dto);
        toast.success("Sales Order created successfully");
        router.push(`/dashboard/sale/order/${result.id}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;

    if (
      confirm(
        "Are you sure you want to confirm this Sales Order? It will become read-only.",
      )
    ) {
      try {
        await confirmMutation.mutateAsync(id);
        toast.success("Sales Order confirmed successfully");
      } catch (error: any) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCancel = async () => {
    if (!id) return;

    if (confirm("Are you sure you want to cancel this Sales Order?")) {
      try {
        await cancelMutation.mutateAsync(id);
        toast.success("Sales Order cancelled successfully");
      } catch (error: any) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleBack = () => {
    router.push("/dashboard/sale/order");
  };

  const handleCreateInvoice = async () => {
    try {
      await salesApi.createInvoice(id!);
      toast.success("Invoice created successfully");
      router.push("/dashboard/sale/invoice");
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  if (isEditMode && isLoadingSO) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? salesOrder?.reference : "New Sales Order"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode
                ? "Edit sales order details"
                : "Create a new sales order"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && <StatusBadge status={salesOrder?.status || "DRAFT"} />}
        </div>
      </div>

      {/* SO Header Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Sales Order Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer */}
            <div>
              <Label htmlFor="customer">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Select
                value={customerId}
                onValueChange={setCustomerId}
                disabled={isReadOnly}
              >
                <SelectTrigger
                  id="customer"
                  className={errors.customer ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customer && (
                <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
              )}
            </div>

            {/* Order Date */}
            <div>
              <Label htmlFor="orderDate">
                Order Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                disabled={isReadOnly}
                className={errors.orderDate ? "border-red-500" : ""}
              />
              {errors.orderDate && (
                <p className="text-red-500 text-sm mt-1">{errors.orderDate}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Line Items */}
      <SalesLineItems
        lines={lines}
        setLines={setLines}
        isReadOnly={isReadOnly}
        errors={errors}
      />

      {/* Summary */}
      <SalesSummary lines={lines} />

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isReadOnly && (
              <>
                <Button
                  onClick={handleSaveDraft}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Draft" : "Save Draft"}
                </Button>

                {isEditMode && (
                  <Button
                    onClick={handleConfirm}
                    disabled={confirmMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                )}
              </>
            )}

            {isEditMode && !isCancelled && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel SO
              </Button>
            )}
          </div>

          {isConfirmed && (
            <Button onClick={handleCreateInvoice}>
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
