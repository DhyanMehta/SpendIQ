import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsNotEmpty,
} from "class-validator";
import { Role } from "@prisma/client";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Login ID must be at least 6 characters long" })
  @MaxLength(12, { message: "Login ID cannot exceed 12 characters" })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: "Login ID must contain only alphanumeric characters",
  })
  loginId: string;

  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: "Password too weak (must contain Upper, Lower, Number/Special)",
  })
  password: string;

  @IsEnum(Role, { message: "Invalid role selected" })
  @IsNotEmpty()
  role: Role;
}
