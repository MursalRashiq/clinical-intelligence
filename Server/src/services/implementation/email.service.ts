import nodemailer, { Transporter } from "nodemailer";
import { env } from '../../config/env';
import type { IEmailService  } from "../interface/IEmailService";
import type { EmailConfig, SmtpConfig } from "../../types/email.type";
import { CONFIG, HttpStatus, MESSAGES } from '../../constants/constants';
import { AppError } from '../../errors/AppError';
import { ILoggerService } from "../interface/ILogger.service";

export class EmailService implements IEmailService {
    private _trasporter: Transporter;
    private readonly _fromAddress: string;

    constructor(private _logger: ILoggerService, config?: SmtpConfig) {
        const emailConfig = config || this._getDefaultConfig();

        this._trasporter = nodemailer.createTransport(emailConfig);
        this._fromAddress = `"Clinical Intelligence" <${env.SMTP_USER}`;
        
        this._verifyConnection();
    }

    private _getDefaultConfig(): SmtpConfig {
        const emailUser = env.SMTP_USER;
        const emailPass = env.SMTP_PASS;
        const emailHost = env.SMTP_HOST;
        const emailPort = Number(env.SMTP_PORT) || 587;

        if (!emailUser || !emailPass ) {
            throw new AppError(MESSAGES.EMAIL_CREDENTIALS_NOT_CONFIGURED, HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return {
            host: emailHost,
            port: emailPort,
            secure: emailPort === 465,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
            tls: {
                rejectUnauthorized: false,
            },
        };
    };

    private async _verifyConnection(): Promise<void> {
        try {
            await this._trasporter.verify();
            this._logger.info("Email server is ready");
        } catch ( error: unknown ){
            this._logger.error("Email server connection failed", error);
        }
    }

    async sendOtpEmail(email: string, name: string, otp: string): Promise<void> {
        try {
            const html = this._getOTPTemplate(otp, name);
            
            const mailOptions = {
                from: this._fromAddress,
                to: email,
                subject: "Your OTP for Registration - Clinical intelligence",
                html,
            };

            const info = await this._trasporter.sendMail(mailOptions);
            this._logger.info("OTP email sent successfully", { messageId: info.messageId });
        } catch (error: unknown ){
            this._logger.error("OTP email sending failed", error);
            const errorMessage = error instanceof Error ? error.message : String(error);

            throw new AppError(
                MESSAGES.EMAIL_SEND_FAILED.replace("{error}", errorMessage),
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async sendPasswordResetEmail(email: string, name: string, otp: string): Promise<void> {
      try {
        const html = this._getPasswordResetTemplate(otp, name);

        const mailOptions = {
          from: this._fromAddress,
          to: email,
          subject: "Password Reset OTP - Clinical-intelligence",
          html,
        };

        const info = await this._trasporter.sendMail(mailOptions);
        this._logger.info("Password reset email sent successfully", { messageId: info.messageId });
      } catch (error: unknown) {
          this._logger.error("Password reset email sending failed", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new AppError(
            MESSAGES.EMAIL_SEND_FAILED.replace("{error}", errorMessage),
            HttpStatus.INTERNAL_SERVER_ERROR
          );
      }
    }

    private _getOTPTemplate(otp: string, name: string): string {
    const expiryText = `${CONFIG.OTP_EXPIRY_TIME} minute${CONFIG.OTP_EXPIRY_TIME === 1 ? "" : "s"}`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="background-color: #14b8a6; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TakeCare</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #14b8a6; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for registering with TakeCare. To complete your registration, please use the following OTP:
          </p>
          
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); margin: 30px 0; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            ⏱️ This OTP will expire in <strong>${expiryText}</strong>.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            🔒 For security reasons, please do not share this OTP with anyone.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            ❓ If you didn't request this OTP, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2025 TakeCare. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }


   private _getPasswordResetTemplate(otp: string, name: string): string {
    const expiryText = `${CONFIG.OTP_EXPIRY_TIME} minute${CONFIG.OTP_EXPIRY_TIME === 1 ? "" : "s"}`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
        <div style="background-color: #14b8a6; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TakeCare</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #14b8a6; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Hello <strong>${name}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Please use the following OTP to continue:
          </p>
          
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); margin: 30px 0; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: white; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            ⏱️ This OTP will expire in <strong>${expiryText}</strong>.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
            🔒 For security reasons, please do not share this OTP with anyone.
          </p>
          
          <p style="color: #ef4444; font-size: 14px; margin-top: 10px; font-weight: bold;">
            ⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2025 TakeCare. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}

