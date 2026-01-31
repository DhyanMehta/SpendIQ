import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/database/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { MailService } from "../mail/mail.service";
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    sendOtp(email: string): Promise<{
        message: string;
        otp: string;
        note: string;
    } | {
        message: string;
        otp?: undefined;
        note?: undefined;
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        loginId: string;
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            loginId: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        loginId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetMyPassword(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateRandomPassword;
}
