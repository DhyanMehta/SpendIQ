"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Needs implementation or primitive
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  ArrowUpDown,
  Calendar as CalendarIcon,
} from "lucide-react";

// Mock Data
const transactions = [
  {
    id: "INV-2024-001",
    date: "2026-01-15",
    recipient: "AWS Web Services",
    description: "Monthly Cloud Hosting",
    amount: 1250.0,
    status: "Paid",
    category: "IT Infrastructure",
  },
  {
    id: "INV-2024-002",
    date: "2026-01-18",
    recipient: "Staples",
    description: "Office Stationery",
    amount: 342.5,
    status: "Pending",
    category: "Office Supplies",
  },
  {
    id: "INV-2024-003",
    date: "2026-01-20",
    recipient: "Upwork",
    description: "Freelance Design Work",
    amount: 850.0,
    status: "Paid",
    category: "Marketing",
  },
  {
    id: "INV-2024-004",
    date: "2026-01-22",
    recipient: "Delta Airlines",
    description: "Sales Team flight to NY",
    amount: 1420.0,
    status: "Processing",
    category: "Travel",
  },
  {
    id: "INV-2024-005",
    date: "2026-01-25",
    recipient: "TechData Corp",
    description: "New Monitors for Dev Team",
    amount: 4500.0,
    status: "Pending",
    category: "IT",
  },
];

export default function TransactionsPage() {
  const [filter, setFilter] = useState("");

  const filteredTransactions = transactions.filter(
    (t) =>
      t.recipient.toLowerCase().includes(filter.toLowerCase()) ||
      t.description.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Recent invoices and expenses.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipient or description..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <CalendarIcon className="mr-2 h-4 w-4" /> Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Invoice ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead className="hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-xs font-mono text-muted-foreground">
                  {t.id}
                </TableCell>
                <TableCell>{t.date}</TableCell>
                <TableCell className="font-semibold">{t.recipient}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {t.description}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="font-normal">
                    {t.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  $
                  {t.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      t.status === "Paid"
                        ? "success"
                        : t.status === "Pending"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
