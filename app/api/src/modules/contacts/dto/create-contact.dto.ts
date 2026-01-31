import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUrl,
} from "class-validator";
import { ContactType } from "@prisma/client";

export class CreateContactDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsEnum(ContactType)
  type!: ContactType;

  @IsOptional()
  @IsBoolean()
  isPortalUser?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // Array of tag IDs or names

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
