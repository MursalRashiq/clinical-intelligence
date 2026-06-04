export interface IOtp {
  email: string;
  otp: string | null;
  userData: OTPUserData;
  expiresAt: Date;
  createdAt?: Date;
}

export interface OTPUserData {
  name: string;
  email: string;
  phone?: string | null | undefined;
  passwordHash: string;
  role: string;
  gender?: 'male' | 'female' | 'other' | null | undefined;
  dob?: Date | null | undefined;
}

export interface OTPData {
  email: string;
  otp: string | null;
  userData: OTPUserData;
  expiresAt: Date;
  createdAt?: Date;
}
