import { IsOptional, IsEnum, IsString } from "class-validator";
import { Status } from "@prisma/client";

export class ProductQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
