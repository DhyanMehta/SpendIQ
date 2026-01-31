"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
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
import { Plus, Trash2 } from "lucide-react";

interface POLineItemsProps {
  lines: any[];
  setLines: (lines: any[]) => void;
  isReadOnly: boolean;
  errors: Record<string, string>;
}

export function POLineItems({
  lines,
  setLines,
  isReadOnly,
  errors,
}: POLineItemsProps) {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await apiClient.get("/products");
      return data;
    },
  });

  const { data: analyticalAccounts } = useQuery({
    queryKey: ["analytical-accounts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytical-accounts");
      return data;
    },
  });

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        analyticalAccountId: "",
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      alert("At least one line item is required");
      return;
    }
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    // Auto-fill description when product changes
    if (field === "productId" && products) {
      const product = products.find((p: any) => p.id === value);
      if (product) {
        newLines[index].description = product.name;
        newLines[index].unitPrice = product.purchasePrice || 0;
        
        // Auto-fill analytical account if product has default
        if (product.defaultAnalyticAccountId) {
          newLines[index].analyticalAccountId = product.defaultAnalyticAccountId;
        }
      }
    }

    setLines(newLines);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Line Items</h2>
          {!isReadOnly && (
            <Button size="sm" variant="outline" onClick={handleAddLine}>
              <Plus className="h-4 w-4 mr-2" />
              Add Line
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead className="w-[250px]">Description</TableHead>
                <TableHead className="w-[120px]">Quantity</TableHead>
                <TableHead className="w-[120px]">Unit Price</TableHead>
                <TableHead className="w-[120px]">Subtotal</TableHead>
                <TableHead className="w-[200px]">Analytic Account</TableHead>
                {!isReadOnly && <TableHead className="w-[80px]">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => {
                const subtotal =
                  parseFloat(line.quantity || 0) *
                  parseFloat(line.unitPrice || 0);

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={line.productId}
                        onValueChange={(value) =>
                          handleLineChange(index, "productId", value)
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger
                          className={
                            errors[`line_${index}_product`]
                              ? "border-red-500"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product: any) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(index, "description", e.target.value)
                        }
                        disabled={isReadOnly}
                        className={
                          errors[`line_${index}_description`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={line.quantity}
                        onChange={(e) =>
                          handleLineChange(index, "quantity", e.target.value)
                        }
                        disabled={isReadOnly}
                        min="0.01"
                        step="0.01"
                        className={
                          errors[`line_${index}_quantity`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={line.unitPrice}
                        onChange={(e) =>
                          handleLineChange(index, "unitPrice", e.target.value)
                        }
                        disabled={isReadOnly}
                        min="0"
                        step="0.01"
                        className={
                          errors[`line_${index}_unitPrice`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={line.analyticalAccountId}
                        onValueChange={(value) =>
                          handleLineChange(index, "analyticalAccountId", value)
                        }
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {analyticalAccounts?.map((account: any) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveLine(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
