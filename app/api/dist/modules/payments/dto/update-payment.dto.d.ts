import { PaymentAllocationDto } from './create-payment.dto';
export declare class UpdatePaymentDto {
    vendorId?: string;
    paymentDate?: Date;
    paymentMethod?: string;
    paymentAmount?: number;
    allocations?: PaymentAllocationDto[];
}
