import mongoose, { Document, Schema } from 'mongoose';
import { PaymentStatus } from '../types';

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  provider: 'mock' | 'telebirr' | 'chapa' | 'cbe_birr';
  transactionReference: string;
  providerReference?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: {
      type: String,
      enum: ['mock', 'telebirr', 'chapa', 'cbe_birr'],
      default: 'mock',
      required: true,
    },
    transactionReference: { type: String, required: true, unique: true },
    providerReference: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'ETB', required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    paymentMethod: { type: String, default: 'Mock Payment' },
    paidAt: { type: Date },
    failureReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
