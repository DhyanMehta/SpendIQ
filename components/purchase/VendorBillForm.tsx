"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Save, Send, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { client } from "@/lib/api/client";
import { billApi } from "@/lib/purchase/api-bills";
import { BudgetWarning } from "./BudgetWarning";
import {
  VendorBill,
  BudgetWarning as BudgetWarningType,
  InvoiceStatus,
} from "@/lib/purchase/types";

// Schema for Bill
const BillLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01),
  unitPrice: z.number().min(0),
  analyticalAccountId: z.string().optional(),
});

const CreateBillSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  billDate: z.string(),
  dueDate: z.string(),
  reference: z.string().optional(),
  lines: z.array(BillLineSchema).min(1, "At least one line item is required"),
});

type BillFormValues = z.infer<typeof CreateBillSchema>;

interface VendorBillFormProps {
  initialData?: VendorBill;
}

export function VendorBillForm({ initialData }: VendorBillFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("poId");

  const [warnings, setWarnings] = useState<BudgetWarningType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bill, setBill] = useState<VendorBill | undefined>(initialData);

  const isEditable = !bill || bill.status === InvoiceStatus.DRAFT;

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await client.get("/contacts?type=VENDOR");
      return response.data || response;
    },
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await client.get("/products");
      return response.data || response;
    },
  });

  // Fetch analytical accounts
  const { data: analyticalAccounts } = useQuery({
    queryKey: ["analytical-accounts"],
    queryFn: async () => {
      const response = await client.get("/analytical-accounts");
      return response.data || response;
    },
  });

  // Fetch PO data if poId is present
  const { data: purchaseOrder } = useQuery({
    queryKey: ["purchase-order", poId],
    queryFn: async () => {
      if (!poId) return null;
      const response = await client.get(`/purchase-orders/${poId}`);
      return response.data || response;
    },
    enabled: !!poId && !initialData,
  });

  const form = useForm<BillFormValues>({
    resolver: zodResolver(CreateBillSchema),
    defaultValues: {
      vendorId: bill?.partnerId || "",
      billDate: bill?.date
        ? format(new Date(bill.date), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      dueDate: bill?.dueDate
        ? format(new Date(bill.dueDate), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      reference: bill?.reference || "",
      lines: bill?.lines.map((l) => ({
        productId: l.productId || "",
        description: l.label,
        quantity: Number(l.quantity),
        unitPrice: Number(l.priceUnit),
        analyticalAccountId: l.analyticAccountId || "",
      })) || [
        {
          productId: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          analyticalAccountId: "",
        },
      ],
    },
    disabled: !isEditable,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Pre-fill form when PO data loads
  useEffect(() => {
    if (purchaseOrder && !initialData) {
      form.reset({
        vendorId: purchaseOrder.vendorId,
        billDate: format(new Date(), "yyyy-MM-dd"),
        dueDate: format(new Date(), "yyyy-MM-dd"),
        reference: `From PO: ${purchaseOrder.number || purchaseOrder.id}`,
        lines: purchaseOrder.lines?.map((line: any) => ({
          productId: line.productId || "",
          description: line.description || "",
          quantity: Number(line.quantity) || 1,
          unitPrice: Number(line.unitPrice) || 0,
          analyticalAccountId: line.analyticalAccountId || "",
        })) || [
          {
            productId: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            analyticalAccountId: "",
          },
        ],
      });
    }
  }, [purchaseOrder, initialData, form]);

  // Handle product selection and auto-fill
  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find((p: any) => p.id === productId);
    if (product) {
      form.setValue(`lines.${index}.productId`, productId);
      form.setValue(`lines.${index}.description`, product.name || "");
      form.setValue(
        `lines.${index}.unitPrice`,
        Number(product.purchasePrice || 0),
      );

      // Auto-fill analytic account if product has default
      if (product.defaultAnalyticAccountId) {
        form.setValue(
          `lines.${index}.analyticalAccountId`,
          product.defaultAnalyticAccountId,
        );
      }
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const lines = form.watch("lines");
    const subtotal = lines.reduce(
      (sum, line) =>
        sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
      0,
    );
    return {
      subtotal,
      tax: 0, // Add tax calculation if needed
      total: subtotal,
    };
  };

  const totals = calculateTotals();

  const onSubmit = async (data: BillFormValues) => {
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

      if (bill) {
        alert("Update feature pending");
      } else {
        const created = await billApi.create(payload);
        setBill(created);
        router.push(`/dashboard/admin/purchase/bills/${created.id}`);
      }
    } catch (error) {
      console.error("Failed to save bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPost = async () => {
    if (!bill) return;
    setIsSubmitting(true);
    setWarnings([]);
    try {
      const response = await billApi.post(bill.id);
      setBill(response.bill);
      if (response.budgetWarnings && response.budgetWarnings.length > 0) {
        setWarnings(response.budgetWarnings);
      }
    } catch (error) {
      console.error("Failed to post bill:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {bill
              ? `Bill: ${bill.number || bill.reference || "New"}`
              : "New Vendor Bill"}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            {bill && (
              <Badge
                variant={
                  bill.status === InvoiceStatus.POSTED ? "default" : "outline"
                }
              >
                {bill.status}
              </Badge>
            )}
            {poId && !bill && (
              <Badge variant="secondary">Created from PO</Badge>
            )}
          </div>
        </div>
        <div className="space-x-2">
          {!bill && (
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
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          )}

          {bill && bill.status === InvoiceStatus.DRAFT && (
            <Button
              type="button"
              onClick={onPost}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="mr-2 h-4 w-4" /> Post Bill
            </Button>
          )}
        </div>
      </div>

      {poId && !bill && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This bill is being created from Purchase Order. The vendor and line
            items have been pre-filled.
          </AlertDescription>
        </Alert>
      )}

      <BudgetWarning warnings={warnings} />

      <Form {...form}>
        <form className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
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
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!isEditable}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors?.map((vendor: any) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.name}{" "}
                              {vendor.company && `(${vendor.company})`}
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
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. INV/2024/001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Product *</TableHead>
                      <TableHead className="w-[250px]">Description *</TableHead>
                      <TableHead className="w-[200px]">
                        Analytic Account
                      </TableHead>
                      <TableHead className="w-[100px]">Qty *</TableHead>
                      <TableHead className="w-[120px]">Unit Price *</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      {isEditable && (
                        <TableHead className="w-[50px]"></TableHead>
                      )}
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
                                  value={field.value}
                                  onValueChange={(value) =>
                                    handleProductChange(index, value)
                                  }
                                  disabled={!isEditable}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products?.map((product: any) => (
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
                                  <Input
                                    placeholder="Description"
                                    {...field}
                                    disabled={!isEditable}
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
                            name={`lines.${index}.analyticalAccountId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={!isEditable}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {analyticalAccounts?.map((account: any) => (
                                      <SelectItem
                                        key={account.id}
                                        value={account.id}
                                      >
                                        {account.code} - {account.name}
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
                                    min="0.01"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    disabled={!isEditable}
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
                                      field.onChange(
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    disabled={!isEditable}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹
                          {(
                            (form.watch(`lines.${index}.quantity`) || 0) *
                            (form.watch(`lines.${index}.unitPrice`) || 0)
                          ).toFixed(2)}
                        </TableCell>
                        {isEditable && (
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <div className="w-[300px] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    ₹{totals.subtotal.toFixed(2)}
                  </span>
                </div>
                {totals.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium">
                      ₹{totals.tax.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
