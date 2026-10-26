import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types';

export interface IOtpVerification extends Document {
  email: string;
  otpHash: string;
  registrationData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role?: UserRole;
    operatorId?: string;
  };
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    registrationData: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: Object.values(UserRole), default: UserRole.PASSENGER },
      operatorId: { type: String },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Automatic TTL cleanup right when expiresAt timestamp is reached
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


export const OtpVerification = mongoose.model<IOtpVerification>('OtpVerification', OtpVerificationSchema);
