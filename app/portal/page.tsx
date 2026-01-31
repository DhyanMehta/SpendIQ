"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, CreditCard, Clock } from "lucide-react";

// Mock Data for Portal User
const invoices = [
  {
    id: "INV-2024-055",
    date: "2026-01-20",
    amount: 2400.0,
    status: "Unpaid",
    due: "2026-02-01",
  },
  {
    id: "INV-2024-042",
    date: "2025-12-15",
    amount: 1250.0,
    status: "Paid",
    due: "2025-12-30",
  },
  {
    id: "INV-2024-033",
    date: "2025-11-20",
    amount: 1800.0,
    status: "Paid",
    due: "2025-12-05",
  },
];

export default function PortalPage() {
  const outstanding = invoices.reduce(
    (acc, inv) => (inv.status === "Unpaid" ? acc + inv.amount : acc),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-primary text-primary-foreground p-8 rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, Client Inc.</h1>
          <p className="opacity-90">
            You have{" "}
            <span className="font-bold">${outstanding.toLocaleString()}</span>{" "}
            in outstanding invoices.
          </p>
        </div>
        <Button variant="secondary" size="lg" className="shadow-sm">
          <CreditCard className="mr-2 h-5 w-5" /> Pay Now
        </Button>
      </div>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            View and download detailed statements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {inv.due}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${inv.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        inv.status === "Paid" ? "success" : "destructive"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" /> PDF
                    </Button>
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
