import mongoose, { Document, Schema } from 'mongoose';

export interface IOperator extends Document {
  name: string;
  legalName: string;
  licenseNumber: string;
  logoUrl?: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  rating: number;
  totalTripsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const OperatorSchema = new Schema<IOperator>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    legalName: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    logoUrl: { type: String },
    contactPhone: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'PENDING'], default: 'ACTIVE' },
    rating: { type: Number, default: 4.8 },
    totalTripsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OperatorSchema.index({ status: 1 });

export const Operator = mongoose.model<IOperator>('Operator', OperatorSchema);
