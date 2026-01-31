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
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD"),
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    try {
      const mailOptions = {
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
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("[MailService] Welcome email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error("[MailService] Error sending welcome email:", error);
      // Don't throw error to prevent registration from failing if email fails
      return { success: false, error: error.message };
    }
  }
}
