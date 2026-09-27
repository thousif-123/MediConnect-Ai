export type Role = 'USER' | 'PHARMACIST' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type OrderStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  verificationStatus?: VerificationStatus;
  dateOfBirth?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
  };
  allergies?: string[];
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PharmacistProfile {
  _id: string;
  userId: string;
  registrationNumber: string;
  qualification: string;
  phone: string;
  pharmacyId?: string;
  availability: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  licenseNumber: string;
  latitude: number;
  longitude: number;
  verificationStatus: VerificationStatus;
  openingHours: string;
  pharmacistId?: string;
  pharmacistName?: string;
  pharmacistPhone?: string;
  distanceKm?: number;
}

export interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  brandName?: string;
  category: string;
  description: string;
  indication?: string;
  requiresPrescription: boolean;
  otcEligible: boolean;
  ageRestrictions?: string;
  contraindications?: string[];
  drugInteractions?: string[];
  warnings?: string[];
  safetyInformation: string;
  activeIngredient?: string;
  dosageForm: string;
  manufacturer?: string;
  status: 'ACTIVE' | 'DISCONTINUED';
  active?: boolean;
}

export interface InventoryItem {
  _id: string;
  pharmacyId: string;
  medicineId: string;
  medicine?: Medicine;
  quantity: number;
  price: number;
  availability: boolean;
  lastUpdated: string;
}

export interface Prescription {
  _id: string;
  userId: string;
  doctorName?: string;
  prescriptionDate: string;
  fileReference: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ConsentRecord {
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

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  genericName?: string;
  quantity: number;
  unitPrice: number;
  requiresPrescription: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  user?: {
    name: string;
    phone: string;
    email: string;
  };
  pharmacyId: string;
  pharmacy?: Pharmacy;
  items: OrderItem[];
  totalAmount: number;
  prescriptionId?: string;
  prescription?: Prescription;
  status: OrderStatus;
  pickupTimeEstimate?: string;
  notes?: string;
  pharmacistNotes?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  departments: string[];
  verificationStatus: VerificationStatus;
  distanceKm?: number;
  emergencyPhone?: string;
}

export interface Doctor {
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
  availableSlots?: string[];
  verificationStatus: VerificationStatus;
  bio?: string;
}

export interface Appointment {
  _id: string;
  appointmentNumber: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  hospitalId: string;
  hospital?: Hospital;
  doctorId: string;
  doctor?: Doctor;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  symptoms?: string;
  status: AppointmentStatus;
  hospitalNotes?: string;
  createdAt: string;
}

export type TriageLevel =
  | 'EMERGENCY'
  | 'URGENT'
  | 'DOCTOR_CONSULTATION'
  | 'PHARMACIST_GUIDANCE'
  | 'GENERAL_SELF_CARE';

export interface AIReport {
  triageLevel: TriageLevel;
  urgency?: 'routine' | 'soon' | 'urgent' | 'emergency'; // backward compatibility
  symptomSummary: string;
  summary?: string; // backward compatibility
  possibleExplanations: string[];
  redFlags: string[];
  precautions: string[];
  generalGuidance?: string[]; // backward compatibility
  followUpQuestions: string[];
  medicineCategorySuggestions: string[];
  recommendedNextSteps?: string[]; // backward compatibility
  pharmacistRecommended: boolean;
  doctorRecommended: boolean;
  emergencyCareRecommended: boolean;
  disclaimer: string;
}

export interface AuditLog {
  _id: string;
  userId?: string;
  userName?: string;
  role?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
}
