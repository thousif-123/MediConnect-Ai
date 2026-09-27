import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

// Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { MedicalStorePage } from './pages/public/MedicalStorePage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/public/AuthPages';
import { AIAssistantPage } from './pages/triage/AIAssistantPage';
import { PharmacyListPage } from './pages/pharmacy/PharmacyListPage';
import { PharmacyDetailPage } from './pages/pharmacy/PharmacyDetailPage';
import { HospitalListPage } from './pages/hospital/HospitalListPage';

// User Pages
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { PrescriptionsPage } from './pages/user/PrescriptionsPage';
import { HealthProfilePage } from './pages/user/HealthProfilePage';
import { OrdersPage, OrderDetailPage } from './pages/user/OrderPages';

// Role Portals
import { PharmacistDashboardPage } from './pages/pharmacist/PharmacistDashboardPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { HospitalAdminDashboardPage } from './pages/hospitalAdmin/HospitalAdminDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/medical-store" element={<MedicalStorePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                <Route path="/pharmacies" element={<PharmacyListPage />} />
                <Route path="/pharmacies/:id" element={<PharmacyDetailPage />} />
                <Route path="/hospitals" element={<HospitalListPage />} />
                <Route path="/hospitals/:id" element={<HospitalListPage />} />
                <Route path="/doctors" element={<HospitalListPage />} />

                {/* Patient / Authenticated User Routes */}
                <Route element={<ProtectedRoute allowedRoles={['USER', 'PHARMACIST', 'DOCTOR', 'HOSPITAL_ADMIN', 'ADMIN']} />}>
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route path="/prescriptions" element={<PrescriptionsPage />} />
                  <Route path="/health-profile" element={<HealthProfilePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/appointments" element={<UserDashboardPage />} />
                </Route>

                {/* Pharmacist Specific Portal */}
                <Route element={<ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']} requireVerifiedPharmacist={true} />}>
                  <Route path="/pharmacist/dashboard" element={<PharmacistDashboardPage />} />
                  <Route path="/pharmacist/orders" element={<PharmacistDashboardPage />} />
                  <Route path="/pharmacist/prescriptions" element={<PharmacistDashboardPage />} />
                </Route>

                {/* Doctor Portal */}
                <Route element={<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']} />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
                  <Route path="/doctor/appointments" element={<DoctorDashboardPage />} />
                </Route>

                {/* Hospital Admin Portal */}
                <Route element={<ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'ADMIN']} />}>
                  <Route path="/hospital/dashboard" element={<HospitalAdminDashboardPage />} />
                </Route>

                {/* Admin Portal */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminDashboardPage />} />
                  <Route path="/admin/audit-logs" element={<AdminDashboardPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
