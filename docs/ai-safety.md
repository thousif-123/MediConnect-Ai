# AI Clinical Safety & Triage Architecture

## 1. Principles of Safe AI Healthcare Triage

MediConnect AI adheres to stringent clinical safety guidelines:
* **Informational Triage Only:** The AI assistant evaluates symptoms to inform decisions; it never acts as an autonomous physician or diagnostician.
* **Deterministic Emergency Screening Layer:** Any emergency indicator triggers an immediate protocol that supersedes AI evaluation and instructs the user to seek immediate emergency care.
* **Prescription Neutrality:** The AI cannot generate orders, suggest off-label drug combinations, or recommend prescription dosages.

## 2. Red-Flag Categories Detected Prior to LLM Call

The deterministic screening filter (`server/services/redFlagRules.ts`) screens for:
1. **Acute Cardiovascular:** Crushing chest pain, left-arm radiation, chest tightness with dyspnea.
2. **Acute Neurological (FAST):** Facial drooping, slurred speech, sudden unilateral weakness/paralysis.
3. **Severe Respiratory Distress:** Inability to breathe, gasping, cyanosis (turning blue).
4. **Altered Consciousness:** Syncope, unresponsive state, sudden severe confusion.
5. **Acute Hemorrhage:** Uncontrollable active arterial bleeding or coughing blood.
6. **Anaphylaxis:** Throat tightness, tongue swelling, acute angioedema with breathing difficulty.
7. **Thunderclap Headache:** Sudden maximal intensity headache with neck rigidity and fever.

## 3. Structured Triage JSON Schema

```typescript
export interface AIReport {
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  summary: string;
  redFlags: string[];
  generalGuidance: string[];
  recommendedNextSteps: string[];
  pharmacistRecommended: boolean;
  doctorRecommended: boolean;
  disclaimer: string;
}
```
