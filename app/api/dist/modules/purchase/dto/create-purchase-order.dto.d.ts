declare class CreatePurchaseOrderLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}
export declare class CreatePurchaseOrderDto {
    vendorId: string;
    orderDate: string;
    lines: CreatePurchaseOrderLineDto[];
}
export {};
