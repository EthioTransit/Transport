import mongoose, { Document, Schema } from 'mongoose';
import { TripStatus } from '../types';

export interface ITrip extends Document {
  tripCode: string;
  route: mongoose.Types.ObjectId;
  operator: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  departureDate: string; // ISO date string YYYY-MM-DD
  departureTime: string; // "06:00 AM"
  estimatedArrival: string; // "11:30 AM"
  fare: number; // Official Fare in ETB
  serviceFee: number; // Platform fee
  status: TripStatus;
  pickupLocation: string;
  dropOffLocation: string;
  availableSeatsCount: number;
  totalSeatsCount: number;
  amenities: string[];
  boardingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    tripCode: { type: String, required: true, unique: true, uppercase: true },
    route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    departureDate: { type: String, required: true }, // Format YYYY-MM-DD
    departureTime: { type: String, required: true },
    estimatedArrival: { type: String, required: true },
    fare: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, default: 15 },
    status: {
      type: String,
      enum: Object.values(TripStatus),
      default: TripStatus.SCHEDULED,
      required: true,
    },
    pickupLocation: { type: String, required: true },
    dropOffLocation: { type: String, required: true },
    availableSeatsCount: { type: Number, required: true },
    totalSeatsCount: { type: Number, required: true },
    amenities: { type: [String], default: ['AC', 'USB Charging', 'Water'] },
    boardingNotes: { type: String },
  },
  { timestamps: true }
);

TripSchema.index({ route: 1, departureDate: 1, status: 1 });
TripSchema.index({ route: 1 });
TripSchema.index({ departureDate: 1 });
TripSchema.index({ status: 1 });
TripSchema.index({ operator: 1 });

export const Trip = mongoose.model<ITrip>('Trip', TripSchema);
