import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private isMailEnabled: boolean = false;

  constructor(private configService: ConfigService) {
    const mailHost = this.configService.get<string>("MAIL_HOST");
    const mailUser = this.configService.get<string>("MAIL_USER");
    let mailPassword = this.configService.get<string>("MAIL_PASSWORD");

    // Parse port as number explicitly to avoid string comparison issues
    const mailPort =
      Number(this.configService.get<number | string>("MAIL_PORT")) || 587;

    // Remove spaces from app password if present (common copy-paste issue)
    if (mailPassword) {
      mailPassword = mailPassword.replace(/\s+/g, "");
    }

    // Only create transporter if mail credentials are properly configured
    if (mailHost && mailUser && mailPassword) {
      this.transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465, // true for 465, false for other ports
        auth: {
          user: mailUser,
          pass: mailPassword,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      // Verify connection on startup (non-blocking)
      this.transporter.verify((error) => {
        if (error) {
          console.error("[MailService] ⚠️ SMTP Connection Failed:", error);
          this.isMailEnabled = false;
        } else {
          console.log(
            `[MailService] ✅ SMTP connected to ${mailHost}:${mailPort} as ${mailUser}`,
          );
          this.isMailEnabled = true;
        }
      });
    } else {
      console.log(
        "[MailService] 📧 Mail not configured - OTPs will be logged to console",
      );
      this.isMailEnabled = false;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    // Skip sending email if SMTP is not available
    if (!this.isMailEnabled || !this.transporter) {
      console.log(
        `[MailService] 📧 Welcome email skipped for ${to} (SMTP not available)`,
      );
      return { success: true, skipped: true };
    }

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

    // Skip sending email if SMTP is not available
    if (!this.isMailEnabled || !this.transporter) {
      console.log(
        `[MailService] 📧 Email sending skipped (SMTP not available) - use OTP logged above`,
      );
      return;
    }

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
      // Mark mail as disabled to skip future attempts this session
      this.isMailEnabled = false;
      console.log(
        `[MailService] 📧 Email sending disabled for this session - use OTP logged above`,
      );
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

    // Skip sending email if SMTP is not available
    if (!this.isMailEnabled || !this.transporter) {
      console.log(
        `[MailService] 📧 Portal invitation email skipped (SMTP not available) - credentials logged above`,
      );
      return;
    }

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

  async sendUserCreatedEmail(
    email: string,
    name: string,
    loginId: string,
    tempPassword: string,
    role: string,
  ) {
    console.log(
      `[MailService] 👤 User Created - Email: ${email}, LoginID: ${loginId}, Password: ${tempPassword}`,
    );

    // Skip sending email if SMTP is not available
    if (!this.isMailEnabled || !this.transporter) {
      console.log(
        `[MailService] 📧 User created email skipped (SMTP not available) - credentials logged above`,
      );
      return { success: true, skipped: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to: email,
        subject: "Your SpendIQ Account Has Been Created! 🎉",
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
                .credentials {
                  background-color: #f4f4f4;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #667eea;
                }
                .credentials p {
                  margin: 8px 0;
                }
                .credentials code {
                  background: #fff;
                  padding: 5px 10px;
                  border-radius: 4px;
                  font-size: 14px;
                  font-family: monospace;
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
                .warning {
                  background-color: #fff3cd;
                  border: 1px solid #ffc107;
                  color: #856404;
                  padding: 12px;
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
                  <p>Your account has been created</p>
                </div>
                <div class="content">
                  <h2>Hello ${name || "User"}! 👋</h2>
                  <p>An administrator has created a SpendIQ account for you. You can now log in to access the platform.</p>
                  
                  <div class="credentials">
                    <p><strong>🔗 Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
                    <p><strong>👤 Login ID:</strong> <code>${loginId}</code></p>
                    <p><strong>📧 Email:</strong> <code>${email}</code></p>
                    <p><strong>🔑 Password:</strong> <code>${tempPassword}</code></p>
                    <p><strong>🎭 Role:</strong> <code>${role}</code></p>
                  </div>
                  
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login for security purposes.
                  </div>
                  
                  <center>
                    <a href="http://localhost:3000/login" class="button">Login to SpendIQ</a>
                  </center>
                  
                  <p style="margin-top: 30px;">If you have any questions, please contact your administrator.</p>
                  
                  <p>Best regards,<br>The SpendIQ Team</p>
                </div>
                <div class="footer">
                  <p>This email was sent to ${email} because an account was created for you on SpendIQ.</p>
                  <p>&copy; 2026 SpendIQ. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`[MailService] ✅ User created email sent to ${email}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(
        `[MailService] ⚠️ Failed to send user created email to ${email}. Credentials logged above.`,
        error,
      );
      // Don't throw - user is already created
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    loginId: string,
    newPassword: string,
  ) {
    console.log(
      `[MailService] 🔑 Password Reset - Email: ${email}, LoginID: ${loginId}, New Password: ${newPassword}`,
    );

    // Skip sending email if SMTP is not available
    if (!this.isMailEnabled || !this.transporter) {
      console.log(
        `[MailService] 📧 Password reset email skipped (SMTP not available) - credentials logged above`,
      );
      return { success: true, skipped: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to: email,
        subject: "Your SpendIQ Password Has Been Reset 🔐",
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
                .credentials {
                  background-color: #f4f4f4;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #667eea;
                }
                .credentials p {
                  margin: 8px 0;
                }
                .credentials code {
                  background: #fff;
                  padding: 5px 10px;
                  border-radius: 4px;
                  font-size: 14px;
                  font-family: monospace;
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
                .warning {
                  background-color: #fff3cd;
                  border: 1px solid #ffc107;
                  color: #856404;
                  padding: 12px;
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
                  <h1>Password Reset</h1>
                  <p>Your password has been reset</p>
                </div>
                <div class="content">
                  <h2>Hello ${name}! 👋</h2>
                  <p>Your SpendIQ password has been reset. Here are your new login credentials:</p>
                  
                  <div class="credentials">
                    <p><strong>🔗 Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
                    <p><strong>👤 Login ID:</strong> <code>${loginId}</code></p>
                    <p><strong>📧 Email:</strong> <code>${email}</code></p>
                    <p><strong>🔑 New Password:</strong> <code>${newPassword}</code></p>
                  </div>
                  
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Please change your password after logging in for security purposes.
                  </div>
                  
                  <center>
                    <a href="http://localhost:3000/login" class="button">Login to SpendIQ</a>
                  </center>
                  
                  <p style="margin-top: 30px;">If you did not request this password reset, please contact your administrator immediately.</p>
                  
                  <p>Best regards,<br>The SpendIQ Team</p>
                </div>
                <div class="footer">
                  <p>This email was sent to ${email} because a password reset was requested.</p>
                  <p>&copy; 2026 SpendIQ. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`[MailService] ✅ Password reset email sent to ${email}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error(
        `[MailService] ⚠️ Failed to send password reset email to ${email}. Credentials logged above.`,
        error,
      );
      return { success: false, error: error.message };
    }
  }
}
