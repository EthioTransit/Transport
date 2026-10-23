import mongoose from 'mongoose';
import { Booking, IBooking, IPassengerInfo } from '../models/Booking';
import { Trip } from '../models/Trip';
import { Seat } from '../models/Seat';
import { BookingStatus, SeatStatus, UserRole } from '../types';
import { BRAND_CONFIG } from '../config/brand';
import { SeatService } from './seat.service';
import { AuditService } from './audit.service';
import { PersistenceService } from './persistence.service';

export class BookingService {
  static async createBooking(params: {
    tripId: string;
    userId: string;
    seats: string[];
    passengers: IPassengerInfo[];
    guestLockId?: string;
  }) {
    const trip = await Trip.findById(params.tripId).populate('route operator vehicle');
    if (!trip) throw new Error('Trip not found');

    if (params.seats.length !== params.passengers.length) {
      throw new Error('Number of passenger details must match the number of selected seats.');
    }

    // Verify or acquire seat reservation
    await SeatService.lockSeats({
      tripId: params.tripId,
      seatNumbers: params.seats,
      userId: params.userId,
      guestLockId: params.guestLockId,
    });

    // Calculate official fare & platform fee
    const perSeatFare = trip.fare;
    const perSeatFee = trip.serviceFee || BRAND_CONFIG.defaultPlatformFee || 15;
    const totalFare = perSeatFare * params.seats.length;
    const totalServiceFee = perSeatFee * params.seats.length;
    const totalAmount = totalFare + totalServiceFee;

    const expiresAt = new Date(Date.now() + (BRAND_CONFIG.seatReservationTimeoutMinutes || 10) * 60 * 1000);

    // If an active pending booking already exists for this caller and these seats, reuse it
    const existingPending = await Booking.findOne({
      trip: params.tripId,
      user: params.userId,
      seats: { $all: params.seats, $size: params.seats.length },
      status: BookingStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });

    if (existingPending) {
      existingPending.passengers = params.passengers;
      existingPending.expiresAt = expiresAt;
      await existingPending.save();
      return await Booking.findById(existingPending._id)
        .populate({
          path: 'trip',
          populate: ['route', 'operator', 'vehicle'],
        })
        .lean();
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingReference = `ET-BK-${dateStr}-${randomSuffix}`;

    const booking = await Booking.create({
      bookingReference,
      user: params.userId,
      trip: params.tripId,
      seats: params.seats,
      passengers: params.passengers,
      fare: totalFare,
      serviceFee: totalServiceFee,
      total: totalAmount,
      status: BookingStatus.PENDING,
      expiresAt,
    });

    // Permanently mark seats as BOOKED for this trip and associate booking
    await Seat.updateMany(
      { trip: params.tripId, seatNumber: { $in: params.seats } },
      {
        $set: {
          status: SeatStatus.BOOKED,
          booking: booking._id,
          lockedBy: params.userId,
        },
        $unset: {
          lockExpiresAt: '',
        },
      }
    );

    // Recalculate and update availableSeatsCount on Trip
    const availableSeatsCount = await Seat.countDocuments({
      trip: params.tripId,
      status: SeatStatus.AVAILABLE,
      $or: [{ booking: { $exists: false } }, { booking: null }],
    });
    await Trip.findByIdAndUpdate(params.tripId, { availableSeatsCount });

    // Persist permanently to disk
    PersistenceService.queueSave();

    await AuditService.log({
      user: params.userId,
      role: UserRole.PASSENGER,
      action: 'PASSENGER_CREATED_BOOKING',
      resource: 'Booking',
      resourceId: booking._id.toString(),
      newValue: {
        bookingReference,
        fare: totalFare,
        total: totalAmount,
        seats: params.seats,
      },
    });

    return await Booking.findById(booking._id)
      .populate({
        path: 'trip',
        populate: ['route', 'operator', 'vehicle'],
      })
      .lean();
  }

  static async getBookingById(bookingId: string) {
    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email phone')
      .populate('payment')
      .populate('tickets')
      .populate({
        path: 'trip',
        populate: [
          'operator',
          'vehicle',
          'driver',
          {
            path: 'route',
            populate: ['origin', 'destination'],
          },
        ],
      })
      .lean();

    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  static async getBookingByReference(bookingReference: string) {
    const booking = await Booking.findOne({ bookingReference: bookingReference.toUpperCase() })
      .populate('user', 'firstName lastName email phone')
      .populate('payment')
      .populate('tickets')
      .populate({
        path: 'trip',
        populate: ['operator', 'vehicle', 'driver', { path: 'route', populate: ['origin', 'destination'] }],
      })
      .lean();

    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  static async getUserBookings(userId: string) {
    return await Booking.find({ user: userId })
      .populate('tickets')
      .populate({
        path: 'trip',
        populate: [
          'operator',
          'vehicle',
          {
            path: 'route',
            populate: ['origin', 'destination'],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async cancelBooking(
    bookingId: string,
    reason: string,
    userContext: { id: string; email: string; role: UserRole }
  ) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.status === BookingStatus.CANCELLED) {
      throw new Error('Booking is already cancelled.');
    }

    // Authorization check
    if (
      userContext.role === UserRole.PASSENGER &&
      booking.user.toString() !== userContext.id
    ) {
      throw new Error('You are not authorized to cancel this booking.');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save();

    // Release seats back to AVAILABLE
    await Seat.updateMany(
      { trip: booking.trip, seatNumber: { $in: booking.seats } },
      {
        $set: { status: SeatStatus.AVAILABLE },
        $unset: { lockedBy: '', guestLockId: '', lockedAt: '', lockExpiresAt: '', booking: '' },
      }
    );

    // Recalculate trip available seats
    const availableCount = await Seat.countDocuments({
      trip: booking.trip,
      status: SeatStatus.AVAILABLE,
      $or: [{ booking: { $exists: false } }, { booking: null }],
    });
    await Trip.findByIdAndUpdate(booking.trip, { availableSeatsCount: availableCount });
    PersistenceService.queueSave();

    await AuditService.log({
      user: userContext.id,
      userEmail: userContext.email,
      role: userContext.role,
      action: 'CANCELLED_BOOKING',
      resource: 'Booking',
      resourceId: bookingId,
      oldValue: { status: BookingStatus.PENDING },
      newValue: { status: BookingStatus.CANCELLED, reason },
    });

    return booking;
  }

  static async getAllBookings(options: { operatorId?: string; status?: string; limit?: number; page?: number } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (options.status) filter.status = options.status;

    let query = Booking.find(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('tickets')
      .populate({
        path: 'trip',
        populate: ['operator', 'vehicle', { path: 'route', populate: ['origin', 'destination'] }],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const [bookings, total] = await Promise.all([query.lean(), Booking.countDocuments(filter)]);

    // In-memory filter for operator isolation if requested
    let results = bookings;
    if (options.operatorId) {
      results = results.filter((b: any) => b.trip?.operator?._id?.toString() === options.operatorId);
    }

    return { bookings: results, total, page, totalPages: Math.ceil(total / limit) };
  }
}
