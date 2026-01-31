export declare class CreateVendorBillLineDto {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    analyticalAccountId?: string;
    taxAmount?: number;
}
export declare class CreateVendorBillDto {
    vendorId: string;
    billDate: string;
    dueDate: string;
    reference?: string;
    lines: CreateVendorBillLineDto[];
    sourceDocument?: string;
}
