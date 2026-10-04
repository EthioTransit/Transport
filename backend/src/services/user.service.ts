import { User, IUser } from '../models/User';
import { AuditService } from './audit.service';
import { UserRole } from '../types';

export class UserService {
  static async getAllUsers(params: { search?: string; role?: string } = {}) {
    const query: Record<string, any> = {};

    if (params.role && params.role !== 'ALL') {
      query.role = params.role;
    }

    if (params.search && params.search.trim() !== '') {
      const regex = new RegExp(params.search.trim(), 'i');
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const users = await User.find(query)
      .populate('operatorId', 'name licenseNumber')
      .sort({ createdAt: -1 })
      .select('-passwordHash')
      .lean();

    return users;
  }

  static async getUserById(id: string) {
    const user = await User.findById(id)
      .populate('operatorId', 'name licenseNumber')
      .select('-passwordHash')
      .lean();
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateUser(
    id: string,
    updates: Partial<IUser>,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    const oldUser = await User.findById(id).select('-passwordHash').lean();
    if (!oldUser) throw new Error('User not found');

    // Filter allowed fields to prevent arbitrary overwrites
    const allowedFields = ['firstName', 'lastName', 'phone', 'role', 'operatorId', 'isActive'];
    const sanitizedUpdates: Record<string, any> = {};

    for (const key of allowedFields) {
      if ((updates as any)[key] !== undefined) {
        // If operatorId is empty string or null, set to null/undefined
        if (key === 'operatorId' && !(updates as any)[key]) {
          sanitizedUpdates[key] = null;
        } else {
          sanitizedUpdates[key] = (updates as any)[key];
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, sanitizedUpdates, { new: true })
      .populate('operatorId', 'name licenseNumber')
      .select('-passwordHash')
      .lean();

    if (userContext) {
      await AuditService.log({
        user: userContext.id,
        userEmail: userContext.email,
        role: userContext.role,
        action: 'UPDATE_USER',
        resource: 'User',
        resourceId: id,
        oldValue: oldUser,
        newValue: updatedUser,
      });
    }

    return updatedUser;
  }

  static async toggleStatus(
    id: string,
    isActive: boolean,
    userContext?: { id: string; email: string; role: UserRole }
  ) {
    return this.updateUser(id, { isActive } as any, userContext);
  }
}
