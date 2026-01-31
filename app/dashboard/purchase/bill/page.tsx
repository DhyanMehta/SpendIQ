"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVendorBills } from "@/lib/hooks/useVendorBills";
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
import { Search, Plus, ChevronLeft, ChevronRight, FileText } from "lucide-react";

export default function VendorBillsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [vendorFilter, setVendorFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const limit = 10;

  const { data: billsData, isLoading } = useVendorBills({
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
    router.push(`/dashboard/purchase/bill/${id}`);
  };

  const handleCreateNew = () => {
    router.push(`/dashboard/purchase/bill/create`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setVendorFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const getPaymentStatusBadge = (paymentState: string) => {
    const colors: Record<string, string> = {
      PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      PARTIAL: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      NOT_PAID: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[paymentState] || ""}`}>
        {paymentState.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor Bills</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage accounts payable and vendor invoices
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Vendor Bill
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bill number or vendor..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter || "all"} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="POSTED">Posted</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="NOT_PAID">Not Paid</SelectItem>
            </SelectContent>
          </Select>

          {/* Vendor Filter */}
          <Select value={vendorFilter || "all"} onValueChange={handleVendorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by vendor" />
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
            placeholder="Start date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            placeholder="End date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : billsData?.data?.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No vendor bills found</p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Vendor Bill
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Bill Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Linked PO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billsData?.data?.map((bill: any) => (
                    <TableRow
                      key={bill.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleRowClick(bill.id)}
                    >
                      <TableCell className="font-medium">{bill.number}</TableCell>
                      <TableCell>{bill.partner?.name}</TableCell>
                      <TableCell>
                        {new Date(bill.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{bill.totalAmount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status} />
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(bill.paymentState)}
                      </TableCell>
                      <TableCell>
                        {bill.purchaseOrder ? (
                          <span className="text-blue-600 dark:text-blue-400 text-sm">
                            {bill.purchaseOrder.poNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Manual</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, billsData?.meta?.total || 0)} of{" "}
                  {billsData?.meta?.total || 0} results
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
                    Page {page} of {billsData?.meta?.totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (billsData?.meta?.totalPages || 1)}
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
