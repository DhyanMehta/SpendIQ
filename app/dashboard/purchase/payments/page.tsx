"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePayments } from "@/lib/hooks/usePayments";
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
import { Search, Plus, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [vendorFilter, setVendorFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const limit = 10;

  const { data: paymentsData, isLoading } = usePayments({
    page,
    limit,
    search,
    status: statusFilter || undefined,
    vendorId: vendorFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: contactsData } = useContacts();
  const vendors = contactsData?.filter((c: any) => c.type === "VENDOR") || [];

  const payments = paymentsData?.data || [];
  const pagination = paymentsData?.pagination || { totalPages: 1 };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleVendorChange = (value: string) => {
    setVendorFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/purchase/payments/${id}`);
  };

  const handleCreateNew = () => {
    router.push("/dashboard/purchase/payments/create");
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setVendorFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      CASH: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      BANK: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      UPI: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      MOCK_GATEWAY: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method] || ""}`}>
        {method.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vendor payments and allocations
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Payment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by payment number or vendor..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="POSTED">Posted</SelectItem>
            </SelectContent>
          </Select>

          {/* Vendor Filter */}
          <Select value={vendorFilter || "all"} onValueChange={handleVendorChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map((vendor: any) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            placeholder="Start Date"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            placeholder="End Date"
          />
        </div>

        {/* Reset Filters */}
        {(search || statusFilter || vendorFilter || startDate || endDate) && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Payment Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading payments...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No payments found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first vendor payment to get started
                      </p>
                      <Button onClick={handleCreateNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Payment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => handleRowClick(payment.id)}
                  >
                    <TableCell className="font-medium">{payment.number}</TableCell>
                    <TableCell>{payment.partner?.name || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹
                      {Number(payment.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && payments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
