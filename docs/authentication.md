# MediConnect AI Authentication & Authorization Guide

## 1. Role System & Enumeration

MediConnect AI uses a strictly typed, unified enumeration for user roles:

```typescript
export type Role = 'USER' | 'PHARMACIST' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'ADMIN';
```

## 2. Authentication Flow

1. **User Login (`POST /api/auth/login`)**:
   - Password verified using `bcryptjs`.
   - Checks account active status (`status !== 'SUSPENDED'`).
   - If user role is `PHARMACIST`, the backend checks `pharmacistsCollection` for the current `verificationStatus` (`VERIFIED`, `PENDING`, or `REJECTED`).
   - JWT signed with user ID and role, delivered via HTTP-only cookie and JSON response body.
   - User profile returned to frontend includes `id`, `name`, `email`, `role`, and `verificationStatus`.

2. **Frontend Routing (`ProtectedRoute.tsx`)**:
   - Evaluates authenticated user role against `allowedRoles`.
   - If user attempts to enter a portal for a different role, displays a clean **Access Restricted** message (HTTP 403) with a direct link to their designated dashboard.
   - For `PHARMACIST` routes:
     - **VERIFIED**: Immediate full access to Pharmacist Dashboard, Live Inventory, and Rx Audits.
     - **PENDING**: Displays a custom notification screen: *"Your pharmacist account is awaiting verification"* with submitted details, admin contact information, and sign-out options.
     - **REJECTED**: Displays a custom notification screen: *"Your pharmacist verification was not approved"* with administrative review guidance.

3. **Stale JWT Token Note**:
   - Because JWT tokens are signed with the user's role at the time of issuance, if an administrator changes a user's role directly in the database, the user must log out and log in again to receive a refreshed token with the updated claims.
