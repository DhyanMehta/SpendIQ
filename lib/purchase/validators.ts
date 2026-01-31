import { z } from "zod";

export const PurchaseOrderLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price must be non-negative"),
  analyticalAccountId: z.string().optional(),
});

export const CreatePurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  orderDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  lines: z
    .array(PurchaseOrderLineSchema)
    .min(1, "At least one line item is required"),
});

export type CreatePurchaseOrderFormValues = z.infer<
  typeof CreatePurchaseOrderSchema
>;
