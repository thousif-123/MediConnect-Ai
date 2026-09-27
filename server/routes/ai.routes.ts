import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { symptomSessionsCollection, usersCollection } from '../config/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// POST /api/ai/triage & /api/ai/health-guidance (Authenticated or Anonymous safe triage evaluation)
const handleTriageRequest = async (req: AuthRequest, res: any) => {
  try {
    const { symptoms, duration, severity, age, allergies, currentMedications, existingConditions, isPregnant } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 3) {
      return res.status(400).json({ message: 'Please describe the health problem or symptom.' });
    }

    // Optional personalization if user is logged in
    let userAllergies = allergies || [];
    let userMeds = currentMedications || [];
    let userConditions = existingConditions || [];

    if (req.cookies?.token || req.headers.authorization) {
      try {
        await new Promise<void>((resolve) => {
          authenticate(req, res, () => resolve());
        });
        if (req.user) {
          const user = await usersCollection.findById(req.user._id);
          if (user) {
            userAllergies = [...new Set([...userAllergies, ...(user.allergies || [])])];
            userMeds = [...new Set([...userMeds, ...(user.currentMedications || [])])];
          }
        }
      } catch {
        // Continue unauthenticated safely
      }
    }

    const report = await aiService.evaluateSymptoms({
      symptoms: symptoms.trim(),
      duration: duration?.trim(),
      severity: severity?.toString(),
      age: age ? Number(age) : undefined,
      allergies: userAllergies,
      currentMedications: userMeds,
      existingConditions: userConditions,
      isPregnant: Boolean(isPregnant),
    });

    // Save session record for analytics/safety audits
    const session = await symptomSessionsCollection.insertOne({
      userId: req.user?._id || 'ANONYMOUS',
      symptoms,
      duration,
      severity,
      report,
    });

    if (req.user) {
      await logAudit(req, 'AI_TRIAGE_SESSION', 'SYMPTOM_SESSION', session._id, {
        triageLevel: report.triageLevel,
      });
    }

    return res.json({ report, sessionId: session._id });
  } catch (err: any) {
    console.error('AI Triage Route Error:', err);
    return res.status(500).json({ message: 'Triage evaluation unavailable at this moment.' });
  }
};

router.post('/triage', handleTriageRequest);
router.post('/health-guidance', handleTriageRequest);

export default router;
