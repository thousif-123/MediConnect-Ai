import { Router } from 'express';
import { hospitalsCollection, doctorsCollection } from '../config/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Haversine helper
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

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const { search, department, lat, lng } = req.query;
    let list = await hospitalsCollection.find();

    if (department && typeof department === 'string') {
      list = list.filter((h) => h.departments?.some((d: string) => d.toLowerCase().includes((department as string).toLowerCase())));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q));
    }

    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      list = list.map((h) => ({
        ...h,
        distanceKm: calculateDistanceKm(userLat, userLng, h.latitude, h.longitude),
      }));
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

    return res.json({ hospitals: list });
  } catch {
    return res.status(500).json({ message: 'Error retrieving hospitals' });
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res) => {
  try {
    const hospital = await hospitalsCollection.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const doctors = await doctorsCollection.find({ hospitalId: hospital._id });
    return res.json({ hospital, doctors });
  } catch {
    return res.status(500).json({ message: 'Error retrieving hospital details' });
  }
});

// GET /api/hospitals/doctors/all
router.get('/doctors/all', async (req, res) => {
  try {
    const { department, search } = req.query;
    let doctors = await doctorsCollection.find();

    if (department && typeof department === 'string') {
      doctors = doctors.filter((d) => d.department.toLowerCase() === department.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      doctors = doctors.filter((d) => d.name.toLowerCase().includes(q) || d.department.toLowerCase().includes(q));
    }

    return res.json({ doctors });
  } catch {
    return res.status(500).json({ message: 'Error retrieving doctors' });
  }
});

export default router;
