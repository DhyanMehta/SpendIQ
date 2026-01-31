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
import { Download, Eye, CreditCard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

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

export default function PortalInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const data = await apiRequest("/portal/invoices");
            if (Array.isArray(data)) setInvoices(data);
        } catch (e) {
            console.error("Failed to load invoices:", e);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (invoiceId: string) => {
        setPaying(true);
        try {
            const result = await apiRequest(`/portal/invoices/${invoiceId}/pay`, {
                method: "POST",
            });
            if (result.success) {
                alert("Payment successful!");
                fetchInvoices();
                setSelectedInvoice(null);
            } else {
                alert(result.message || "Payment failed");
            }
        } catch (e: any) {
            alert(e.message || "Payment failed");
        } finally {
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
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            PAID: "default",
            NOT_PAID: "destructive",
            PARTIAL: "secondary",
            POSTED: "default",
            DRAFT: "outline",
        };
        return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
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
                    View and manage all your invoices
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Invoices</CardTitle>
                            <CardDescription>
                                {invoices.length} total invoice(s)
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
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Payment</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-medium">{inv.number}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {inv.type === "IN_INVOICE" ? "Bill" : "Invoice"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(inv.date)}</TableCell>
                                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(inv.total)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(inv.paymentState)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedInvoice(inv)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {inv.paymentState !== "PAID" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePay(inv.id)}
                                                        disabled={paying}
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Pay
                                                    </Button>
                                                )}
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
            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Invoice {selectedInvoice?.number}</DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p className="font-medium">{formatDate(selectedInvoice.date)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Due Date</p>
                                    <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    {getStatusBadge(selectedInvoice.paymentState)}
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Type</p>
                                    <Badge variant="outline">
                                        {selectedInvoice.type === "IN_INVOICE" ? "Vendor Bill" : "Customer Invoice"}
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
                                                <TableCell className="text-right">{line.quantity}</TableCell>
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

                            <div className="flex justify-between items-center border-t pt-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Tax: {formatCurrency(selectedInvoice.tax)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedInvoice.total)}</p>
                                </div>
                            </div>

                            {selectedInvoice.paymentState !== "PAID" && (
                                <Button
                                    className="w-full"
                                    onClick={() => handlePay(selectedInvoice.id)}
                                    disabled={paying}
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {paying ? "Processing..." : "Pay Now"}
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
