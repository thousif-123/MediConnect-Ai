import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import {
  prescriptionsCollection,
  consentsCollection,
  ordersCollection,
  usersCollection,
  pharmacistsCollection,
} from '../config/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadPrescription, PRESCRIPTION_DIR } from '../middleware/upload.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET /api/prescriptions (My prescriptions)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const list = await prescriptionsCollection.find({ userId: req.user!._id });
    return res.json({ prescriptions: list });
  } catch {
    return res.status(500).json({ message: 'Error retrieving prescriptions' });
  }
});

// POST /api/prescriptions/upload (Controlled file upload with private object storage)
router.post('/upload', authenticate, uploadPrescription.single('prescriptionFile'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please provide a valid prescription document (PDF/JPEG/PNG).' });
    }

    const { doctorName, prescriptionDate, notes } = req.body;

    const newPrescription = await prescriptionsCollection.insertOne({
      userId: req.user!._id,
      doctorName: doctorName || 'Attending Physician',
      prescriptionDate: prescriptionDate || new Date().toISOString().split('T')[0],
      fileReference: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'ACTIVE',
      notes: notes || '',
    });

    await logAudit(req, 'UPLOAD_PRESCRIPTION', 'PRESCRIPTION', newPrescription._id, {
      filename: req.file.originalname,
      size: req.file.size,
    });

    return res.status(201).json({
      message: 'Prescription uploaded and stored securely.',
      prescription: newPrescription,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Error processing prescription upload' });
  }
});

// GET /api/prescriptions/:id/view (Secure streaming with authorization & consent check)
router.get('/:id/view', authenticate, async (req: AuthRequest, res) => {
  try {
    const prescription = await prescriptionsCollection.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    const userId = req.user!._id;
    const userRole = req.user!.role;
    let authorized = false;

    // 1. Patient Owner
    if (prescription.userId === userId) {
      authorized = true;
    }

    // 2. Admin
    if (userRole === 'ADMIN') {
      authorized = true;
    }

    // 3. Active consent check for Pharmacist or Doctor
    if (!authorized) {
      const activeConsent = await consentsCollection.findOne({
        prescriptionId: prescription._id,
        recipientId: userId,
        revoked: false,
      });

      if (activeConsent) {
        const isExpired = new Date(activeConsent.expiresAt).getTime() < Date.now();
        if (!isExpired) {
          authorized = true;
        }
      }
    }

    // 4. Pharmacy order fulfillment check: if an order references this Rx and belongs to pharmacist's pharmacy
    if (!authorized && userRole === 'PHARMACIST') {
      const pharmacist = await pharmacistsCollection.findOne({ userId });
      if (pharmacist?.pharmacyId) {
        const order = await ordersCollection.findOne({
          prescriptionId: prescription._id,
          pharmacyId: pharmacist.pharmacyId,
        });
        if (order) authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({
        message: 'Access Denied: You do not possess explicit patient consent or ownership for this medical document.',
      });
    }

    const filePath = path.join(PRESCRIPTION_DIR, prescription.fileReference);
    if (!fs.existsSync(filePath)) {
      // In case of demo seed file reference
      return res.status(200).json({
        demoNotice: true,
        prescription,
        message: 'Verified prescription document record active. (Secure file storage demo reference).',
      });
    }

    await logAudit(req, 'VIEW_PRESCRIPTION_FILE', 'PRESCRIPTION', prescription._id);
    res.setHeader('Content-Type', prescription.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${prescription.originalFilename}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch {
    return res.status(500).json({ message: 'Error retrieving prescription file' });
  }
});

// POST /api/prescriptions/:id/share (Consent grant)
router.post('/:id/share', authenticate, async (req: AuthRequest, res) => {
  try {
    const { recipientType, recipientId, recipientName, purpose, durationHours } = req.body;
    const prescription = await prescriptionsCollection.findById(req.params.id);

    if (!prescription || prescription.userId !== req.user!._id) {
      return res.status(404).json({ message: 'Prescription not found or ownership mismatch.' });
    }

    const hours = Number(durationHours) || 72; // Default 3 days
    const expiresAt = new Date(Date.now() + hours * 3600000).toISOString();

    const consent = await consentsCollection.insertOne({
      userId: req.user!._id,
      prescriptionId: prescription._id,
      recipientType: recipientType || 'PHARMACIST',
      recipientId,
      recipientName: recipientName || 'Healthcare Provider',
      purpose: purpose || 'Verification of medication order',
      expiresAt,
      revoked: false,
    });

    await logAudit(req, 'GRANT_PRESCRIPTION_CONSENT', 'CONSENT', consent._id, {
      prescriptionId: prescription._id,
      recipientId,
    });

    return res.status(201).json({
      message: 'Prescription shared securely under timed patient consent.',
      consent,
    });
  } catch {
    return res.status(500).json({ message: 'Error granting prescription consent' });
  }
});

// GET /api/prescriptions/:id/consents (Sharing history)
router.get('/:id/consents', authenticate, async (req: AuthRequest, res) => {
  try {
    const consents = await consentsCollection.find({ prescriptionId: req.params.id });
    return res.json({ consents });
  } catch {
    return res.status(500).json({ message: 'Error retrieving consent history' });
  }
});

// PUT /api/prescriptions/consents/:consentId/revoke
router.put('/consents/:consentId/revoke', authenticate, async (req: AuthRequest, res) => {
  try {
    const consent = await consentsCollection.findById(req.params.consentId);
    if (!consent || consent.userId !== req.user!._id) {
      return res.status(404).json({ message: 'Consent record not found.' });
    }

    await consentsCollection.findByIdAndUpdate(consent._id, { revoked: true });
    await logAudit(req, 'REVOKE_PRESCRIPTION_CONSENT', 'CONSENT', consent._id);
    return res.json({ message: 'Prescription access consent revoked successfully.' });
  } catch {
    return res.status(500).json({ message: 'Error revoking consent' });
  }
});

// DELETE /api/prescriptions/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const prescription = await prescriptionsCollection.findById(req.params.id);
    if (!prescription || (prescription.userId !== req.user!._id && req.user!.role !== 'ADMIN')) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    const filePath = path.join(PRESCRIPTION_DIR, prescription.fileReference);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    await prescriptionsCollection.findByIdAndDelete(prescription._id);
    await consentsCollection.deleteMany({ prescriptionId: prescription._id });
    await logAudit(req, 'DELETE_PRESCRIPTION', 'PRESCRIPTION', prescription._id);

    return res.json({ message: 'Prescription removed successfully.' });
  } catch {
    return res.status(500).json({ message: 'Error removing prescription' });
  }
});

export default router;
