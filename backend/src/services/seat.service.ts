import mongoose from 'mongoose';
import { Seat, ISeat } from '../models/Seat';
import { Trip } from '../models/Trip';
import { SeatStatus } from '../types';
import { BRAND_CONFIG } from '../config/brand';
import { PersistenceService } from './persistence.service';
import { hasTripDeparted } from '../utils/time.utils';

export class SeatService {
  /**
   * Automatically clears temporary unbooked reservations so they become available again.
   * NEVER clears seats that have a booking attached (permanently reserved).
   */
  static async cleanupExpiredLocks(tripId?: string) {
    const now = new Date();
    const filter: any = {
      status: SeatStatus.RESERVED,
      lockExpiresAt: { $lt: now },
      $or: [
        { booking: { $exists: false } },
        { booking: null },
      ],
    };
    if (tripId) {
      filter.trip = tripId;
    }

    const expiredSeats = await Seat.find(filter);
    if (expiredSeats.length > 0) {
      const seatIds = expiredSeats.map((s) => s._id);
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        {
          $set: {
            status: SeatStatus.AVAILABLE,
          },
          $unset: {
            lockedBy: '',
            guestLockId: '',
            lockedAt: '',
            lockExpiresAt: '',
          },
        }
      );

      // Recalculate trip availableSeatsCount
      const tripIdsToUpdate = Array.from(new Set(expiredSeats.map((s) => s.trip.toString())));
      for (const tId of tripIdsToUpdate) {
        const availableCount = await Seat.countDocuments({
          trip: tId,
          status: SeatStatus.AVAILABLE,
          $or: [{ booking: { $exists: false } }, { booking: null }],
        });
        await Trip.findByIdAndUpdate(tId, { availableSeatsCount: availableCount });
      }
      PersistenceService.queueSave();
    }
  }

  static async getSeatsForTrip(tripId: string, userId?: string, guestLockId?: string) {
    await this.cleanupExpiredLocks(tripId);

    const trip = await Trip.findById(tripId).populate('vehicle');
    if (!trip) throw new Error('Trip not found');

    // Vehicle-level seat preservation: reflect seats booked on this bus across all its trips
    const vehicleId = (trip.vehicle as any)?._id || trip.vehicle;
    if (vehicleId) {
      const vehicleTripIds = await Trip.find({ vehicle: vehicleId }).distinct('_id');
      const bookedOnVehicle = await Seat.find({
        trip: { $in: vehicleTripIds },
        $or: [{ status: SeatStatus.BOOKED }, { booking: { $exists: true, $ne: null } }],
      }).lean();

      if (bookedOnVehicle.length > 0) {
        const bookedSeatNumbers = Array.from(new Set(bookedOnVehicle.map((s) => s.seatNumber)));
        const syncResult = await Seat.updateMany(
          {
            trip: tripId,
            seatNumber: { $in: bookedSeatNumbers },
            status: { $ne: SeatStatus.BOOKED },
          },
          {
            $set: { status: SeatStatus.BOOKED },
            $unset: { lockExpiresAt: '', guestLockId: '' },
          }
        );

        if (syncResult.modifiedCount > 0) {
          const avail = await Seat.countDocuments({
            trip: tripId,
            status: SeatStatus.AVAILABLE,
            $or: [{ booking: { $exists: false } }, { booking: null }],
          });
          await Trip.findByIdAndUpdate(tripId, { availableSeatsCount: avail });
          PersistenceService.queueSave();
        }
      }
    }

    const seats = await Seat.find({ trip: tripId }).sort({ row: 1, column: 1 }).lean();

    // Map seats to show client state
    const mappedSeats = seats.map((seat) => {
      const hasBooking = Boolean(seat.booking);
      const isPermanentlyBooked = seat.status === SeatStatus.BOOKED || hasBooking;

      const isMine =
        (userId && seat.lockedBy && seat.lockedBy.toString() === userId) ||
        (guestLockId && seat.guestLockId === guestLockId);

      let effectiveStatus = seat.status;
      if (isPermanentlyBooked) {
        effectiveStatus = SeatStatus.BOOKED;
      } else if (seat.status === SeatStatus.RESERVED) {
        effectiveStatus = isMine ? SeatStatus.SELECTED : SeatStatus.RESERVED;
      }

      return {
        id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        seatType: seat.seatType,
        status: effectiveStatus,
        isMine: !!isMine && !isPermanentlyBooked,
        priceModifier: seat.priceModifier || 0,
        fare: trip.fare + (seat.priceModifier || 0),
        lockExpiresAt: isMine && !isPermanentlyBooked ? seat.lockExpiresAt : undefined,
      };
    });

    const realAvailableCount = seats.filter(
      (s) => s.status === SeatStatus.AVAILABLE && !s.booking
    ).length;

    const isDeparted = hasTripDeparted(trip.departureDate, trip.departureTime);

    return {
      tripId,
      vehicle: trip.vehicle,
      seats: mappedSeats,
      totalSeats: seats.length,
      availableCount: isDeparted ? 0 : realAvailableCount,
      isDeparted,
      canReserve: !isDeparted,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
    };
  }

  /**
   * Atomically locks seats for a 10-minute reservation window.
   * If any seat fails, acquired locks are reverted.
   */
  static async lockSeats(params: {
    tripId: string;
    seatNumbers: string[];
    userId?: string;
    guestLockId?: string;
  }) {
    await this.cleanupExpiredLocks(params.tripId);

    const tripObjectId = mongoose.Types.ObjectId.isValid(params.tripId)
      ? new mongoose.Types.ObjectId(params.tripId)
      : params.tripId;

    const trip = await Trip.findById(tripObjectId);
    if (!trip) throw new Error('Trip not found');

    if (hasTripDeparted(trip.departureDate, trip.departureTime)) {
      throw new Error(
        `Cannot reserve seat: This trip has already departed (${trip.departureTime} on ${trip.departureDate}). Seat reservations are closed.`
      );
    }

    const timeoutMinutes = BRAND_CONFIG.seatReservationTimeoutMinutes || 10;
    const now = new Date();
    const lockExpiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000);

    const userObjectId =
      params.userId && mongoose.Types.ObjectId.isValid(params.userId)
        ? new mongoose.Types.ObjectId(params.userId)
        : null;

    const acquiredSeatIds: mongoose.Types.ObjectId[] = [];

    try {
      for (const seatNumber of params.seatNumbers) {
        const cleanSeatNumber = seatNumber.trim();
        const seat = await Seat.findOne({
          trip: tripObjectId,
          seatNumber: cleanSeatNumber,
        });

        if (!seat) {
          throw new Error(`Seat ${seatNumber} does not exist for this trip.`);
        }

        // Check if booked on this trip
        if (seat.status === SeatStatus.BOOKED || seat.booking) {
          throw new Error(`Seat ${seatNumber} has already been reserved and booked.`);
        }

        // Check if booked on this vehicle across any scheduled departure
        const parentTrip = await Trip.findById(tripObjectId);
        if (parentTrip?.vehicle) {
          const vTrips = await Trip.find({ vehicle: parentTrip.vehicle }).distinct('_id');
          const isBookedOnVehicle = await Seat.exists({
            trip: { $in: vTrips },
            seatNumber: cleanSeatNumber,
            $or: [{ status: SeatStatus.BOOKED }, { booking: { $exists: true, $ne: null } }],
          });
          if (isBookedOnVehicle) {
            throw new Error(`Seat ${seatNumber} is reserved and booked on this bus.`);
          }
        }

        if (seat.status === SeatStatus.BLOCKED) {
          throw new Error(`Seat ${seatNumber} is blocked for maintenance or driver.`);
        }

        const isLockExpired = seat.lockExpiresAt ? new Date(seat.lockExpiresAt) < now : true;
        const isAvailable = (seat.status === SeatStatus.AVAILABLE || isLockExpired) && !seat.booking;

        let callerMatches = false;
        if (!isAvailable && seat.status === SeatStatus.RESERVED) {
          // Check if caller is the owner
          if (userObjectId && seat.lockedBy && seat.lockedBy.toString() === userObjectId.toString()) {
            callerMatches = true;
          } else if (params.userId && seat.lockedBy && seat.lockedBy.toString() === params.userId.toString()) {
            callerMatches = true;
          } else if (params.guestLockId && seat.guestLockId === params.guestLockId) {
            callerMatches = true;
          } else if (!seat.lockedBy && !seat.guestLockId) {
            callerMatches = true;
          } else if (seat.booking) {
            // Check if attached booking is a pending booking of this user
            const b = await mongoose.model('Booking').findById(seat.booking);
            if (b && b.status === 'PENDING' && b.user && b.user.toString() === (params.userId || '').toString()) {
              callerMatches = true;
            }
          }
        }

        if (!isAvailable && !callerMatches) {
          throw new Error(`Seat ${seatNumber} is currently reserved by another passenger. Please select another seat.`);
        }

        // Lock / refresh lock on seat
        seat.status = SeatStatus.RESERVED;
        seat.lockedAt = now;
        seat.lockExpiresAt = lockExpiresAt;
        if (userObjectId) seat.lockedBy = userObjectId;
        if (params.guestLockId) seat.guestLockId = params.guestLockId;

        await seat.save();
        acquiredSeatIds.push(seat._id as mongoose.Types.ObjectId);
      }

      // Update available count on trip
      const availableCount = await Seat.countDocuments({
        trip: tripObjectId,
        status: SeatStatus.AVAILABLE,
        $or: [{ booking: { $exists: false } }, { booking: null }],
      });
      await Trip.findByIdAndUpdate(tripObjectId, { availableSeatsCount: availableCount });
      PersistenceService.queueSave();

      return {
        success: true,
        lockedSeats: params.seatNumbers,
        lockExpiresAt,
        timeoutMinutes,
      };
    } catch (err: any) {
      console.warn(`[Seat Lock Warning]: ${err.message}`);
      throw err;
    }
  }

  static async unlockSeats(params: {
    tripId: string;
    seatNumbers: string[];
    userId?: string;
    guestLockId?: string;
  }) {
    const tripObjectId = mongoose.Types.ObjectId.isValid(params.tripId)
      ? new mongoose.Types.ObjectId(params.tripId)
      : params.tripId;

    const userObjectId =
      params.userId && mongoose.Types.ObjectId.isValid(params.userId)
        ? new mongoose.Types.ObjectId(params.userId)
        : null;

    const filter: any = {
      trip: tripObjectId,
      seatNumber: { $in: params.seatNumbers },
      status: SeatStatus.RESERVED,
      $or: [{ booking: { $exists: false } }, { booking: null }],
    };

    if (userObjectId) {
      filter.$or = [{ lockedBy: userObjectId }, { lockedBy: params.userId }];
    } else if (params.guestLockId) {
      filter.guestLockId = params.guestLockId;
    }

    await Seat.updateMany(filter, {
      $set: { status: SeatStatus.AVAILABLE },
      $unset: { lockedBy: '', guestLockId: '', lockedAt: '', lockExpiresAt: '' },
    });

    const availableCount = await Seat.countDocuments({
      trip: tripObjectId,
      status: SeatStatus.AVAILABLE,
      $or: [{ booking: { $exists: false } }, { booking: null }],
    });
    await Trip.findByIdAndUpdate(tripObjectId, { availableSeatsCount: availableCount });
    PersistenceService.queueSave();

    return { success: true };
  }
}
