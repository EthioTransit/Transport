import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { BookingService } from '../services/booking.service';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response.utils';
import { UserRole } from '../types';

export class BookingController {
  static async createBooking(req: Request, res: Response) {
    try {
      const { tripId, seats, passengers, guestLockId } = req.body;
      let userId = req.user?.userId;

      // If user is not authenticated (guest checkout or expired session), find or create a passenger record
      if (!userId && passengers && passengers.length > 0) {
        const primaryPhone = passengers[0].phone.trim();
        let user = await User.findOne({ phone: primaryPhone });
        if (!user) {
          const parts = passengers[0].name.trim().split(' ');
          const firstName = parts[0] || 'Passenger';
          const lastName = parts.slice(1).join(' ') || 'Customer';
          const cleanPhoneDigits = primaryPhone.replace(/\D/g, '');
          const baseEmail = `passenger_${cleanPhoneDigits}@ethiotransit.et`;
          const existingEmail = await User.findOne({ email: baseEmail });
          const email = existingEmail ? `passenger_${cleanPhoneDigits}_${Date.now()}@ethiotransit.et` : baseEmail;

          user = await User.create({
            firstName,
            lastName,
            phone: primaryPhone,
            email,
            passwordHash: await bcrypt.hash('EthioTransit@2026', 10),
            role: UserRole.PASSENGER,
            isActive: true,
          });
        }
        userId = user._id.toString();
      }

      if (!userId) {
        return sendError(res, 'Authentication or passenger contact details required to create a booking', 401);
      }

      const booking = await BookingService.createBooking({
        tripId,
        userId,
        seats,
        passengers,
        guestLockId,
      });

      return sendSuccess(res, booking, 'Booking created. Proceed to payment within 10 minutes.', 201);
    } catch (err: any) {
      console.error('[BookingController CreateBooking Error]:', err.message);
      return sendError(res, err.message, 400);
    }
  }

  static async getBookingById(req: Request, res: Response) {
    try {
      const booking = await BookingService.getBookingById(req.params.id);

      // Authorization check
      if (
        req.user &&
        req.user.role === UserRole.PASSENGER &&
        (booking.user as any)?._id?.toString() !== req.user.userId
      ) {
        return sendError(res, 'Access denied', 403);
      }

      return sendSuccess(res, booking);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async getBookingByReference(req: Request, res: Response) {
    try {
      const booking = await BookingService.getBookingByReference(req.params.reference);
      return sendSuccess(res, booking);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async getMyBookings(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const bookings = await BookingService.getUserBookings(req.user.userId);
      return sendSuccess(res, bookings);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const { reason } = req.body;
      const userContext = {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      };

      const booking = await BookingService.cancelBooking(req.params.id, reason, userContext);
      return sendSuccess(res, booking, 'Booking successfully cancelled');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      let operatorId = req.query.operatorId as string | undefined;
      if (req.user && req.user.role === UserRole.OPERATOR) {
        operatorId = req.user.operatorId;
      }

      const status = req.query.status as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      const result = await BookingService.getAllBookings({ operatorId, status, limit, page });
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
