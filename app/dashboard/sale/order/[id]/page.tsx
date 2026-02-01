"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useSalesOrder,
  useUpdateSalesOrder,
  useConfirmSalesOrder,
  useDeleteSalesOrder,
} from "@/lib/hooks/useSalesOrders";
import { salesApi } from "@/lib/api/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react";
import { generatePDF, prepareSalesOrderData } from "@/lib/pdf-generator";
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
import { toast } from "sonner";

export default function SalesOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: order, isLoading } = useSalesOrder(id);
  const deleteOrder = useDeleteSalesOrder();
  const confirmOrder = useConfirmSalesOrder();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!order)
    return <div className="p-8 text-center text-red-500">Order not found</div>;

  const handleDelete = async () => {
    try {
      await deleteOrder.mutateAsync(id);
      toast.success("Sales order deleted");
      router.push("/dashboard/sale/order");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmOrder.mutateAsync(id);
      toast.success("Sales order confirmed");
    } catch (error) {
      toast.error("Failed to confirm order");
    }
  };

  const handleCreateInvoice = async () => {
    try {
      await salesApi.createInvoice(id);
      toast.success("Invoice created successfully");
      // Optionally redirect to invoice or refresh
      router.push("/dashboard/sale/invoice");
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  const handleDownloadPDF = () => {
    const pdfData = prepareSalesOrderData(order);
    generatePDF(pdfData);
    toast.success("PDF downloaded successfully");
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
            <h1 className="text-2xl font-bold">{order.reference}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Customer: {order.customer?.name}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {order.status === "DRAFT" && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/sale/order/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="default" onClick={() => setIsConfirming(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleting(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          )}
          {order.status === "CONFIRMED" && (
            <Button onClick={handleCreateInvoice}>
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Order Lines</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines?.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell>{line.product?.name}</TableCell>
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
                <TableCell colSpan={3} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  ₹
                  {Number(order.totalAmount).toLocaleString("en-IN", {
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
            <h3 className="font-semibold mb-4">Customer Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                {order.customer?.name}
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                {order.customer?.email}
              </p>
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {order.customer?.phone}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Order Info</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Date:</span>{" "}
                {new Date(order.date).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-500">Created At:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sales Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sales order? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Sales Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this order? It will be locked and
              ready for invoicing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirming(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleConfirm();
                setIsConfirming(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
