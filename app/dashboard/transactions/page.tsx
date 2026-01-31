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

import { apiRequest } from "@/lib/api";
import { useEffect } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await apiRequest("/invoices");
        setTransactions(data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchInvoices();
  }, []);

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
              <TableHead className="w-[140px]">Invoice No.</TableHead>
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
                <TableCell className="font-medium text-sm">
                  {t.number || `INV-${t.id.slice(0, 6).toUpperCase()}`}
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
