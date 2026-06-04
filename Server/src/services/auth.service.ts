import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils';
import { IAuthService } from './interface/IAuthService';
import { IUserRepository } from '../repositories/interface/IUser.repository';
import { IDoctorRepository } from '../repositories/interface/IDoctor.repository';
import {
  comparePassword,
  hashPassword,
  validatePassword,
  validatePasswordsMatch,
} from '../utils/password.utils';
import {
  AuthResponseDTO,
  BaseUserResponseDTO,
  ChangePasswordDTO,
  ForgotPasswordDTO,
  ForgotPasswordVerifyOtpDTO,
  Gender,
  LoginDTO,
  RegisterDTO,
  ResendOtpDTO,
  ResetPasswordDTO,
  VerifyOtpDTO,
} from '../dtos/common.dto';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../errors/AppError';
import { MESSAGES, GENDER, CONFIG, ROLES } from '../constants/constants';
import { IOtpService } from './interface/IOtpService';
import { ILoggerService } from './interface/ILogger.service';
import { UserMapper } from '../mappers/user.mapper';
import { IUserDocument } from '../types/user.type';
import { VerificationStatus } from '../dtos/doctor.dto/doctor.dto';

export class AuthService implements IAuthService {
  constructor(
    private _userRepository: IUserRepository,
    private _otpService: IOtpService,
    private _logger: ILoggerService,
    private _doctorRepository: IDoctorRepository,
  ) {}

  async register(data: RegisterDTO): Promise<{ email: string }> {
    validatePasswordsMatch(data.password, data.confirmPassword);
    validatePassword(data.password);

    await this._checkUserDoesNotExist(data.email, data.phone);

    const passwordHash = await hashPassword(data.password);

    await this._otpService.createAndSendOtp(
      data.email,
      data.name,
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role,
      },
      CONFIG.OTP_EXPIRY_TIME,
    );

