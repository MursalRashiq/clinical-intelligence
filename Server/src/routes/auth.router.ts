import { Router } from "express";
import { env } from '../config/env';
import passport from 'passport';
import { AuthController } from "../controllers/auth.controller";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/implementation/auth.service";
import { OTPService } from "../services/implementation/otp.service";
import { OTPRepository } from "../repositories/otp.repository";
import { EmailService } from "../services/implementation/email.service";
import { AuthValidator } from "../validators/auth.validator";
import { AUTH_ROUTES } from '../constants/routes.constants';
import { validate } from "../middlewares/validation.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { LoggerService } from "../services/implementation/logger.service";

const userRepository = new UserRepository();
const otpRepository = new OTPRepository();

const emailServiceLogger = new LoggerService("EmailService");
const emailService = new EmailService(emailServiceLogger);

const otpServiceLogger = new LoggerService("OTPService");
const otpService = new OTPService(otpRepository, emailService, otpServiceLogger);
const authServiceLogger = new LoggerService("AuthService");
const authControllerLogger = new LoggerService("AuthController");

const authService = new AuthService(userRepository, otpService, authServiceLogger);
const authController = new AuthController(authService, authControllerLogger)
const router = Router();


router.post(AUTH_ROUTES.REGISTER, validate(AuthValidator.validateRegisterInput), authController.register);
router.post(AUTH_ROUTES.VERIFY_OTP, validate(AuthValidator.validateVerifyOtpInput), authController.verifyOtp);
router.post(AUTH_ROUTES.RESEND_OTP, validate(AuthValidator.validateResendOtpInput), authController.resendOtp);
router.post(AUTH_ROUTES.LOGIN, validate(AuthValidator.validateLoginInput), authController.login)
router.post(AUTH_ROUTES.LOGOUT, authController.logout)


export default router;