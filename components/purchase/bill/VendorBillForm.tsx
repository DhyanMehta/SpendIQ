"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useVendorBill,
  useCreateVendorBill,
  useUpdateVendorBill,
  usePostVendorBill,
  useRegisterPayment,
} from "@/lib/hooks/useVendorBills";
import { usePurchaseOrder } from "@/lib/hooks/usePurchaseOrders";
import { useContacts } from "@/lib/hooks/useContacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Check, CreditCard, AlertCircle } from "lucide-react";
import { BillHeader } from "@/components/purchase/bill/BillHeader";
import { BillLines } from "@/components/purchase/bill/BillLines";
import { BillSummary } from "@/components/purchase/bill/BillSummary";

interface VendorBillFormProps {
  id?: string;
  poId?: string;
}

export default function VendorBillForm({ id, poId }: VendorBillFormProps) {
  const router = useRouter();
  const isEditMode = !!id && id !== "create";

  const { data: bill, isLoading: isLoadingBill } = useVendorBill(id || "");
  const { data: po } = usePurchaseOrder(poId || "");
  const { data: contactsData } = useContacts();

  const createMutation = useCreateVendorBill();
  const updateMutation = useUpdateVendorBill();
  const postMutation = usePostVendorBill();
  const paymentMutation = useRegisterPayment();

  const [vendorId, setVendorId] = useState("");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [lines, setLines] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("BANK");

  const vendors = contactsData?.filter((c: any) => c.type === "VENDOR") || [];

  const isPosted = bill?.status === "POSTED";
  const isReadOnly = isPosted;

  // Load bill data
  useEffect(() => {
    if (bill && isEditMode) {
      setVendorId(bill.partnerId);
      setBillDate(bill.date.split("T")[0]);
      setDueDate(bill.dueDate.split("T")[0]);
      setLines(
        bill.lines.map((line) => ({
          productId: line.productId || "",
          description: line.label,
          quantity: Number(line.quantity),
          unitPrice: Number(line.priceUnit),
          analyticalAccountId: line.analyticAccountId || "",
        }))
      );
    }
  }, [bill, isEditMode]);

  // Load PO data for new bill
  useEffect(() => {
    if (po && !isEditMode) {
      setVendorId(po.vendorId);
      setLines(
        po.lines.map((line: any) => ({
          productId: line.productId,
          description: line.description,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice),
          analyticalAccountId: line.analyticalAccountId || "",
        }))
      );
    } else if (!isEditMode && lines.length === 0) {
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
  }, [po, isEditMode, lines.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!vendorId) {
      newErrors.vendor = "Vendor is required";
    }

    if (!billDate) {
      newErrors.billDate = "Bill date is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
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
      billDate: new Date(billDate),
      dueDate: new Date(dueDate),
      purchaseOrderId: poId,
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
        alert("Vendor Bill updated successfully");
      } else {
        const result = await createMutation.mutateAsync(dto);
        alert("Vendor Bill created successfully");
        router.push(`/dashboard/purchase/bill/${result.id}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePost = async () => {
    if (!id) return;

    // Check for missing analytics
    const missingAnalytics = lines.filter(line => !line.analyticalAccountId);
    if (missingAnalytics.length > 0) {
      alert(`Cannot post bill: ${missingAnalytics.length} line(s) are missing Analytic Account. All lines must have an analytic account before posting.`);
      return;
    }

    if (
      confirm(
        "Are you sure you want to post this Vendor Bill? This will create accounting entries and update budgets. The bill will become read-only."
      )
    ) {
      try {
        const result = await postMutation.mutateAsync(id);
        
        // Show budget impact if any
        if (result.budgetImpact && result.budgetImpact.length > 0) {
          const overBudget = result.budgetImpact.filter((b: any) => b.isOverBudget);
          if (overBudget.length > 0) {
            alert(`Bill posted successfully! Warning: ${overBudget.length} budget line(s) are now over budget.`);
          } else {
            alert("Vendor Bill posted successfully");
          }
        } else {
          alert("Vendor Bill posted successfully");
        }
      } catch (error: any) {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleRegisterPayment = async () => {
    if (!id || !paymentAmount) return;

    const dto = {
      amount: parseFloat(paymentAmount),
      paymentDate: new Date(paymentDate),
      paymentMethod: paymentMethod,
    };

    try {
      const result = await paymentMutation.mutateAsync({ id, dto });
      alert(`Payment registered successfully. Outstanding: ₹${result.outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
      setShowPaymentDialog(false);
      setPaymentAmount("");
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/purchase/bill");
  };

  if (isEditMode && isLoadingBill) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const totalAmount = lines.reduce(
    (sum, line) => sum + parseFloat(line.quantity || 0) * parseFloat(line.unitPrice || 0),
    0
  );

  const totalPaid = bill?.payments?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0;
  const outstanding = totalAmount - totalPaid;

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
              {isEditMode ? bill?.number : "New Vendor Bill"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode
                ? "View and manage vendor bill"
                : poId
                ? "Create bill from purchase order"
                : "Create a new vendor bill"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <BillHeader
        vendorId={vendorId}
        setVendorId={setVendorId}
        billDate={billDate}
        setBillDate={setBillDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        billNumber={bill?.number}
        status={bill?.status}
        vendors={vendors}
        purchaseOrder={po || bill?.purchaseOrder}
        isReadOnly={isReadOnly}
        errors={errors}
      />

      <BillLines
        lines={lines}
        setLines={setLines}
        isReadOnly={isReadOnly}
        errors={errors}
      />

      <BillSummary lines={lines} payments={bill?.payments} />

      {/* Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {!isReadOnly && (
              <>
                <Button
                  onClick={handleSaveDraft}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Draft" : "Save Draft"}
                </Button>

                {isEditMode && (
                  <Button
                    onClick={handlePost}
                    variant="default"
                    disabled={postMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Post Bill
                  </Button>
                )}
              </>
            )}

            {isPosted && outstanding > 0 && (
              <Button onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Register Payment
              </Button>
            )}
          </div>

          {isPosted && outstanding === 0 && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              <span className="font-medium">Fully Paid</span>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Outstanding Amount
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{outstanding.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <Label htmlFor="paymentAmount">
                Payment Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                max={outstanding}
                step="0.01"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <Label htmlFor="paymentDate">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleRegisterPayment}
                disabled={!paymentAmount || paymentMutation.isPending}
                className="flex-1"
              >
                Register Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
