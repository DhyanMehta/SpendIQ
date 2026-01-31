import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  loginId!: string;

  @IsNotEmpty()
  password!: string;
}
