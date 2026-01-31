import { IsString, IsNotEmpty, IsDate, IsArray, ValidateNested, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class VendorBillLineDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsString()
  @IsOptional()
  analyticalAccountId?: string;
}

export class CreateVendorBillDto {
  @IsString()
  @IsNotEmpty()
  vendorId!: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  billDate!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate!: Date;

  @IsString()
  @IsOptional()
  purchaseOrderId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorBillLineDto)
  lines!: VendorBillLineDto[];
}
