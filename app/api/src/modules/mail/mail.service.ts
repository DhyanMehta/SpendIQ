import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: true, // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
        ciphers: "SSLv3", // Support older SSL versions if needed
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("[MailService] ❌ SMTP connection failed:", error);
      } else {
        console.log("[MailService] ✅ SMTP server is ready to send emails");
      }
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to,
        subject: "Welcome to SpendIQ! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #f9f9f9;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .content {
                  background: white;
                  padding: 30px;
                  border-radius: 0 0 10px 10px;
                }
                .button {
                  display: inline-block;
                  padding: 12px 30px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to SpendIQ!</h1>
                </div>
                <div class="content">
                  <h2>Hello ${name}! 👋</h2>
                  <p>Thank you for creating an account with SpendIQ - your intelligent budget and accounting system.</p>
                  
                  <p>We're excited to have you on board! Here's what you can do with SpendIQ:</p>
                  <ul>
                    <li>📊 Create and manage budgets</li>
                    <li>💰 Track expenses and income</li>
                    <li>📈 Generate financial reports</li>
                    <li>🔍 Analyze spending patterns</li>
                    <li>👥 Collaborate with your team</li>
                  </ul>
                  
                  <p>Get started by logging into your account and exploring the dashboard.</p>
                  
                  <center>
                    <a href="http://localhost:3000/login" class="button">Go to Dashboard</a>
                  </center>
                  
                  <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
                  
                  <p>Best regards,<br>The SpendIQ Team</p>
                </div>
                <div class="footer">
                  <p>This email was sent to ${to} because you created an account on SpendIQ.</p>
                  <p>&copy; 2026 SpendIQ. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log("[MailService] Welcome email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error("[MailService] Error sending welcome email:", error);
      // Don't throw error to prevent registration from failing if email fails
      return { success: false, error: error.message };
    }
  }
  async sendOtpEmail(email: string, otp: string) {
    // Always log OTP to console for development/testing
    console.log(`[MailService] 🔐 OTP for ${email}: ${otp}`);

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to: email,
        subject: "Your Verification Code - SpendIQ",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to SpendIQ</h2>
            <p>Please use the following verification code to complete your registration:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0070f3;">${otp}</span>
            </div>
            <p>This code is valid for 10 minutes.</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't request this code, you can ignore this email.</p>
          </div>
        `,
      });

      console.log(`[MailService] ✅ OTP email successfully sent to ${email}`);
    } catch (error) {
      console.error(
        `[MailService] ⚠️ Failed to send OTP email to ${email}. OTP is logged above for testing.`,
        error,
      );
      // Don't throw - allow registration to proceed even if email fails
      // OTP is already logged to console for development/testing
    }
  }

  async sendPortalInvitation(
    email: string,
    name: string,
    tempPassword: string,
  ) {
    console.log(
      `[MailService] 🔑 Portal Invitation for ${email} - Password: ${tempPassword}`,
    );

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to: email,
        subject: "Welcome to SpendIQ Portal! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Portal Access Granted</h2>
            <p>Hello ${name},</p>
            <p>You have been granted access to the SpendIQ customer portal. You can now log in to view your account information, invoices, and more.</p>
            
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${tempPassword}</code></p>
            </div>
            
            <p style="color: #d9534f;"><strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.</p>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>The SpendIQ Team</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">This email was sent to ${email} because you were added as a contact in SpendIQ.</p>
          </div>
        `,
      });

      console.log(`[MailService] ✅ Portal invitation sent to ${email}`);
    } catch (error) {
      console.error(
        `[MailService] ⚠️ Failed to send portal invitation to ${email}. Credentials logged above.`,
        error,
      );
      // Don't throw - portal user is already created
    }
  }
}
