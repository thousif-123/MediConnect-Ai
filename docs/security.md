# MediConnect AI Security Architecture & Compliance

## Security Engineering Principles

### 1. Zero Secrets in Client Bundle
* The `GEMINI_API_KEY` and `JWT_SECRET` are strictly held on the server.
* The frontend interacts with AI solely through the protected backend endpoint `/api/ai/triage`.

### 2. Private Object Storage Isolation for Medical Documents
* Uploaded prescriptions are never placed inside the public web root (`/public` or `/dist`).
* Prescriptions are saved to `/storage/prescriptions/` using randomly generated non-guessable identifiers (`rx_timestamp_random.pdf`).
* Direct URL access is blocked. Files can only be streamed via `/api/prescriptions/:id/view` through authorization middleware:
  1. Owner check (`prescription.userId === callerId`).
  2. Timed unexpired `Consent` verification (`recipientId === callerId && expiresAt > now && !revoked`).
  3. Active order verification (pharmacist fulfilling an order referencing the Rx).
  4. System Administrator override.

### 3. Role-Based Access Control (RBAC)
* Roles: `USER`, `PHARMACIST`, `DOCTOR`, `HOSPITAL_ADMIN`, `ADMIN`.
* Middleware `requireRoles(...)` protects every privileged route.
* React Router client guards (`ProtectedRoute.tsx`) prevent unauthorized viewing.

### 4. Password Security & Cryptographic Hashes
* Passwords hashed using `bcryptjs` with 10 salt rounds.
* JWTs signed with `HS256` and issued with strict expiration (`TOKEN_EXPIRY = 7d`).
* HTTP-only cookie delivery prevents XSS token theft.

### 5. Audit Logging
* All sensitive operations (registration, login, logout, prescription upload, consent grant/revoke, order placement, order verification, account suspension) write to the `AuditLog` collection, logging the actor, action, timestamp, IP address, and resource affected.
