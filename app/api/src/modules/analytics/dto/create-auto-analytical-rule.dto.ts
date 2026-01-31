import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateAutoAnalyticalRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  // Optional match conditions (at least one should be provided)
  @IsString()
  @IsOptional()
  partnerTagId?: string;

  @IsString()
  @IsOptional()
  partnerId?: string;

  @IsString()
  @IsOptional()
  productCategoryId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  // Required output
  @IsString()
  @IsNotEmpty()
  analyticalAccountId: string;
}
