"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface UnpaidBill {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amountTotal: number;
  paidAmount: number;
  outstanding: number;
}

interface Allocation {
  billId: string;
  allocatedAmount: number;
}

interface AllocationTableProps {
  unpaidBills: UnpaidBill[];
  allocations: Allocation[];
  setAllocations: (allocations: Allocation[]) => void;
  paymentAmount: number;
  isReadOnly: boolean;
}

export function AllocationTable({
  unpaidBills,
  allocations,
  setAllocations,
  paymentAmount,
  isReadOnly,
}: AllocationTableProps) {
  const handleAllocationChange = (billId: string, amount: number) => {
    const newAllocations = [...allocations];
    const index = newAllocations.findIndex((a) => a.billId === billId);

    if (amount <= 0 && index !== -1) {
      // Remove allocation if amount is 0
      newAllocations.splice(index, 1);
    } else if (amount > 0) {
      if (index !== -1) {
        // Update existing allocation
        newAllocations[index].allocatedAmount = amount;
      } else {
        // Add new allocation
        newAllocations.push({ billId, allocatedAmount: amount });
      }
    }

    setAllocations(newAllocations);
  };

  const getAllocatedAmount = (billId: string): number => {
    const allocation = allocations.find((a) => a.billId === billId);
    return allocation?.allocatedAmount || 0;
  };

  const totalAllocated = allocations.reduce(
    (sum, alloc) => sum + alloc.allocatedAmount,
    0
  );

  const remaining = paymentAmount - totalAllocated;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bill Allocation</h2>
          {unpaidBills.length === 0 && (
            <span className="text-sm text-gray-500">
              No unpaid bills for this vendor
            </span>
          )}
        </div>

        {unpaidBills.length > 0 && (
          <>
            {remaining !== 0 && !isReadOnly && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Allocation Required
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Total allocated must equal payment amount before posting.
                    Remaining: ₹{Math.abs(remaining).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Bill Number</TableHead>
                    <TableHead className="w-[120px]">Bill Date</TableHead>
                    <TableHead className="w-[120px]">Due Date</TableHead>
                    <TableHead className="text-right w-[120px]">Total Amount</TableHead>
                    <TableHead className="text-right w-[120px]">Paid Amount</TableHead>
                    <TableHead className="text-right w-[120px]">Outstanding</TableHead>
                    <TableHead className="text-right w-[150px]">
                      Allocate Amount *
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unpaidBills.map((bill) => {
                    const allocatedAmount = getAllocatedAmount(bill.id);
                    const isOverAllocated = allocatedAmount > bill.outstanding;

                    return (
                      <TableRow
                        key={bill.id}
                        className={isOverAllocated ? "bg-red-50 dark:bg-red-900/10" : ""}
                      >
                        <TableCell className="font-medium">{bill.number}</TableCell>
                        <TableCell>
                          {new Date(bill.date).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell>
                          {new Date(bill.dueDate).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{bill.amountTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{bill.paidAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{bill.outstanding.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={allocatedAmount || ""}
                            onChange={(e) =>
                              handleAllocationChange(
                                bill.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            disabled={isReadOnly}
                            min="0"
                            max={bill.outstanding}
                            step="0.01"
                            className={`text-right ${
                              isOverAllocated ? "border-red-500" : ""
                            }`}
                            placeholder="0.00"
                          />
                          {isOverAllocated && (
                            <p className="text-xs text-red-500 mt-1">
                              Exceeds outstanding
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
