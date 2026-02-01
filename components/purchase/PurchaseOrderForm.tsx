"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Save, CheckCircle, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreatePurchaseOrderSchema,
  CreatePurchaseOrderFormValues,
  PurchaseOrderLineSchema,
} from "@/lib/purchase/validators";
import { purchaseApi } from "@/lib/purchase/api";
import { client } from "@/lib/api/client";
import { BudgetWarning } from "./BudgetWarning";
import {
  BudgetWarning as BudgetWarningType,
  PurchaseOrder,
  PurchOrderStatus,
} from "@/lib/purchase/types";
import { generatePDF, preparePurchaseOrderData } from "@/lib/pdf-generator";

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder;
}

export function PurchaseOrderForm({ initialData }: PurchaseOrderFormProps) {
  const router = useRouter();
  const [warnings, setWarnings] = useState<BudgetWarningType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [po, setPo] = useState<PurchaseOrder | undefined>(initialData);

  // Fetch vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await client.get("/contacts?type=VENDOR");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await client.get("/products");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  // Fetch analytic accounts
  const { data: analyticAccounts = [] } = useQuery({
    queryKey: ["analyticAccounts"],
    queryFn: async () => {
      const response = await client.get("/analytical-accounts");
      return Array.isArray(response) ? response : response.data || [];
    },
  });

  const isEditable = !po || po.status === PurchOrderStatus.DRAFT;

  const form = useForm<CreatePurchaseOrderFormValues>({
    resolver: zodResolver(CreatePurchaseOrderSchema),
    defaultValues: {
      vendorId: po?.vendorId || "",
      orderDate: po?.orderDate
        ? format(new Date(po.orderDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      lines: po?.lines.map((l) => ({
        productId: l.productId,
        description: l.description,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        analyticalAccountId: l.analyticalAccountId || "",
      })) || [
          {
            productId: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            analyticalAccountId: "", // Optional
          },
        ],
    },
    disabled: !isEditable,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const onSubmit = async (data: CreatePurchaseOrderFormValues) => {
    setIsSubmitting(true);
    setWarnings([]);
    try {
      const payload = {
        ...data,
        lines: data.lines.map((l) => ({
          ...l,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      };

      if (po) {
        // Update
        const updated = await purchaseApi.update(po.id, payload);
        setPo(updated);
        // Toast success
      } else {
        // Create
        const created = await purchaseApi.create(payload);
        setPo(created);
        router.push(`/dashboard/admin/purchase/orders/${created.id}`);
      }
    } catch (error) {
      console.error("Failed to save PO:", error);
      // Handle error (toast, etc)
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirm = async () => {
    if (!po) return;
    setIsSubmitting(true);
    setWarnings([]);
    try {
      const response = await purchaseApi.confirm(po.id);
      setPo(response.po);
      if (response.budgetWarnings && response.budgetWarnings.length > 0) {
        setWarnings(response.budgetWarnings);
      }
    } catch (error) {
      console.error("Failed to confirm PO:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateBill = () => {
    // Navigate to Bill creation (future imp)
    alert("Feature coming in next step: Create Bill from PO " + po?.poNumber);
  };

  const handleDownloadPDF = () => {
    if (!po) return;
    const pdfData = preparePurchaseOrderData(po);
    generatePDF(pdfData);
    toast.success("PDF downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {po ? `PO: ${po.poNumber}` : "New Purchase Order"}
          </h2>
          <div className="mt-1">
            {po && (
              <Badge
                variant={
                  po.status === PurchOrderStatus.CONFIRMED
                    ? "default"
                    : "outline"
                }
              >
                {po.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-x-2">
          {po && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          )}
          {!po && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          )}

          {isEditable && (
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
          )}

          {po && po.status === PurchOrderStatus.DRAFT && (
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Confirm Order
            </Button>
          )}

          {po && po.status === PurchOrderStatus.CONFIRMED && (
            <Button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/admin/purchase/bills/create?poId=${po.id}`,
                )
              }
              className="bg-green-600 hover:bg-green-700"
            >
              <FileText className="mr-2 h-4 w-4" /> Create Bill
            </Button>
          )}
        </div>
      </div>

      <BudgetWarning warnings={warnings} />

      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!isEditable}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor: any) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}
                              {vendor.company && ` (${vendor.company})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              {isEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      productId: "",
                      description: "",
                      quantity: 1,
                      unitPrice: 0,
                      analyticalAccountId: "",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Line
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Analytic Account</TableHead>
                    <TableHead className="w-[100px]">Qty</TableHead>
                    <TableHead className="w-[150px]">Unit Price</TableHead>
                    <TableHead className="w-[150px]">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.productId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // Auto-fill description and price when product is selected
                                  const product = products.find(
                                    (p: any) => p.id === value,
                                  );
                                  if (product) {
                                    form.setValue(
                                      `lines.${index}.description`,
                                      product.name || "",
                                    );
                                    form.setValue(
                                      `lines.${index}.unitPrice`,
                                      Number(product.purchasePrice) || 0,
                                    );
                                    // Set default analytic account if available
                                    if (product.defaultAnalyticAccountId) {
                                      form.setValue(
                                        `lines.${index}.analyticalAccountId`,
                                        product.defaultAnalyticAccountId,
                                      );
                                    }
                                  }
                                }}
                                value={field.value}
                                disabled={!isEditable}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((product: any) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id}
                                    >
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.analyticalAccountId`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!isEditable}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Optional" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {analyticAccounts.map((account: any) => (
                                    <SelectItem
                                      key={account.id}
                                      value={account.id}
                                    >
                                      {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`lines.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {/* Calculated Total Display */}
                        {(
                          (form.watch(`lines.${index}.quantity`) || 0) *
                          (form.watch(`lines.${index}.unitPrice`) || 0)
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {isEditable && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default PurchaseOrderForm;
