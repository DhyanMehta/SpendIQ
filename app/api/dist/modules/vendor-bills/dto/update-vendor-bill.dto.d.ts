declare class VendorBillLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
}
export declare class UpdateVendorBillDto {
    vendorId?: string;
    billDate?: Date;
    dueDate?: Date;
    lines?: VendorBillLineDto[];
}
export {};
