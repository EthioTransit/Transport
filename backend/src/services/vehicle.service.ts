import { Vehicle, IVehicle } from '../models/Vehicle';
import { AuditService } from './audit.service';
import { UserRole } from '../types';

export class VehicleService {
  static async getVehicles(options: { operatorId?: string; activeOnly?: boolean; status?: string } = {}) {
    const filter: any = {};
    if (options.operatorId) {
      filter.operator = options.operatorId;
    }
    if (options.activeOnly) {
      filter.status = 'ACTIVE';
    } else if (options.status) {
      filter.status = options.status;
    }

    return await Vehicle.find(filter).populate('operator', 'name legalName').sort({ createdAt: -1 }).lean();
  }

  static async getVehicleById(id: string) {
    const vehicle = await Vehicle.findById(id).populate('operator').lean();
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  static async createVehicle(
    data: any,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const plateNumber = data.plateNumber.trim().toUpperCase();
    const existing = await Vehicle.findOne({ plateNumber });
    if (existing) {
      throw new Error(`A vehicle with plate number ${plateNumber} already exists in the fleet database.`);
    }

    const capacity = Number(data.seatCapacity) || 49;
    const layoutType = data.seatLayout?.layoutType || (data.vehicleType === 'Minibus' ? 'minibus' : '2x2');
    const columns = data.seatLayout?.columns || (layoutType === '2x1' || layoutType === '1x2' ? 3 : 4);
    const rows = data.seatLayout?.rows || Math.ceil(capacity / columns);
    const aislePosition = data.seatLayout?.aislePosition || (layoutType === '2x1' ? [2] : layoutType === '1x2' ? [1] : [2]);

    const seatLayout = {
      layoutType,
      rows,
      columns,
      aislePosition,
      blockedSeats: data.seatLayout?.blockedSeats || [],
    };

    const vehicle = await Vehicle.create({
      ...data,
      plateNumber,
      seatCapacity: capacity,
      seatLayout,
      features: data.features && data.features.length > 0 ? data.features : ['AC', 'USB Charging', 'Reclining Seats'],
      status: data.status || 'ACTIVE',
    });

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'CREATED_VEHICLE',
        resource: 'Vehicle',
        resourceId: vehicle._id.toString(),
        newValue: vehicle.toObject(),
      });
    }

    return await Vehicle.findById(vehicle._id).populate('operator').lean();
  }

  static async updateVehicle(
    id: string,
    updates: Partial<IVehicle>,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const old = await Vehicle.findById(id);
    if (!old) throw new Error('Vehicle not found');

    if (updates.plateNumber) {
      updates.plateNumber = updates.plateNumber.trim().toUpperCase();
      const existing = await Vehicle.findOne({ plateNumber: updates.plateNumber, _id: { $ne: id } });
      if (existing) {
        throw new Error(`A vehicle with plate number ${updates.plateNumber} already exists.`);
      }
    }

    const updated = await Vehicle.findByIdAndUpdate(id, updates, { new: true }).populate('operator').lean();

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: updates.status && updates.status !== old.status
          ? (updates.status === 'ACTIVE' ? 'ACTIVATED_VEHICLE' : 'DEACTIVATED_VEHICLE')
          : 'UPDATED_VEHICLE',
        resource: 'Vehicle',
        resourceId: id,
        oldValue: old.toObject(),
        newValue: updated,
      });
    }

    return updated;
  }

  static async updateVehicleStatus(
    id: string,
    status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    return this.updateVehicle(id, { status } as any, userContext);
  }
}
