import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPendingUser extends Document {
  LName: string | null;
  FName: string | null;
  DateOfBirth: string | null;
  PhoneNo: string | null;
  BloodGroup: string | null;
  Password: string | null;
  Gender: string | null;
  Role: string | null;
  Email: string | null;
  otp: string | null;
  otpExpiresAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const PendingUserSchema: Schema<IPendingUser> = new Schema<IPendingUser>(
  {
    LName: { type: String, default: null },
    FName: { type: String, default: null },
    DateOfBirth: { type: String, default: null },
    PhoneNo: { type: String, default: null },
    BloodGroup: { type: String, default: null },
    Password: { type: String, default: null },
    Gender: { type: String, default: null },
    Role: { type: String, default: 'user' },
    Email: { type: String, default: null, unique: true, sparse: true },
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

PendingUserSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model<IPendingUser>(
  'PendingUser',
  PendingUserSchema,
);

export default PendingUser;
