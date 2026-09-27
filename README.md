# MediConnect AI

> **"Your Health. Connected."**
> A production-structured college healthcare marketplace, prescription vault, and triage platform.

---

## ⚠️ Important Healthcare Safety Disclaimer
* MediConnect AI is an **educational and academic prototype**.
* It is **NOT** a certified medical diagnostic system or prescribing tool.
* Healthcare professional profiles and dispensary data are clearly marked **DEMO** entries for simulation.
* In life-threatening emergencies, users must call **911** or contact local emergency services immediately.

---

## Key Features

1. **Deterministic Red-Flag Filter & 5-Tier AI Triage**:
   - Immediate interception of acute cardiac, stroke (FAST protocol), respiratory distress, severe hemorrhage, and anaphylaxis signs.
   - Structured AI triage via `@google/genai` (Gemini 2.5 Flash on server-side only):
     - `EMERGENCY`
     - `URGENT`
     - `DOCTOR_CONSULTATION`
     - `PHARMACIST_GUIDANCE`
     - `GENERAL_SELF_CARE`
   - AI outputs symptom summaries, possible explanations, precautions, and follow-up questions without generating unauthorized prescriptions.

2. **Verified Pharmacist Network & Medicine Ordering**:
   - Geolocation-based discovery of nearby licensed pharmacies and open hours.
   - "Possible Symptom Relief Options" queried directly from the verified database (never hallucinated by the model).
   - "Reserve for Pickup" flow with counter payment.
   - Prescription-only items require an attached prescription document before order submission.

3. **Private Prescription Vault & Consent Control**:
   - Prescriptions stored in isolated backend object storage (`/storage/prescriptions/`).
   - Timed, revocable sharing consents (`Consent` records) with explicit "Allow" and "Cancel" confirmations.
   - Strict authorization middleware preventing unauthorized file access.

4. **Hospital & Doctor Appointment System**:
   - Clinical department filtering (Cardiology, Dermatology, Internal Medicine, etc.).
   - Interactive consultation slot booking and status tracking.

5. **Multi-Role RBAC & Status Guarding**:
   - Five distinct roles: `USER`, `PHARMACIST`, `DOCTOR`, `HOSPITAL_ADMIN`, `ADMIN`.
   - Distinct pharmacist verification states: `VERIFIED`, `PENDING`, and `REJECTED`.

---

## Demo Accounts & Test Credentials

Use the **"Demo Roles Switcher"** in the top navigation bar or log in directly:

| Role | Email | Password | Status / Behavior |
|---|---|---|---|
| **Patient** | `patient@demo.com` | `Password123!` | Standard patient dashboard, triage, orders |
| **Verified Pharmacist** | `pharmacist@demo.com` | `Password123!` | Accesses Pharmacist Dashboard, audits orders |
| **Pending Pharmacist** | `pending-pharmacist@demo.com` | `Password123!` | Displays "Awaiting verification" screen |
| **Rejected Pharmacist** | `rejected-pharmacist@demo.com` | `Password123!` | Displays "Verification not approved" screen |
| **Doctor** | `doctor@demo.com` | `Password123!` | Accesses Doctor consultation dashboard |
| **Hospital Admin** | `hospital@demo.com` | `Password123!` | Hospital department and staff management |
| **System Admin** | `admin@demo.com` | `Password123!` | Verifies licenses, manages accounts, audits |

*Note on Stale JWTs: If an account's role is updated directly in the database, the user must log out and log in again to acquire a refreshed JWT containing the new role claim.*

---

## Environment Variables
Defined in `.env.example`:
- `GEMINI_API_KEY`: Server-side API key for Google GenAI triage.
- `JWT_SECRET`: Secret key for session authentication.
- `PORT`: Server port (default `3000`).

---

## Running the Application

```bash
# Install dependencies
npm install

# Start full-stack development server (Express backend + Vite frontend)
npm run dev

# Run linting check
npm run lint

# Build for production
npm run build
npm start
```
