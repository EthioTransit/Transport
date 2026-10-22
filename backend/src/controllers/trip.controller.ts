import { Request, Response } from 'express';
import { TripService } from '../services/trip.service';
import { SeatService } from '../services/seat.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { UserRole } from '../types';

export class TripController {
  static async searchTrips(req: Request, res: Response) {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const date = req.query.date as string;
      const passengers = req.query.passengers ? parseInt(req.query.passengers as string, 10) : 1;
      const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined;
      const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined;
      const operatorId = req.query.operatorId as string | undefined;
      const vehicleType = req.query.vehicleType as string | undefined;
      const sortBy = req.query.sortBy as any;

      const result = await TripService.searchTrips({
        from,
        to,
        date,
        passengers,
        priceMin,
        priceMax,
        operatorId,
        vehicleType,
        sortBy,
      });

      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getTripById(req: Request, res: Response) {
    try {
      const trip = await TripService.getTripById(req.params.id);
      return sendSuccess(res, trip);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async getAllTrips(req: Request, res: Response) {
    try {
      let operatorId = req.query.operatorId as string | undefined;
      if (req.user && req.user.role === UserRole.OPERATOR) {
        operatorId = req.user.operatorId;
      }

      const date = req.query.date as string | undefined;
      const status = req.query.status as string | undefined;
      const trips = await TripService.getAllTrips({ operatorId, date, status });
      return sendSuccess(res, { trips, total: trips.length });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async createTrip(req: Request, res: Response) {
    try {
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;

      const payload = { ...req.body };
      if (req.user && req.user.role === UserRole.OPERATOR && req.user.operatorId) {
        payload.operator = req.user.operatorId;
      }

      const trip = await TripService.createTrip(payload, userContext);
      return sendSuccess(res, trip, 'Trip scheduled successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async updateTrip(req: Request, res: Response) {
    try {
      const userContext = req.user
        ? { id: req.user.userId, email: req.user.email, role: req.user.role }
        : undefined;
      const trip = await TripService.updateTrip(req.params.id, req.body, userContext);
      return sendSuccess(res, trip, 'Trip updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getTripSeats(req: Request, res: Response) {
    try {
      const tripId = req.params.id;
      const userId = req.user?.userId;
      const guestLockId = req.query.guestLockId as string | undefined;

      const seatMap = await SeatService.getSeatsForTrip(tripId, userId, guestLockId);
      return sendSuccess(res, seatMap);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async lockSeats(req: Request, res: Response) {
    try {
      const tripId = req.params.id;
      const { seatNumbers, guestLockId } = req.body;
      const userId = req.user?.userId;

      const result = await SeatService.lockSeats({
        tripId,
        seatNumbers,
        userId,
        guestLockId,
      });

      return sendSuccess(res, result, 'Seats reserved temporarily for 10 minutes');
    } catch (err: any) {
      return sendError(res, err.message, 409, 'SEAT_UNAVAILABLE');
    }
  }

  static async unlockSeats(req: Request, res: Response) {
    try {
      const tripId = req.params.id;
      const { seatNumbers, guestLockId } = req.body;
      const userId = req.user?.userId;

      const result = await SeatService.unlockSeats({
        tripId,
        seatNumbers,
        userId,
        guestLockId,
      });

      return sendSuccess(res, result, 'Seats unlocked');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
