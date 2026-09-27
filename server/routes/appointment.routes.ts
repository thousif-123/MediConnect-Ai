import { Router } from 'express';
import {
  appointmentsCollection,
  hospitalsCollection,
  doctorsCollection,
  usersCollection,
} from '../config/db.js';
import { authenticate, AuthRequest, requireRoles } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// GET /api/appointments (Patient appointments or Doctor/Admin appointments)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const role = req.user!.role;

    let list = [];
    if (role === 'USER') {
      list = await appointmentsCollection.find({ userId });
    } else if (role === 'DOCTOR') {
      const doc = await doctorsCollection.findOne({ userId });
      list = doc ? await appointmentsCollection.find({ doctorId: doc._id }) : [];
    } else {
      list = await appointmentsCollection.find();
    }

    const hospitals = await hospitalsCollection.find();
    const doctors = await doctorsCollection.find();
    const users = await usersCollection.find();

    const hMap = new Map(hospitals.map((h) => [h._id, h]));
    const dMap = new Map(doctors.map((d) => [d._id, d]));
    const uMap = new Map(users.map((u) => [u._id, u]));

    const enriched = list.map((apt) => ({
      ...apt,
      hospital: hMap.get(apt.hospitalId),
      doctor: dMap.get(apt.doctorId),
      user: uMap.get(apt.userId)
        ? {
            name: uMap.get(apt.userId).name,
            email: uMap.get(apt.userId).email,
            phone: uMap.get(apt.userId).phone,
          }
        : undefined,
    }));

    return res.json({ appointments: enriched });
  } catch {
    return res.status(500).json({ message: 'Error retrieving appointments' });
  }
});

// POST /api/appointments (Book appointment)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { hospitalId, doctorId, department, appointmentDate, appointmentTime, symptoms } = req.body;

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Hospital, doctor, date, and appointment time slot are required.' });
    }

    const hospital = await hospitalsCollection.findById(hospitalId);
    const doctor = await doctorsCollection.findById(doctorId);

    if (!hospital || !doctor) {
      return res.status(404).json({ message: 'Specified hospital or doctor not found.' });
    }

    // Check slot collision
    const existing = await appointmentsCollection.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['REQUESTED', 'CONFIRMED'] },
    });

    if (existing) {
      return res.status(409).json({ message: 'This appointment slot has already been booked. Please select another time.' });
    }

    const appointmentNumber = `APT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newAppointment = await appointmentsCollection.insertOne({
      appointmentNumber,
      userId: req.user!._id,
      hospitalId,
      doctorId,
      department: department || doctor.department,
      appointmentDate,
      appointmentTime,
      symptoms: symptoms || '',
      status: 'CONFIRMED', // Immediate instant-confirmation for MVP college demo flow
      hospitalNotes: `Confirmed appointment with ${doctor.name} at ${hospital.name}. Please arrive 15 minutes prior.`,
    });

    await logAudit(req, 'BOOK_APPOINTMENT', 'APPOINTMENT', newAppointment._id, {
      appointmentNumber,
      hospitalId,
      doctorId,
      date: appointmentDate,
    });

    return res.status(201).json({
      message: 'Appointment booked and confirmed successfully!',
      appointment: newAppointment,
    });
  } catch {
    return res.status(500).json({ message: 'Error booking appointment' });
  }
});

// PUT /api/appointments/:id/status
router.put('/:id/status', authenticate, requireRoles('DOCTOR', 'HOSPITAL_ADMIN', 'ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { status, hospitalNotes } = req.body;
    const apt = await appointmentsCollection.findById(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });

    const updated = await appointmentsCollection.findByIdAndUpdate(apt._id, {
      status,
      hospitalNotes: hospitalNotes ?? apt.hospitalNotes,
    });

    await logAudit(req, 'UPDATE_APPOINTMENT_STATUS', 'APPOINTMENT', apt._id, { status });
    return res.json({ message: 'Appointment status updated', appointment: updated });
  } catch {
    return res.status(500).json({ message: 'Error updating appointment status' });
  }
});

// PUT /api/appointments/:id/cancel (Patient cancellation)
router.put('/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const apt = await appointmentsCollection.findById(req.params.id);
    if (!apt) return res.status(404).json({ message: 'Appointment not found' });

    if (apt.userId !== req.user!._id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    const updated = await appointmentsCollection.findByIdAndUpdate(apt._id, { status: 'CANCELLED' });
    await logAudit(req, 'CANCEL_APPOINTMENT', 'APPOINTMENT', apt._id);
    return res.json({ message: 'Appointment cancelled', appointment: updated });
  } catch {
    return res.status(500).json({ message: 'Error cancelling appointment' });
  }
});

export default router;
