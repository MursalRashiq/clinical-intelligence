import mongoose, { Schema, Model } from 'mongoose';
import type { IUserDocument } from '../types/user.type';
import type { JsonTransformReturnType } from '../types/common';
import { ROLES, GENDER } from 


export interface IAddress {
  _id?: Types.ObjectId;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  addressType: 'home' | 'work';
  isDefault: boolean;
}

export interface IUser extends Document {
  LName: string;
  FName: string;
  DateOfBirth: string;
  PhoneNo: string;
  BloodGroup: string;
  Password: string;
  Gender: string;
  PImage?: string;
  IsActive: boolean;
  Role: string;
  Email: string;
  resetPasswordOtp?: string | null;
  resetPasswordOtpExpiresAt?: Date | null;
  addresses?: IAddress[];
  PImagePublicId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    addressLine1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    addressType: { type: String, enum: ['home', 'work'], required: true },
    isDefault: { type: Boolean, default: false },
  },
  {_id: true}
)

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    LName: { type: String, required: true },
    FName: { type: String, required: true },
    DateOfBirth: { type: String, required: true },
    PhoneNo: { type: String, required: true },
    BloodGroup: { type: String, required: true },
    Password: { type: String, required: true },
    Gender: { type: String, required: true },
    PImage: { type: String, default: "" },
    PImagePublicId: { type: String, default: '' },
    IsActive: { type: Boolean, default: true },
    Role: { type: String, default: 'user' },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpiresAt: { type: Date, default: null },
    addresses: { type: [AddressSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

interface IUserModel extends Model<IUser> {}

const User: IUserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;