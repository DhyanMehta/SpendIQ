declare class PurchaseOrderLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}
export declare class UpdatePurchaseOrderDto {
    vendorId?: string;
    orderDate?: Date;
    lines?: PurchaseOrderLineDto[];
}
export {};
