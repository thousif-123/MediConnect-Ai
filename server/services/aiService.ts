import { GoogleGenAI } from '@google/genai';
import { AIReport, TriageLevel } from '../../src/types/index.js';
import { evaluateRedFlags } from './redFlagRules.js';

export interface SymptomEvaluationParams {
  symptoms: string;
  duration?: string;
  severity?: string;
  age?: number | string;
  allergies?: string[];
  currentMedications?: string[];
  existingConditions?: string[];
  isPregnant?: boolean;
}

export class HealthAIService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  public async evaluateSymptoms(params: SymptomEvaluationParams): Promise<AIReport> {
    const combinedText = `${params.symptoms} ${params.duration || ''} ${params.severity || ''}`;

    // 1. Mandatory Pre-AI deterministic emergency scan
    const redFlagCheck = evaluateRedFlags(combinedText);
    if (redFlagCheck.isEmergency) {
      return {
        triageLevel: 'EMERGENCY',
        urgency: 'emergency',
        symptomSummary: `Emergency clinical indicators detected in report: "${params.symptoms.slice(0, 120)}..."`,
        summary: 'Emergency indicators detected. Immediate clinical intervention is strongly advised.',
        possibleExplanations: [
          'Acute emergency condition requiring physical hospital evaluation',
          'Urgent clinical stabilization needed prior to any non-emergency intervention',
        ],
        redFlags: redFlagCheck.matchedTriggers,
        precautions: [
          'Cease physical exertion immediately.',
          'Keep your airway open and stay in an upright or recovery position.',
          'Do not drive yourself to the hospital; request an ambulance with paramedic care.',
        ],
        generalGuidance: [
          'Cease physical exertion immediately.',
          'Keep your airway open and stay in an upright or recovery position.',
          'Do not drive yourself to the hospital; request an ambulance with paramedic care.',
        ],
        followUpQuestions: [
          'Have you dialed 911 or your local emergency response service?',
          'Is someone physically with you right now?',
        ],
        medicineCategorySuggestions: [], // Strictly no medicines recommended in emergency state
        recommendedNextSteps: [
          'Call 911 or local emergency services right now',
          'Have someone stay with you until emergency medical responders arrive',
          'Prepare your emergency medical contact and medication list',
        ],
        pharmacistRecommended: false,
        doctorRecommended: true,
        emergencyCareRecommended: true,
        disclaimer:
          'EMERGENCY WARNING: The symptoms described indicate a potentially life-threatening situation. This AI assistant cannot diagnose or replace emergency medical practitioners. Seek emergency care immediately.',
      };
    }

    // 2. Fallback if Gemini key is absent or offline
    if (!this.ai || !process.env.GEMINI_API_KEY) {
      return this.buildFallbackTriage(params);
    }

