import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { InvoiceType } from "@prisma/client";

export class CreateInvoiceLineDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsNotEmpty()
  @IsString()
  label!: string;

  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @IsNotEmpty()
  @IsNumber()
  priceUnit!: number;

  @IsOptional()
  @IsString()
  analyticAccountId?: string;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  number!: string;

  @IsNotEmpty()
  @IsEnum(InvoiceType)
  type!: InvoiceType;

  @IsNotEmpty()
  @IsString()
  partnerId!: string;

  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines!: CreateInvoiceLineDto[];
}
