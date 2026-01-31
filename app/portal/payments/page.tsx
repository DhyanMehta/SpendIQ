"use client";

import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

interface Payment {
    id: string;
    reference: string;
    date: string;
    amount: number;
    method: string;
    status: string;
    type: string;
}

export default function PortalPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await apiRequest("/portal/payments");
                if (Array.isArray(data)) setPayments(data);
            } catch (e) {
                console.error("Failed to load payments:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

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
            POSTED: "default",
            DRAFT: "outline",
            CANCELLED: "destructive",
            RECONCILED: "default",
        };
        return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    };

    const getMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            BANK_TRANSFER: "bg-blue-100 text-blue-800",
            CREDIT_CARD: "bg-purple-100 text-purple-800",
            CASH: "bg-green-100 text-green-800",
            CHECK: "bg-orange-100 text-orange-800",
            OTHER: "bg-gray-100 text-gray-800",
        };
        return (
            <Badge className={colors[method] || colors.OTHER} variant="secondary">
                {method.replace(/_/g, " ")}
            </Badge>
        );
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant={type === "INBOUND" ? "default" : "outline"}>
                {type === "INBOUND" ? "Received" : "Sent"}
            </Badge>
        );
    };

    const filteredPayments = payments.filter(
        (payment) =>
            payment.reference?.toLowerCase().includes(search.toLowerCase()) ||
            payment.method?.toLowerCase().includes(search.toLowerCase()) ||
            payment.status?.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate summary
    const totalReceived = payments
        .filter((p) => p.type === "INBOUND" && p.status === "POSTED")
        .reduce((sum, p) => sum + p.amount, 0);
    const totalSent = payments
        .filter((p) => p.type === "OUTBOUND" && p.status === "POSTED")
        .reduce((sum, p) => sum + p.amount, 0);

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
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground mt-1">
                    View your payment history
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">
                            Total Received
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalReceived)}
                        </div>
                        <p className="text-xs text-muted-foreground">Inbound payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">
                            Total Sent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(totalSent)}
                        </div>
                        <p className="text-xs text-muted-foreground">Outbound payments</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>
                                {payments.length} total payment(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search payments..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredPayments.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No payments found
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.reference || "-"}
                                        </TableCell>
                                        <TableCell>{formatDate(payment.date)}</TableCell>
                                        <TableCell>{getTypeBadge(payment.type)}</TableCell>
                                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            <span
                                                className={
                                                    payment.type === "INBOUND"
                                                        ? "text-green-600"
                                                        : "text-blue-600"
                                                }
                                            >
                                                {payment.type === "INBOUND" ? "+" : "-"}
                                                {formatCurrency(payment.amount)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
