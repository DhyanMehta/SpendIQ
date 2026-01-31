declare class VendorBillLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}
export declare class CreateVendorBillDto {
    vendorId: string;
    billDate: Date;
    dueDate: Date;
    purchaseOrderId?: string;
    lines: VendorBillLineDto[];
}
export {};
