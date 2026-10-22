import { AuditLog } from '../models/AuditLog';
import { UserRole } from '../types';

export class AuditService {
  static async log(params: {
    user?: string;
    userEmail?: string;
    role: UserRole | 'SYSTEM';
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await AuditLog.create({
        user: params.user,
        userEmail: params.userEmail,
        role: params.role,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        oldValue: params.oldValue,
        newValue: params.newValue,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        timestamp: new Date(),
      });
      // Automatically queue persistent snapshot to disk
      const { PersistenceService } = await import('./persistence.service');
      PersistenceService.queueSave();
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
    }
  }

  static async getLogs(limit = 100, page = 1) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(),
    ]);
    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }
}
