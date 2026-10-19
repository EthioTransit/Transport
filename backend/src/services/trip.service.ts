import mongoose from 'mongoose';
import { Trip, ITrip } from '../models/Trip';
import { Route } from '../models/Route';
import { City } from '../models/City';
import { Vehicle } from '../models/Vehicle';
import { Seat } from '../models/Seat';
import { TripStatus, SeatStatus, UserRole } from '../types';
import { AuditService } from './audit.service';

export class TripService {
  static async searchTrips(params: {
    from: string; // city ID or code or name
    to: string;   // city ID or code or name
    date: string; // YYYY-MM-DD
    passengers: number;
    priceMin?: number;
    priceMax?: number;
    operatorId?: string;
    vehicleType?: string;
    departureTimeRange?: string; // 'morning', 'afternoon', 'evening'
    sortBy?: 'PRICE_ASC' | 'PRICE_DESC' | 'DEPARTURE_EARLIEST' | 'DEPARTURE_LATEST' | 'SEATS_AVAILABLE';
  }) {
    // 1. Resolve cities
    const findCity = async (identifier: string) => {
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        const byId = await City.findById(identifier);
        if (byId) return byId;
      }
      return await City.findOne({
        $or: [
          { code: identifier.toUpperCase() },
          { name: new RegExp(`^${identifier}$`, 'i') },
        ],
      });
    };

    const [originCity, destinationCity] = await Promise.all([
      findCity(params.from),
      findCity(params.to),
    ]);

    if (!originCity || !destinationCity) {
      return {
        trips: [],
        total: 0,
        originCity: originCity ? { id: originCity._id, name: originCity.name } : null,
        destinationCity: destinationCity ? { id: destinationCity._id, name: destinationCity.name } : null,
        message: 'Origin or destination city not found in route database.',
      };
    }

    // 2. Find matching active route
    const route = await Route.findOne({
      origin: originCity._id,
      destination: destinationCity._id,
      status: 'ACTIVE',
    });

    if (!route) {
      return {
        trips: [],
        total: 0,
        originCity: { id: originCity._id, name: originCity.name, code: originCity.code },
        destinationCity: { id: destinationCity._id, name: destinationCity.name, code: destinationCity.code },
        message: `No active route found between ${originCity.name} and ${destinationCity.name}.`,
      };
    }

