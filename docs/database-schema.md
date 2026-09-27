# Database Schemas & Collections

MediConnect AI uses an embedded resilient Mongoose/MongoDB document store with persistent disk snapshots (`/data/*.json`) and support for standard MongoDB URI connections.

## Collections & Schemas

### 1. `User`
```typescript
{
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // bcrypt hash (10 salt rounds)
  role: 'USER' | 'PHARMACIST' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'ADMIN';
  dateOfBirth?: string;
  address?: string;
  location?: { lat: number; lng: number; city?: string };
  allergies: string[];
  currentMedications: string[];
  emergencyContact?: { name: string; phone: string; relationship: string };
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}
```

### 2. `Pharmacist`
```typescript
{
  _id: string;
  userId: string;
  registrationNumber: string;
  qualification: string;
  phone: string;
  pharmacyId?: string;
  availability: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}
```

### 3. `Pharmacy`
```typescript
{
  _id: string;
  name: string;
  address: string;
  phone: string;
  licenseNumber: string;
  latitude: number;
  longitude: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  openingHours: string;
  pharmacistId?: string;
  pharmacistName?: string;
  pharmacistPhone?: string;
}
```

### 4. `Doctor`
```typescript
{
  _id: string;
  userId?: string;
  name: string;
  qualification: string;
  registrationNumber: string;
  department: string;
  hospitalId: string;
  hospitalName?: string;
  consultationFee: number;
  availability: string[];
  availableSlots: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  bio?: string;
}
```

### 5. `Hospital`
```typescript
{
  _id: string;
  name: string;
  address: string;
  phone: string;
  emergencyPhone?: string;
  latitude: number;
  longitude: number;
  departments: string[];
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
```

### 6. `Medicine`
```typescript
{
  _id: string;
  name: string;
  genericName: string;
  category: string;
  description: string;
  requiresPrescription: boolean;
  safetyInformation: string;
  dosageForm: string;
  active: boolean;
}
```

### 7. `Inventory`
```typescript
{
  _id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  price: number;
  availability: boolean;
  lastUpdated: string;
}
```

### 8. `Prescription`
```typescript
{
  _id: string;
  userId: string;
  doctorName?: string;
  prescriptionDate: string;
  fileReference: string; // Isolated in /storage/prescriptions/
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}
```

### 9. `Consent`
```typescript
{
  _id: string;
  userId: string;
  prescriptionId: string;
  recipientType: 'PHARMACIST' | 'DOCTOR' | 'PHARMACY';
  recipientId: string;
  recipientName?: string;
  purpose: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}
```

### 10. `Order`
```typescript
{
  _id: string;
  orderNumber: string;
  userId: string;
  pharmacyId: string;
  items: Array<{
    medicineId: string;
    medicineName: string;
    genericName?: string;
    quantity: number;
    unitPrice: number;
    requiresPrescription: boolean;
  }>;
  totalAmount: number;
  prescriptionId?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
  pickupTimeEstimate?: string;
  notes?: string;
  pharmacistNotes?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 11. `Appointment`
```typescript
{
  _id: string;
  appointmentNumber: string;
  userId: string;
  hospitalId: string;
  doctorId: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms?: string;
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  hospitalNotes?: string;
  createdAt: string;
}
```

### 12. `AuditLog`
```typescript
{
  _id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress: string;
  timestamp: string;
}
```
