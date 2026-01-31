import { ConfigService } from "@nestjs/config";
export declare class MailService {
    private configService;
    private transporter;
    private isMailEnabled;
    constructor(configService: ConfigService);
    sendWelcomeEmail(to: string, name: string): Promise<{
        success: boolean;
        skipped: boolean;
        messageId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        messageId: any;
        skipped?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        messageId?: undefined;
    }>;
    sendOtpEmail(email: string, otp: string): Promise<void>;
    sendPortalInvitation(email: string, name: string, tempPassword: string): Promise<void>;
    sendUserCreatedEmail(email: string, name: string, loginId: string, tempPassword: string, role: string): Promise<{
        success: boolean;
        skipped: boolean;
        messageId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        messageId: any;
        skipped?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        messageId?: undefined;
    }>;
    sendPasswordResetEmail(email: string, name: string, loginId: string, newPassword: string): Promise<{
        success: boolean;
        skipped: boolean;
        messageId?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        messageId: any;
        skipped?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        skipped?: undefined;
        messageId?: undefined;
    }>;
}
