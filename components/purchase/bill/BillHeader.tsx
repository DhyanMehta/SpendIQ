"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface BillHeaderProps {
  vendorId: string;
  setVendorId: (value: string) => void;
  billDate: string;
  setBillDate: (value: string) => void;
  dueDate: string;
  setDueDate: (value: string) => void;
  billNumber?: string;
  status?: string;
  vendors: any[];
  purchaseOrder?: any;
  isReadOnly: boolean;
  errors: Record<string, string>;
}

export function BillHeader({
  vendorId,
  setVendorId,
  billDate,
  setBillDate,
  dueDate,
  setDueDate,
  billNumber,
  status,
  vendors,
  purchaseOrder,
  isReadOnly,
  errors,
}: BillHeaderProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bill Details</h2>
          {status && <StatusBadge status={status} />}
        </div>

        {billNumber && (
          <div>
            <Label>Bill Number</Label>
            <Input value={billNumber} disabled className="bg-gray-50 dark:bg-gray-900" />
          </div>
        )}

        {purchaseOrder && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Created from Purchase Order
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {purchaseOrder.poNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vendor */}
          <div>
            <Label htmlFor="vendor">
              Vendor <span className="text-red-500">*</span>
            </Label>
            <Select
              value={vendorId}
              onValueChange={setVendorId}
              disabled={isReadOnly || !!purchaseOrder}
            >
              <SelectTrigger
                id="vendor"
                className={errors.vendor ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor: any) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendor && (
              <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>
            )}
          </div>

          {/* Bill Date */}
          <div>
            <Label htmlFor="billDate">
              Bill Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="billDate"
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              disabled={isReadOnly}
              className={errors.billDate ? "border-red-500" : ""}
            />
            {errors.billDate && (
              <p className="text-red-500 text-sm mt-1">{errors.billDate}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate">
              Due Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isReadOnly}
              className={errors.dueDate ? "border-red-500" : ""}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
