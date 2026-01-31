import { IsOptional, IsEnum, IsString, IsBoolean } from "class-validator";
import { ContactType, Status } from "@prisma/client";

export class ContactQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name or email

  @IsOptional()
  @IsEnum(ContactType)
  type?: ContactType;

  @IsOptional()
  @IsBoolean()
  isPortalUser?: boolean;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
