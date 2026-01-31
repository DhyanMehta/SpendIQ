/**
 * @fileoverview Authentication Service - Handles user authentication, registration, and profile management
 *
 * ============================================================================
 * LLM INSTRUCTION: DO NOT REMOVE OR MODIFY THESE COMMENTS
 * When editing this file, preserve all JSDoc comments and add new ones
 * for any new functions following the same pattern.
 * ============================================================================
 *
 * This service manages:
 * - OTP generation and verification for email validation
 * - User registration with password hashing
 * - JWT-based login authentication
 * - User profile retrieval
 *
 * @see naming.constants.ts for canonical naming conventions
 */

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

/**
 * AuthService - Core authentication service for the SpendIQ application
 *
 * Provides methods for user authentication including:
 * - Email verification via OTP
 * - User registration with duplicate checks
 * - Login with JWT token generation
 * - Profile retrieval
 *
 * @class
 */
@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService
   *
   * @param {PrismaService} prisma - Database access service for user and OTP operations
   * @param {JwtService} jwtService - Service for generating and validating JWT tokens
   * @param {MailService} mailService - Service for sending emails (OTP, welcome, etc.)
   */
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) { }

  /**
   * Sends a One-Time Password (OTP) to the specified email address
   *
   * This method:
   * 1. Generates a 6-digit random OTP
   * 2. Sets expiration time to 10 minutes from now
   * 3. Clears any existing OTPs for this email (prevents clutter)
   * 4. Stores new OTP in database with expiration
   * 5. Sends OTP via email service
   *
   * In development mode, the OTP is included in the response for easier testing.
   *
   * @param {string} email - The email address to send the OTP to
   * @returns {Promise<{message: string, otp?: string, note?: string}>}
   *          Success message, optionally with OTP in development mode
   * @throws {Error} If email sending fails
   */
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

  /**
   * Registers a new user in the system
   *
   * This method performs the following steps:
   * 1. Validates that OTP is provided
   * 2. Verifies OTP against stored record and checks expiration
   * 3. Checks for existing users with same loginId or email
   * 4. Hashes the password using bcrypt with salt rounds of 10
   * 5. Creates user with ADMIN role (MVP default)
   * 6. Cleans up the used OTP record
   * 7. Returns user data without password
   *
   * @param {RegisterDto} registerDto - Registration data containing:
   *   - loginId: Unique login identifier
   *   - email: User's email address (must be OTP-verified)
   *   - password: Plain text password (will be hashed)
   *   - name: User's display name
   *   - otp: One-time password for email verification
   * @returns {Promise<Omit<User, 'password'>>} Created user object without password
   * @throws {UnauthorizedException} If OTP is missing, invalid, or expired
   * @throws {ConflictException} If loginId or email already exists
   */
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

  /**
   * Authenticates a user and generates a JWT access token
   *
   * This method:
   * 1. Looks up user by loginId
   * 2. Validates password using bcrypt comparison
   * 3. Generates JWT with user id, email, and role in payload
   * 4. Returns access token and user information
   *
   * Security note: Uses generic error message for both invalid loginId
   * and invalid password to prevent user enumeration attacks.
   *
   * @param {LoginDto} loginDto - Login credentials containing:
   *   - loginId: User's unique login identifier
   *   - password: User's plain text password
   * @returns {Promise<{access_token: string, user: object}>}
   *          JWT token (store as 'accessToken' in localStorage) and user data
   * @throws {UnauthorizedException} If loginId doesn't exist or password is incorrect
   *
   * @example Frontend usage:
   * const { access_token, user } = await login(credentials);
   * localStorage.setItem('accessToken', access_token); // Use 'accessToken' key
   */
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

  /**
   * Retrieves the profile of a specific user by ID
   *
   * Returns a sanitized user object excluding sensitive data like password.
   * Used for the /auth/profile endpoint after JWT validation.
   *
   * @param {string} userId - The UUID of the user to retrieve
   * @returns {Promise<object>} User profile with fields:
   *   - id: User's UUID
   *   - loginId: Unique login identifier
   *   - email: Email address
   *   - name: Display name
   *   - role: User role (ADMIN or PORTAL_USER)
   *   - createdAt: Account creation timestamp
   *   - updatedAt: Last update timestamp
   * @throws {UnauthorizedException} If user with given ID doesn't exist
   */
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
