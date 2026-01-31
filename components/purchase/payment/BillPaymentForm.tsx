"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save, CheckCircle, Printer, Send, X, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { client } from "@/lib/api/client";

// Types
interface BillPayment {
  id: string;
  paymentNumber: string;
  paymentType: "SEND" | "RECEIVE";
  partnerId: string;
  paymentMethod: string;
  amount: number;
  paymentDate: string;
  reference?: string;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  billId?: string;
  partner?: any;
  bill?: any;
}

// Schema
const BillPaymentSchema = z.object({
  paymentType: z.enum(["SEND", "RECEIVE"]),
  partnerId: z.string().min(1, "Partner is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.string(),
  reference: z.string().optional(),
  billId: z.string().optional(),
});

type BillPaymentFormValues = z.infer<typeof BillPaymentSchema>;

interface BillPaymentFormProps {
  initialData?: BillPayment;
}

export function BillPaymentForm({ initialData }: BillPaymentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payment, setPayment] = useState<BillPayment | undefined>(initialData);

  const billId = searchParams.get("billId");

  // Fetch bill if creating from bill
  const { data: sourceBill } = useQuery({
    queryKey: ["vendor-bill", billId],
    queryFn: async () => {
      if (!billId) return null;
      const { data } = await client.get(`/purchase/bills/${billId}`);
      return data;
    },
    enabled: !!billId && !payment,
  });

  // Fetch vendors/partners
  const { data: partners = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await client.get("/contacts");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  // Fetch bank accounts / payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      // Try to fetch from bank accounts or use default list
      try {
        const response = await client.get("/accounts?type=BANK");
        const accounts = Array.isArray(response) ? response : response.data || [];
        if (accounts.length > 0) {
          return accounts.map((a: any) => ({ id: a.id, name: a.name, type: "BANK" }));
        }
      } catch {
        // Fallback to default methods
      }
      return [
        { id: "CASH", name: "Cash", type: "CASH" },
        { id: "BANK_TRANSFER", name: "Bank Transfer", type: "BANK" },
        { id: "CHECK", name: "Check", type: "BANK" },
        { id: "UPI", name: "UPI", type: "BANK" },
        { id: "CARD", name: "Card", type: "BANK" },
      ];
    },
  });

  const isEditable = !payment || payment.status === "DRAFT";
  const isConfirmed = payment?.status === "CONFIRMED";
  const isCancelled = payment?.status === "CANCELLED";

  // Calculate amount due from bill
  const amountDue = sourceBill 
    ? Number(sourceBill.totalAmount) - Number(sourceBill.amountPaid || 0)
    : 0;

  const form = useForm<BillPaymentFormValues>({
    resolver: zodResolver(BillPaymentSchema),
    defaultValues: {
      paymentType: "SEND", // For vendor payments, we send money
      partnerId: payment?.partnerId || sourceBill?.vendorId || "",
      paymentMethod: payment?.paymentMethod || "",
      amount: payment?.amount || amountDue || 0,
      paymentDate: payment?.paymentDate
        ? format(new Date(payment.paymentDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      reference: payment?.reference || "",
      billId: billId || payment?.billId || "",
    },
  });

  // Update form when sourceBill loads
  useEffect(() => {
    if (sourceBill && !payment) {
      form.setValue("partnerId", sourceBill.vendorId);
      const due = Number(sourceBill.totalAmount) - Number(sourceBill.amountPaid || 0);
      form.setValue("amount", due);
      form.setValue("billId", sourceBill.id);
    }
  }, [sourceBill, payment, form]);

  // Save Draft
  const onSubmit = async (data: BillPaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
      };

      if (payment) {
        const { data: updated } = await client.patch(`/payments/${payment.id}`, payload);
        setPayment(updated);
      } else {
        const { data: created } = await client.post("/payments", payload);
        setPayment(created);
        router.push(`/dashboard/purchase/payment/${created.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    } catch (error) {
      console.error("Failed to save payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Payment
  const onConfirm = async () => {
    if (!payment) return;
    setIsSubmitting(true);
    try {
      const { data: updated } = await client.patch(`/payments/${payment.id}/confirm`);
      setPayment(updated);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bills"] });
    } catch (error) {
      console.error("Failed to confirm payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel Payment
  const onCancel = async () => {
    if (!payment) return;
    if (!confirm("Are you sure you want to cancel this payment?")) return;
    setIsSubmitting(true);
    try {
      const { data: updated } = await client.patch(`/payments/${payment.id}`, {
        status: "CANCELLED"
      });
      setPayment(updated);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    } catch (error) {
      console.error("Failed to cancel payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print
  const onPrint = () => {
    window.print();
  };

  // Send
  const onSend = () => {
    alert("Send payment confirmation to partner");
  };

  const selectedPartner = partners.find((p: any) => p.id === form.watch("partnerId"));

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Badge variant="outline">New</Badge>
          {billId && sourceBill && (
            <Badge className="bg-blue-100 text-blue-700">
              For Bill: {sourceBill.billNumber}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Home / Purchase / Payment
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {isEditable && (
          <>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting || !payment}
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
              disabled={!payment}
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </>
        )}

        {/* Status Tabs */}
        <div className="ml-auto">
          <Tabs value={payment?.status || "DRAFT"}>
            <TabsList>
              <TabsTrigger value="DRAFT" disabled>Draft</TabsTrigger>
              <TabsTrigger value="CONFIRMED" disabled>Confirm</TabsTrigger>
              <TabsTrigger value="CANCELLED" disabled>Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Payment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Bill Payment</span>
                <span className="text-primary font-bold">
                  {payment?.paymentNumber || "Pay/25/XXXX"}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                (Create Sequence – auto generate payment Number)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Type */}
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Payment Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                        disabled={!isEditable}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SEND" id="send" />
                          <Label htmlFor="send" className="cursor-pointer">
                            Send
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="RECEIVE" id="receive" />
                          <Label htmlFor="receive" className="cursor-pointer">
                            Receive
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Partner */}
              <FormField
                control={form.control}
                name="partnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEditable || !!billId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select partner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partners.map((partner: any) => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Via */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Payment Via
                      <span className="text-xs text-pink-500 ml-2">
                        (Bank Account from Account / Bill)
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEditable}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method: any) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-8 text-lg font-semibold"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={!isEditable}
                        />
                      </div>
                    </FormControl>
                    {sourceBill && (
                      <p className="text-xs text-muted-foreground">
                        Bill Total: ₹{Number(sourceBill.totalAmount).toLocaleString("en-IN")} | 
                        Amount Due: ₹{amountDue.toLocaleString("en-IN")}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={!isEditable}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reference */}
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Transaction reference"
                        {...field}
                        disabled={!isEditable}
                      />
                    </FormControl>
                    <span className="text-xs text-muted-foreground">Alpha numeric (text)</span>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden Bill ID */}
              {billId && (
                <input type="hidden" {...form.register("billId")} />
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          {isEditable && (
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={isSubmitting} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {payment ? "Update" : "Save"} Payment
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
        <CardContent className="pt-4 text-sm">
          <p className="font-medium text-blue-700 mb-2">Bill Payment Flow:</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Click <strong>Pay</strong> button on a posted Bill to create this payment</li>
            <li>Partner is auto-filled from the Bill's vendor</li>
            <li>Amount is pre-filled with the Bill's due amount</li>
            <li>Select payment method (Cash, Bank Transfer, UPI, etc.)</li>
            <li>Confirm payment to apply it to the Bill</li>
            <li>Bill status updates: Paid (due=0), Partial (due{"<"}total), Not Paid (due=total)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default BillPaymentForm;
