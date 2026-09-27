import { Router } from 'express';
import { medicinesCollection, inventoryCollection, pharmaciesCollection } from '../config/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET /api/medicines (Catalogue search)
router.get('/', async (req, res) => {
  try {
    const { search, category, prescriptionRequired } = req.query;
    let list = await medicinesCollection.find();

    if (prescriptionRequired === 'true') {
      list = list.filter((m) => m.requiresPrescription === true);
    } else if (prescriptionRequired === 'false') {
      list = list.filter((m) => m.requiresPrescription === false);
    }

    if (category && typeof category === 'string') {
      list = list.filter((m) => m.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    return res.json({ medicines: list });
  } catch {
    return res.status(500).json({ message: 'Error retrieving medicines' });
  }
});

// GET /api/medicines/:id (Single medicine detail with availability)
router.get('/:id', async (req, res) => {
  try {
    const medicine = await medicinesCollection.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found in catalogue' });

    // Find pharmacies stocking this medicine
    const inventoryItems = await inventoryCollection.find({ medicineId: medicine._id, availability: true });
    const pharmacies = await pharmaciesCollection.find();
    const pMap = new Map(pharmacies.map((p) => [p._id, p]));

    const stockingPharmacies = inventoryItems.map((inv) => ({
      pharmacy: pMap.get(inv.pharmacyId),
      quantity: inv.quantity,
      price: inv.price,
    })).filter((sp) => sp.pharmacy && sp.pharmacy.verificationStatus === 'VERIFIED');

    return res.json({ medicine, stockingPharmacies });
  } catch {
    return res.status(500).json({ message: 'Error retrieving medicine detail' });
  }
});

// POST /api/medicines (Admin manages catalogue)
router.post('/', authenticate, requireRoles('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { name, genericName, category, description, requiresPrescription, safetyInformation, dosageForm } = req.body;
    if (!name || !genericName || !category) {
      return res.status(400).json({ message: 'Name, generic name, and category are required' });
    }

    const newMed = await medicinesCollection.insertOne({
      name,
      genericName,
      category,
      description: description || '',
      requiresPrescription: Boolean(requiresPrescription),
      safetyInformation: safetyInformation || 'Use only as directed.',
      dosageForm: dosageForm || 'Tablet',
      active: true,
    });

    await logAudit(req, 'CREATE_MEDICINE_CATALOGUE', 'MEDICINE', newMed._id);
    return res.status(201).json({ message: 'Medicine added to catalogue', medicine: newMed });
  } catch {
    return res.status(500).json({ message: 'Error creating medicine' });
  }
});

// GET /api/medicines/inventory/:pharmacyId
router.get('/inventory/:pharmacyId', async (req, res) => {
  try {
    const inventory = await inventoryCollection.find({ pharmacyId: req.params.pharmacyId });
    const meds = await medicinesCollection.find();
    const medMap = new Map(meds.map((m) => [m._id, m]));

    const result = inventory.map((inv) => ({
      ...inv,
      medicine: medMap.get(inv.medicineId),
    }));

    return res.json({ inventory: result });
  } catch {
    return res.status(500).json({ message: 'Error retrieving pharmacy inventory' });
  }
});

// POST /api/medicines/inventory (Pharmacist updates their stock)
router.post('/inventory', authenticate, requireRoles('PHARMACIST', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { pharmacyId, medicineId, quantity, price, availability } = req.body;
    if (!pharmacyId || !medicineId) {
      return res.status(400).json({ message: 'Pharmacy ID and Medicine ID are required' });
    }

    const existing = await inventoryCollection.findOne({ pharmacyId, medicineId });
    let record;
    if (existing) {
      record = await inventoryCollection.findByIdAndUpdate(existing._id, {
        quantity: Number(quantity),
        price: Number(price),
        availability: availability !== undefined ? availability : Number(quantity) > 0,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      record = await inventoryCollection.insertOne({
        pharmacyId,
        medicineId,
        quantity: Number(quantity),
        price: Number(price),
        availability: availability !== undefined ? availability : Number(quantity) > 0,
        lastUpdated: new Date().toISOString(),
      });
    }

    await logAudit(req, 'UPDATE_INVENTORY', 'INVENTORY', record._id, { pharmacyId, medicineId });
    return res.json({ message: 'Inventory updated successfully', record });
  } catch {
    return res.status(500).json({ message: 'Error updating inventory' });
  }
});

export default router;
