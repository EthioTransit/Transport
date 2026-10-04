import mongoose, { Document, Schema } from 'mongoose';
import { TicketStatus } from '../types';

export interface ITicket extends Document {
  ticketNumber: string;
  booking: mongoose.Types.ObjectId;
  trip: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  routeTitle: string;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  pickupLocation: string;
  dropOffLocation: string;
  operatorName: string;
  vehiclePlate: string;
  amountPaid: number;
  qrVerificationToken: string;
  qrCodeDataUrl?: string;
  status: TicketStatus;
  boardingTime?: Date;
  verifiedBy?: mongoose.Types.ObjectId; // Driver ref
  verificationDevice?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, required: true, unique: true, uppercase: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    passengerName: { type: String, required: true, trim: true },
    passengerPhone: { type: String, required: true, trim: true },
    seatNumber: { type: String, required: true, trim: true },
    routeTitle: { type: String, required: true },
    originCity: { type: String, required: true },
    destinationCity: { type: String, required: true },
    departureDate: { type: String, required: true },
    departureTime: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    dropOffLocation: { type: String, required: true },
    operatorName: { type: String, required: true },
    vehiclePlate: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    qrVerificationToken: { type: String, required: true, unique: true },
    qrCodeDataUrl: { type: String },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.ISSUED,
      required: true,
    },
    boardingTime: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Driver' },
    verificationDevice: { type: String },
  },
  { timestamps: true }
);

TicketSchema.index({ booking: 1 });
TicketSchema.index({ trip: 1 });
TicketSchema.index({ user: 1 });
TicketSchema.index({ status: 1 });

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
