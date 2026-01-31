"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  usePayment,
  useUnpaidBills,
  useCreatePayment,
  useUpdatePayment,
  usePostPayment,
} from "@/lib/hooks/usePayments";
import { useContacts } from "@/lib/hooks/useContacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Check } from "lucide-react";
import { PaymentHeader } from "@/components/purchase/payment/PaymentHeader";
import { AllocationTable } from "@/components/purchase/payment/AllocationTable";
import { PaymentSummary } from "@/components/purchase/payment/PaymentSummary";

interface PaymentFormProps {
  id?: string;
}

export default function PaymentForm({ id }: PaymentFormProps) {
  const router = useRouter();
  const isEditMode = !!id && id !== "create";

  const { data: payment, isLoading: isLoadingPayment } = usePayment(id || "");
  const { data: contactsData } = useContacts();

  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const postMutation = usePostPayment();

  const [vendorId, setVendorId] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("BANK");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [allocations, setAllocations] = useState<
    Array<{ billId: string; allocatedAmount: number }>
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vendors = contactsData?.filter((c: any) => c.type === "VENDOR") || [];

  // Fetch unpaid bills when vendor is selected
  const { data: unpaidBills = [] } = useUnpaidBills(vendorId);

  const isPosted = payment?.status === "POSTED";
  const isReadOnly = isPosted;

  // Load payment data in edit mode
  useEffect(() => {
    if (payment && isEditMode) {
      setVendorId(payment.partnerId);
      setPaymentDate(payment.date.split("T")[0]);
      setPaymentMethod(payment.paymentMethod);
      setPaymentAmount(Number(payment.amount));
      
      if (payment.allocations) {
        setAllocations(
          payment.allocations.map((alloc: any) => ({
            billId: alloc.invoiceId,
            allocatedAmount: Number(alloc.amount),
          }))
        );
      }
    }
  }, [payment, isEditMode]);

  // Auto-suggest allocations when unpaid bills load
  useEffect(() => {
    if (!isEditMode && unpaidBills.length > 0 && allocations.length === 0 && paymentAmount > 0) {
      const suggested: Array<{ billId: string; allocatedAmount: number }> = [];
      let remaining = paymentAmount;

      for (const bill of unpaidBills) {
        if (remaining <= 0) break;

        const allocateAmount = Math.min(remaining, bill.outstanding);
        suggested.push({
          billId: bill.id,
          allocatedAmount: allocateAmount,
        });
        remaining -= allocateAmount;
      }

      setAllocations(suggested);
    }
  }, [unpaidBills, paymentAmount, isEditMode, allocations.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!vendorId) {
      newErrors.vendor = "Vendor is required";
    }

    if (!paymentDate) {
      newErrors.paymentDate = "Payment date is required";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Payment method is required";
    }

    if (paymentAmount <= 0) {
      newErrors.paymentAmount = "Payment amount must be greater than 0";
    }

    if (allocations.length === 0) {
      newErrors.allocations = "At least one allocation is required";
    }

    // Validate allocations don't exceed outstanding
    for (const allocation of allocations) {
      const bill = unpaidBills.find((b) => b.id === allocation.billId);
      if (bill && allocation.allocatedAmount > bill.outstanding) {
        newErrors[`allocation_${allocation.billId}`] = "Exceeds outstanding amount";
      }
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
      paymentDate: new Date(paymentDate),
      paymentMethod,
      paymentAmount,
      allocations,
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: id!, dto });
        alert("Payment updated successfully");
      } else {
        const result = await createMutation.mutateAsync(dto);
        alert("Payment created successfully");
        router.push(`/dashboard/purchase/payments/${result.id}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePost = async () => {
    if (!id) return;

    // Validate allocations equal payment amount
    const totalAllocated = allocations.reduce(
      (sum, alloc) => sum + alloc.allocatedAmount,
      0
    );

    if (Math.abs(totalAllocated - paymentAmount) > 0.01) {
      alert(
        `Cannot post payment: Total allocated (₹${totalAllocated.toLocaleString("en-IN")}) must equal payment amount (₹${paymentAmount.toLocaleString("en-IN")})`
      );
      return;
    }

    if (
      confirm(
        "Are you sure you want to post this payment? This will update bill payment states and create accounting entries. The payment will become read-only."
      )
    ) {
      try {
        await postMutation.mutateAsync(id);
        alert("Payment posted successfully");
      } catch (error: any) {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleBack = () => {
    router.push("/dashboard/purchase/payments");
  };

  if (isEditMode && isLoadingPayment) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const totalAllocated = allocations.reduce(
    (sum, alloc) => sum + alloc.allocatedAmount,
    0
  );
  const remaining = paymentAmount - totalAllocated;

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
              {isEditMode ? payment?.number : "New Vendor Payment"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode
                ? "View and manage vendor payment"
                : "Create a new vendor payment"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <PaymentHeader
        vendorId={vendorId}
        setVendorId={setVendorId}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentNumber={payment?.number}
        status={payment?.status}
        vendors={vendors}
        isReadOnly={isReadOnly}
        errors={errors}
      />

      {vendorId && (
        <>
          <AllocationTable
            unpaidBills={unpaidBills}
            allocations={allocations}
            setAllocations={setAllocations}
            paymentAmount={paymentAmount}
            isReadOnly={isReadOnly}
          />

          <PaymentSummary paymentAmount={paymentAmount} allocations={allocations} />
        </>
      )}

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
                    disabled={postMutation.isPending || remaining !== 0}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Post Payment
                  </Button>
                )}
              </>
            )}
          </div>

          {isPosted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              <span className="font-medium">Payment Posted</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
