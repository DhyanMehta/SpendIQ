import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsUUID,
} from "class-validator";
import { BudgetType } from "@prisma/client";
import { Type } from "class-transformer";

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  analyticAccountId: string;

  @IsEnum(BudgetType)
  budgetType: BudgetType;

  @Type(() => Number)
  @IsNotEmpty()
  budgetedAmount: number; // Will be converted to Decimal in service
}
