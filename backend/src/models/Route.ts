import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  origin: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  distanceKm: number;
  estimatedDurationHours: number;
  pickupPoints: Array<{
    name: string;
    locationNote?: string;
    timeOffsetMinutes: number;
  }>;
  dropOffPoints: Array<{
    name: string;
    locationNote?: string;
  }>;
  status: 'ACTIVE' | 'INACTIVE';
  popularityScore: number;
  operatingDays: string[];
  departureTimes: string[];
  baseFare?: number;
  operator?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    origin: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    destination: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    distanceKm: { type: Number, default: 0 },
    estimatedDurationHours: { type: Number, default: 4 },
    pickupPoints: [
      {
        name: { type: String, required: true },
        locationNote: { type: String },
        timeOffsetMinutes: { type: Number, default: 0 },
      },
    ],
    dropOffPoints: [
      {
        name: { type: String, required: true },
        locationNote: { type: String },
      },
    ],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    popularityScore: { type: Number, default: 10 },
    operatingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    departureTimes: {
      type: [String],
      default: ['06:00 AM', '08:30 AM', '01:30 PM'],
    },
    baseFare: { type: Number },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator' },
  },
  { timestamps: true }
);

RouteSchema.index({ origin: 1, destination: 1 }, { unique: true });
RouteSchema.index({ origin: 1 });
RouteSchema.index({ destination: 1 });
RouteSchema.index({ status: 1 });
RouteSchema.index({ popularityScore: -1 });

export const Route = mongoose.model<IRoute>('Route', RouteSchema);
