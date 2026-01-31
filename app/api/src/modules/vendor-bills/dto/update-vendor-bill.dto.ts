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

export class UpdateVendorBillDto {
  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  billDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorBillLineDto)
  @IsOptional()
  lines?: VendorBillLineDto[];
}
