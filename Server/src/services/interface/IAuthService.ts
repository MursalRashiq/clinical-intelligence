import type {
    RegisterDTO,
    VerifyOtpDTO,
    ResendOtpDTO,
    LoginDTO,
    AuthResponseDTO,
    BaseUserResponseDTO,
    ForgotPasswordDTO,
    ForgotPasswordVerifyOtpDTO,
    ResetPasswordDTO,
    ChangePasswordDTO,
} from "../../dtos/common.dto";


export interface IAuthService {
    register(registerDTO: RegisterDTO): Promise<{ email: string}>;

     verifyOtp(verifyOtpDTO: VerifyOtpDTO): Promise<AuthResponseDTO<BaseUserResponseDTO>>;

     resendOtp(resendOtpDTO: ResendOtpDTO): Promise<void>;

     login(data: LoginDTO): Promise<AuthResponseDTO<BaseUserResponseDTO>>;

     forgotPassword(data: ForgotPasswordDTO): Promise<void>;

     forgotPasswordVerifyOtp(data: ForgotPasswordVerifyOtpDTO): Promise<{resetToken: string}>;

     resetPassword(data: ResetPasswordDTO): Promise<void>;

     changePassword(data: ChangePasswordDTO): Promise<void>;

     getDoctorStatus(userId: string): Promise<string>;

     getDoctorID(userId: string): Promise<string | undefined>;

     refreshToken(token: string): Promise<{accessToken: string}>;
     validateGoogleUser(profile: any): Promise<any>;
}