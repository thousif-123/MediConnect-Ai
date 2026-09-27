import { auditLogsCollection } from '../config/db.js';
import { AuthRequest } from './auth.js';

export const logAudit = async (
  req: AuthRequest,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any
) => {
  try {
    await auditLogsCollection.insertOne({
      userId: req.user?._id || 'ANONYMOUS',
      userName: req.user?.name || 'Anonymous User',
      role: req.user?.role || 'PUBLIC',
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};
