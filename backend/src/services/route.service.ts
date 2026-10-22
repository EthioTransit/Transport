import { Route, IRoute } from '../models/Route';
import { City } from '../models/City';
import { AuditService } from './audit.service';
import { UserRole } from '../types';
import { TripService } from './trip.service';

export class RouteService {
  private static formatRoute(route: any) {
    if (!route) return route;
    return {
      ...route,
      operatingDays:
        route.operatingDays && route.operatingDays.length > 0
          ? route.operatingDays
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      departureTimes:
        route.departureTimes && route.departureTimes.length > 0
          ? route.departureTimes
          : ['06:00 AM', '08:30 AM', '01:30 PM'],
    };
  }

  static async getAllRoutes(options: { activeOnly?: boolean } = {}) {
    const filter: any = {};
    if (options.activeOnly) {
      filter.status = 'ACTIVE';
    }

    const routes = await Route.find(filter)
      .populate('origin', 'name amharicName code region')
      .populate('destination', 'name amharicName code region')
      .populate('operator', 'name legalName rating logoUrl')
      .sort({ popularityScore: -1 })
      .lean();

    return routes.map((r) => this.formatRoute(r));
  }

  static async getPopularRoutes(limit = 6) {
    const routes = await Route.find({ status: 'ACTIVE' })
      .populate('origin', 'name amharicName code region')
      .populate('destination', 'name amharicName code region')
      .populate('operator', 'name legalName rating logoUrl')
      .sort({ popularityScore: -1 })
      .limit(limit)
      .lean();

    return routes.map((r) => this.formatRoute(r));
  }

  static async getRouteById(id: string) {
    const route = await Route.findById(id)
      .populate('origin')
      .populate('destination')
      .populate('operator', 'name legalName rating logoUrl')
      .lean();
    if (!route) throw new Error('Route not found');
    return this.formatRoute(route);
  }

  static async findRouteByCities(originCityId: string, destCityId: string) {
    const route = await Route.findOne({
      origin: originCityId,
      destination: destCityId,
      status: 'ACTIVE',
    })
      .populate('origin destination operator')
      .lean();
    return route ? this.formatRoute(route) : null;
  }

  static async createRoute(
    data: {
      origin: string;
      destination: string;
      distanceKm: number;
      estimatedDurationHours: number;
      pickupPoints?: Array<{ name: string; locationNote?: string; timeOffsetMinutes: number }>;
      dropOffPoints?: Array<{ name: string; locationNote?: string }>;
      status?: 'ACTIVE' | 'INACTIVE';
      popularityScore?: number;
      operatingDays?: string[];
      departureTimes?: string[];
      baseFare?: number;
      operator?: string;
      autoScheduleTrips?: boolean;
    },
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    if (data.origin === data.destination) {
      throw new Error('Origin and destination cities cannot be the same.');
    }

    const [originCity, destCity] = await Promise.all([
      City.findById(data.origin),
      City.findById(data.destination),
    ]);

    if (!originCity || !destCity) {
      throw new Error('Both origin and destination cities must exist in the database.');
    }

    const existing = await Route.findOne({
      origin: data.origin,
      destination: data.destination,
    });

    if (existing) {
      throw new Error(`A route from ${originCity.name} to ${destCity.name} already exists.`);
    }

    const route = await Route.create({
      ...data,
      pickupPoints: data.pickupPoints || [{ name: `${originCity.name} Central Terminal`, timeOffsetMinutes: 0 }],
      dropOffPoints: data.dropOffPoints || [{ name: `${destCity.name} Main Bus Station` }],
      status: data.status || 'ACTIVE',
      popularityScore: data.popularityScore !== undefined ? data.popularityScore : 15,
      operatingDays: data.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      departureTimes: data.departureTimes || ['06:00 AM', '08:30 AM', '01:30 PM'],
      baseFare: data.baseFare,
      operator: data.operator || undefined,
    });

    // Auto-generate scheduled trips for this route if active
    if (route.status === 'ACTIVE' && data.autoScheduleTrips !== false) {
      try {
        await TripService.generateTripsForRouteSchedule(route._id, 14);
      } catch (scheduleErr) {
        console.error('[RouteService] Failed to schedule trips for new route:', scheduleErr);
      }
    }

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'ADMIN_CREATED_ROUTE',
        resource: 'Route',
        resourceId: route._id.toString(),
        newValue: route.toObject(),
      });
    }

    return await Route.findById(route._id).populate('origin destination operator').lean();
  }

  static async updateRoute(
    id: string,
    updates: Partial<IRoute> & { autoScheduleTrips?: boolean },
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const oldRoute = await Route.findById(id);
    if (!oldRoute) throw new Error('Route not found');

    const updated = await Route.findByIdAndUpdate(id, updates, { new: true })
      .populate('origin destination operator')
      .lean();

    if (updated && updated.status === 'ACTIVE' && updates.autoScheduleTrips !== false) {
      try {
        await TripService.generateTripsForRouteSchedule(updated._id, 14);
      } catch (scheduleErr) {
        console.error('[RouteService] Failed to update trips for route:', scheduleErr);
      }
    }

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'ADMIN_UPDATED_ROUTE',
        resource: 'Route',
        resourceId: id,
        oldValue: oldRoute.toObject(),
        newValue: updated,
      });
    }

    return updated;
  }
}
