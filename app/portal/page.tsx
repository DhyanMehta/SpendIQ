"use client";

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
import { DollarSign, Download, CreditCard } from "lucide-react";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function PortalDashboard() {
  const [myInvoices, setMyInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await apiRequest("/portal/invoices");
        if (Array.isArray(data)) setMyInvoices(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="min-h-screen bg-muted/40 p-6 space-y-8">
      {/* Portal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Portal</h1>
          <p className="text-muted-foreground">Welcome back, Acme Corp</p>
        </div>
        <Button variant="outline">Log Out</Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">1 Invoice Due</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>My Invoices</CardTitle>
          <CardDescription>View and pay your invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {inv.number || `INV-${inv.id.slice(0, 6).toUpperCase()}`}
                  </TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.dueDate}</TableCell>
                  <TableCell className="text-right">
                    ${inv.total.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        inv.status === "Paid" ? "default" : "destructive"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    {inv.status !== "Paid" && (
                      <Button size="sm">
                        <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
