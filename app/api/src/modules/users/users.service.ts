import {
  Injectable,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateUserDto) {
    // 1. Check for duplicates (Email or Login ID)
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { loginId: dto.loginId }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException("Email already exists");
      }
      if (existingUser.loginId === dto.loginId) {
        throw new ConflictException("Login ID already exists");
      }
    }

    // Store the original password before hashing (for email)
    const plainPassword = dto.password;

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create User
    try {
      // If creating a PORTAL_USER and we have an associated contact?
      // For now, this is a direct admin creation, so we just create the user.
      // Linkage logic usually happens when creating a contact -> portal user.
      // Here we are creating a generic internal user or standalone portal user.

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          loginId: dto.loginId,
          email: dto.email,
          password: hashedPassword,
          role: dto.role,
        },
        select: {
          id: true,
          name: true,
          loginId: true,
          email: true,
          role: true,
          createdAt: true,
          // NEVER select password
        },
      });

      // 4. Send welcome email with credentials
      await this.mailService.sendUserCreatedEmail(
        user.email,
        user.name || "User",
        user.loginId,
        plainPassword,
        user.role,
      );

      return user;
    } catch (error) {
      throw new BadRequestException("Failed to create user");
    }
  }
}