    return { email: data.email };
  }

  async verifyOtp(
    data: VerifyOtpDTO & { role: (typeof ROLES)[keyof typeof ROLES] },
  ): Promise<AuthResponseDTO<BaseUserResponseDTO>> {
    const otpRecord = await this._otpService.verifyOtp(data.email, data.otp);

    const user = await this._userRepository.create({
      name: otpRecord.userData.name,
      email: otpRecord.userData.email,
      phone: otpRecord.userData.phone,
      passwordHash: otpRecord.userData.passwordHash,
      role: otpRecord.userData.role as (typeof ROLES)[keyof typeof ROLES],
      isActive: true,
    });

    let doctorId: string | undefined;
    let verificationStatus: string | undefined;

    if (String(user.role).toLocaleLowerCase() === ROLES.DOCTOR) {
      const doctor = await this._ensureDoctorProfile(user);
      doctorId = doctor?._id.toString();
      verificationStatus =
        doctor?.verificationStatus || VerificationStatus.Pending;
    }

    const token = generateToken(user, doctorId, verificationStatus);
    const refreshToken = generateRefreshToken(
      user,
      doctorId,
      verificationStatus,
    );
    await this._otpService.deleteOtp(data.email);

    return {
      user: { ...UserMapper.toDTO(user), verificationStatus } as any,
      token,
      refreshToken,
    };
  }

  async resendOtp(data: ResendOtpDTO): Promise<void> {
    const existingUser = await this._userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError(MESSAGES.EMAIL_ALREADY_REGISTERED);
    }
    await this._otpService.resendOtp(
      data.email,
      CONFIG.OTP_EXPIRY_TIME,
      CONFIG.OTP_RESEND_DELAY_SECONDS,
    );
  }

  async login(data: LoginDTO): Promise<AuthResponseDTO<BaseUserResponseDTO>> {
    const user = await this._validateLogin(
      data.email,
      data.password,
      data.role,
    );
    let doctorId: string | undefined;
    let verificationStatus: string | undefined;

    if (String(user.role).toLocaleLowerCase() === ROLES.DOCTOR) {
      const doctor = await this._ensureDoctorProfile(user);
      doctorId = doctor?._id.toString();
      verificationStatus =
        doctor?.verificationStatus || VerificationStatus.Pending;
    }

    const token = generateToken(user, doctorId, verificationStatus);
    const refreshToken = generateRefreshToken(
      user,
      doctorId,
      verificationStatus,
    );

    return {
      user: { ...UserMapper.toDTO(user), verificationStatus } as any,
      token,
      refreshToken,
    };
  }

  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    validatePasswordsMatch(data.newPassword, data.confirmNewPassword);
    validatePassword(data.newPassword);

    await this._otpService.verifyResetToken(data.email, data.resetToken);
    const passwordHash = await hashPassword(data.newPassword);
    const user = await this._userRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundError(MESSAGES.NOT_FOUND);
    }

    await this._userRepository.updateById(user._id, { passwordHash });
    await this._otpService.deleteOtp(data.email);
  }

  async forgotPasswordVerifyOtp(
    data: ForgotPasswordVerifyOtpDTO,
  ): Promise<{ resetToken: string }> {
    const resetToken = await this._otpService.verifyAndCreateResetToken(
      data.email,
      data.otp,
    );
    return { resetToken };
  }

  async getDoctorStatus(userId: string): Promise<string> {
    const doctor = await this._doctorRepository.findByUserId(userId);
    return doctor?.verificationStatus || VerificationStatus.Pending;
  }

  async getDoctorID(userId: string): Promise<string | undefined> {
    const doctor = await this._doctorRepository.findByUserId(userId);
    return doctor?._id.toString();
  }

  async changePassword(data: ChangePasswordDTO): Promise<void> {
    const { userId, oldPassword, newPassword, confirmNewPassword } = data;

    validatePasswordsMatch(newPassword, confirmNewPassword);
    validatePassword(newPassword);

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(MESSAGES.USER_NOT_FOUND);
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(MESSAGES.GOOGLE_SIGNIN_REQUIRED);
    }

    const isMatch = await comparePassword(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Incorrect old password');
    }

    if (oldPassword === newPassword) {
      throw new UnauthorizedError(
        'New password cannot be the same as old password',
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await this._userRepository.updateById(userId, { passwordHash });
  }

  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    const normalizedEmail = data.email.toLowerCase().trim();

    this._logger.info(
      `[ForgotPassword] Request for: ${normalizedEmail}, role: ${data.role}`,
    );

    const user =
      await this._userRepository.findByEmailIncludingInactive(normalizedEmail);

    if (!user) {
      this._logger.warn(
        `[ForgotPassword] User not found (including inactive): ${normalizedEmail}`,
      );
      throw new NotFoundError(MESSAGES.NO_ACCOUNT_FOUND);
    }

    this._logger.info(
      `[ForgotPassword] Found user: ${user.email}, role: ${user.role}, active: ${user.isActive}`,
    );

    if (!user.isActive) {
      this._logger.warn(`[ForgotPassword] User is not active`);
      throw new ForbiddenError(MESSAGES.USER_NOT_ACTIVE);
    }

    if (data.role && user.role !== data.role) {
      this._logger.warn(
        `[ForgotPassword] Role mismatch. Expected: ${data.role}, Actual: ${user.role}`,
      );

      if (process.env.NODE_ENV !== 'production') {
        throw new NotFoundError(
          `Account found but it is a ${user.role} account, not ${data.role}`,
        );
      }
      throw new NotFoundError(MESSAGES.NO_ACCOUNT_FOUND);
    }

    await this._otpService.createPasswordResetOtp(data.email, user.name, {
      name: user.name,
      email: user.email,
      phone: (user.phone as string) || '',
      passwordHash: user.passwordHash || '',
      role: user.role,
    });
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await this._userRepository.findByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedError(MESSAGES.NOT_FOUND);
      }

      if (!user.isActive) {
        throw new ForbiddenError(MESSAGES.USER_BLOCKED);
      }

      let doctorId: string | undefined;
      let verificationStatus: string | undefined;

      if (user.role === ROLES.DOCTOR) {
        const doctor = await this._doctorRepository.findByUserId(
          user._id.toString(),
        );
        doctorId = doctor?._id.toString();
        verificationStatus = doctor?.verificationStatus;
      }

      const accessToken = generateToken(user, doctorId, verificationStatus);
      return { accessToken };
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      throw new UnauthorizedError(MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async validateGoogleUser(profile: any): Promise<IUserDocument> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;

    let user = await this._userRepository.findByGoogleId(id);

    if (!user) {
      user = await this._userRepository.findByEmailIncludingInactive(email);

      if (user) {
        // Link Google ID to existing user
        await this._userRepository.updateById(user._id, { googleId: id });
      } else {
        // Create new user
        user = await this._userRepository.create({
          name: displayName,
          email: email,
          googleId: id,
          role: ROLES.PATIENT as 'patient' | 'doctor' | 'admin',
          isActive: true,
          profileImage: photos?.[0]?.value || null,
        });
      }
    }

    if (!user.isActive) {
      throw new ForbiddenError(MESSAGES.USER_BLOCKED);
    }

    return user;
  }

  private async _checkUserDoesNotExist(
    email: string,
    phone?: string,
  ): Promise<void> {
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError(MESSAGES.USER_EXIST_EMAIL);
    }

    if (phone) {
      const existingPhone = await this._userRepository.findByPhone(phone);
      if (existingPhone) {
        throw new ConflictError(MESSAGES.USER_EXIST_PHONE);
      }
    }
  }

  private _normalizeGender(gender?: string | Gender): Gender | null {
    if (!gender) return null;
    const normalized = String(gender).toLowerCase().trim();
    if (normalized === GENDER.MALE) return GENDER.MALE as Gender;
    if (normalized === GENDER.FEMALE) return GENDER.FEMALE as Gender;
    if (normalized === GENDER.OTHER) return GENDER.OTHER as Gender;
    return null;
  }

  private async _validateLogin(
    email: string,
    password: string,
    role: string,
  ): Promise<IUserDocument> {
    const normalizedEmail = email.toLowerCase().trim();
    const user =
      await this._userRepository.findByEmailIncludingInactive(normalizedEmail);

    this._logger.info(
      `[ValidateLogin] Attempting login for ${normalizedEmail}`,
      {
        attemptedRole: role,
        userFound: !!user,
        userRole: user?.role,
        userActive: user?.isActive,
      },
    );

    if (!user || user.role !== role) {
      this._logger.warn(
        `[ValidateLogin] Login failed: ${!user ? 'User not found' : 'Role mismatch'}`,
      );
      throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ForbiddenError(MESSAGES.USER_BLOCKED);
    }

    if (!user.passwordHash) {
      throw new UnauthorizedError(MESSAGES.GOOGLE_SIGNIN_REQUIRED);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS);
    }

    return user;
  }

  private async _ensureDoctorProfile(user: IUserDocument) {
    let existingDoctor = await this._doctorRepository.findByUserId(
      user._id.toString(),
    );
    if (!existingDoctor) {
      existingDoctor = await this._doctorRepository.create({
        userId: user._id,
        licenseNumber: null,
        qualifications: [],
        specialty: null,
        experienceYears: null,
        VideoFees: null,
        ChatFees: null,
        languages: [],
        verificationDocuments: [],
        verificationStatus: VerificationStatus.Pending,
        rejectionReason: null,
        ratingAvg: 0,
        ratingCount: 0,
        isActive: true,
      });
    }
    return existingDoctor;
  }
}
