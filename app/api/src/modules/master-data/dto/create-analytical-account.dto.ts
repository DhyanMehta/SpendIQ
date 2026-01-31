import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAnalyticalAccountDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
