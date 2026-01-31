import {
  IsString,
  IsOptional,
  IsNumber,
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
  @IsNumber()
  @Min(0)
  salesPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
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
