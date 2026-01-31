"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { useContacts } from "@/lib/hooks/useContacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProcessInvoicesPage() {
  // Renamed to avoid calling it Page if exported default
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [partnerFilter, setPartnerFilter] = useState<string>("");

  const limit = 10;
  // Force type to OUT_INVOICE for Customer Invoices
  const type = "OUT_INVOICE";

  const { data: invoicesData, isLoading } = useInvoices({
    page,
    limit,
    search,
    type,
    state: statusFilter || undefined,
    partnerId: partnerFilter || undefined,
  });

  const { data: contactsData } = useContacts();
  const customers =
    contactsData?.filter((c: any) => c.type === "CUSTOMER") || [];

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handlePartnerChange = (value: string) => {
    setPartnerFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/sale/invoice/${id}`);
  };

  const handleCreateNew = () => {
    router.push(`/dashboard/sale/invoice/create`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage invoices and payments
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Invoice # or customer..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* Customer Filter */}
          <Select
            value={partnerFilter || "all"}
            onValueChange={handlePartnerChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {customers.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPartnerFilter("");
              setPage(1);
            }}
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : invoicesData?.data?.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No invoices found</p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Invoice
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoicesData?.data?.map((inv: any) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleRowClick(inv.id)}
                    >
                      <TableCell className="font-medium">
                        {inv.number}
                      </TableCell>
                      <TableCell>{inv.partner?.name}</TableCell>
                      <TableCell>
                        {new Date(inv.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {Number(inv.totalAmount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹
                        {Number(inv.amountDue).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.state} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.paymentState} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, invoicesData?.meta?.total || 0)} of{" "}
                  {invoicesData?.meta?.total || 0} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page} of {invoicesData?.meta?.totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (invoicesData?.meta?.totalPages || 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
