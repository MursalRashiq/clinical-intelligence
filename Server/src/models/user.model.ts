import mongoose, { Schema, Model } from 'mongoose';
import type { IUserDocument } from '../types/user.type';
import type { JsonTransformReturnType } from '../types/common';
import { ROLES, GENDER } from '../constants/constants';
import { IDGenerator } from '../utils/idGenerator.utils';

const UserSchema = new Schema<IUserDocument>(
  {
    customId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PATIENT,
      required: true,
    },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bloodGroup: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    pincode: {
      type: String,
      default: null,
    },
    favorite: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
  },

  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>): JsonTransformReturnType {
        const { _id, __v, passwordHash, ...cleanedRet } = ret;

        return {
          ...cleanedRet,
          id: _id as string,
        };
      },
    },
    toObject: { virtuals: true },
  },
);

UserSchema.index({ role: 1, isActive: 1 });

UserSchema.pre('save', async function () {
  if (this.isNew && !this.customId) {
    if (this.role === ROLES.PATIENT) {
      this.customId = IDGenerator.generatePatientID();
    } else if (this.role === ROLES.DOCTOR) {
      this.customId = IDGenerator.generateDoctorID();
    } else if (this.role === ROLES.ADMIN) {
      this.customId = IDGenerator.generatePatientID();
    }
  }
});

const UserModel: Model<IUserDocument> =
  (mongoose.models && (mongoose.models.User as Model<IUserDocument>)) ||
  mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
