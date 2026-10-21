import mongoose from 'mongoose';
import { Seat, ISeat } from '../models/Seat';
import { Trip } from '../models/Trip';
import { SeatStatus } from '../types';
import { BRAND_CONFIG } from '../config/brand';

export class SeatService {
  /**
   * Automatically clears expired reservations so they become available again
   */
  static async cleanupExpiredLocks(tripId?: string) {
    const now = new Date();
    const filter: any = {
      status: SeatStatus.RESERVED,
      lockExpiresAt: { $lt: now },
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
            booking: '',
          },
        }
      );

      // Recalculate trip availableSeatsCount
      const tripIdsToUpdate = Array.from(new Set(expiredSeats.map((s) => s.trip.toString())));
      for (const tId of tripIdsToUpdate) {
        const availableCount = await Seat.countDocuments({ trip: tId, status: SeatStatus.AVAILABLE });
        await Trip.findByIdAndUpdate(tId, { availableSeatsCount: availableCount });
      }
    }
  }

  static async getSeatsForTrip(tripId: string, userId?: string, guestLockId?: string) {
    await this.cleanupExpiredLocks(tripId);

    const trip = await Trip.findById(tripId).populate('vehicle');
    if (!trip) throw new Error('Trip not found');

    const seats = await Seat.find({ trip: tripId }).sort({ row: 1, column: 1 }).lean();

    // Map seats to show client state
    const mappedSeats = seats.map((seat) => {
      const isMine =
        (userId && seat.lockedBy && seat.lockedBy.toString() === userId) ||
        (guestLockId && seat.guestLockId === guestLockId);

      let effectiveStatus = seat.status;
      if (seat.status === SeatStatus.RESERVED) {
        effectiveStatus = isMine ? SeatStatus.SELECTED : SeatStatus.RESERVED;
      }

      return {
        id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        seatType: seat.seatType,
        status: effectiveStatus,
        isMine: !!isMine,
        priceModifier: seat.priceModifier || 0,
        fare: trip.fare + (seat.priceModifier || 0),
        lockExpiresAt: isMine ? seat.lockExpiresAt : undefined,
      };
    });

    return {
      tripId,
      vehicle: trip.vehicle,
      seats: mappedSeats,
      totalSeats: seats.length,
      availableCount: seats.filter((s) => s.status === SeatStatus.AVAILABLE).length,
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

    const timeoutMinutes = BRAND_CONFIG.seatReservationTimeoutMinutes || 10;
    const now = new Date();
    const lockExpiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000);

    const acquiredSeatIds: mongoose.Types.ObjectId[] = [];

    try {
      const userObjectId =
        params.userId && mongoose.Types.ObjectId.isValid(params.userId)
          ? new mongoose.Types.ObjectId(params.userId)
          : null;

      for (const seatNumber of params.seatNumbers) {
        // Atomic condition: must be AVAILABLE OR already locked by this exact caller
        const orConditions: any[] = [{ status: SeatStatus.AVAILABLE }];

        if (userObjectId) {
          orConditions.push({ status: SeatStatus.RESERVED, lockedBy: userObjectId });
          orConditions.push({ status: SeatStatus.RESERVED, lockedBy: params.userId });
        } else if (params.userId) {
          orConditions.push({ status: SeatStatus.RESERVED, lockedBy: params.userId });
        }

        if (params.guestLockId) {
          orConditions.push({ status: SeatStatus.RESERVED, guestLockId: params.guestLockId });
        }

        const query: any = {
          trip: params.tripId,
          seatNumber,
          $or: orConditions,
        };

        const update: any = {
          status: SeatStatus.RESERVED,
          lockedAt: now,
          lockExpiresAt,
        };

        if (params.userId) update.lockedBy = params.userId;
        if (params.guestLockId) update.guestLockId = params.guestLockId;

        const updatedSeat = await Seat.findOneAndUpdate(query, { $set: update }, { new: true });

        if (!updatedSeat) {
          throw new Error(`Seat ${seatNumber} is no longer available. Please select another seat.`);
        }

        acquiredSeatIds.push(updatedSeat._id as mongoose.Types.ObjectId);
      }

      // Update available count on trip
      const availableCount = await Seat.countDocuments({ trip: params.tripId, status: SeatStatus.AVAILABLE });
      await Trip.findByIdAndUpdate(params.tripId, { availableSeatsCount: availableCount });

      return {
        success: true,
        lockedSeats: params.seatNumbers,
        lockExpiresAt,
        timeoutMinutes,
      };
    } catch (err) {
      // Rollback acquired locks if failure occurs
      if (acquiredSeatIds.length > 0) {
        await Seat.updateMany(
          { _id: { $in: acquiredSeatIds } },
          {
            $set: { status: SeatStatus.AVAILABLE },
            $unset: { lockedBy: '', guestLockId: '', lockedAt: '', lockExpiresAt: '' },
          }
        );
      }
      throw err;
    }
  }

  static async unlockSeats(params: {
    tripId: string;
    seatNumbers: string[];
    userId?: string;
    guestLockId?: string;
  }) {
    const filter: any = {
      trip: params.tripId,
      seatNumber: { $in: params.seatNumbers },
      status: SeatStatus.RESERVED,
    };

    if (params.userId) filter.lockedBy = params.userId;
    else if (params.guestLockId) filter.guestLockId = params.guestLockId;

    await Seat.updateMany(filter, {
      $set: { status: SeatStatus.AVAILABLE },
      $unset: { lockedBy: '', guestLockId: '', lockedAt: '', lockExpiresAt: '', booking: '' },
    });

    const availableCount = await Seat.countDocuments({ trip: params.tripId, status: SeatStatus.AVAILABLE });
    await Trip.findByIdAndUpdate(params.tripId, { availableSeatsCount: availableCount });

    return { success: true };
  }
}
