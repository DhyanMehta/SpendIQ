import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

// Local enum until Prisma Client is regenerated
export enum BudgetType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export class CreateBudgetDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsUUID()
  analyticAccountId!: string;

  @IsEnum(BudgetType)
  budgetType!: BudgetType;

  @Type(() => Number)
  @IsNotEmpty()
  @IsNumber()
  budgetedAmount!: number;
}
