import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateAnalyticalAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}
