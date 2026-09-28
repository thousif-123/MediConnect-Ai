import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import pharmacistRoutes from './routes/pharmacist.routes.js';
import medicineRoutes from './routes/medicine.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import orderRoutes from './routes/order.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import aiRoutes from './routes/ai.routes.js';
import adminRoutes from './routes/admin.routes.js';

import { seedInitialData } from './services/seedService.js';

let appPromise: Promise<express.Express> | null = null;

export function createApp(): Promise<express.Express> {
  if (!appPromise) {
    appPromise = initializeApp();
  }

  return appPromise;
}

async function initializeApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
  }));
  app.use(cookieParser());

  // Initialize demo data if the database is empty
  await seedInitialData();

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/pharmacies', pharmacyRoutes);
  app.use('/api/pharmacists', pharmacistRoutes);
  app.use('/api/medicines', medicineRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/hospitals', hospitalRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      app: 'MediConnect AI',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  return app;
}