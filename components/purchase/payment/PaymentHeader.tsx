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

interface PaymentHeaderProps {
  vendorId: string;
  setVendorId: (value: string) => void;
  paymentDate: string;
  setPaymentDate: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  paymentAmount: number;
  setPaymentAmount: (value: number) => void;
  paymentNumber?: string;
  status?: string;
  vendors: any[];
  isReadOnly: boolean;
  errors: Record<string, string>;
}

export function PaymentHeader({
  vendorId,
  setVendorId,
  paymentDate,
  setPaymentDate,
  paymentMethod,
  setPaymentMethod,
  paymentAmount,
  setPaymentAmount,
  paymentNumber,
  status,
  vendors,
  isReadOnly,
  errors,
}: PaymentHeaderProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Details</h2>
          {status && <StatusBadge status={status} />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Number */}
          {paymentNumber && (
            <div>
              <Label>Payment Number</Label>
              <Input value={paymentNumber} disabled />
            </div>
          )}

          {/* Vendor */}
          <div>
            <Label htmlFor="vendor">
              Vendor <span className="text-red-500">*</span>
            </Label>
            <Select
              value={vendorId}
              onValueChange={setVendorId}
              disabled={isReadOnly}
            >
              <SelectTrigger
                id="vendor"
                className={errors.vendor ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
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

          {/* Payment Date */}
          <div>
            <Label htmlFor="paymentDate">
              Payment Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={isReadOnly}
              className={errors.paymentDate ? "border-red-500" : ""}
            />
            {errors.paymentDate && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="paymentMethod">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              disabled={isReadOnly}
            >
              <SelectTrigger
                id="paymentMethod"
                className={errors.paymentMethod ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK">Bank Transfer</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="MOCK_GATEWAY">Mock Gateway</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          {/* Payment Amount */}
          <div>
            <Label htmlFor="paymentAmount">
              Payment Amount (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="paymentAmount"
              type="number"
              value={paymentAmount || ""}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              disabled={isReadOnly}
              min="0.01"
              step="0.01"
              className={errors.paymentAmount ? "border-red-500" : ""}
            />
            {errors.paymentAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentAmount}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
