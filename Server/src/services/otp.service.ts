import { IOTPRepository } from "../repositories/interface/IOtp.repository";
import { IEmailService } from "./interface/IEmailService";
import { generateOTP, getOtpExpiry, isOtpExpirted } from '../utils/otp.util';
import type { IOtpService } from "./interface/IOtpService";
import type { OTPData, OTPUserData } from '../types/otp.type';
import { ILoggerService } from "./interface/ILogger.service";
import { AppError, ValidationError } from "../errors/AppError";
import { HttpStatus, MESSAGES } from "../constants/constants";

export class OTPService implements IOtpService {
    constructor (
        private _otpRepository: IOTPRepository,
        private _emailService: IEmailService,
        private _logger: ILoggerService
    ) { }

    async createAndSendOtp(email: string, name: string, userData: OTPUserData, expiryMinutes: number = 1): Promise<string> {
        const otp = generateOTP(6);
        console.log(`OTP for ${email} is: ${otp}\n`);
        this._logger.debug("OTP generated", { email });
        const otpExpiresAt = getOtpExpiry(expiryMinutes);
        const expiresAt = getOtpExpiry(30);

        await this._otpRepository.create({
            email,
            otp,
            userData,
            otpExpiresAt,
            expiresAt,
        });

        await this._emailService.sendOtpEmail(email, name, otp);
        return otp;
    }

    async verifyOtp(email: string, otp: string): Promise<OTPData> {
        const otpRecord = await this._otpRepository.findByEmailAndOtp(email, otp);

        if(!otpRecord) {
            throw new AppError(MESSAGES.OTP_INVALID_OR_EXPIRED, HttpStatus.GONE);
        }

        if(isOtpExpirted(otpRecord.otpExpiresAt)) {
            await this._otpRepository.updateOtp(email, {otp: null, otpExpiresAt: new Date() });
            throw new ValidationError(MESSAGES.OTP_INVALID_OR_EXPIRED);
        }

        return otpRecord;

    }

    async resendOtp(email: string, expiryMinutes: number = 1, maxSessionAge: number=30): Promise<void> {
        const otpRecord = await this._otpRepository.findOneByField("email", email);

        if(!otpRecord) {
            throw new AppError(MESSAGES.OTP_INVALID_OR_EXPIRED, HttpStatus.GONE);
        }

        const sessionAge = Date.now() - new Date(otpRecord.createdAt!).getTime();
        const maxSessionAgeMs = maxSessionAge * 60 * 1000;

        if(sessionAge > maxSessionAgeMs) {
            await this._otpRepository.updateOtp(email, {otp: null, otpExpiresAt: new Date() });
            throw new AppError(MESSAGES.OTP_SESSION_EXPIRED, HttpStatus.GONE)
        }

        const newOtp = generateOTP(6);
        console.log(`[DEV ONLY] Resend OTP for ${email} is: ${newOtp}\n`);
        const otpExpiresAt = getOtpExpiry(expiryMinutes);

        await this._otpRepository.updateOtp(email, { otp: newOtp, otpExpiresAt });
        await this._emailService.sendOtpEmail(email, otpRecord.userData?.name || "", newOtp);
    }

    async createPasswordResetOtp(email: string, name: string, userData: OTPUserData): Promise<void> {
        const otp = generateOTP(6);
        console.log(`[DEV ONLY] Password Reset OTP for ${email} is: ${otp}\n`);
        const otpExpiresAt = getOtpExpiry(10);
        const expiresAt = getOtpExpiry(30);

        const existingOtp = await this._otpRepository.findOneByField("email", email);

        if (existingOtp) {
            await this._otpRepository.updateOtp(email, { otp, otpExpiresAt });
        } else {
            await this._otpRepository.create({ email, otp, userData, otpExpiresAt, expiresAt });
        }

        await this._emailService.sendPasswordResetEmail(email, name, otp)
    }

    async verifyResetToken(email: string, resetToken: string): Promise<OTPData> {
        const otpRecord = await this._otpRepository.findByEmailAndOtp(email, resetToken);

        if(!otpRecord) {
            throw new ValidationError(MESSAGES.RESET_TOKEN_INVALID);
        }

        return otpRecord;
    }

    async verifyAndCreateResetToken(email: string, otp: string): Promise<string> {
        await this.verifyOtp(email, otp);

        const resetToken = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const resetTokenExpiry = getOtpExpiry(15);

        await this._otpRepository.updateOtp(email, { otp: resetToken, otpExpiresAt: resetTokenExpiry});

        return resetToken;
    }
    
    async deleteOtp(email: string): Promise<void> {
        await this._otpRepository.deleteByEmaill(email)
    }
}