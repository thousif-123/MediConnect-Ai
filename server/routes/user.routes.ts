import { Router } from 'express';
import { usersCollection } from '../config/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await usersCollection.findById(req.user!._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password: _, ...userSafe } = user;
    return res.json({ profile: userSafe });
  } catch {
    return res.status(500).json({ message: 'Error retrieving profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, phone, dateOfBirth, address, location } = req.body;
    const updated = await usersCollection.findByIdAndUpdate(req.user!._id, {
      name: name?.trim(),
      phone: phone?.trim(),
      dateOfBirth,
      address,
      location,
    });
    await logAudit(req, 'UPDATE_PROFILE', 'USER', req.user!._id);
    const { password: _, ...userSafe } = updated || {};
    return res.json({ message: 'Profile updated successfully', profile: userSafe });
  } catch {
    return res.status(500).json({ message: 'Error updating profile' });
  }
});

// GET /api/users/medical-profile
router.get('/medical-profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await usersCollection.findById(req.user!._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({
      allergies: user.allergies || [],
      currentMedications: user.currentMedications || [],
      emergencyContact: user.emergencyContact || null,
    });
  } catch {
    return res.status(500).json({ message: 'Error retrieving medical profile' });
  }
});

// PUT /api/users/medical-profile
router.put('/medical-profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { allergies, currentMedications, emergencyContact } = req.body;
    await usersCollection.findByIdAndUpdate(req.user!._id, {
      allergies: Array.isArray(allergies) ? allergies : [],
      currentMedications: Array.isArray(currentMedications) ? currentMedications : [],
      emergencyContact,
    });
    await logAudit(req, 'UPDATE_MEDICAL_PROFILE', 'USER', req.user!._id);
    return res.json({ message: 'Medical profile updated securely' });
  } catch {
    return res.status(500).json({ message: 'Error updating medical profile' });
  }
});

export default router;
