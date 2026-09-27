# MediConnect AI REST API Reference

All endpoints return JSON responses. Protected endpoints expect either an HTTP-only `token` cookie or `Authorization: Bearer <JWT>`.

## Base URL: `/api`

### 1. Authentication (`/api/auth`)
* `POST /register`: Register user account (`name`, `email`, `phone`, `password`, `role`).
* `POST /login`: Authenticate credentials, set HTTP-only cookie, return JWT + safe user object.
* `GET /me`: Returns authenticated user profile and permissions.
* `POST /logout`: Clears session token and logs audit event.

### 2. User & Medical Profile (`/api/users`)
* `GET /profile`: Retrieve personal details.
* `PUT /profile`: Update name, phone, address, and coordinates.
* `GET /medical-profile`: Fetch allergies, current medications, emergency contact.
* `PUT /medical-profile`: Securely update allergies and medications.

### 3. Pharmacies & Directory (`/api/pharmacies`)
* `GET /`: List pharmacies with optional query parameters (`search`, `lat`, `lng`, `verifiedOnly`). Calculates Haversine distance.
* `GET /:id`: Retrieve single pharmacy with available medicine inventory.
* `POST /`: Register/create new pharmacy (Pharmacist/Admin).

### 4. Pharmacist Operations (`/api/pharmacists`)
* `GET /me`: Get pharmacist profile, license registration number, and linked dispensary.
* `PUT /profile`: Update credentials and availability.
* `GET /orders`: List incoming medicine reservations for pharmacist's facility.
* `PUT /orders/:id/status`: Audit prescription, add clinical notes, and transition order status (`UNDER_REVIEW`, `ACCEPTED`, `READY_FOR_PICKUP`, `COMPLETED`, `REJECTED`).

### 5. Medicines & Inventory (`/api/medicines`)
* `GET /`: Search medicine catalogue with categories and prescription requirements.
* `POST /`: Add medicine to catalogue (Admin).
* `GET /inventory/:pharmacyId`: Fetch live pharmacy stock.
* `POST /inventory`: Update quantity, pricing, and availability.

### 6. Prescriptions & Consent (`/api/prescriptions`)
* `GET /`: List patient's uploaded prescriptions.
* `POST /upload`: Secure multipart upload (PDF, PNG, JPEG) with hashed filename in private object storage.
* `GET /:id/view`: Securely stream prescription document if caller is owner, has active unexpired consent, or is a fulfilling pharmacist.
* `POST /:id/share`: Issue timed temporary consent for a pharmacist, doctor, or clinic.
* `GET /:id/consents`: Fetch consent log for a prescription.
* `PUT /consents/:consentId/revoke`: Immediately revoke access.
* `DELETE /:id`: Permanently delete prescription and remove private file from storage.

### 7. Medicine Orders (`/api/orders`)
* `GET /`: List patient's medicine orders.
* `GET /:id`: Get order detail with prescription document and pharmacy data.
* `POST /`: Place medicine reservation for pickup (mandates prescription attachment if Rx-only drugs included).
* `PUT /:id/cancel`: Cancel order before completion.

### 8. Hospitals & Appointments (`/api/hospitals` & `/api/appointments`)
* `GET /api/hospitals`: Discover facilities, emergency departments, and locations.
* `GET /api/hospitals/:id`: Get hospital and on-duty doctors.
* `GET /api/hospitals/doctors/all`: Specialty doctor directory.
* `GET /api/appointments`: List appointments for patient or doctor.
* `POST /api/appointments`: Book doctor slot with collision prevention.
* `PUT /api/appointments/:id/status`: Update status (Doctor/Admin).
* `PUT /api/appointments/:id/cancel`: Cancel booking.

### 9. AI Symptom Triage (`/api/ai`)
* `POST /triage`: Run deterministic red-flag screening followed by Gemini 2.5 Flash clinical guidance. Returns structured JSON report.

### 10. System Administration (`/api/admin`)
* `GET /metrics`: Aggregated system KPIs.
* `GET /users`: List registered accounts.
* `PUT /users/:id/status`: Suspend or reactivate user.
* `GET /pharmacists`: List pharmacist license applications.
* `PUT /pharmacists/:id/verify`: Approve (`VERIFIED`) or reject (`REJECTED`) license.
* `PUT /pharmacies/:id/verify`: Verify dispensary facility.
* `GET /audit-logs`: Immutable audit trail of system events.
