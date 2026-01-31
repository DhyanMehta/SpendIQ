declare class InvoiceLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}
export declare class CreateInvoiceDto {
    partnerId: string;
    date: string;
    dueDate: string;
    type: "IN_INVOICE" | "OUT_INVOICE";
    lines: InvoiceLineDto[];
}
export {};
