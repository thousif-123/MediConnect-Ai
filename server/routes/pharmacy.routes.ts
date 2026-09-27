import { Router } from 'express';
import {
  pharmaciesCollection,
  inventoryCollection,
  medicinesCollection,
  pharmacistsCollection,
} from '../config/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Haversine formula distance calculation
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
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

// GET /api/pharmacies & /api/pharmacies/nearby
const getPharmaciesHandler = async (req: any, res: any) => {
  try {
    const { search, lat, lng, verifiedOnly } = req.query;
    let list = await pharmaciesCollection.find();

    if (verifiedOnly === 'true') {
      list = list.filter((p) => p.verificationStatus === 'VERIFIED');
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.licenseNumber?.toLowerCase().includes(q)
      );
    }

    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      list = list.map((p) => ({
        ...p,
        distanceKm: calculateDistanceKm(userLat, userLng, p.latitude, p.longitude),
      }));
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return res.json({ pharmacies: list });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving pharmacies' });
  }
};

router.get('/', getPharmaciesHandler);
router.get('/nearby', getPharmaciesHandler);

// GET /api/pharmacies/:id
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await pharmaciesCollection.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    // Populate inventory
    const rawInv = await inventoryCollection.find({ pharmacyId: pharmacy._id });
    const allMeds = await medicinesCollection.find();
    const medMap = new Map(allMeds.map((m) => [m._id, m]));

    const inventory = rawInv.map((item) => ({
      ...item,
      medicine: medMap.get(item.medicineId),
    }));

    return res.json({ pharmacy, inventory });
  } catch {
    return res.status(500).json({ message: 'Error retrieving pharmacy details' });
  }
});

// POST /api/pharmacies (Pharmacist or Admin registers/creates pharmacy)
router.post('/', authenticate, requireRoles('PHARMACIST', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { name, address, phone, licenseNumber, latitude, longitude, openingHours } = req.body;
    if (!name || !address || !phone || !licenseNumber) {
      return res.status(400).json({ message: 'Missing required pharmacy fields.' });
    }

    const newPharmacy = await pharmaciesCollection.insertOne({
      name,
      address,
      phone,
      licenseNumber,
      latitude: Number(latitude) || 37.7749,
      longitude: Number(longitude) || -122.4194,
      openingHours: openingHours || 'Mon-Fri: 9:00 AM - 6:00 PM',
      verificationStatus: req.user?.role === 'ADMIN' ? 'VERIFIED' : 'PENDING',
      pharmacistId: req.user?._id,
      pharmacistName: req.user?.name,
    });

    // Link to pharmacist record if available
    const pharmacistRec = await pharmacistsCollection.findOne({ userId: req.user!._id });
    if (pharmacistRec) {
      await pharmacistsCollection.findByIdAndUpdate(pharmacistRec._id, {
        pharmacyId: newPharmacy._id,
      });
    }

    await logAudit(req, 'CREATE_PHARMACY', 'PHARMACY', newPharmacy._id);
    return res.status(201).json({ message: 'Pharmacy registered successfully', pharmacy: newPharmacy });
  } catch {
    return res.status(500).json({ message: 'Error registering pharmacy' });
  }
});

export default router;