    // 3. Gemini 2.5 Flash Guardrailed Evaluation
    try {
      const prompt = `
You are MediConnect AI's healthcare information and triage assistant, NOT a doctor.
Patient Consultation Brief:
- Symptoms: ${params.symptoms}
- Symptom Duration: ${params.duration || 'Not specified'}
- Discomfort Severity (1-10): ${params.severity || 'Not specified'}
- Patient Age: ${params.age || 'Not specified'}
- Reported Allergies: ${params.allergies?.join(', ') || 'None reported'}
- Current Regular Medicines: ${params.currentMedications?.join(', ') || 'None reported'}
- Existing Chronic Conditions: ${params.existingConditions?.join(', ') || 'None reported'}
- Pregnancy Status: ${params.isPregnant ? 'Pregnant' : 'Not pregnant / Not specified'}

MANDATORY CLINICAL SAFETY RULES:
1. NEVER diagnose with certainty ("You definitely have X", "This is Y"). Use cautious, responsible language like: "These symptoms can occur with several conditions, including...", "This may be associated with...", "Common possibilities include...", "I cannot confirm a diagnosis from symptoms alone."
2. NEVER prescribe prescription-only medicines, invent custom prescription dosages, or recommend unsafe drug combinations.
3. Classify the situation into exactly ONE of these five triage levels:
   - "EMERGENCY" (Critical acute symptoms requiring immediate 911 / ER care)
   - "URGENT" (Concerning symptoms requiring urgent care clinic evaluation within 12-24h)
   - "DOCTOR_CONSULTATION" (Persistent or moderate symptoms needing formal physician examination)
   - "PHARMACIST_GUIDANCE" (Mild acute ailments suitable for over-the-counter pharmacist consultation)
   - "GENERAL_SELF_CARE" (Minor, self-limiting discomfort manageable with rest, hydration, monitoring)
4. Highlight clinical red-flag warning signs that would warrant in-person emergency attention.
5. Provide safe general precautions (Rest, hydration, temperature tracking, trigger avoidance).
6. List 2-3 helpful follow-up questions to clarify the picture.
7. If lower-risk (PHARMACIST_GUIDANCE or GENERAL_SELF_CARE), suggest 1-2 generic medicine CATEGORIES (e.g. "Analgesics & Antipyretics (OTC)", "Antihistamines (OTC)", "Decongestants") that the user could discuss with a licensed pharmacist. NEVER invent brand names or prescribe. If higher risk, leave medicineCategorySuggestions as an empty array.

Return ONLY a valid JSON object matching this exact schema:
{
  "triageLevel": "EMERGENCY" | "URGENT" | "DOCTOR_CONSULTATION" | "PHARMACIST_GUIDANCE" | "GENERAL_SELF_CARE",
  "symptomSummary": string,
  "possibleExplanations": string[],
  "redFlags": string[],
  "precautions": string[],
  "followUpQuestions": string[],
  "medicineCategorySuggestions": string[],
  "pharmacistRecommended": boolean,
  "doctorRecommended": boolean,
  "emergencyCareRecommended": boolean
}
`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);

      const triageLevel: TriageLevel = [
        'EMERGENCY',
        'URGENT',
        'DOCTOR_CONSULTATION',
        'PHARMACIST_GUIDANCE',
        'GENERAL_SELF_CARE',
      ].includes(parsed.triageLevel)
        ? parsed.triageLevel
        : 'DOCTOR_CONSULTATION';

      const legacyUrgency =
        triageLevel === 'EMERGENCY'
          ? 'emergency'
          : triageLevel === 'URGENT'
          ? 'urgent'
          : triageLevel === 'DOCTOR_CONSULTATION'
          ? 'soon'
          : 'routine';

