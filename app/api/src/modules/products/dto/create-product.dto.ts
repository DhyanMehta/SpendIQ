import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salesPrice!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @IsOptional()
  @IsEnum(["ACTIVE", "ARCHIVED"])
  status?: "ACTIVE" | "ARCHIVED";

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
