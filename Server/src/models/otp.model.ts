import { Schema, model, Document } from 'mongoose';
import { OTPUserData } from '../types/otp.type';

export interface IOTPDocument extends Document {
  email: string;
  otp: string;
  userData: OTPUserData;
  otpExpiresAt: Date;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTPDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userData: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: false },
      passwordHash: { type: String, required: true },
      role: { type: String, required: true, default: 'patient' },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: null,
      },
      dob: { type: Date, default: null },
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTPModel = model<IOTPDocument>('OTP', OTPSchema);

export default OTPModel;
