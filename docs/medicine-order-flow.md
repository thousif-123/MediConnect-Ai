# Medicine Order & Reservation Flow

MediConnect AI uses a "Reserve for Pickup" clinical fulfillment model to connect online triage to local dispensaries.

## Complete Workflow

```
[ User Symptoms Input ]
         ↓
[ Deterministic Emergency Check ] → (Emergency? Prompt 911 / ER immediately)
         ↓
[ Gemini AI 5-Tier Triage ]
(EMERGENCY | URGENT | DOCTOR_CONSULTATION | PHARMACIST_GUIDANCE | GENERAL_SELF_CARE)
         ↓
[ Medicine Category Matching ]
(Queries verified database: GET /api/medicines?category=...)
         ↓
[ Medicine Selection ]
  • OTC Eligible → [Check Availability & Reserve]
  • Prescription-Only → [Upload Prescription to Reserve] (Direct purchase blocked)
         ↓
[ Select Pharmacy & Stock Check ]
(View distance, operating hours, pharmacist on duty)
         ↓
[ Order Request Created ]
  • OTC order → status: PENDING
  • Prescription order → status: UNDER_REVIEW (automatically attaches Consent for pharmacy)
         ↓
[ Pharmacist Order Audit ]
(Pharmacist views patient-uploaded PDF/image prescription)
         ↓
[ Pharmacist Decision ]
  • Validated → ACCEPTED → READY_FOR_PICKUP
  • Invalid/Contraindicated → REJECTED (with clinical explanation notes)
         ↓
[ Physical Pickup & Payment at Counter ]
(Patient presents ID and collects verified medications)
```

## Order Status Lifecycle
* `PENDING`: Order received; awaiting pharmacy fulfillment.
* `UNDER_REVIEW`: Prescription document being verified by licensed pharmacist.
* `ACCEPTED`: Prescription approved and items packaged.
* `REJECTED`: Order rejected due to clinical contraindication or invalid prescription.
* `READY_FOR_PICKUP`: Medicine bagged and awaiting counter pickup.
* `COMPLETED`: Patient collected medication.
* `CANCELLED`: Order cancelled by user or administrator.
