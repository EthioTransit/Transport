import { City, ICity } from '../models/City';
import { Route } from '../models/Route';
import { AuditService } from './audit.service';
import { UserRole } from '../types';

export class CityService {
  static async searchCities(query?: string, includeInactive = false) {
    const filter: any = {};
    if (!includeInactive) {
      filter.status = 'ACTIVE';
    }

    if (query && query.trim()) {
      const regex = new RegExp(query.trim(), 'i');
      filter.$or = [
        { name: regex },
        { amharicName: regex },
        { region: regex },
        { code: regex },
      ];
    }

    return await City.find(filter).sort({ name: 1 }).lean();
  }

  static async getCityById(id: string) {
    const city = await City.findById(id).lean();
    if (!city) throw new Error('City not found');
    return city;
  }

  static async createCity(
    data: {
      name: string;
      amharicName?: string;
      region: string;
      country?: string;
      code: string;
      status?: 'ACTIVE' | 'INACTIVE';
      terminalName?: string;
      image?: string;
    },
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const existing = await City.findOne({
      $or: [{ name: new RegExp(`^${data.name}$`, 'i') }, { code: data.code.toUpperCase() }],
    });
    if (existing) {
      throw new Error(`A city with name "${data.name}" or code "${data.code}" already exists.`);
    }

    const city = await City.create({
      ...data,
      code: data.code.toUpperCase(),
      status: data.status || 'ACTIVE',
    });

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'ADMIN_CREATED_CITY',
        resource: 'City',
        resourceId: city._id.toString(),
        newValue: city.toObject(),
      });
    }

    return city;
  }

  static async updateCity(
    id: string,
    updates: Partial<ICity>,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const oldCity = await City.findById(id);
    if (!oldCity) throw new Error('City not found');

    const updated = await City.findByIdAndUpdate(id, updates, { new: true });

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'ADMIN_UPDATED_CITY',
        resource: 'City',
        resourceId: id,
        oldValue: oldCity.toObject(),
        newValue: updated?.toObject(),
      });
    }

    return updated;
  }

  static async getCityRoutes(cityId: string) {
    return await Route.find({
      $or: [{ origin: cityId }, { destination: cityId }],
    })
      .populate('origin destination')
      .lean();
  }
}
