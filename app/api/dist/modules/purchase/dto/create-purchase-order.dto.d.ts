declare class PurchaseOrderLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}
export declare class CreatePurchaseOrderDto {
    vendorId: string;
    orderDate: Date;
    lines: PurchaseOrderLineDto[];
}
export {};
