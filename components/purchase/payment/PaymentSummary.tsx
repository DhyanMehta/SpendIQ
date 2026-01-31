"use client";

import { Card } from "@/components/ui/card";

interface PaymentSummaryProps {
  paymentAmount: number;
  allocations: Array<{
    billId: string;
    allocatedAmount: number;
  }>;
}

export function PaymentSummary({
  paymentAmount,
  allocations,
}: PaymentSummaryProps) {
  const totalAllocated = allocations.reduce(
    (sum, alloc) => sum + alloc.allocatedAmount,
    0
  );

  const remaining = paymentAmount - totalAllocated;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400">Payment Amount</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            ₹{paymentAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-gray-600 dark:text-gray-400">Total Allocated</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            ₹{totalAllocated.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-t">
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            Remaining Amount
          </span>
          <span
            className={`font-bold text-lg ${
              remaining === 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ₹{Math.abs(remaining).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {remaining !== 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Remaining amount must be zero before posting
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
