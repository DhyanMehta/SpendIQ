"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/database/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    async sendOtp(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.otpVerification.deleteMany({ where: { email } });
        await this.prisma.otpVerification.create({
            data: {
                email,
                otp,
                expiresAt,
            },
        });
        this.mailService.sendOtpEmail(email, otp).catch((error) => {
            console.error("[AuthService] Failed to send OTP email:", error);
        });
        const isDevelopment = process.env.NODE_ENV === "development";
        if (isDevelopment) {
            return {
                message: "OTP sent successfully",
                otp,
                note: "⚠️ OTP included in response because NODE_ENV=development. Remove in production!",
            };
        }
        return { message: "OTP sent successfully" };
    }
    async register(registerDto) {
        console.log("[AuthService] Registering user:", registerDto.loginId);
        if (!registerDto.otp) {
            throw new common_1.UnauthorizedException("OTP is required");
        }
        const otpRecord = await this.prisma.otpVerification.findFirst({
            where: { email: registerDto.email, otp: registerDto.otp },
        });
        if (!otpRecord) {
            throw new common_1.UnauthorizedException("Wrong OTP. Please check the code and try again.");
        }
        if (otpRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException("OTP has expired. Please request a new code.");
        }
        const existingLoginId = await this.prisma.user.findUnique({
            where: { loginId: registerDto.loginId },
        });
        if (existingLoginId) {
            throw new common_1.ConflictException("Login ID already in use");
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException("Email already in use");
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                loginId: registerDto.loginId,
                email: registerDto.email,
                password: hashedPassword,
                name: registerDto.name,
                role: client_1.Role.ADMIN,
            },
        });
        await this.prisma.otpVerification.delete({
            where: { id: otpRecord.id },
        });
        const { password } = user, result = __rest(user, ["password"]);
        return result;
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { loginId: loginDto.loginId },
        });
        const invalidCredsError = new common_1.UnauthorizedException("Invalid Login Id or Password");
        if (!user) {
            throw invalidCredsError;
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
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
    async getProfile(userId) {
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
            throw new common_1.UnauthorizedException("User not found");
        }
        return user;
    }
    async resetMyPassword(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("User not found");
        }
        const newPassword = this.generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        await this.mailService.sendPasswordResetEmail(user.email, user.name || "User", user.loginId, newPassword);
        return {
            success: true,
            message: "A new password has been sent to your email address",
        };
    }
    generateRandomPassword() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map