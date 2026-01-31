import {
  IsString,
  IsOptional,
  IsDecimal,
  Min,
  IsUUID,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { Status } from "@prisma/client";

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: "0,2" })
  @Min(0)
  salesPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: "0,2" })
  @Min(0)
  purchasePrice?: number;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  defaultAnalyticAccountId?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
