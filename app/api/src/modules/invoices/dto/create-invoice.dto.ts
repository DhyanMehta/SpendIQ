import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class InvoiceLineDto {
  @IsString()
  productId: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsOptional()
  analyticalAccountId?: string;
}

export class CreateInvoiceDto {
  @IsString()
  partnerId: string;

  @IsDateString()
  date: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(["CUSTOMER_INVOICE", "VENDOR_BILL", "IN_INVOICE", "OUT_INVOICE"]) // Using generic types matching schema usually
  type: "IN_INVOICE" | "OUT_INVOICE"; // IN_INVOICE = Vendor Bill, OUT_INVOICE = Customer Invoice

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  lines: InvoiceLineDto[];
}
