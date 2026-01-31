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

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs for this email to avoid clutter
    await (this.prisma as any).otpVerification.deleteMany({ where: { email } });

    await (this.prisma as any).otpVerification.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    await this.mailService.sendOtpEmail(email, otp);

    // In development mode, return the OTP in the response for easier testing
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      return {
        message: "OTP sent successfully",
        otp, // Include OTP in response for development
        note: "⚠️ OTP included in response because NODE_ENV=development. Remove in production!",
      };
    }

    return { message: "OTP sent successfully" };
  }

  async register(registerDto: RegisterDto) {
    console.log("[AuthService] Registering user:", registerDto.loginId);

    // Verify OTP
    if (!registerDto.otp) {
      throw new UnauthorizedException("OTP is required");
    }

    const otpRecord = await (this.prisma as any).otpVerification.findFirst({
      where: { email: registerDto.email, otp: registerDto.otp },
    });

    if (!otpRecord) {
      throw new UnauthorizedException("Invalid OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP has expired");
    }

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

    // Cleanup OTP
    await (this.prisma as any).otpVerification.delete({
      where: { id: otpRecord.id },
    });

    // Send welcome email (non-blocking) - Optional since we just verified email
    // this.mailService.sendWelcomeEmail(...)

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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loginId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
