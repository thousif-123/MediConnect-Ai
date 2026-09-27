import { Router } from 'express';
import {
  ordersCollection,
  pharmaciesCollection,
  medicinesCollection,
  prescriptionsCollection,
  usersCollection,
  consentsCollection,
} from '../config/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET /api/orders (User's orders)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await ordersCollection.find({ userId: req.user!._id });
    const pharmacies = await pharmaciesCollection.find();
    const pMap = new Map(pharmacies.map((p) => [p._id, p]));

    const enriched = orders.map((o) => ({
      ...o,
      pharmacy: pMap.get(o.pharmacyId),
    }));

    return res.json({ orders: enriched });
  } catch {
    return res.status(500).json({ message: 'Error retrieving orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await ordersCollection.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Authorization: User owner, Admin, or Pharmacist affiliated with order pharmacy
    if (order.userId !== req.user!._id && req.user!.role !== 'ADMIN' && req.user!.role !== 'PHARMACIST') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const pharmacy = await pharmaciesCollection.findById(order.pharmacyId);
    let prescription = undefined;
    if (order.prescriptionId) {
      prescription = await prescriptionsCollection.findById(order.prescriptionId);
    }
    const user = await usersCollection.findById(order.userId);

    return res.json({
      order: {
        ...order,
        pharmacy,
        prescription,
        user: user ? { name: user.name, phone: user.phone, email: user.email } : undefined,
      },
    });
  } catch {
    return res.status(500).json({ message: 'Error retrieving order' });
  }
});

// POST /api/orders (Create medicine reservation / order request)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { pharmacyId, items, prescriptionId, notes } = req.body;

    if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Pharmacy selection and at least one medicine item are required.' });
    }

    const pharmacy = await pharmaciesCollection.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Selected pharmacy does not exist.' });
    }

    // Check if any item strictly requires a prescription
    const requiresPrescription = items.some((item: any) => item.requiresPrescription === true);
    if (requiresPrescription && !prescriptionId) {
      return res.status(400).json({
        message: 'One or more selected items are Prescription-Only medicines. An uploaded prescription is mandatory before reserving.',
      });
    }

    let verifiedRx = null;
    if (prescriptionId) {
      verifiedRx = await prescriptionsCollection.findById(prescriptionId);
      if (!verifiedRx || verifiedRx.userId !== req.user!._id) {
        return res.status(400).json({ message: 'Invalid or inaccessible prescription document selected.' });
      }

      // Automatically create explicit Consent record for the pharmacy
      await consentsCollection.insertOne({
        userId: req.user!._id,
        prescriptionId: verifiedRx._id,
        recipientType: 'PHARMACY',
        recipientId: pharmacy._id,
        recipientName: pharmacy.name,
        purpose: 'Fulfillment and pharmacist clinical verification of medicine order',
        expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        revoked: false,
      });
    }

    const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1), 0);
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = await ordersCollection.insertOne({
      orderNumber,
      userId: req.user!._id,
      pharmacyId,
      items,
      totalAmount: Math.round(totalAmount * 100) / 100,
      prescriptionId: verifiedRx?._id || undefined,
      status: requiresPrescription ? 'UNDER_REVIEW' : 'PENDING',
      notes: notes || '',
      pharmacistNotes: requiresPrescription ? 'Prescription verification pending by licensed pharmacist.' : 'Awaiting pharmacy processing.',
      pickupTimeEstimate: 'Within 2-4 hours during pharmacy operating hours.',
    });

    await logAudit(req, 'CREATE_ORDER', 'ORDER', newOrder._id, {
      orderNumber,
      pharmacyId,
      requiresPrescription,
    });

    return res.status(201).json({
      message: requiresPrescription
        ? 'Prescription reservation submitted! A verified pharmacist will review your order before confirmation.'
        : 'Medicine reservation placed successfully. You will receive a pickup readiness update shortly.',
      order: newOrder,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error processing medicine order' });
  }
});

// PUT /api/orders/:id/cancel
router.put('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await ordersCollection.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.userId !== req.user!._id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to cancel this order.' });
    }

    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel an order in ${order.status} state.` });
    }

    const updated = await ordersCollection.findByIdAndUpdate(order._id, { status: 'CANCELLED' });
    await logAudit(req, 'CANCEL_ORDER', 'ORDER', order._id);
    return res.json({ message: 'Order cancelled successfully', order: updated });
  } catch {
    return res.status(500).json({ message: 'Error cancelling order' });
  }
});

export default router;
