import { IsString, IsDate, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentAllocationDto {
  @IsString()
  @IsNotEmpty()
  billId!: string;

  @IsNumber()
  @Min(0.01)
  allocatedAmount!: number;
}

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsDate()
  @Type(() => Date)
  paymentDate!: Date;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string; // CASH, BANK, UPI, MOCK_GATEWAY

  @IsNumber()
  @Min(0.01)
  paymentAmount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations!: PaymentAllocationDto[];
}
