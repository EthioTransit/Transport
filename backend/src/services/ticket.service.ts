import mongoose from 'mongoose';
import { Ticket, ITicket } from '../models/Ticket';
import { Booking } from '../models/Booking';
import { Trip } from '../models/Trip';
import { TicketStatus } from '../types';
import { generateSecureVerificationToken, generateQrCodeDataUrl } from '../utils/qr.utils';

export class TicketService {
  static async generateTicketsForBooking(bookingId: string) {
    const booking = await Booking.findById(bookingId).populate({
      path: 'trip',
      populate: [
        'operator',
        'vehicle',
        {
          path: 'route',
          populate: ['origin', 'destination'],
        },
      ],
    });

    if (!booking) throw new Error('Booking not found');
    const trip: any = booking.trip;
    const originName = trip.route?.origin?.name || 'Origin';
    const destName = trip.route?.destination?.name || 'Destination';
    const routeTitle = `${originName} → ${destName}`;
    const perTicketFare = booking.fare / (booking.passengers.length || 1);

    const generatedTickets: ITicket[] = [];

    for (let i = 0; i < booking.passengers.length; i++) {
      const passenger = booking.passengers[i];
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const ticketNumber = `TK-${trip.departureDate.replace(/-/g, '')}-${randomSuffix}-${i + 1}`;
      const qrVerificationToken = generateSecureVerificationToken(ticketNumber);
      const qrCodeDataUrl = await generateQrCodeDataUrl(qrVerificationToken);

      const ticket = await Ticket.create({
        ticketNumber,
        booking: booking._id,
        trip: trip._id,
        user: booking.user,
        passengerName: passenger.name,
        passengerPhone: passenger.phone,
        seatNumber: passenger.seatNumber,
        routeTitle,
        originCity: originName,
        destinationCity: destName,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        pickupLocation: trip.pickupLocation,
        dropOffLocation: trip.dropOffLocation,
        operatorName: trip.operator?.name || 'Authorized Operator',
        vehiclePlate: trip.vehicle?.plateNumber || 'TBD',
        amountPaid: perTicketFare,
        qrVerificationToken,
        qrCodeDataUrl,
        status: TicketStatus.ISSUED,
      });

      generatedTickets.push(ticket);
    }

    // Attach tickets to booking
    booking.tickets = generatedTickets.map((t) => t._id);
    await booking.save();

    return generatedTickets;
  }

  static async getTicketById(identifier: string) {
    const isObjectId = mongoose.isValidObjectId(identifier);
    const query = isObjectId
      ? { $or: [{ _id: identifier }, { ticketNumber: identifier }, { qrVerificationToken: identifier }] }
      : { $or: [{ ticketNumber: identifier }, { qrVerificationToken: identifier }] };

    const ticket = await Ticket.findOne(query)
      .populate('booking')
      .populate({
        path: 'trip',
        populate: ['operator', 'vehicle', 'driver'],
      })
      .lean();

    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  static async lookupTickets(query: string) {
    const q = query.trim();
    if (!q) return [];

    // 1. Try ticket number, QR token, or phone
    let tickets = await Ticket.find({
      $or: [
        { ticketNumber: { $regex: new RegExp(`^${q}$`, 'i') } },
        { qrVerificationToken: q },
        { passengerPhone: q },
      ],
    })
      .populate('booking')
      .populate({
        path: 'trip',
        populate: ['operator', 'vehicle', 'driver'],
      })
      .sort({ createdAt: -1 })
      .lean();

    if (tickets.length > 0) return tickets;

    // 2. Try booking reference
    const booking = await Booking.findOne({ bookingReference: q.toUpperCase() });
    if (booking) {
      tickets = await Ticket.find({ booking: booking._id })
        .populate('booking')
        .populate({
          path: 'trip',
          populate: ['operator', 'vehicle', 'driver'],
        })
        .sort({ seatNumber: 1 })
        .lean();
    }

    return tickets;
  }

  static async getTicketsByBooking(bookingId: string) {
    return await Ticket.find({ booking: bookingId }).sort({ seatNumber: 1 }).lean();
  }

  static async getUserTickets(userId: string) {
    return await Ticket.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }
}

