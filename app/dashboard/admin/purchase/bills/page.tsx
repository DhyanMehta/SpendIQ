"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { billApi } from "@/lib/purchase/api-bills";
import { VendorBill, InvoiceStatus } from "@/lib/purchase/types";

export default function VendorBillsListPage() {
  const router = useRouter();
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await billApi.getAll();
      setBills(data);
    } catch (error) {
      console.error("Failed to load bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants: Record<InvoiceStatus, "default" | "outline" | "secondary"> =
      {
        [InvoiceStatus.DRAFT]: "outline",
        [InvoiceStatus.POSTED]: "default",
        [InvoiceStatus.CANCELLED]: "secondary",
      };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendor Bills</h1>
        <Button
          onClick={() => router.push("/dashboard/admin/purchase/bills/create")}
        >
          <Plus className="mr-2 h-4 w-4" /> New Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendor Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No vendor bills found
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">
                        {bill.number || bill.reference}
                      </TableCell>
                      <TableCell>
                        {bill.partner?.name || bill.partnerId}
                      </TableCell>
                      <TableCell>
                        {format(new Date(bill.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(bill.dueDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        ${Number(bill.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(bill.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/dashboard/admin/purchase/bills/${bill.id}`,
                            )
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
