import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    sendOtp(body: SendOtpDto): Promise<{
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
    getProfile(req: any): Promise<{
        id: string;
        loginId: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetPassword(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
