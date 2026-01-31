import { IsNotEmpty, IsNumber, IsDate, IsString, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterPaymentDto {
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  paymentDate: Date;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // BANK, CASH, UPI

  @IsString()
  @IsOptional()
  reference?: string;
}
