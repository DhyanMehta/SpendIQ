import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/database/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log("[AuthService] Registering user:", registerDto.loginId);

    // Check for existing loginId
    const existingLoginId = await this.prisma.user.findUnique({
      where: { loginId: registerDto.loginId },
    });
    if (existingLoginId) {
      throw new ConflictException("Login ID already in use");
    }

    // Check for existing email (since schema requires uniqueness)
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        loginId: registerDto.loginId,
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: Role.ADMIN, // Defaulting to ADMIN for MVP functionality
      },
    });

    // Send welcome email (non-blocking)
    this.mailService
      .sendWelcomeEmail(user.email, user.name || "User")
      .catch((error) => {
        console.error("[AuthService] Failed to send welcome email:", error);
      });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { loginId: loginDto.loginId },
    });

    // Specific error message as requested
    const invalidCredsError = new UnauthorizedException(
      "Invalid Login Id or Password",
    );

    if (!user) {
      throw invalidCredsError;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw invalidCredsError;
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        loginId: user.loginId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
