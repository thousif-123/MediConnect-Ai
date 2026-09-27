import bcrypt from 'bcryptjs';
import {
  usersCollection,
  pharmacistsCollection,
  pharmaciesCollection,
  doctorsCollection,
  hospitalsCollection,
  medicinesCollection,
  inventoryCollection,
  prescriptionsCollection,
  ordersCollection,
  appointmentsCollection,
  auditLogsCollection,
} from '../config/db.js';

export async function seedInitialData() {
  const userCount = await usersCollection.countDocuments();
  if (userCount > 0) {
    return; // Already initialized
  }

  console.log('🌱 Seeding demo healthcare database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Users across roles
  const patientUser = await usersCollection.insertOne({
    name: 'Sarah Connor (Patient)',
    email: 'patient@demo.com',
    phone: '+1 (555) 234-5678',
    password: passwordHash,
    role: 'USER',
    dateOfBirth: '1992-05-14',
    address: '42 Market Street, Downtown Health District',
    location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco' },
    allergies: ['Penicillin', 'Peanuts'],
    currentMedications: ['Loratadine 10mg daily', 'Multivitamin'],
    emergencyContact: {
      name: 'John Connor',
      phone: '+1 (555) 987-6543',
      relationship: 'Brother',
    },
    status: 'ACTIVE',
  });

  const pharmacistUser = await usersCollection.insertOne({
    name: 'Dr. Marcus Vance, PharmD',
    email: 'pharmacist@demo.com',
    phone: '+1 (555) 345-6789',
    password: passwordHash,
    role: 'PHARMACIST',
    status: 'ACTIVE',
  });

  const doctorUser = await usersCollection.insertOne({
    name: 'Dr. Elena Rostova, MD',
    email: 'doctor@demo.com',
    phone: '+1 (555) 456-7890',
    password: passwordHash,
    role: 'DOCTOR',
    status: 'ACTIVE',
  });

  const hospitalAdminUser = await usersCollection.insertOne({
    name: 'Robert Davis (Clinic Admin)',
    email: 'hospital@demo.com',
    phone: '+1 (555) 567-8901',
    password: passwordHash,
    role: 'HOSPITAL_ADMIN',
    status: 'ACTIVE',
  });

  const adminUser = await usersCollection.insertOne({
    name: 'System Administrator',
    email: 'admin@demo.com',
    phone: '+1 (555) 000-1122',
    password: passwordHash,
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  // 2. Pharmacies
  const p1 = await pharmaciesCollection.insertOne({
    name: 'DEMO — Beacon Hill Community Pharmacy',
    address: '742 Evergreen Terrace, Medical Corridor',
    phone: '+1 (555) 888-2121',
    licenseNumber: 'PH-CA-99214-DEMO',
    latitude: 37.7755,
    longitude: -122.4180,
    verificationStatus: 'VERIFIED',
    openingHours: 'Mon-Sun: 8:00 AM – 10:00 PM',
    pharmacistId: pharmacistUser._id,
    pharmacistName: 'Dr. Marcus Vance, PharmD',
    pharmacistPhone: '+1 (555) 345-6789',
  });

  const p2 = await pharmaciesCollection.insertOne({
    name: 'DEMO — St. Jude Care Rx',
    address: '1088 Mission St, Suite 200',
    phone: '+1 (555) 777-3434',
    licenseNumber: 'PH-CA-88102-DEMO',
    latitude: 37.7812,
    longitude: -122.4105,
    verificationStatus: 'VERIFIED',
    openingHours: '24/7 Emergency Counter Available',
    pharmacistName: 'Dr. Chloe Lin, RPh',
    pharmacistPhone: '+1 (555) 777-3435',
  });

  const p3 = await pharmaciesCollection.insertOne({
    name: 'DEMO — Pacific Wellness Pharmacy',
    address: '350 Bay Street, Fishermans Wharf',
    phone: '+1 (555) 666-4545',
    licenseNumber: 'PH-CA-77112-DEMO',
    latitude: 37.8055,
    longitude: -122.4140,
    verificationStatus: 'PENDING',
    openingHours: 'Mon-Fri: 9:00 AM – 7:00 PM',
  });

  // Pharmacist record (VERIFIED Demo Pharmacist)
  await pharmacistsCollection.insertOne({
    userId: pharmacistUser._id,
    registrationNumber: 'RPH-99281-DEMO',
    qualification: 'Doctor of Pharmacy (PharmD), Board Certified Pharmacotherapy Specialist',
    phone: '+1 (555) 345-6789',
    pharmacyId: p1._id,
    availability: 'Monday to Friday: 9am - 6pm',
    verificationStatus: 'VERIFIED',
  });

  // Demo Pharmacist 2: PENDING Verification (for testing pending screen)
  const pendingPhUser = await usersCollection.insertOne({
    name: 'David Kim, RPh (Pending License)',
    email: 'pending-pharmacist@demo.com',
    phone: '+1 (555) 345-1111',
    password: passwordHash,
    role: 'PHARMACIST',
    status: 'ACTIVE',
  });
  await pharmacistsCollection.insertOne({
    userId: pendingPhUser._id,
    registrationNumber: 'RPH-APPLY-8812',
    qualification: 'Bachelor of Pharmacy (B.Pharm), Registered Candidate',
    phone: '+1 (555) 345-1111',
    pharmacyId: p3._id,
    availability: 'Mon-Fri: 9am - 5pm',
    verificationStatus: 'PENDING',
  });

  // Demo Pharmacist 3: REJECTED Verification (for testing rejected screen)
  const rejectedPhUser = await usersCollection.insertOne({
    name: 'Alex Rivera (Rejected License)',
    email: 'rejected-pharmacist@demo.com',
    phone: '+1 (555) 345-2222',
    password: passwordHash,
    role: 'PHARMACIST',
    status: 'ACTIVE',
  });
  await pharmacistsCollection.insertOne({
    userId: rejectedPhUser._id,
    registrationNumber: 'RPH-DISPUTED-001',
    qualification: 'Pharmacology Associate (Expired Accreditation)',
    phone: '+1 (555) 345-2222',
    availability: 'Part-time',
    verificationStatus: 'REJECTED',
    rejectionReason: 'License credentials expired and failed state board audit verification.',
  });

  // 3. Hospitals
  const h1 = await hospitalsCollection.insertOne({
    name: 'DEMO — City General Health Center',
    address: '1001 Potrero Ave, Central District',
    phone: '+1 (555) 911-0000',
    emergencyPhone: '+1 (555) 911-9999',
    latitude: 37.7558,
    longitude: -122.4045,
    departments: ['Emergency Medicine', 'Cardiology', 'Internal Medicine', 'Pediatrics', 'Orthopedics'],
    verificationStatus: 'VERIFIED',
  });

  const h2 = await hospitalsCollection.insertOne({
    name: 'DEMO — St. Mary Comprehensive Medical Pavilion',
    address: '450 Stanyan Street, Golden Gate Parkside',
    phone: '+1 (555) 922-1111',
    emergencyPhone: '+1 (555) 922-2222',
    latitude: 37.7711,
    longitude: -122.4532,
    departments: ['General Practice', 'Neurology', 'Dermatology', 'Pulmonology', 'ENT'],
    verificationStatus: 'VERIFIED',
  });

  // 4. Doctors
  await doctorsCollection.insertOne({
    userId: doctorUser._id,
    name: 'Dr. Elena Rostova, MD',
    qualification: 'MD in Internal Medicine (Johns Hopkins), Fellowship in Preventative Care',
    registrationNumber: 'MED-77192-DEMO',
    department: 'Internal Medicine',
    hospitalId: h1._id,
    hospitalName: h1.name,
    consultationFee: 75,
    availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '04:45 PM'],
    verificationStatus: 'VERIFIED',
    bio: 'Dedicated internist with 12 years of experience specializing in preventive care and chronic illness monitoring.',
  });

  await doctorsCollection.insertOne({
    name: 'Dr. Julian Morales, MD',
    qualification: 'MD, FACC Cardiology Specialization (Stanford Medicine)',
    registrationNumber: 'MED-88401-DEMO',
    department: 'Cardiology',
    hospitalId: h1._id,
    hospitalName: h1.name,
    consultationFee: 120,
    availability: ['Mon', 'Wed', 'Fri'],
    availableSlots: ['11:00 AM', '01:30 PM', '03:00 PM'],
    verificationStatus: 'VERIFIED',
    bio: 'Cardiologist focused on non-invasive diagnostics, arrhythmia management, and heart health rehabilitation.',
  });

  await doctorsCollection.insertOne({
    name: 'Dr. Aisha Patel, MBBS, MD',
    qualification: 'Board Certified Dermatologist (Harvard Medical School)',
    registrationNumber: 'MED-66302-DEMO',
    department: 'Dermatology',
    hospitalId: h2._id,
    hospitalName: h2.name,
    consultationFee: 90,
    availability: ['Tue', 'Wed', 'Sat'],
    availableSlots: ['10:00 AM', '11:15 AM', '02:15 PM', '04:00 PM'],
    verificationStatus: 'VERIFIED',
    bio: 'Specialist in acute dermatological presentations, eczema management, and patient-centered skin health.',
  });

  // 5. Medicines Catalogue (Verified DEMO dataset)
  const m1 = await medicinesCollection.insertOne({
    name: 'Amoxicillin 500mg Capsules',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil (DEMO)',
    category: 'Antibiotics',
    description: 'Broad-spectrum penicillin antibiotic used for bacterial infections under medical guidance.',
    indication: 'Bacterial pharyngitis, acute otitis media, lower respiratory tract infections',
    requiresPrescription: true,
    otcEligible: false,
    ageRestrictions: 'Adults and children over 12 (pediatric suspensions require specialized dosing)',
    contraindications: ['Penicillin allergy', 'Cephalosporin hypersensitivity', 'Infectious mononucleosis'],
    drugInteractions: ['Methotrexate', 'Warfarin', 'Allopurinol'],
    warnings: ['Complete entire 10-day course even if feeling better', 'Discontinue if severe skin rash or wheezing develops'],
    safetyInformation: 'Must not be used if allergic to penicillin. Complete entire course as directed by your physician.',
    activeIngredient: 'Amoxicillin Trihydrate 500mg',
    dosageForm: 'Capsule',
    manufacturer: 'Demo Health Pharma Ltd',
    status: 'ACTIVE',
    active: true,
  });

  const m2 = await medicinesCollection.insertOne({
    name: 'Atorvastatin 20mg Tablets',
    genericName: 'Atorvastatin Calcium',
    brandName: 'Lipitor (DEMO)',
    category: 'Cardiovascular / Statins',
    description: 'HMG-CoA reductase inhibitor used to lower LDL cholesterol and manage cardiovascular risk.',
    indication: 'Hypercholesterolemia, dyslipidemia, primary prevention of cardiovascular events',
    requiresPrescription: true,
    otcEligible: false,
    ageRestrictions: 'Adults 18+ only',
    contraindications: ['Active liver disease', 'Unexplained persistent elevations in hepatic transaminases', 'Pregnancy/Lactation'],
    drugInteractions: ['Cyclosporine', 'Clarithromycin', 'Grapefruit juice in large quantities'],
    warnings: ['Report unexplained muscle pain, tenderness, or weakness promptly', 'Requires periodic baseline liver function tests'],
    safetyInformation: 'Requires regular liver panel monitoring. Consult your physician regarding muscle pain or tenderness.',
    activeIngredient: 'Atorvastatin Calcium 20mg',
    dosageForm: 'Tablet',
    manufacturer: 'Demo CardioCare Labs',
    status: 'ACTIVE',
    active: true,
  });

  const m3 = await medicinesCollection.insertOne({
    name: 'Paracetamol / Acetaminophen 500mg',
    genericName: 'Paracetamol',
    brandName: 'Tylenol / Panadol (DEMO)',
    category: 'Analgesics & Antipyretics (OTC)',
    description: 'Common over-the-counter pain reliever and fever reducer.',
    indication: 'Mild to moderate headache, muscular aches, sore throat, pyrexia (fever)',
    requiresPrescription: false,
    otcEligible: true,
    ageRestrictions: 'Adults and children over 12 years (use pediatric suspension for younger children)',
    contraindications: ['Severe hepatic impairment', 'Acute active hepatitis', 'Known hypersensitivity to paracetamol'],
    drugInteractions: ['Alcohol (increased hepatotoxicity risk)', 'Warfarin (with chronic high-dose use)'],
    warnings: ['Do NOT exceed 4,000mg total in 24 hours across all sources', 'Verify other cough/cold products do not contain acetaminophen'],
    safetyInformation: 'Do not exceed 4,000mg in 24 hours. Avoid concurrent use with other acetaminophen-containing medications.',
    activeIngredient: 'Paracetamol 500mg',
    dosageForm: 'Tablet',
    manufacturer: 'Demo Wellness Consumer Healthcare',
    status: 'ACTIVE',
    active: true,
  });

  const m4 = await medicinesCollection.insertOne({
    name: 'Cetirizine 10mg Allergy Relief',
    genericName: 'Cetirizine Hydrochloride',
    brandName: 'Zyrtec (DEMO)',
    category: 'Antihistamines (OTC)',
    description: 'Second-generation non-drowsy antihistamine for allergic rhinitis and hives.',
    indication: 'Seasonal allergic rhinitis, perennial allergic rhinitis, chronic urticaria (hives)',
    requiresPrescription: false,
    otcEligible: true,
    ageRestrictions: 'Adults and children 6 years and older',
    contraindications: ['Severe renal impairment (CrCl < 10 mL/min)', 'Hypersensitivity to hydroxyzine'],
    drugInteractions: ['CNS depressants', 'Alcohol (additive sedative effects in sensitive patients)'],
    warnings: ['May cause mild drowsiness in sensitive individuals', 'Exercise caution when driving or operating machinery'],
    safetyInformation: 'May cause mild drowsiness in sensitive individuals. Do not combine with alcohol.',
    activeIngredient: 'Cetirizine Hydrochloride 10mg',
    dosageForm: 'Tablet',
    manufacturer: 'Demo Allergy Solutions',
    status: 'ACTIVE',
    active: true,
  });

  const m5 = await medicinesCollection.insertOne({
    name: 'Metformin 500mg Extended Release',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage XR (DEMO)',
    category: 'Antidiabetic Agents',
    description: 'Biguanide antihyperglycemic agent for managing type 2 diabetes.',
    indication: 'Type 2 diabetes mellitus glycemic management',
    requiresPrescription: true,
    otcEligible: false,
    ageRestrictions: 'Adults 18+ only',
    contraindications: ['Severe renal dysfunction (eGFR < 30 mL/min)', 'Acute metabolic acidosis', 'Congestive heart failure requiring pharmacologic treatment'],
    drugInteractions: ['Iodinated radiocontrast media', 'Cimetidine', 'Alcohol'],
    warnings: ['Take with evening meal to minimize gastrointestinal discomfort', 'Suspend 48 hours prior to surgical procedures or radiological contrast tests'],
    safetyInformation: 'Take with food to minimize GI side effects. Strict contraindication in severe renal impairment.',
    activeIngredient: 'Metformin Hydrochloride 500mg',
    dosageForm: 'Extended-Release Tablet',
    manufacturer: 'Demo Diabetes Care Global',
    status: 'ACTIVE',
    active: true,
  });

  const m6 = await medicinesCollection.insertOne({
    name: 'Salbutamol (Albuterol) Inhaler 100mcg',
    genericName: 'Salbutamol Sulfate',
    brandName: 'Ventolin HFA (DEMO)',
    category: 'Respiratory / Bronchodilators',
    description: 'Fast-acting bronchodilator for acute relief of asthma and bronchospasm.',
    indication: 'Relief of bronchospasm in bronchial asthma and COPD, exercise-induced asthma prophylaxis',
    requiresPrescription: true,
    otcEligible: false,
    ageRestrictions: 'Adults and pediatric patients 4 years and older',
    contraindications: ['Known hypersensitivity to albuterol or propellant excipients'],
    drugInteractions: ['Non-selective beta-blockers (e.g. propranolol)', 'Digoxin', 'Diuretics'],
    warnings: ['Carry at all times for acute breathlessness', 'If relief requires increasing frequency of use, seek medical review immediately'],
    safetyInformation: 'Carry at all times. If symptom relief requires increasing frequency of use, seek medical review immediately.',
    activeIngredient: 'Salbutamol Sulfate 100mcg/actuation',
    dosageForm: 'Metered Dose Inhaler',
    manufacturer: 'Demo Pulmonary Therapeutics',
    status: 'ACTIVE',
    active: true,
  });

  // 6. Inventories
  await inventoryCollection.insertOne({
    pharmacyId: p1._id,
    medicineId: m1._id,
    quantity: 65,
    price: 18.5,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p1._id,
    medicineId: m2._id,
    quantity: 40,
    price: 24.0,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p1._id,
    medicineId: m3._id,
    quantity: 120,
    price: 6.99,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p1._id,
    medicineId: m4._id,
    quantity: 85,
    price: 11.5,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p1._id,
    medicineId: m5._id,
    quantity: 50,
    price: 14.25,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p1._id,
    medicineId: m6._id,
    quantity: 30,
    price: 32.0,
    availability: true,
  });

  // Inventory for p2
  await inventoryCollection.insertOne({
    pharmacyId: p2._id,
    medicineId: m1._id,
    quantity: 20,
    price: 19.99,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p2._id,
    medicineId: m3._id,
    quantity: 200,
    price: 5.99,
    availability: true,
  });
  await inventoryCollection.insertOne({
    pharmacyId: p2._id,
    medicineId: m6._id,
    quantity: 15,
    price: 34.5,
    availability: true,
  });

  // 7. Seed sample prescription for Patient Sarah
  const sampleRx = await prescriptionsCollection.insertOne({
    userId: patientUser._id,
    doctorName: 'Dr. Harrison Wells, MD',
    prescriptionDate: '2026-09-10',
    fileReference: 'demo_prescription_wells.pdf',
    originalFilename: 'Dr_Wells_Amoxicillin_Rx.pdf',
    mimeType: 'application/pdf',
    fileSize: 148520,
    status: 'ACTIVE',
    notes: 'Prescribed for acute bacterial pharyngitis, 500mg tid x 10 days.',
  });

  // 8. Seed sample order
  await ordersCollection.insertOne({
    orderNumber: 'ORD-98214',
    userId: patientUser._id,
    pharmacyId: p1._id,
    items: [
      {
        medicineId: m1._id,
        medicineName: m1.name,
        genericName: m1.genericName,
        quantity: 1,
        unitPrice: 18.5,
        requiresPrescription: true,
      },
      {
        medicineId: m3._id,
        medicineName: m3.name,
        genericName: m3.genericName,
        quantity: 1,
        unitPrice: 6.99,
        requiresPrescription: false,
      },
    ],
    totalAmount: 25.49,
    prescriptionId: sampleRx._id,
    status: 'UNDER_REVIEW',
    notes: 'Patient will pick up on Saturday morning.',
    pharmacistNotes: 'Reviewing Amoxicillin prescription validity against license records.',
    verifiedBy: pharmacistUser._id,
  });

  // 9. Seed sample appointment
  await appointmentsCollection.insertOne({
    appointmentNumber: 'APT-10492',
    userId: patientUser._id,
    hospitalId: h1._id,
    doctorId: doctorUser._id,
    department: 'Internal Medicine',
    appointmentDate: '2026-09-30',
    appointmentTime: '10:30 AM',
    symptoms: 'Follow-up consultation for seasonal asthma management and allergy control.',
    status: 'CONFIRMED',
    hospitalNotes: 'Confirmed by reception. Please arrive 15 minutes before the time slot.',
  });

  // 10. Audit log initial entry
  await auditLogsCollection.insertOne({
    userId: adminUser._id,
    userName: adminUser.name,
    role: 'ADMIN',
    action: 'SYSTEM_BOOTSTRAP',
    resource: 'DATABASE',
    details: { initialEntitiesSeeded: true },
    ipAddress: '127.0.0.1',
  });

  console.log('✅ Demo healthcare data successfully seeded with verified roles!');
}
