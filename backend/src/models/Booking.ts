import mongoose, { Document, Schema } from 'mongoose';
import { BookingStatus } from '../types';

export interface IPassengerInfo {
  name: string;
  phone: string;
  seatNumber: string;
  ageGroup: 'ADULT' | 'CHILD';
  idNumber?: string;
}

export interface IBooking extends Document {
  bookingReference: string;
  user: mongoose.Types.ObjectId;
  trip: mongoose.Types.ObjectId;
  seats: string[];
  passengers: IPassengerInfo[];
  fare: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  payment?: mongoose.Types.ObjectId;
  tickets: mongoose.Types.ObjectId[];
  expiresAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true, uppercase: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    seats: { type: [String], required: true },
    passengers: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        seatNumber: { type: String, required: true },
        ageGroup: { type: String, enum: ['ADULT', 'CHILD'], default: 'ADULT' },
        idNumber: { type: String },
      },
    ],
    fare: { type: Number, required: true },
    serviceFee: { type: Number, required: true, default: 15 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      required: true,
    },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
    tickets: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
    expiresAt: { type: Date, required: true },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ trip: 1, status: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ expiresAt: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
