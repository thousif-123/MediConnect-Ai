import { Router } from 'express';
import {
  pharmacistsCollection,
  pharmaciesCollection,
  inventoryCollection,
  medicinesCollection,
  ordersCollection,
  prescriptionsCollection,
  usersCollection,
} from '../config/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Haversine formula distance calculation
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// GET /api/pharmacists (Public or verified directory)
router.get('/', async (req, res) => {
  try {
    const { verifiedOnly } = req.query;
    let list = await pharmacistsCollection.find();
    if (verifiedOnly === 'true') {
      list = list.filter((p) => p.verificationStatus === 'VERIFIED');
    }

    const users = await usersCollection.find();
    const pharmacies = await pharmaciesCollection.find();
    const uMap = new Map(users.map((u) => [u._id, u]));
    const pMap = new Map(pharmacies.map((p) => [p._id, p]));

    const result = list.map((p) => {
      const u = uMap.get(p.userId);
      const ph = p.pharmacyId ? pMap.get(p.pharmacyId) : undefined;
      return {
        _id: p._id,
        name: u?.name || 'Verified Pharmacist',
        qualification: p.qualification,
        registrationNumber: p.registrationNumber,
        phone: p.phone || ph?.phone || '',
        availability: p.availability,
        verificationStatus: p.verificationStatus,
        pharmacyId: p.pharmacyId,
        pharmacyName: ph?.name,
        pharmacyAddress: ph?.address,
      };
    });

    return res.json({ pharmacists: result });
  } catch {
    return res.status(500).json({ message: 'Error retrieving pharmacists' });
  }
});

// GET /api/pharmacists/nearby
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userLat = lat ? parseFloat(lat as string) : 37.7749;
    const userLng = lng ? parseFloat(lng as string) : -122.4194;

    const verifiedPharmacists = await pharmacistsCollection.find({ verificationStatus: 'VERIFIED' });
    const pharmacies = await pharmaciesCollection.find();
    const users = await usersCollection.find();

    const pMap = new Map(pharmacies.map((p) => [p._id, p]));
    const uMap = new Map(users.map((u) => [u._id, u]));

    const enriched = verifiedPharmacists.map((ph) => {
      const u = uMap.get(ph.userId);
      const pharmacy = ph.pharmacyId ? pMap.get(ph.pharmacyId) : undefined;
      const distanceKm = pharmacy
        ? calculateDistanceKm(userLat, userLng, pharmacy.latitude, pharmacy.longitude)
        : 1.2;

      return {
        _id: ph._id,
        userId: ph.userId,
        name: u?.name || 'Dr. Marcus Vance, PharmD',
        qualification: ph.qualification,
        registrationNumber: ph.registrationNumber,
        phone: ph.phone || pharmacy?.phone || '+1 (555) 345-6789',
        availability: ph.availability || 'Monday - Friday: 9am - 6pm',
        verificationStatus: ph.verificationStatus,
        pharmacyId: ph.pharmacyId,
        pharmacyName: pharmacy?.name || 'Community Care Pharmacy',
        pharmacyAddress: pharmacy?.address || 'Medical Corridor',
        distanceKm,
      };
    });

    enriched.sort((a, b) => a.distanceKm - b.distanceKm);
    return res.json({ pharmacists: enriched });
  } catch {
    return res.status(500).json({ message: 'Error retrieving nearby pharmacists' });
  }
});

// GET /api/pharmacists/me
router.get('/me', authenticate, requireRoles('PHARMACIST'), async (req: AuthRequest, res) => {
  try {
    let profile = await pharmacistsCollection.findOne({ userId: req.user!._id });
    if (!profile) {
      profile = await pharmacistsCollection.insertOne({
        userId: req.user!._id,
        registrationNumber: 'PENDING-REG',
        qualification: 'Registered Pharmacist',
        phone: '',
        availability: 'Mon-Fri: 9:00 AM - 5:00 PM',
        verificationStatus: 'PENDING',
      });
    }

    let pharmacy = null;
    if (profile.pharmacyId) {
      pharmacy = await pharmaciesCollection.findById(profile.pharmacyId);
    }

    return res.json({ profile, pharmacy });
  } catch {
    return res.status(500).json({ message: 'Error retrieving pharmacist profile' });
  }
});

// PUT /api/pharmacists/profile
router.put('/profile', authenticate, requireRoles('PHARMACIST'), async (req: AuthRequest, res) => {
  try {
    const { registrationNumber, qualification, phone, availability, pharmacyId } = req.body;
    let profile = await pharmacistsCollection.findOne({ userId: req.user!._id });
    
    if (profile) {
      profile = await pharmacistsCollection.findByIdAndUpdate(profile._id, {
        registrationNumber,
        qualification,
        phone,
        availability,
        pharmacyId,
      });
    } else {
      profile = await pharmacistsCollection.insertOne({
        userId: req.user!._id,
        registrationNumber,
        qualification,
        phone,
        availability,
        pharmacyId,
        verificationStatus: 'PENDING',
      });
    }

    await logAudit(req, 'UPDATE_PHARMACIST_PROFILE', 'PHARMACIST', profile._id);
    return res.json({ message: 'Profile updated successfully', profile });
  } catch {
    return res.status(500).json({ message: 'Error updating pharmacist profile' });
  }
});

// GET /api/pharmacists/orders
router.get('/orders', authenticate, requireRoles('PHARMACIST'), async (req: AuthRequest, res) => {
  try {
    const profile = await pharmacistsCollection.findOne({ userId: req.user!._id });
    if (!profile || !profile.pharmacyId) {
      return res.json({ orders: [] });
    }

    const orders = await ordersCollection.find({ pharmacyId: profile.pharmacyId });
    const allRx = await prescriptionsCollection.find();
    const rxMap = new Map(allRx.map((r) => [r._id, r]));

    const enriched = orders.map((o) => ({
      ...o,
      prescription: o.prescriptionId ? rxMap.get(o.prescriptionId) : undefined,
    }));

    return res.json({ orders: enriched });
  } catch {
    return res.status(500).json({ message: 'Error retrieving pharmacy orders' });
  }
});

// PUT /api/pharmacists/orders/:id/status
router.put('/orders/:id/status', authenticate, requireRoles('PHARMACIST', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { status, pharmacistNotes, pickupTimeEstimate } = req.body;
    const order = await ordersCollection.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const updated = await ordersCollection.findByIdAndUpdate(order._id, {
      status,
      pharmacistNotes: pharmacistNotes ?? order.pharmacistNotes,
      pickupTimeEstimate: pickupTimeEstimate ?? order.pickupTimeEstimate,
      verifiedBy: req.user!._id,
    });

    await logAudit(req, 'VERIFY_ORDER_STATUS', 'ORDER', order._id, { newStatus: status });
    return res.json({ message: 'Order status updated', order: updated });
  } catch {
    return res.status(500).json({ message: 'Error updating order status' });
  }
});

export default router;
