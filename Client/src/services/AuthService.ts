import axiosInstance from "../api/axiosInstance";
import {
    USER_API_ROUTES,
    AUTH_ROUTES,
    DOCTOR_API_ROUTES,
    ADMIN_API_ROUTES,
    AUTH_BASE_URL
} from '../utils/constants';
import { handleApiError } from '../utils/errorHandles';

import type {
    LoginRequest,
    AuthUser,
    RegisterRequest,
    OtpRequest
} from '../types/auth.type';

interface JwtPayload {
    userId: string;
    id: string;
    role: 'patient' | 'doctor' | 'admin';
    exp: number;
    email: string;
    name?: string;
    profileImage?: string;
    doctorId?: string;
    isActive: boolean;
}

class AuthService {
    private _getApiRoute(role: "user" | "doctor"){
        return role === "doctor" ? DOCTOR_API_ROUTES: USER_API_ROUTES;
    }

    private decodeToken<T = JwtPayload>(token: string): T | null {
        try { 
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, '/');
            const jsonPayload = decodeURIComponent (
                atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            return JSON.parse(jsonPayload) as T;
        } catch (error) {
            console.error('Failed to decode token', error);
            return null;
        }
    }

    private _isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken<{ exp: number }>(token);
        if(!decoded) return true;
        return decoded.exp * 1000 < Date.now();
    }

    saveToken(token: string): void {
        localStorage.setItem('authToken', token)
    }

    getToken(): string | null {
        return localStorage.getItem('authToken')
    }

    getCurrentUserInfo(): JwtPayload | null {
        const token = this.getToken();
        console.log(token, "token")
        if(!token)return null;
        const decoded = this.decodeToken<JwtPayload>(token);
        if(!decoded)return null;

        return {
            ...decoded,
            id: decoded.id || decoded.userId,
            userId: decoded.userId || decoded.id,
        } as JwtPayload;
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return !!(token && !this._isTokenExpired(token));
    }

    async userRegister(userData: RegisterRequest) {
        try {
            const response = await axiosInstance.post(
                USER_API_ROUTES.REGISTER,
                userData
            );
            return response.data;
        } catch (error: unknown) {
            return handleApiError(error, "Registration failed");
        }
    }

    async userVerifyOtp(otpData: OtpRequest) {
        try {
            const response = await axiosInstance.post(
                USER_API_ROUTES.VERIFY_OTP,
                otpData
            );
            return response.data;
        } catch (error: unknown) {
            return handleApiError(error, "OTP verification failed")
        }
    }

    async userResendOtp(email: string) {
        try {
            const response = await axiosInstance.post(USER_API_ROUTES.RESEND_OTP, {
                email
            });
            return response.data;
        } catch (error: unknown) {
            return handleApiError(error, "Failed to resend OTP")
        }
    }

    async userLogin(credentials: LoginRequest) {
        try {
            const response = await axiosInstance.post (
                USER_API_ROUTES.LOGIN,
                credentials
            );
            if (response.data?.data.token) {
                this.saveToken(response.data.data.token);
            } else if (response.data?.token) {
                this.saveToken(response.data.token)
            }
            return response.data;
        } catch (error: unknown) {
            return handleApiError(error, "Login failed")
        }
    }

    async doctorVerifyOtp(otpData: OtpRequest) {
        try {
            const response = await axiosInstance.post(
                DOCTOR_API_ROUTES.VERIFY_OTP,
                otpData
            );
            return response.data;
        } catch (error: unknown) {
            return handleApiError(error, "OTP verifcation failed");
        }
    }

    async doctorResendOtp(email: string) {
        try {
            const response = await axiosInstance.post(DOCTOR_API_ROUTES.RESEND_OTP, {
                email,
            });
            return response.data;
        } catch (error: unknown) {
            return handleApiError(error, "Failed to resend OTP");
        }
    }

     async doctorLogin(credentials: LoginRequest) {
    try {
      const response = await axiosInstance.post(
        DOCTOR_API_ROUTES.LOGIN,
        credentials
      );
      if (response.data?.data?.token) {
        this.saveToken(response.data.data.token);
      } else if (response.data?.token) {
        this.saveToken(response.data.token);
      }
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Login failed");
    }
  }

  async getDoctorProfile() {
    try {
      const response = await axiosInstance.get(DOCTOR_API_ROUTES.GET_PROFILE);
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Failed to fetch doctor profile");
    }
  }

  async resubmitVerification() {
    try {
      const response = await axiosInstance.post(DOCTOR_API_ROUTES.RESUBMIT_VERIFICATION);
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Failed to resubmit verification");
    }
  }

  async updateDoctorDocuments(formData: FormData) {
    try {
      const response = await axiosInstance.put(DOCTOR_API_ROUTES.UPDATE_DOCUMENTS, formData);
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Failed to update documents");
    }
  }

  async getDocumentUrl(index: number) {
    try {
      const response = await axiosInstance.get(DOCTOR_API_ROUTES.GET_DOCUMENT_URL(index));
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Failed to fetch document URL");
    }
  }

   async adminLogin(credentials: LoginRequest) {
    try {
      const response = await axiosInstance.post(
        ADMIN_API_ROUTES.LOGIN,
        credentials
      );
      if (response.data?.data?.token) {
        this.saveToken(response.data.data.token);
      } else if (response.data?.token) {
        this.saveToken(response.data.token);
      }
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Admin login failed");
    }
  }


  async logout() {
    try {
      await axiosInstance.get(AUTH_ROUTES.LOGOUT);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("authToken");
    }
  }

  getCurrentUser(): AuthUser | null {
    console.warn('getCurrentUser is deprecated. Use getCurrentUserInfo() instead.');
    const userInfo = this.getCurrentUserInfo();
    if (!userInfo) return null;

    return {
      id: userInfo.id,
      _id: userInfo.id,
      email: userInfo.email,
      role: userInfo.role,
      name: userInfo.name || '',
      isActive: userInfo.isActive,
    } as unknown as AuthUser;
  }

  saveUser(_userdata: unknown): void {
    console.warn('saveUser is deprecated.User data should not be stored in localStorage', _userdata)
  }

  async forgotPassword(
    email: string,
    role: "user" | "doctor" = "user"
  ){
    const beRole = role === "user" ? "patient" : role;
    const apiRoutes = this._getApiRoute(role);

    try {
        const response = await axiosInstance.post(apiRoutes.FORGOT_PASSWORD, {
            email,
            role: beRole,
        });
        return response.data;
    } catch (error: unknown) {
        return handleApiError(error, "Failed to send reset link")
    }
  }

  async verifyForgotOtp(
    email: string,
    otp: string,
    role: "user" | "doctor" = "user"
  ) {
    const apiRoutes = this._getApiRoute(role);

    try {
        const response = await axiosInstance.post(apiRoutes.VERIFY_OTP_PASSWORD, {
            email,
            otp
        });
        return response.data
    } catch (error: unknown) {
        return handleApiError(error, "OTP verification failed");
    }
  }

  async resendOtp(email: string, role: 'user' | 'doctor' = 'user') {
    const apiRoutes = this._getApiRoute(role);
    try {
        const response = await axiosInstance.post(apiRoutes.RESEND_OTP, {
            email,
        })
        return response.data;
    } catch (error: unknown) {
        return handleApiError(error, "Failed to resend OTP")
    }
  }

  async resetPassword(
    data: {
        email: string;
        resetToken: string;
        newPassword: string;
        confirmNewPassword: string;
    },
    role: "user" | "doctor" = "user"
  ) {
    const apiRoutes = this._getApiRoute(role);
    try {
        const response = await axiosInstance.post(apiRoutes.RESET_PASSWORD, data);
        return response.data;
    } catch (error: unknown) {
        return handleApiError(error, "Failed to reset password")
    }
  }

  async changePassword(
    data: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
    role: "user" | "doctor" = "user"
  ) {
    const apiRoutes = this._getApiRoute(role);
    try {
      const response = await axiosInstance.post(apiRoutes.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error: unknown) {
      return handleApiError(error, "Failed to change password");
    }
  }

  userGoogleLogin(): void {
    window.location.href = `${AUTH_BASE_URL}${AUTH_ROUTES.USER_GOOGLE_LOGIN}`
  }

}

export default new AuthService();