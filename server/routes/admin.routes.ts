import { Router } from 'express';
import {
  usersCollection,
  pharmacistsCollection,
  pharmaciesCollection,
  doctorsCollection,
  hospitalsCollection,
  ordersCollection,
  appointmentsCollection,
  medicinesCollection,
  auditLogsCollection,
} from '../config/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Enforce ADMIN role across all admin sub-routes
router.use(authenticate, requireRoles('ADMIN'));

// GET /api/admin/metrics
router.get('/metrics', async (_req, res) => {
  try {
    const userCount = await usersCollection.countDocuments();
    const pharmacistCount = await pharmacistsCollection.countDocuments();
    const pendingPharmacists = await pharmacistsCollection.countDocuments({ verificationStatus: 'PENDING' });
    const pharmacyCount = await pharmaciesCollection.countDocuments();
    const pendingPharmacies = await pharmaciesCollection.countDocuments({ verificationStatus: 'PENDING' });
    const doctorCount = await doctorsCollection.countDocuments();
    const hospitalCount = await hospitalsCollection.countDocuments();
    const orderCount = await ordersCollection.countDocuments();
    const appointmentCount = await appointmentsCollection.countDocuments();
    const medicineCount = await medicinesCollection.countDocuments();

    return res.json({
      metrics: {
        users: userCount,
        pharmacists: pharmacistCount,
        pendingPharmacists,
        pharmacies: pharmacyCount,
        pendingPharmacies,
        doctors: doctorCount,
        hospitals: hospitalCount,
        orders: orderCount,
        appointments: appointmentCount,
        medicines: medicineCount,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Error retrieving system metrics' });
  }
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  try {
    const list = await usersCollection.find();
    const safeUsers = list.map(({ password, ...u }) => u);
    return res.json({ users: safeUsers });
  } catch {
    return res.status(500).json({ message: 'Error retrieving users' });
  }
});

// PUT /api/admin/users/:id/status (Suspend / Activate)
router.put('/users/:id/status', async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const user = await usersCollection.findByIdAndUpdate(req.params.id, { status });
    await logAudit(req, 'UPDATE_USER_STATUS', 'USER', req.params.id, { status });
    return res.json({ message: 'User status updated', user });
  } catch {
    return res.status(500).json({ message: 'Error updating user status' });
  }
});

// GET /api/admin/pharmacists
router.get('/pharmacists', async (_req, res) => {
  try {
    const pharmacists = await pharmacistsCollection.find();
    const users = await usersCollection.find();
    const uMap = new Map(users.map((u) => [u._id, u]));

    const enriched = pharmacists.map((p) => ({
      ...p,
      user: uMap.get(p.userId) ? { name: uMap.get(p.userId).name, email: uMap.get(p.userId).email } : undefined,
    }));

    return res.json({ pharmacists: enriched });
  } catch {
    return res.status(500).json({ message: 'Error retrieving pharmacists' });
  }
});

// PUT /api/admin/pharmacists/:id/verify
router.put('/pharmacists/:id/verify', async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // 'VERIFIED' | 'REJECTED'
    const pharmacist = await pharmacistsCollection.findByIdAndUpdate(req.params.id, {
      verificationStatus: status,
    });
    await logAudit(req, 'VERIFY_PHARMACIST', 'PHARMACIST', req.params.id, { status });
    return res.json({ message: `Pharmacist status updated to ${status}`, pharmacist });
  } catch {
    return res.status(500).json({ message: 'Error updating pharmacist status' });
  }
});

// PUT /api/admin/pharmacies/:id/verify
router.put('/pharmacies/:id/verify', async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const pharmacy = await pharmaciesCollection.findByIdAndUpdate(req.params.id, {
      verificationStatus: status,
    });
    await logAudit(req, 'VERIFY_PHARMACY', 'PHARMACY', req.params.id, { status });
    return res.json({ message: `Pharmacy status updated to ${status}`, pharmacy });
  } catch {
    return res.status(500).json({ message: 'Error updating pharmacy status' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (_req, res) => {
  try {
    const logs = await auditLogsCollection.find();
    // Sort descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json({ auditLogs: logs.slice(0, 100) });
  } catch {
    return res.status(500).json({ message: 'Error retrieving audit logs' });
  }
});

export default router;
