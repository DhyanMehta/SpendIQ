"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Save, CheckCircle, FileText, Printer,
  Send, X, ArrowLeft, BarChart3, CreditCard, Banknote
} from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/api/client";
import { BudgetWarning } from "./BudgetWarning";
import { BudgetWarning as BudgetWarningType } from "@/lib/purchase/types";

// Types
interface VendorBill {
  id: string;
  billNumber: string;
  vendorId: string;
  reference?: string;
  billDate: string;
  dueDate?: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  paymentState?: "NOT_PAID" | "PARTIAL" | "PAID";
  totalAmount: number;
  amountPaid?: number;
  amountDue?: number;
  poId?: string;
  lines: VendorBillLine[];
  vendor?: any;
}

interface VendorBillLine {
  id?: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  analyticalAccountId?: string;
}

// Schema
const VendorBillLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price must be non-negative"),
  analyticalAccountId: z.string().optional(),
});

const VendorBillSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  reference: z.string().optional(),
  billDate: z.string(),
  dueDate: z.string().optional(),
  lines: z.array(VendorBillLineSchema).min(1, "At least one line item is required"),
});

type VendorBillFormValues = z.infer<typeof VendorBillSchema>;

interface VendorBillFormNewProps {
  initialData?: VendorBill;
}

export function VendorBillFormNew({ initialData }: VendorBillFormNewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [warnings, setWarnings] = useState<BudgetWarningType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bill, setBill] = useState<VendorBill | undefined>(initialData);
  
  const poId = searchParams.get("poId");

  // Fetch PO if creating from PO
  const { data: sourcePO } = useQuery({
    queryKey: ["purchase-order", poId],
    queryFn: async () => {
      if (!poId) return null;
      const { data } = await client.get(`/purchase/orders/${poId}`);
      return data;
    },
    enabled: !!poId && !bill,
  });

  // Fetch vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await client.get("/contacts?type=VENDOR");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await client.get("/products");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  // Fetch analytic accounts
  const { data: analyticAccounts = [] } = useQuery({
    queryKey: ["analyticAccounts"],
    queryFn: async () => {
      const response = await client.get("/analytical-accounts");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  // Fetch payments for this bill
  const { data: payments = [] } = useQuery({
    queryKey: ["bill-payments", bill?.id],
    queryFn: async () => {
      if (!bill?.id) return [];
      const { data } = await client.get(`/purchase/bills/${bill.id}/payments`);
      return data || [];
    },
    enabled: !!bill?.id,
  });

  const isEditable = !bill || bill.status === "DRAFT";
  const isPosted = bill?.status === "POSTED";
  const isCancelled = bill?.status === "CANCELLED";

  const form = useForm<VendorBillFormValues>({
    resolver: zodResolver(VendorBillSchema),
    defaultValues: {
      vendorId: bill?.vendorId || sourcePO?.vendorId || "",
      reference: bill?.reference || "",
      billDate: bill?.billDate
        ? format(new Date(bill.billDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      dueDate: bill?.dueDate
        ? format(new Date(bill.dueDate), "yyyy-MM-dd")
        : "",
      lines: bill?.lines?.map((l) => ({
        productId: l.productId,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        analyticalAccountId: l.analyticalAccountId || "",
      })) || sourcePO?.lines?.map((l: any) => ({
        productId: l.productId,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        analyticalAccountId: l.analyticalAccountId || "",
      })) || [
        {
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          analyticalAccountId: "",
        },
      ],
    },
  });

  // Update form when sourcePO loads
  useEffect(() => {
    if (sourcePO && !bill) {
      form.setValue("vendorId", sourcePO.vendorId);
      form.setValue("lines", sourcePO.lines.map((l: any) => ({
        productId: l.productId,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        analyticalAccountId: l.analyticalAccountId || "",
      })));
    }
  }, [sourcePO, bill, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Calculations
  const calculateLineTotal = (index: number) => {
    const qty = form.watch(`lines.${index}.quantity`) || 0;
    const price = form.watch(`lines.${index}.unitPrice`) || 0;
    return qty * price;
  };

  const calculateGrandTotal = () => {
    const lines = form.watch("lines");
    return lines.reduce((sum, line) => {
      return sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
    }, 0);
  };

  // Calculate payment summary
  const totalAmount = bill?.totalAmount || calculateGrandTotal();
  const amountPaid = bill?.amountPaid || payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const amountDue = totalAmount - amountPaid;
  
  // Calculate paid by type
  const paidViaCash = payments
    .filter((p: any) => p.paymentMethod === "CASH")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const paidViaBank = payments
    .filter((p: any) => p.paymentMethod === "BANK" || p.paymentMethod === "TRANSFER")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  // Determine payment status
  const paymentStatus = bill?.paymentState || 
    (amountDue === 0 ? "PAID" : amountDue < totalAmount ? "PARTIAL" : "NOT_PAID");

  // Save Draft
  const onSubmit = async (data: VendorBillFormValues) => {
    setIsSubmitting(true);
    setWarnings([]);
    try {
      const payload = {
        ...data,
        poId: poId || undefined,
        lines: data.lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      };

      if (bill) {
        const { data: updated } = await client.patch(`/purchase/bills/${bill.id}`, payload);
        setBill(updated);
      } else {
        const { data: created } = await client.post("/purchase/bills", payload);
        setBill(created);
        router.push(`/dashboard/purchase/bill/${created.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    } catch (error) {
      console.error("Failed to save bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Post Bill
  const onPost = async () => {
    if (!bill) return;
    setIsSubmitting(true);
    setWarnings([]);
    try {
      const { data: response } = await client.patch(`/purchase/bills/${bill.id}/post`);
      setBill(response.bill || response);
      if (response.budgetWarnings && response.budgetWarnings.length > 0) {
        setWarnings(response.budgetWarnings);
      }
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    } catch (error) {
      console.error("Failed to post bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Bill
  const onCancel = async () => {
    if (!bill) return;
    if (!confirm("Are you sure you want to cancel this bill?")) return;
    setIsSubmitting(true);
    try {
      const { data: updated } = await client.patch(`/purchase/bills/${bill.id}`, {
        status: "CANCELLED"
      });
      setBill(updated);
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    } catch (error) {
      console.error("Failed to cancel bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Make Payment
  const onMakePayment = () => {
    if (!bill) return;
    router.push(`/dashboard/purchase/payment/create?billId=${bill.id}`);
  };

  // Print
  const onPrint = () => {
    window.print();
  };

  // Send
  const onSend = () => {
    alert("Send functionality - Email bill to vendor");
  };

  // View Budget
  const onViewBudget = () => {
    router.push("/dashboard/budgets");
  };

  const getPaymentStatusBadge = () => {
    switch (paymentStatus) {
      case "PAID":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Paid</Badge>;
      case "PARTIAL":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Partial</Badge>;
      default:
        return <Badge variant="destructive">Not Paid</Badge>;
    }
  };

  const selectedVendor = vendors.find((v: any) => v.id === form.watch("vendorId"));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Badge variant="outline">New</Badge>
          {poId && sourcePO && (
            <Badge className="bg-blue-100 text-blue-700">
              From PO: {sourcePO.poNumber}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Home / Purchase / Bill
        </div>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Bill Number */}
            <div>
              <label className="text-xs text-muted-foreground uppercase">Vendor Bill No.</label>
              <div className="font-semibold text-lg text-primary">
                {bill?.billNumber || "Auto Generated"}
              </div>
              <span className="text-xs text-muted-foreground">Bill/2025/XXXX</span>
            </div>

            {/* Vendor Name */}
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">
                    Vendor Name <span className="text-pink-500">(from PO)</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditable || !!poId}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vendors.map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bill Reference */}
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Bill Reference</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SUP-25-001"
                      {...field}
                      disabled={!isEditable}
                      className="h-9"
                    />
                  </FormControl>
                  <span className="text-xs text-muted-foreground">Alpha numeric (text)</span>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bill Date */}
            <FormField
              control={form.control}
              name="billDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Bill Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={!isEditable}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      disabled={!isEditable}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Payment Status */}
          {bill && isPosted && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getPaymentStatusBadge()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {isEditable && (
          <>
            <Button
              onClick={onPost}
              disabled={isSubmitting || !bill}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Confirm
            </Button>
            <Button variant="outline" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={onSend}>
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={!bill}
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </>
        )}

        {isPosted && amountDue > 0 && (
          <Button
            onClick={onMakePayment}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <CreditCard className="mr-2 h-4 w-4" /> Pay
          </Button>
        )}

        <Button
          variant="outline"
          onClick={onViewBudget}
          className="border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <BarChart3 className="mr-2 h-4 w-4" /> Budget
        </Button>

        {/* Status Tabs */}
        <div className="ml-auto">
          <Tabs value={bill?.status || "DRAFT"}>
            <TabsList>
              <TabsTrigger value="DRAFT" disabled>Draft</TabsTrigger>
              <TabsTrigger value="POSTED" disabled>Confirm</TabsTrigger>
              <TabsTrigger value="CANCELLED" disabled>Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Budget Warnings */}
      <BudgetWarning warnings={warnings} />

      {/* Line Items */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-base">Line Items</CardTitle>
              {isEditable && !poId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      productId: "",
                      description: "",
                      quantity: 1,
                      unitPrice: 0,
                      analyticalAccountId: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Line
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]">Sr. No.</TableHead>
                    <TableHead className="min-w-[180px]">Product</TableHead>
                    <TableHead className="min-w-[180px]">Budget Analytics</TableHead>
                    <TableHead className="w-[80px] text-right">Qty</TableHead>
                    <TableHead className="w-[120px] text-right">Unit Price</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const lineTotal = calculateLineTotal(index);
                    const hasWarning = warnings.some(w => w.lineId === field.id);

                    return (
                      <TableRow
                        key={field.id}
                        className={hasWarning ? "bg-orange-50 dark:bg-orange-900/20" : ""}
                      >
                        <TableCell className="text-center font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.productId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    const product = products.find((p: any) => p.id === value);
                                    if (product) {
                                      form.setValue(`lines.${index}.description`, product.name || "");
                                      form.setValue(`lines.${index}.unitPrice`, Number(product.purchasePrice) || 0);
                                    }
                                  }}
                                  value={field.value}
                                  disabled={!isEditable}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.map((product: any) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.analyticalAccountId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={!isEditable}
                                >
                                  <FormControl>
                                    <SelectTrigger className={`h-8 ${hasWarning ? "border-orange-500" : ""}`}>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {analyticAccounts.map((account: any) => (
                                      <SelectItem key={account.id} value={account.id}>
                                        {account.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    className="h-8 text-right"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    disabled={!isEditable}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`lines.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="h-8 text-right"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    disabled={!isEditable}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{lineTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2
                          })}
                        </TableCell>
                        <TableCell>
                          {isEditable && fields.length > 1 && !poId && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Total and Payment Summary */}
              <div className="border-t p-4">
                <div className="flex justify-between items-start">
                  {/* Payment Summary (for posted bills) */}
                  {isPosted && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Paid Via Cash:</span>
                        <span className="font-medium">
                          ₹{paidViaCash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">Paid Via Bank:</span>
                        <span className="font-medium">
                          ₹{paidViaBank.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">Amount Due:</span>
                        <span className={`font-bold ${amountDue > 0 ? "text-red-600" : "text-green-600"}`}>
                          ₹{amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="text-right ml-auto">
                    <span className="text-sm text-muted-foreground mr-4">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{calculateGrandTotal().toLocaleString("en-IN", {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditable && (
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {bill ? "Update" : "Save"} Draft
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Payment Status Logic Card */}
      {isPosted && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="pt-4 text-sm">
            <p className="font-medium text-blue-700 mb-2">Payment Status Logic:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white text-xs">Paid</Badge>
                <span>If Amount Due = 0</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white text-xs">Partial</Badge>
                <span>If Amount Due {"<"} Bill Total</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">Not Paid</Badge>
                <span>If Amount Due = Bill Total</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Budget Warning */}
      {warnings.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-600 text-sm">
              ⚠️ Non Blocking Warning on Confirmation of Bill
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-orange-700">
              Budget Analytical lines exceed approved budget. Review budget allocation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VendorBillFormNew;
