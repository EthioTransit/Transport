import mongoose from 'mongoose';
import { Trip, ITrip } from '../models/Trip';
import { Route } from '../models/Route';
import { City } from '../models/City';
import { Vehicle } from '../models/Vehicle';
import { Seat } from '../models/Seat';
import { Operator } from '../models/Operator';
import { Driver } from '../models/Driver';
import { TripStatus, SeatStatus, UserRole } from '../types';
import { AuditService } from './audit.service';
import { PersistenceService } from './persistence.service';

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

    // Auto-ensure scheduled trips exist for this active route on the requested date
    if (params.date) {
      await this.ensureTripsForRouteAndDate(route._id, params.date);
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
        operatingDays:
          route.operatingDays && route.operatingDays.length > 0
            ? route.operatingDays
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        departureTimes:
          route.departureTimes && route.departureTimes.length > 0
            ? route.departureTimes
            : ['06:00 AM', '08:30 AM', '01:30 PM'],
        baseFare: route.baseFare,
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

    const route = await Route.findById(data.route).populate('origin destination');
    if (!route) throw new Error('Route not found');

    const originCity = route.origin as any;
    const destCity = route.destination as any;

    const pickupLocation = (data.pickupLocation && data.pickupLocation.trim()) || route.pickupPoints?.[0]?.name || originCity?.terminalName || `${originCity?.name || 'Origin'} Central Terminal`;
    const dropOffLocation = (data.dropOffLocation && data.dropOffLocation.trim()) || route.dropOffPoints?.[0]?.name || destCity?.terminalName || `${destCity?.name || 'Destination'} Terminal`;

    // 1. Determine target dates
    const targetDates: string[] = [];
    if (data.recurringDays && Array.isArray(data.recurringDays) && data.recurringDays.length > 0) {
      const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const baseDate = data.departureDate ? new Date(data.departureDate + 'T00:00:00') : new Date();
      const repeatWeeks = Number(data.repeatWeeks) || 2;
      const totalDays = repeatWeeks * 7;

      for (let i = 0; i < totalDays; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dayName = dayOfWeekNames[d.getDay()];
        if (data.recurringDays.includes(dayName)) {
          targetDates.push(d.toISOString().split('T')[0]);
        }
      }
    } else if (data.departureDates && Array.isArray(data.departureDates) && data.departureDates.length > 0) {
      targetDates.push(...data.departureDates);
    } else if (data.departureDate) {
      targetDates.push(data.departureDate);
    }

    if (targetDates.length === 0) {
      throw new Error('No valid departure dates calculated.');
    }

    // 2. Determine target departure times
    const times: string[] =
      data.departureTimes && Array.isArray(data.departureTimes) && data.departureTimes.length > 0
        ? data.departureTimes
        : [data.departureTime];

    const createdTrips: any[] = [];

    for (const dDate of targetDates) {
      for (const dTime of times) {
        // Prevent duplicate trip for same route, vehicle, date and time
        const existing = await Trip.findOne({
          route: route._id,
          vehicle: vehicle._id,
          departureDate: dDate,
          departureTime: dTime,
          status: { $ne: TripStatus.CANCELLED },
        });

        if (existing) continue;

        // Compute estimated arrival if not explicitly supplied
        let estimatedArrival = data.estimatedArrival?.trim();
        if (!estimatedArrival) {
          try {
            const match = dTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
              let hours = parseInt(match[1], 10);
              const minutes = parseInt(match[2], 10);
              const ampm = match[3].toUpperCase();
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
              const totalMinutes = hours * 60 + minutes + Math.round((route.estimatedDurationHours || 4) * 60);
              const arrivalHour24 = Math.floor(totalMinutes / 60) % 24;
              const arrivalMin = totalMinutes % 60;
              const arrivalAmPm = arrivalHour24 >= 12 ? 'PM' : 'AM';
              let arrivalHour12 = arrivalHour24 % 12;
              if (arrivalHour12 === 0) arrivalHour12 = 12;
              estimatedArrival = `${arrivalHour12.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')} ${arrivalAmPm}`;
            }
          } catch {
            estimatedArrival = '12:00 PM';
          }
        }

        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        const tripCode = `ET-${dDate.replace(/-/g, '')}-${randomSuffix}`;

        const trip = await Trip.create({
          ...data,
          route: route._id,
          vehicle: vehicle._id,
          operator: data.operator || vehicle.operator,
          departureDate: dDate,
          departureTime: dTime,
          tripCode,
          pickupLocation,
          dropOffLocation,
          estimatedArrival: estimatedArrival || '12:00 PM',
          totalSeatsCount: vehicle.seatCapacity,
          availableSeatsCount: vehicle.seatCapacity,
          status: TripStatus.SCHEDULED,
          amenities: data.amenities && data.amenities.length > 0 ? data.amenities : vehicle.features,
        });

        await this.generateSeatsForTrip(trip._id.toString(), vehicle);
        createdTrips.push(trip);

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
      }
    }

    const lastTrip = createdTrips[createdTrips.length - 1];
    if (!lastTrip) {
      throw new Error('All trips in this schedule already exist.');
    }

    PersistenceService.queueSave();
    return await this.getTripById(lastTrip._id.toString());
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

    PersistenceService.queueSave();
    return updated;
  }

  static async getAllTrips(options: { operatorId?: string; date?: string; status?: string } = {}) {
    const filter: any = {};
    if (options.operatorId) filter.operator = options.operatorId;
    if (options.date) filter.departureDate = options.date;
    if (options.status && options.status !== 'ALL') filter.status = options.status;

    return await Trip.find(filter)
      .populate('operator', 'name legalName logoUrl')
      .populate('vehicle', 'plateNumber model vehicleModel vehicleType seatCapacity status features')
      .populate('driver', 'name phone')
      .populate({
        path: 'route',
        populate: ['origin', 'destination'],
      })
      .sort({ departureDate: -1, departureTime: -1, createdAt: -1 })
      .lean();
  }

  static async ensureTripsForRouteAndDate(routeId: any, dateStr: string) {
    try {
      const route = await Route.findById(routeId).populate('origin destination');
      if (!route || route.status !== 'ACTIVE') return;

      const existingCount = await Trip.countDocuments({
        route: route._id,
        departureDate: dateStr,
        status: { $in: [TripStatus.SCHEDULED, TripStatus.BOARDING] },
      });
      if (existingCount > 0) return;

      // Check operating days
      const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayName = dayOfWeekNames[dateObj.getDay()];

      const operatingDays = (route.operatingDays && route.operatingDays.length > 0)
        ? route.operatingDays
        : ['Daily', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      const isOperatingToday = operatingDays.includes('Daily') || operatingDays.includes(dayName);
      if (!isOperatingToday) {
        return;
      }

      const [operators, vehicles, driver] = await Promise.all([
        Operator.find({ status: 'ACTIVE' }),
        Vehicle.find({ status: 'ACTIVE' }),
        Driver.findOne({ status: 'ACTIVE' }),
      ]);

      const availableVehicles = vehicles.length > 0 ? vehicles : await Vehicle.find();
      if (!availableVehicles || availableVehicles.length === 0) return;

      const departureTimes = (route.departureTimes && route.departureTimes.length > 0)
        ? route.departureTimes
        : ['06:00 AM', '08:30 AM', '01:30 PM'];

      const originName = (route.origin as any)?.name || 'Central';
      const destName = (route.destination as any)?.name || 'Destination';
      const pickupLocation = route.pickupPoints?.[0]?.name || `${originName} Main Intercity Terminal`;
      const dropOffLocation = route.dropOffPoints?.[0]?.name || `${destName} Central Terminal`;

      const distance = route.distanceKm || 150;
      const calculatedFare = Math.max(120, Math.round(distance * 2.2));
      const baseFare = (route.baseFare && route.baseFare > 0) ? route.baseFare : calculatedFare;

      for (let i = 0; i < departureTimes.length; i++) {
        const timeStr = departureTimes[i];
        const vehicle = availableVehicles[i % availableVehicles.length];
        const operatorId = route.operator || vehicle.operator || (operators.length > 0 ? operators[i % operators.length]._id : undefined);

        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const tripCode = `ET-${dateStr.replace(/-/g, '')}-${(i + 1).toString().padStart(2, '0')}-${randomSuffix}`;

        try {
          const trip = await Trip.create({
            tripCode,
            route: route._id,
            operator: operatorId,
            vehicle: vehicle._id,
            driver: driver?._id,
            departureDate: dateStr,
            departureTime: timeStr,
            estimatedArrival: `~${route.estimatedDurationHours || 3} hrs travel`,
            fare: baseFare,
            serviceFee: 15,
            status: TripStatus.SCHEDULED,
            pickupLocation,
            dropOffLocation,
            totalSeatsCount: vehicle.seatCapacity || 44,
            availableSeatsCount: vehicle.seatCapacity || 44,
            amenities: vehicle.features || ['Air Conditioning', 'High-Speed Wi-Fi', 'USB Charging Port'],
            boardingNotes: 'Please arrive 30 minutes before departure with your digital QR ticket.',
          });

          await this.generateSeatsForTrip(trip._id.toString(), vehicle);
        } catch (err: any) {
          if (err.code !== 11000) {
            console.error('[TripService] Error auto-generating trip:', err);
          }
        }
      }
    } catch (err) {
      console.error('[TripService] ensureTripsForRouteAndDate error:', err);
    }
  }

  static async generateTripsForRouteSchedule(routeId: any, daysToSchedule = 14) {
    try {
      const route = await Route.findById(routeId).populate('origin destination');
      if (!route || route.status !== 'ACTIVE') return;

      const [operators, vehicles, driver] = await Promise.all([
        Operator.find({ status: 'ACTIVE' }),
        Vehicle.find({ status: 'ACTIVE' }),
        Driver.findOne({ status: 'ACTIVE' }),
      ]);

      const availableVehicles = vehicles.length > 0 ? vehicles : await Vehicle.find();
      if (!availableVehicles || availableVehicles.length === 0) return;

      const operatingDays = (route.operatingDays && route.operatingDays.length > 0)
        ? route.operatingDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      const departureTimes = (route.departureTimes && route.departureTimes.length > 0)
        ? route.departureTimes
        : ['06:00 AM', '08:30 AM', '01:30 PM'];

      const originName = (route.origin as any)?.name || 'Central';
      const destName = (route.destination as any)?.name || 'Destination';
      const pickupLocation = route.pickupPoints?.[0]?.name || `${originName} Main Intercity Terminal`;
      const dropOffLocation = route.dropOffPoints?.[0]?.name || `${destName} Central Terminal`;

      const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const isDaily = operatingDays.includes('Daily') || operatingDays.length === 7;
      const today = new Date();

      const distance = route.distanceKm || 150;
      const calculatedFare = Math.max(120, Math.round(distance * 2.2));
      const baseFare = (route.baseFare && route.baseFare > 0) ? route.baseFare : calculatedFare;

      for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        const dateStr = targetDate.toISOString().split('T')[0];
        const dayOfWeek = dayOfWeekNames[targetDate.getDay()];

        if (!isDaily && !operatingDays.includes(dayOfWeek)) {
          continue;
        }

        for (let tIndex = 0; tIndex < departureTimes.length; tIndex++) {
          const timeStr = departureTimes[tIndex];

          const exists = await Trip.findOne({
            route: route._id,
            departureDate: dateStr,
            departureTime: timeStr,
          });

          if (exists) continue;

          const vehicle = availableVehicles[tIndex % availableVehicles.length];
          const operatorId = route.operator || vehicle.operator || (operators.length > 0 ? operators[tIndex % operators.length]._id : undefined);

          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const tripCode = `ET-${dateStr.replace(/-/g, '')}-${(tIndex + 1).toString().padStart(2, '0')}-${randomSuffix}`;

          try {
            const trip = await Trip.create({
              tripCode,
              route: route._id,
              operator: operatorId,
              vehicle: vehicle._id,
              driver: driver?._id,
              departureDate: dateStr,
              departureTime: timeStr,
              estimatedArrival: `~${route.estimatedDurationHours || 3} hrs travel`,
              fare: baseFare,
              serviceFee: 15,
              status: TripStatus.SCHEDULED,
              pickupLocation,
              dropOffLocation,
              totalSeatsCount: vehicle.seatCapacity || 44,
              availableSeatsCount: vehicle.seatCapacity || 44,
              amenities: vehicle.features || ['Air Conditioning', 'High-Speed Wi-Fi', 'USB Charging Port'],
              boardingNotes: 'Please arrive 30 minutes before departure with your digital QR ticket.',
            });

            await this.generateSeatsForTrip(trip._id.toString(), vehicle);
          } catch (err: any) {
            if (err.code !== 11000) {
              console.error('[TripService] Schedule error:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('[TripService] generateTripsForRouteSchedule error:', err);
    }
  }
}
