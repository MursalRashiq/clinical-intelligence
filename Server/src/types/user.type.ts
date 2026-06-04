import { Document, Types } from 'mongoose';

export interface IUser {
  customId: string;
  name: string;
  email: string;
  phone?: string | null | undefined;
  passwordHash?: string;
  role: 'patient' | 'doctor' | 'admin';
  gender?: 'male' | 'female' | 'other' | null;
  dob?: Date | null;
  profileImage?: string | null;
  googleId?: string | null | undefined;
  isActive: boolean;
  bloodGroup?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  favorite?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserDocument = IUser & Document<Types.ObjectId>;
