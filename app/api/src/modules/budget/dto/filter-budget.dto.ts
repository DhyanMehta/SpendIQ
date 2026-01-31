import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsString,
} from "class-validator";
import { BudgetStatus, BudgetType } from "@prisma/client";
import { Type } from "class-transformer";

export class FilterBudgetDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;

  @IsOptional()
  @IsEnum(BudgetType)
  budgetType?: BudgetType;

  @IsOptional()
  @IsUUID()
  analyticAccountId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
