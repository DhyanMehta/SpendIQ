"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  usePostInvoice,
} from "@/lib/hooks/useInvoices";
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
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { SalesLineItems } from "@/components/sale/SalesLineItems";
import { SalesSummary } from "@/components/sale/SalesSummary";
import { toast } from "sonner";

interface InvoiceFormProps {
  id?: string;
}

export default function InvoiceForm({ id }: InvoiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = !!id && id !== "create";

  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(id || "");
  const { data: contactsData } = useContacts();

  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const postMutation = usePostInvoice();

  const [partnerId, setPartnerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [lines, setLines] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const customers =
    contactsData?.filter((c: any) => c.type === "CUSTOMER") || [];

  const isPosted = invoice?.state === "POSTED";
  const isPaid = invoice?.paymentState === "PAID";
  const isReadOnly = isPosted || isPaid;

  // Load existing data in edit mode
  useEffect(() => {
    if (invoice && isEditMode) {
      setPartnerId(invoice.partnerId);
      setInvoiceDate(invoice.date.split("T")[0]);
      setDueDate(invoice.dueDate.split("T")[0]);
      setLines(invoice.lines || []);
    }
  }, [invoice, isEditMode]);

  // Initialize with one empty line for new Invoice
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

    if (!partnerId) {
      newErrors.partner = "Customer is required";
    }

    if (!invoiceDate) {
      newErrors.invoiceDate = "Invoice date is required";
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
      partnerId,
      date: new Date(invoiceDate),
      dueDate: new Date(dueDate),
      type: "OUT_INVOICE", // Explicitly set type for Customer Invoice
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
        await updateMutation.mutateAsync({ id: id!, data: dto });
        toast.success("Invoice updated successfully");
      } else {
        const result = await createMutation.mutateAsync(dto);
        toast.success("Invoice created successfully");
        router.push(`/dashboard/sale/invoice/${result.id}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePost = async () => {
    if (!id) return;

    if (
      confirm(
        "Are you sure you want to post this Invoice? It will generate journal entries.",
      )
    ) {
      try {
        await postMutation.mutateAsync(id);
        toast.success("Invoice posted successfully");
      } catch (error: any) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleBack = () => {
    router.push("/dashboard/sale/invoice");
  };

  if (isEditMode && isLoadingInvoice) {
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
              {isEditMode ? invoice?.number : "New Customer Invoice"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode
                ? "Edit invoice details"
                : "Create a new customer invoice"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <StatusBadge status={invoice?.state || "DRAFT"} />
              <StatusBadge status={invoice?.paymentState || "NOT_PAID"} />
            </>
          )}
        </div>
      </div>

      {/* Invoice Header Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Invoice Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer */}
            <div>
              <Label htmlFor="customer">
                Customer <span className="text-red-500">*</span>
              </Label>
              <Select
                value={partnerId}
                onValueChange={setPartnerId}
                disabled={isReadOnly}
              >
                <SelectTrigger
                  id="customer"
                  className={errors.partner ? "border-red-500" : ""}
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
              {errors.partner && (
                <p className="text-red-500 text-sm mt-1">{errors.partner}</p>
              )}
            </div>

            {/* Invoice Date */}
            <div>
              <Label htmlFor="invoiceDate">
                Invoice Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                disabled={isReadOnly}
                className={errors.invoiceDate ? "border-red-500" : ""}
              />
              {errors.invoiceDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invoiceDate}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isReadOnly}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Line Items - Reusing SalesLineItems as structure is compatible */}
      <SalesLineItems
        lines={lines}
        setLines={setLines}
        isReadOnly={isReadOnly}
        errors={errors}
      />

      {/* Summary - Reusing SalesSummary */}
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
                    onClick={handlePost}
                    disabled={postMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
