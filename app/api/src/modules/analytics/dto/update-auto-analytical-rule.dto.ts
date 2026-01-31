import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdateAutoAnalyticalRuleDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  // Optional match conditions
  @IsString()
  @IsOptional()
  partnerTagId?: string | null;

  @IsString()
  @IsOptional()
  partnerId?: string | null;

  @IsString()
  @IsOptional()
  productCategoryId?: string | null;

  @IsString()
  @IsOptional()
  productId?: string | null;

  // Output
  @IsString()
  @IsOptional()
  analyticalAccountId?: string;
}
