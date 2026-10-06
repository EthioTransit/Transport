import { Route, IRoute } from '../models/Route';
import { City } from '../models/City';
import { AuditService } from './audit.service';
import { UserRole } from '../types';

export class RouteService {
  static async getAllRoutes(options: { activeOnly?: boolean } = {}) {
    const filter: any = {};
    if (options.activeOnly) {
      filter.status = 'ACTIVE';
    }

    return await Route.find(filter)
      .populate('origin', 'name amharicName code region')
      .populate('destination', 'name amharicName code region')
      .sort({ popularityScore: -1 })
      .lean();
  }

  static async getPopularRoutes(limit = 6) {
    return await Route.find({ status: 'ACTIVE' })
      .populate('origin', 'name amharicName code region')
      .populate('destination', 'name amharicName code region')
      .sort({ popularityScore: -1 })
      .limit(limit)
      .lean();
  }

  static async getRouteById(id: string) {
    const route = await Route.findById(id)
      .populate('origin')
      .populate('destination')
      .lean();
    if (!route) throw new Error('Route not found');
    return route;
  }

  static async findRouteByCities(originCityId: string, destCityId: string) {
    return await Route.findOne({
      origin: originCityId,
      destination: destCityId,
      status: 'ACTIVE',
    })
      .populate('origin destination')
      .lean();
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
    });

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

    return await Route.findById(route._id).populate('origin destination').lean();
  }

  static async updateRoute(
    id: string,
    updates: Partial<IRoute>,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const oldRoute = await Route.findById(id);
    if (!oldRoute) throw new Error('Route not found');

    const updated = await Route.findByIdAndUpdate(id, updates, { new: true })
      .populate('origin destination')
      .lean();

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
