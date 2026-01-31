"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Search, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface InvoiceLine {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  id: string;
  number: string;
  type: string;
  date: string;
  dueDate: string;
  total: number;
  tax: number;
  status: string;
  paymentState: string;
  lines: InvoiceLine[];
}

// Dummy data for testing Razorpay
const DUMMY_INVOICES: Invoice[] = [
  {
    id: "dummy-1",
    number: "INV/2025/00001",
    type: "OUT_INVOICE",
    date: "2025-04-17",
    dueDate: "2025-04-17",
    total: 749.0,
    tax: 49.0,
    status: "POSTED",
    paymentState: "NOT_PAID",
    lines: [
      {
        id: "line-1",
        product: "Web Development Service",
        description: "Monthly maintenance",
        quantity: 1,
        unitPrice: 700.0,
        amount: 700.0,
      },
    ],
  },
  {
    id: "dummy-2",
    number: "INV/2025/00002",
    type: "OUT_INVOICE",
    date: "2025-04-15",
    dueDate: "2025-04-20",
    total: 1500.0,
    tax: 150.0,
    status: "POSTED",
    paymentState: "PAID",
    lines: [
      {
        id: "line-2",
        product: "Consulting",
        description: "Business consulting - 10 hours",
        quantity: 10,
        unitPrice: 135.0,
        amount: 1350.0,
      },
    ],
  },
];

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    if (document.getElementById("razorpay-script")) return;

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchInvoices = async () => {
    try {
      const data = await apiRequest("/portal/invoices");
      if (Array.isArray(data) && data.length > 0) {
        setInvoices(data);
      } else {
        // Use dummy data if no invoices from API
        setInvoices(DUMMY_INVOICES);
      }
    } catch (e) {
      console.error("Failed to load invoices:", e);
      // Use dummy data on error
      setInvoices(DUMMY_INVOICES);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (invoice: Invoice) => {
    setPaying(true);

    // Check if it's dummy data
    if (invoice.id.startsWith("dummy-")) {
      // For dummy data, create a test Razorpay order directly
      try {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_yourkeyhere",
          amount: Math.round(invoice.total * 100), // Convert to paise
          currency: "INR",
          name: "SpendIQ",
          description: `Payment for Invoice ${invoice.number}`,
          prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#667eea",
          },
          handler: function (response: any) {
            setPaymentSuccess(
              `Payment successful! Payment ID: ${response.razorpay_payment_id}`
            );
            // Update local state to mark as paid
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.id === invoice.id ? { ...inv, paymentState: "PAID" } : inv
              )
            );
            setSelectedInvoice(null);
            setPaying(false);
          },
          modal: {
            ondismiss: function () {
              setPaying(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (response: any) {
          alert(`Payment failed: ${response.error.description}`);
          setPaying(false);
        });
        razorpay.open();
      } catch (e: any) {
        alert(e.message || "Payment failed");
        setPaying(false);
      }
      return;
    }

    // Real invoice - use API
    try {
      const orderData = await apiRequest(`/portal/invoices/${invoice.id}/pay`, {
        method: "POST",
      });

      if (!orderData.success) {
        alert(orderData.message || "Failed to create payment order");
        setPaying(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency,
        name: "SpendIQ",
        description: `Payment for Invoice ${orderData.invoiceNumber}`,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: {
          color: "#667eea",
        },
        handler: async function (response: any) {
          try {
            const verifyResult = await apiRequest(
              `/portal/invoices/${invoice.id}/verify-payment`,
              {
                method: "POST",
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }
            );

            if (verifyResult.success) {
              setPaymentSuccess(
                `Payment of ₹${verifyResult.amountPaid.toFixed(2)} successful! Reference: ${verifyResult.paymentReference}`
              );
              fetchInvoices();
              setSelectedInvoice(null);
            } else {
              alert(verifyResult.message || "Payment verification failed");
            }
          } catch (err: any) {
            alert(err.message || "Payment verification failed");
          }
          setPaying(false);
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        alert(`Payment failed: ${response.error.description}`);
        setPaying(false);
      });
      razorpay.open();
    } catch (e: any) {
      alert(e.message || "Payment failed");
      setPaying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.paymentState.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground mt-1">
          Contact can only view own Invoice
        </p>
      </div>

      {/* Payment Success Message */}
      {paymentSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">{paymentSuccess}</p>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setPaymentSuccess(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                {filteredInvoices.length} total invoice(s)
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No invoices found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-primary">
                      {inv.number}
                    </TableCell>
                    <TableCell>{formatDate(inv.date)}</TableCell>
                    <TableCell>{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      {inv.paymentState === "PAID" ? (
                        <Badge variant="default">Paid</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary"
                          onClick={() => handlePay(inv)}
                          disabled={paying}
                        >
                          {paying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Pay Now"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onOpenChange={() => setSelectedInvoice(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedInvoice.date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {selectedInvoice.paymentState === "PAID" ? (
                    <Badge variant="default">Paid</Badge>
                  ) : (
                    <Badge variant="destructive">Not Paid</Badge>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline">
                    {selectedInvoice.type === "IN_INVOICE"
                      ? "Vendor Bill"
                      : "Customer Invoice"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Line Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.product || "-"}</TableCell>
                        <TableCell>{line.description || "-"}</TableCell>
                        <TableCell className="text-right">
                          {line.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(line.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(line.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">
                    {formatCurrency(selectedInvoice.total)}
                  </span>
                </div>
              </div>

              {selectedInvoice.paymentState !== "PAID" && (
                <Button
                  className="w-full"
                  onClick={() => handlePay(selectedInvoice)}
                  disabled={paying}
                >
                  {paying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" />
                  )}
                  {paying
                    ? "Processing..."
                    : `Pay ${formatCurrency(selectedInvoice.total)} Now`}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
