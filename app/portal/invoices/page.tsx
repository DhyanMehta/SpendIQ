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
    DialogFooter,
} from "@/components/ui/dialog";
import { CreditCard, Search, CheckCircle, Loader2, Eye, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    paymentState: "PAID" | "PARTIAL" | "NOT_PAID";
    paidViaCash: number;
    paidViaBank: number;
    totalPaid: number;
    amountDue: number;
    salesOrderRef?: string;
    lines: InvoiceLine[];
}

export default function PortalInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentDialogInvoice, setPaymentDialogInvoice] = useState<Invoice | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
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
            if (Array.isArray(data)) {
                setInvoices(data);
            }
        } catch (e) {
            console.error("Failed to load invoices:", e);
        } finally {
            setLoading(false);
        }
    };

    const openPaymentDialog = (invoice: Invoice) => {
        setPaymentDialogInvoice(invoice);
        setPaymentAmount(invoice.amountDue.toString());
    };

    const handlePay = async (invoice: Invoice, amount: number) => {
        setPaying(true);

        try {
            const orderData = await apiRequest(`/portal/invoices/${invoice.id}/pay`, {
                method: "POST",
                body: { amount },
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
                description: `Payment for Invoice ${orderData.invoiceNumber}${orderData.isPartialPayment ? ' (Partial)' : ''}`,
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
                                    amount: amount,
                                },
                            }
                        );

                        if (verifyResult.success) {
                            const successMsg = verifyResult.paymentState === "PAID"
                                ? `Payment of ₹${verifyResult.amountPaid.toFixed(2)} successful! Invoice fully paid. Reference: ${verifyResult.paymentReference}`
                                : `Partial payment of ₹${verifyResult.amountPaid.toFixed(2)} successful! Amount due: ₹${verifyResult.amountDue.toFixed(2)}. Reference: ${verifyResult.paymentReference}`;
                            setPaymentSuccess(successMsg);
                            fetchInvoices();
                            setSelectedInvoice(null);
                            setPaymentDialogInvoice(null);
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
                <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
                <p className="text-muted-foreground mt-1">
                    View and pay your invoices via Razorpay
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
                                {filteredInvoices.length} invoice(s) found
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
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No invoices found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your invoices will appear here once created by admin
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Sales Order</TableHead>
                                    <TableHead>Invoice Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Paid</TableHead>
                                    <TableHead className="text-right">Due</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-medium">{inv.number}</TableCell>
                                        <TableCell>
                                            {inv.salesOrderRef || <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                        <TableCell>{formatDate(inv.date)}</TableCell>
                                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(inv.total)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600 font-medium">
                                            {formatCurrency(inv.totalPaid || 0)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600 font-medium">
                                            {formatCurrency(inv.amountDue || inv.total)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {inv.paymentState === "PAID" ? (
                                                <Badge variant="default" className="bg-green-600">Paid</Badge>
                                            ) : inv.paymentState === "PARTIAL" ? (
                                                <Badge variant="default" className="bg-yellow-500">Partial</Badge>
                                            ) : (
                                                <Badge variant="destructive">Not Paid</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {inv.paymentState !== "PAID" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => openPaymentDialog(inv)}
                                                        disabled={paying}
                                                    >
                                                        {paying ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <DollarSign className="h-4 w-4 mr-1" />
                                                                Pay
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedInvoice(inv)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
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
                                    <p className="text-muted-foreground">Invoice Date</p>
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
                                    <p className="text-muted-foreground">Payment Status</p>
                                    {selectedInvoice.paymentState === "PAID" ? (
                                        <Badge variant="default" className="bg-green-600">Paid</Badge>
                                    ) : selectedInvoice.paymentState === "PARTIAL" ? (
                                        <Badge variant="default" className="bg-yellow-500">Partial</Badge>
                                    ) : (
                                        <Badge variant="destructive">Not Paid</Badge>
                                    )}
                                </div>
                                {selectedInvoice.salesOrderRef && (
                                    <div>
                                        <p className="text-muted-foreground">Sales Order</p>
                                        <p className="font-medium">{selectedInvoice.salesOrderRef}</p>
                                    </div>
                                )}
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
                                <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                    <span>Invoice Total</span>
                                    <span>{formatCurrency(selectedInvoice.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid Via Cash</span>
                                    <span className="text-green-600">{formatCurrency(selectedInvoice.paidViaCash || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Paid Via Bank/Razorpay</span>
                                    <span className="text-green-600">{formatCurrency(selectedInvoice.paidViaBank || 0)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Amount Due</span>
                                    <span className={selectedInvoice.amountDue > 0 ? "text-red-600" : "text-green-600"}>
                                        {formatCurrency(selectedInvoice.amountDue || selectedInvoice.total)}
                                    </span>
                                </div>
                            </div>

                            {selectedInvoice.paymentState !== "PAID" && (
                                <Button
                                    className="w-full"
                                    onClick={() => openPaymentDialog(selectedInvoice)}
                                    disabled={paying}
                                >
                                    {paying ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <DollarSign className="mr-2 h-4 w-4" />
                                    )}
                                    {paying
                                        ? "Processing..."
                                        : `Pay Now (Due: ${formatCurrency(selectedInvoice.amountDue || selectedInvoice.total)})`}
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Payment Amount Dialog */}
            <Dialog
                open={!!paymentDialogInvoice}
                onOpenChange={() => setPaymentDialogInvoice(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Make Payment</DialogTitle>
                    </DialogHeader>
                    {paymentDialogInvoice && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                                <div>
                                    <p className="text-muted-foreground">Invoice</p>
                                    <p className="font-medium">{paymentDialogInvoice.number}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Invoice Total</p>
                                    <p className="font-medium">{formatCurrency(paymentDialogInvoice.total)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Already Paid</p>
                                    <p className="font-medium text-green-600">{formatCurrency(paymentDialogInvoice.totalPaid || 0)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Amount Due</p>
                                    <p className="font-medium text-red-600">{formatCurrency(paymentDialogInvoice.amountDue || paymentDialogInvoice.total)}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="paymentAmount">Payment Amount (₹)</Label>
                                <Input
                                    id="paymentAmount"
                                    type="number"
                                    min="1"
                                    max={paymentDialogInvoice.amountDue || paymentDialogInvoice.total}
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Enter amount to pay"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Maximum: {formatCurrency(paymentDialogInvoice.amountDue || paymentDialogInvoice.total)}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setPaymentAmount((paymentDialogInvoice.amountDue || paymentDialogInvoice.total).toString())}
                                >
                                    Pay Full Due
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setPaymentAmount(((paymentDialogInvoice.amountDue || paymentDialogInvoice.total) / 2).toFixed(2))}
                                >
                                    Pay 50%
                                </Button>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogInvoice(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                const amount = parseFloat(paymentAmount);
                                if (isNaN(amount) || amount <= 0) {
                                    alert("Please enter a valid payment amount");
                                    return;
                                }
                                const maxAmount = paymentDialogInvoice!.amountDue || paymentDialogInvoice!.total;
                                if (amount > maxAmount) {
                                    alert(`Payment amount cannot exceed ${formatCurrency(maxAmount)}`);
                                    return;
                                }
                                handlePay(paymentDialogInvoice!, amount);
                            }}
                            disabled={paying}
                        >
                            {paying ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            {paying ? "Processing..." : `Pay ${formatCurrency(parseFloat(paymentAmount) || 0)}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
