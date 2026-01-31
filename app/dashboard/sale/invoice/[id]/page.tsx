"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useInvoice,
  usePostInvoice,
  useRegisterPayment,
} from "@/lib/hooks/useInvoices";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge"; // Verify this component exists/path
import { ArrowLeft, CheckCircle, Smartphone, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: invoice, isLoading } = useInvoice(id);
  const postInvoice = usePostInvoice();
  const registerPayment = useRegisterPayment();

  const [isRegisteringPayment, setIsRegisteringPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!invoice)
    return (
      <div className="p-8 text-center text-red-500">Invoice not found</div>
    );

  const handlePost = async () => {
    try {
      await postInvoice.mutateAsync(id);
      toast.success("Invoice posted successfully");
    } catch (error) {
      toast.error("Failed to post invoice");
    }
  };

  const handleRegisterPayment = async () => {
    try {
      await registerPayment.mutateAsync({
        id,
        data: {
          amount: Number(paymentAmount),
          date: new Date(paymentDate),
          journalId: "BANK", // Placeholder, ideally fetch Journals
          reference: `PAY/${invoice.number}`,
        },
      });
      toast.success("Payment registered");
      setIsRegisteringPayment(false);
    } catch (error) {
      toast.error("Failed to register payment");
    }
  };

  const openPaymentDialog = () => {
    setPaymentAmount(invoice.amountDue);
    setIsRegisteringPayment(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.number}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customer: {invoice.partner?.name}
            </p>
          </div>
          <StatusBadge status={invoice.state} />
          <StatusBadge status={invoice.paymentState} />
        </div>
        <div className="flex gap-2">
          {invoice.state === "DRAFT" && (
            <Button onClick={handlePost}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Post
            </Button>
          )}
          {invoice.state === "POSTED" && invoice.paymentState !== "PAID" && (
            <Button onClick={openPaymentDialog}>
              <Smartphone className="mr-2 h-4 w-4" />
              Register Payment
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Invoice Lines</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lines?.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell>{line.product?.name}</TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">
                    ₹{Number(line.unitPrice).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{Number(line.subtotal).toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  ₹
                  {Number(invoice.totalAmount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-right font-bold text-red-500"
                >
                  Amount Due
                </TableCell>
                <TableCell className="text-right font-bold text-red-500">
                  ₹
                  {Number(invoice.amountDue).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Invoice Info</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Invoice Date:</span>{" "}
                {new Date(invoice.date).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-500">Due Date:</span>{" "}
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Journal Entry</h3>
            <div className="space-y-2 text-sm">
              {invoice.journalEntryId ? (
                <p className="text-blue-600 cursor-pointer hover:underline">
                  View Journal Entry
                </p>
              ) : (
                <p className="text-gray-500">No Journal Entry generated yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog
        open={isRegisteringPayment}
        onOpenChange={setIsRegisteringPayment}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRegisteringPayment(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRegisterPayment}>Create Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
