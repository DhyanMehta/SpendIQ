export enum PurchOrderStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface PurchaseOrderLine {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: {
    id: string;
    name: string;
  };
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  analyticalAccountId?: string;
  analyticalAccount?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor?: {
    id: string;
    name: string;
  };
  orderDate: string;
  status: PurchOrderStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  lines: PurchaseOrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderLineRequest {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  analyticalAccountId?: string;
}

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  orderDate: string;
  lines: CreatePurchaseOrderLineRequest[];
}

export interface UpdatePurchaseOrderRequest {
  vendorId?: string;
  orderDate?: string;
  // Lines update is complex, typically handled separately or full replacement
}

export interface BudgetWarning {
  lineId: string;
  analytic: string;
  message: string;
}

export interface ConfirmPOResponse {
  po: PurchaseOrder;
  budgetWarnings: BudgetWarning[];
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export interface VendorBill {
  id: string;
  number: string;
  type: string;
  partnerId: string;
  partner?: {
    id: string;
    name: string;
  };
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentState: string;
  totalAmount: number;
  taxAmount: number;
  reference?: string;
  lines: VendorBillLine[];
}

export interface VendorBillLine {
  id: string;
  productId?: string;
  product?: {
    id: string;
    name: string;
  };
  label: string;
  quantity: number;
  priceUnit: number;
  subtotal: number;
  taxRate: number;
  analyticAccountId?: string;
  analyticAccount?: {
    id: string;
    name: string;
  };
}
