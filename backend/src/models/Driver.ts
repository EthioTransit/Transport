import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  user?: mongoose.Types.ObjectId;
  operator: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  status: 'ACTIVE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
  rating: number;
  assignedTrips: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseCategory: { type: String, default: 'Public Transport 1' },
    status: {
      type: String,
      enum: ['ACTIVE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    rating: { type: Number, default: 4.9 },
    assignedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }],
  },
  { timestamps: true }
);

DriverSchema.index({ operator: 1 });
DriverSchema.index({ status: 1 });

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);
