import {
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

class SalesOrderLineDto {
  @IsString()
  productId: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateSalesOrderDto {
  @IsString()
  customerId: string;

  @IsDateString()
  date: string; // Changed from orderDate to date to match schema if needed, checking schema... Schema says `date`

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderLineDto)
  lines: SalesOrderLineDto[];
}
