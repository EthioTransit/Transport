import mongoose, { Document, Schema } from 'mongoose';
import { VehicleType } from '../types';

export interface IVehicle extends Document {
  plateNumber: string;
  vehicleType: VehicleType;
  operator: mongoose.Types.ObjectId;
  seatCapacity: number;
  seatLayout: {
    layoutType: '2x2' | '2x1' | '1x2' | 'minibus';
    rows: number;
    columns: number;
    aislePosition: number[]; // e.g. [2] between col 2 and 3
    blockedSeats?: string[];
  };
  vehicleModel: string;
  year: number;
  features: string[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    plateNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: { type: String, enum: Object.values(VehicleType), default: VehicleType.BUS, required: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    seatCapacity: { type: Number, required: true, min: 10, max: 80 },
    seatLayout: {
      layoutType: { type: String, enum: ['2x2', '2x1', '1x2', 'minibus'], default: '2x2' },
      rows: { type: Number, required: true, default: 11 },
      columns: { type: Number, required: true, default: 4 },
      aislePosition: { type: [Number], default: [2] },
      blockedSeats: { type: [String], default: [] },
    },
    vehicleModel: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    features: { type: [String], default: ['AC', 'USB Charging', 'Reclining Seats'] },
    status: { type: String, enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

VehicleSchema.index({ operator: 1 });
VehicleSchema.index({ status: 1 });

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
