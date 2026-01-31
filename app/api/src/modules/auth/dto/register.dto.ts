import {
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
  IsString,
} from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 12, { message: "Login ID must be between 6 and 12 characters" })
  loginId!: string;

  @IsNotEmpty()
  @Length(9, 50, { message: "Password must be more than 8 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*$/, {
    message:
      "Password must contain a lowercase letter, an uppercase letter, and a special character",
  })
  password!: string;

  @IsNotEmpty()
  name!: string;

  @IsString()
  otp?: string;
}
