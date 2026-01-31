export declare class PaymentAllocationDto {
    billId: string;
    allocatedAmount: number;
}
export declare class CreatePaymentDto {
    vendorId: string;
    paymentDate: Date;
    paymentMethod: string;
    paymentAmount: number;
    allocations: PaymentAllocationDto[];
}
