"use client";

import { Card } from "@/components/ui/card";

interface BillSummaryProps {
  lines: any[];
  payments?: any[];
}

export function BillSummary({ lines, payments = [] }: BillSummaryProps) {
  const subtotal = lines.reduce((sum, line) => {
    const lineSubtotal =
      parseFloat(line.quantity || 0) * parseFloat(line.unitPrice || 0);
    return sum + lineSubtotal;
  }, 0);

  const taxAmount = 0; // No tax calculation for now
  const total = subtotal + taxAmount;

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const outstanding = total - totalPaid;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Summary</h2>

        <div className="space-y-2 max-w-md ml-auto">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Untaxed Amount:</span>
            <span className="font-medium">
              ₹{subtotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Taxes:</span>
            <span className="font-medium">
              ₹{taxAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600 dark:text-blue-400">
                ₹{total.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {payments.length > 0 && (
            <>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Paid:</span>
                <span className="font-medium">
                  ₹{totalPaid.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex justify-between text-red-600 dark:text-red-400 font-bold">
                <span>Outstanding:</span>
                <span>
                  ₹{outstanding.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
