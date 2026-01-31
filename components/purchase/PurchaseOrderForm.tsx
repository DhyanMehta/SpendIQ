"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
} from "@/lib/hooks/usePurchaseOrders";
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
import { POLineItems } from "@/components/purchase/POLineItems";
import { POSummary } from "@/components/purchase/POSummary";

interface PurchaseOrderFormProps {
  id?: string;
}

export default function PurchaseOrderForm({ id }: PurchaseOrderFormProps) {
  const router = useRouter();
  const isEditMode = !!id && id !== "create";

  const { data: purchaseOrder, isLoading: isLoadingPO } = usePurchaseOrder(id || "");
  const { data: contactsData } = useContacts();

  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const confirmMutation = useConfirmPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  const [vendorId, setVendorId] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [lines, setLines] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vendors = contactsData?.filter((c: any) => c.type === "VENDOR") || [];

  const isConfirmed = purchaseOrder?.status === "CONFIRMED";
  const isCancelled = purchaseOrder?.status === "CANCELLED";
  const isReadOnly = isConfirmed || isCancelled;

  // Load existing data in edit mode
  useEffect(() => {
    if (purchaseOrder && isEditMode) {
      setVendorId(purchaseOrder.vendorId);
      setOrderDate(purchaseOrder.orderDate.split("T")[0]);
      setLines(purchaseOrder.lines || []);
    }
  }, [purchaseOrder, isEditMode]);

  // Initialize with one empty line for new PO
  useEffect(() => {
    if (!isEditMode && lines.length === 0) {
      setLines([
        {
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          analyticalAccountId: "",
        },
      ]);
    }
  }, [isEditMode, lines.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!vendorId) {
      newErrors.vendor = "Vendor is required";
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
        if (!line.description) {
          newErrors[`line_${index}_description`] = "Description is required";
        }
        if (line.quantity <= 0) {
          newErrors[`line_${index}_quantity`] = "Quantity must be greater than 0";
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
      vendorId,
      orderDate: new Date(orderDate),
      lines: lines.map((line) => ({
        productId: line.productId,
        description: line.description,
        quantity: parseFloat(line.quantity),
        unitPrice: parseFloat(line.unitPrice),
        analyticalAccountId: line.analyticalAccountId || undefined,
      })),
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, dto });
        alert("Purchase Order updated successfully");
      } else {
        const result = await createMutation.mutateAsync(dto);
        alert("Purchase Order created successfully");
        router.push(`/dashboard/purchase/order/${result.id}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;

    if (
      confirm(
        "Are you sure you want to confirm this Purchase Order? It will become read-only."
      )
    ) {
      try {
        await confirmMutation.mutateAsync(id);
        alert("Purchase Order confirmed successfully");
      } catch (error: any) {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCancel = async () => {
    if (!id) return;

    if (confirm("Are you sure you want to cancel this Purchase Order?")) {
      try {
        await cancelMutation.mutateAsync(id);
        alert("Purchase Order cancelled successfully");
      } catch (error: any) {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleBack = () => {
    router.push("/dashboard/purchase/order");
  };

  const handleCreateVendorBill = () => {
    // Navigate to invoice creation with PO context
    router.push(`/dashboard/sale/invoice/create?poId=${id}`);
  };

  if (isEditMode && isLoadingPO) {
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
              {isEditMode ? purchaseOrder?.poNumber : "New Purchase Order"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode
                ? "Edit purchase order details"
                : "Create a new purchase order"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <StatusBadge status={purchaseOrder?.status || "DRAFT"} />
          )}
        </div>
      </div>

      {/* PO Header Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Purchase Order Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor */}
            <div>
              <Label htmlFor="vendor">
                Vendor <span className="text-red-500">*</span>
              </Label>
              <Select
                value={vendorId}
                onValueChange={setVendorId}
                disabled={isReadOnly}
              >
                <SelectTrigger
                  id="vendor"
                  className={errors.vendor ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vendor && (
                <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>
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
      <POLineItems
        lines={lines}
        setLines={setLines}
        isReadOnly={isReadOnly}
        errors={errors}
      />

      {/* Summary */}
      <POSummary lines={lines} />

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
                Cancel PO
              </Button>
            )}
          </div>

          {isConfirmed && (
            <Button onClick={handleCreateVendorBill}>
              <FileText className="h-4 w-4 mr-2" />
              Create Vendor Bill
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
