import { IsOptional, IsDateString, IsUUID, IsEnum } from "class-validator";

export enum BudgetTypeFilter {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  ALL = "ALL",
}

export enum StatusFilter {
  WITHIN_BUDGET = "WITHIN_BUDGET",
  OVER_BUDGET = "OVER_BUDGET",
  ALL = "ALL",
}

export class AnalyticsFiltersDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsUUID()
  analyticAccountId?: string;

  @IsOptional()
  @IsEnum(BudgetTypeFilter)
  budgetType?: BudgetTypeFilter;

  @IsOptional()
  @IsEnum(StatusFilter)
  status?: StatusFilter;
}
