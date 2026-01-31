"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePurchaseOrders } from "@/lib/hooks/usePurchaseOrders";
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

export default function PurchaseOrderPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [vendorFilter, setVendorFilter] = useState<string>("");

  const limit = 10;

  const { data: purchaseOrdersData, isLoading } = usePurchaseOrders({
    page,
    limit,
    search,
    status: statusFilter || undefined,
    vendorId: vendorFilter || undefined,
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
    router.push(`/dashboard/purchase/order/${id}`);
  };

  const handleCreateNew = () => {
    router.push(`/dashboard/purchase/order/create`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage purchase orders from vendors
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search PO number or vendor..."
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
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
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

          {/* Reset Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setVendorFilter("");
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
          ) : purchaseOrdersData?.data?.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No purchase orders found</p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Purchase Order
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrdersData?.data?.map((po: any) => (
                    <TableRow
                      key={po.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => handleRowClick(po.id)}
                    >
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.vendor?.name}</TableCell>
                      <TableCell>
                        {new Date(po.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{po.totalAmount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={po.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(po.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, purchaseOrdersData?.meta?.total || 0)} of{" "}
                  {purchaseOrdersData?.meta?.total || 0} results
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
                    Page {page} of {purchaseOrdersData?.meta?.totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (purchaseOrdersData?.meta?.totalPages || 1)}
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
