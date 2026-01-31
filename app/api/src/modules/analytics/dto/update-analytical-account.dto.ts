import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdateAnalyticalAccountDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