      return {
        triageLevel,
        urgency: legacyUrgency,
        symptomSummary: parsed.symptomSummary || `Assessment for: ${params.symptoms.slice(0, 100)}`,
        summary: parsed.symptomSummary || `Assessment for: ${params.symptoms.slice(0, 100)}`,
        possibleExplanations: Array.isArray(parsed.possibleExplanations) ? parsed.possibleExplanations : [
          'Symptoms may be associated with common viral or upper respiratory presentations',
          'Mild physiological fatigue or seasonal irritant response',
        ],
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [
          'High fever (> 103°F / 39.4°C) unresponsive to standard antipyretics',
          'Shortness of breath or sudden chest discomfort',
          'Inability to keep liquids down for more than 24 hours',
        ],
        precautions: Array.isArray(parsed.precautions) ? parsed.precautions : [
          'Maintain adequate fluid intake (water, warm broths, oral rehydration).',
          'Prioritize physical rest and monitor body temperature daily.',
          'Avoid known environmental triggers and heavy exertion.',
        ],
        generalGuidance: Array.isArray(parsed.precautions) ? parsed.precautions : [],
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : [
          'Have your symptoms progressively worsened since onset?',
          'Do you have any known medical conditions such as asthma or hypertension?',
        ],
        medicineCategorySuggestions: Array.isArray(parsed.medicineCategorySuggestions) ? parsed.medicineCategorySuggestions : [],
        recommendedNextSteps: [
          'Consult a verified pharmacist or physician for personalized clinical review',
          'Monitor symptoms closely for emerging warning signs',
        ],
        pharmacistRecommended: parsed.pharmacistRecommended ?? (triageLevel === 'PHARMACIST_GUIDANCE' || triageLevel === 'GENERAL_SELF_CARE'),
        doctorRecommended: parsed.doctorRecommended ?? (triageLevel === 'DOCTOR_CONSULTATION' || triageLevel === 'URGENT'),
        emergencyCareRecommended: parsed.emergencyCareRecommended ?? (triageLevel === 'EMERGENCY'),
        disclaimer:
          'AI Health Assistant provides educational health information and preliminary triage only. It does not replace a Registered Medical Practitioner or Pharmacist. I cannot confirm a diagnosis from symptoms alone.',
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to rule triage:', err);
      return this.buildFallbackTriage(params);
    }
  }

  private buildFallbackTriage(params: SymptomEvaluationParams): AIReport {
    const lower = params.symptoms.toLowerCase();
    let triageLevel: TriageLevel = 'GENERAL_SELF_CARE';
    let pharmacistRec = true;
    let doctorRec = false;
    let emergencyRec = false;
    const medCategories: string[] = [];

    if (lower.includes('fever') || lower.includes('cough') || lower.includes('cold') || lower.includes('throat') || lower.includes('headache')) {
      triageLevel = 'PHARMACIST_GUIDANCE';
      pharmacistRec = true;
      medCategories.push('Analgesics & Antipyretics (OTC)');
    } else if (lower.includes('rash') || lower.includes('itch') || lower.includes('allergy')) {
      triageLevel = 'PHARMACIST_GUIDANCE';
      pharmacistRec = true;
      medCategories.push('Antihistamines (OTC)');
    } else if (lower.includes('persistent') || lower.includes('ear') || lower.includes('pain') || lower.includes('infection')) {
      triageLevel = 'DOCTOR_CONSULTATION';
      doctorRec = true;
    } else if (lower.includes('breath') || lower.includes('chest') || lower.includes('vision') || lower.includes('bleed')) {
      triageLevel = 'URGENT';
      doctorRec = true;
    }

    return {
      triageLevel,
      urgency: triageLevel === 'URGENT' ? 'urgent' : triageLevel === 'DOCTOR_CONSULTATION' ? 'soon' : 'routine',
      symptomSummary: `Guidance for described symptoms: "${params.symptoms.slice(0, 100)}"`,
      summary: `Guidance for described symptoms: "${params.symptoms.slice(0, 100)}"`,
      possibleExplanations: [
        'These symptoms can occur with several conditions, including common seasonal viral syndromes',
        'Upper respiratory tract irritation or localized inflammatory response',
        'I cannot confirm a diagnosis from symptoms alone; physical clinical evaluation is advised if symptoms persist.',
      ],
      redFlags: [
        'Persistent high fever above 103°F (39.4°C) unresponsive to standard measures',
        'Severe shortness of breath, stridor, or difficulty swallowing fluids',
        'Stiff neck accompanied by confusion or photophobia',
      ],
      precautions: [
        'Hydrate continuously with room-temperature water or oral electrolytes.',
        'Allow adequate rest to support physiological immune recovery.',
        'Avoid tobacco smoke, alcohol, and unprescribed medication mixing.',
      ],
      generalGuidance: [
        'Hydrate continuously with room-temperature water or oral electrolytes.',
        'Allow adequate rest to support physiological immune recovery.',
      ],
      followUpQuestions: [
        'Are symptoms getting progressively more severe over the past 24 hours?',
        'Do you have any pre-existing chronic illnesses or known drug allergies?',
      ],
      medicineCategorySuggestions: medCategories,
      recommendedNextSteps: [
        'Discuss potential over-the-counter relief options with your verified community pharmacist',
        'Schedule a clinic consultation if symptoms do not improve within 48 to 72 hours',
      ],
      pharmacistRecommended: pharmacistRec,
      doctorRecommended: doctorRec,
      emergencyCareRecommended: emergencyRec,
      disclaimer:
        'AI Health Assistant provides educational health information and preliminary triage only. It does not replace a Registered Medical Practitioner or Pharmacist. I cannot confirm a diagnosis from symptoms alone.',
    };
  }
}

export const aiService = new HealthAIService();