    // 3. Build search query for trips on that date
    const tripFilter: any = {
      route: route._id,
      departureDate: params.date,
      status: { $in: [TripStatus.SCHEDULED, TripStatus.BOARDING] },
      availableSeatsCount: { $gte: params.passengers },
    };

    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      tripFilter.fare = {};
      if (params.priceMin !== undefined) tripFilter.fare.$gte = params.priceMin;
      if (params.priceMax !== undefined) tripFilter.fare.$lte = params.priceMax;
    }

    if (params.operatorId) {
      tripFilter.operator = params.operatorId;
    }

    let tripsQuery = Trip.find(tripFilter)
      .populate('operator', 'name legalName logoUrl rating contactPhone')
      .populate('vehicle', 'plateNumber vehicleType seatCapacity seatLayout features model')
      .populate('driver', 'name phone rating')
      .populate({
        path: 'route',
        populate: ['origin', 'destination'],
      });

    // Apply sorting
    switch (params.sortBy) {
      case 'PRICE_ASC':
        tripsQuery = tripsQuery.sort({ fare: 1 });
        break;
      case 'PRICE_DESC':
        tripsQuery = tripsQuery.sort({ fare: -1 });
        break;
      case 'DEPARTURE_LATEST':
        tripsQuery = tripsQuery.sort({ departureTime: -1 });
        break;
      case 'SEATS_AVAILABLE':
        tripsQuery = tripsQuery.sort({ availableSeatsCount: -1 });
        break;
      case 'DEPARTURE_EARLIEST':
      default:
        tripsQuery = tripsQuery.sort({ departureTime: 1 });
        break;
    }

    const trips = await tripsQuery.lean();

    // In-memory filter for vehicleType if needed
    let filteredTrips = trips;
    if (params.vehicleType) {
      filteredTrips = filteredTrips.filter((t: any) => t.vehicle?.vehicleType === params.vehicleType);
    }

    return {
      trips: filteredTrips,
      total: filteredTrips.length,
      route: {
        id: route._id,
        distanceKm: route.distanceKm,
        estimatedDurationHours: route.estimatedDurationHours,
        image: route.image,
      },
      originCity: { id: originCity._id, name: originCity.name, code: originCity.code, region: originCity.region },
      destinationCity: { id: destinationCity._id, name: destinationCity.name, code: destinationCity.code, region: destinationCity.region },
    };
  }

  static async getTripById(id: string) {
    const trip = await Trip.findById(id)
      .populate('operator')
      .populate('vehicle')
      .populate('driver')
      .populate({
        path: 'route',
        populate: ['origin', 'destination'],
      })
      .lean();

    if (!trip) throw new Error('Trip not found');
    return trip;
  }

  static async createTrip(
    data: any,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const vehicle = await Vehicle.findById(data.vehicle);
    if (!vehicle) throw new Error('Vehicle not found');

    if (vehicle.status !== 'ACTIVE') {
      throw new Error(`Vehicle ${vehicle.plateNumber} is currently ${vehicle.status} and cannot be assigned to trips. Please activate it first in Fleet Management.`);
    }

    const route = await Route.findById(data.route);
    if (!route) throw new Error('Route not found');

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const tripCode = `ET-${data.departureDate.replace(/-/g, '')}-${randomSuffix}`;

    const trip = await Trip.create({
      ...data,
      tripCode,
      totalSeatsCount: vehicle.seatCapacity,
      availableSeatsCount: vehicle.seatCapacity,
      status: TripStatus.SCHEDULED,
      amenities: data.amenities || vehicle.features,
    });

    // Auto-generate seat documents for this trip based on vehicle layout
    await this.generateSeatsForTrip(trip._id.toString(), vehicle);

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'CREATED_TRIP',
        resource: 'Trip',
        resourceId: trip._id.toString(),
        newValue: trip.toObject(),
      });
    }

    return await this.getTripById(trip._id.toString());
  }

  static async generateSeatsForTrip(tripId: string, vehicle: any) {
    const rows = vehicle.seatLayout?.rows || Math.ceil(vehicle.seatCapacity / 4);
    const columns = vehicle.seatLayout?.columns || 4;
    const colLetters = ['A', 'B', 'C', 'D', 'E'];
    const blockedList = new Set(vehicle.seatLayout?.blockedSeats || []);

    const seatsToInsert = [];
    let count = 0;

    for (let r = 1; r <= rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (count >= vehicle.seatCapacity) break;
        const letter = colLetters[c] || `C${c + 1}`;
        const seatNumber = `${r}${letter}`;

        const isAisle = vehicle.seatLayout?.aislePosition?.includes(c + 1);
        const isWindow = c === 0 || c === columns - 1;
        const seatType = isWindow ? 'WINDOW' : isAisle ? 'AISLE' : 'MIDDLE';

        const isBlocked = blockedList.has(seatNumber);

        seatsToInsert.push({
          trip: tripId,
          seatNumber,
          row: r,
          column: c + 1,
          seatType,
          status: isBlocked ? SeatStatus.BLOCKED : SeatStatus.AVAILABLE,
          priceModifier: 0,
        });
        count++;
      }
    }

    if (seatsToInsert.length > 0) {
      await Seat.insertMany(seatsToInsert);
    }
  }

  static async updateTrip(
    id: string,
    updates: Partial<ITrip>,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const old = await Trip.findById(id);
    if (!old) throw new Error('Trip not found');

    const updated = await Trip.findByIdAndUpdate(id, updates, { new: true })
      .populate('operator vehicle driver')
      .populate({
        path: 'route',
        populate: ['origin', 'destination'],
      })
      .lean();

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'UPDATED_TRIP',
        resource: 'Trip',
        resourceId: id,
        oldValue: old.toObject(),
        newValue: updated,
      });
    }

    return updated;
  }

  static async getAllTrips(options: { operatorId?: string; date?: string; status?: string } = {}) {
    const filter: any = {};
    if (options.operatorId) filter.operator = options.operatorId;
    if (options.date) filter.departureDate = options.date;
    if (options.status) filter.status = options.status;

    return await Trip.find(filter)
      .populate('operator', 'name')
      .populate('vehicle', 'plateNumber model vehicleType')
      .populate('driver', 'name phone')
      .populate({
        path: 'route',
        populate: ['origin', 'destination'],
      })
      .sort({ departureDate: -1, departureTime: -1 })
      .lean();
  }
}
