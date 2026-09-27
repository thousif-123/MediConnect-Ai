# MediConnect AI — Production Architecture & Engineering Overview

MediConnect AI is an integrated healthcare marketplace and triage platform engineered as an academic production-grade prototype. It connects patients with verified pharmacists, doctors, hospitals, and safe AI health triage guidance.

## Core System Architecture

```
                                  [ Client Browser ]
                                          |
                +-------------------------+-------------------------+
                |                                                   |
      [ React 19 + Tailwind v4 ]                           [ Leaflet Maps ]
      (Role-based UI, GPS Triage)                         (OpenStreetMap GPS)
                |
                v (HTTPS / HTTP-only Cookies / Bearer)
      +-------------------------------------------------------------+
      |               Express 4.21 Application Server               |
      |   - Helmet Security Headers                                 |
      |   - CORS with credentials                                   |
      |   - JWT Role-based Authentication & Rate Limits             |
      +-------------------------------------------------------------+
             |                                             |
             v                                             v
  [ Pre-AI Red-Flag Filter ]                    [ Private Object Vault ]
  (Deterministic rule checks:                  (Encrypted / Hashed Rx files
   stroke, cardiac, airway)                     accessed only via timed consent)
             |                                             |
             v                                             v
  [ Google GenAI SDK: 2.5-Flash ]               [ Dual-Engine Data Store ]
  (Triage guidance, structured JSON)            (User, Orders, AuditLogs,
                                                 Consents, Medicines, Inventories)
```

## Security & Healthcare Privacy Architecture

1. **AI Safety Firewall:**
   - Pre-evaluates incoming symptom descriptions for acute emergency triggers before sending them to the LLM.
   - Guardrailed model prompt explicitly bans diagnoses, direct prescriptions, and prescription bypass advice.
   - Returns structured JSON enforcing mandatory triage levels (`routine`, `soon`, `urgent`, `emergency`).

2. **Prescription Vault & Timed Consent:**
   - Prescriptions are isolated from public web directories.
   - Pharmacists and physicians can only inspect documents when the patient has created an active, unexpired `Consent` record or placed an order at their pharmacy.
   - Users can revoke access to any prescription at any time.

3. **Immutable Audit Trails:**
   - Every sensitive event (registration, login, prescription upload, consent grant, consent revocation, status verification) is recorded with IP address, timestamp, and user context.
