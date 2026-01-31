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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

interface OrderLine {
    id: string;
    product: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

interface Order {
    id: string;
    number: string;
    date: string;
    expectedDate?: string;
    total: number;
    status: string;
    lines: OrderLine[];
}

export default function PortalOrdersPage() {
    const [purchaseOrders, setPurchaseOrders] = useState<Order[]>([]);
    const [salesOrders, setSalesOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedType, setSelectedType] = useState<"PO" | "SO" | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const [poData, soData] = await Promise.all([
                    apiRequest("/portal/purchase-orders"),
                    apiRequest("/portal/sales-orders"),
                ]);
                if (Array.isArray(poData)) setPurchaseOrders(poData);
                if (Array.isArray(soData)) setSalesOrders(soData);
            } catch (e) {
                console.error("Failed to load orders:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
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
            CONFIRMED: "default",
            DRAFT: "outline",
            CANCELLED: "destructive",
            COMPLETED: "default",
            INVOICED: "secondary",
        };
        return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    };

    const filterOrders = (orders: Order[]) =>
        orders.filter((order) =>
            order.number.toLowerCase().includes(search.toLowerCase()) ||
            order.status.toLowerCase().includes(search.toLowerCase())
        );

    const handleViewOrder = (order: Order, type: "PO" | "SO") => {
        setSelectedOrder(order);
        setSelectedType(type);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const OrderTable = ({ orders, type }: { orders: Order[]; type: "PO" | "SO" }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    {type === "PO" && <TableHead>Expected Date</TableHead>}
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={type === "PO" ? 6 : 5} className="text-center py-8 text-muted-foreground">
                            No orders found
                        </TableCell>
                    </TableRow>
                ) : (
                    orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.number}</TableCell>
                            <TableCell>{formatDate(order.date)}</TableCell>
                            {type === "PO" && (
                                <TableCell>
                                    {order.expectedDate ? formatDate(order.expectedDate) : "-"}
                                </TableCell>
                            )}
                            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewOrder(order, type)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-muted-foreground mt-1">
                    View your purchase and sales orders
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>
                                {purchaseOrders.length} purchase order(s), {salesOrders.length} sales order(s)
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="purchase-orders" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="purchase-orders" className="gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                Purchase Orders ({purchaseOrders.length})
                            </TabsTrigger>
                            <TabsTrigger value="sales-orders" className="gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Sales Orders ({salesOrders.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="purchase-orders">
                            <OrderTable orders={filterOrders(purchaseOrders)} type="PO" />
                        </TabsContent>

                        <TabsContent value="sales-orders">
                            <OrderTable orders={filterOrders(salesOrders)} type="SO" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Order Detail Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedType === "PO" ? "Purchase Order" : "Sales Order"} {selectedOrder?.number}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Order Date</p>
                                    <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                                </div>
                                {selectedOrder.expectedDate && (
                                    <div>
                                        <p className="text-muted-foreground">Expected Date</p>
                                        <p className="font-medium">{formatDate(selectedOrder.expectedDate)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    {getStatusBadge(selectedOrder.status)}
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Type</p>
                                    <Badge variant="outline">
                                        {selectedType === "PO" ? "Purchase Order" : "Sales Order"}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Order Items</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedOrder.lines.map((line) => (
                                            <TableRow key={line.id}>
                                                <TableCell>{line.product || "-"}</TableCell>
                                                <TableCell className="font-mono text-sm">{line.sku || "-"}</TableCell>
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

                            <div className="flex justify-end items-center border-t pt-4">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedOrder.total)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
