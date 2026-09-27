import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Routes
import authRoutes from './server/routes/auth.routes.js';
import userRoutes from './server/routes/user.routes.js';
import pharmacyRoutes from './server/routes/pharmacy.routes.js';
import pharmacistRoutes from './server/routes/pharmacist.routes.js';
import medicineRoutes from './server/routes/medicine.routes.js';
import prescriptionRoutes from './server/routes/prescription.routes.js';
import orderRoutes from './server/routes/order.routes.js';
import hospitalRoutes from './server/routes/hospital.routes.js';
import appointmentRoutes from './server/routes/appointment.routes.js';
import aiRoutes from './server/routes/ai.routes.js';
import adminRoutes from './server/routes/admin.routes.js';

import { seedInitialData } from './server/services/seedService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Security Headers with safe CSP allowing Leaflet tiles & styles
  app.use(
    helmet({
      contentSecurityPolicy: false, // In Vite dev server CSP can interfere with HMR/inline scripts
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(cors({
    origin: true,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Bootstrap initial DEMO dataset
  await seedInitialData();

  // API Endpoints
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

  // Health probe
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      app: 'MediConnect AI',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Client integration: Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MediConnect AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
