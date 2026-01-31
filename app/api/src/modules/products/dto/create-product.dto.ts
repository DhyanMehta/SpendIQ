import { IsString, IsOptional, IsDecimal, Min, IsUUID } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsDecimal({ decimal_digits: "0,2" })
  @Min(0)
  salesPrice!: number;

  @Type(() => Number)
  @IsDecimal({ decimal_digits: "0,2" })
  @Min(0)
  purchasePrice!: number;

  @IsOptional()
  @IsString()
  categoryName?: string; // Create category on-the-fly

  @IsOptional()
  @IsUUID()
  categoryId?: string; // Or use existing category ID

  @IsOptional()
  @IsUUID()
  defaultAnalyticAccountId?: string;
}
