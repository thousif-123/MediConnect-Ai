import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Clock, ShieldX, AlertCircle, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  requireVerifiedPharmacist?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requireVerifiedPharmacist = false,
}) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-medium text-slate-500">Verifying secure healthcare session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role Mismatch Check (403 Unauthorized Role)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl shadow-sm border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your current account role is <span className="font-semibold text-rose-600">{user.role}</span>. This specific portal requires {allowedRoles.join(' or ')} credentials.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
          >
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Specific Pharmacist Verification State Handling
  if (user.role === 'PHARMACIST' && requireVerifiedPharmacist) {
    if (user.verificationStatus === 'PENDING') {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-amber-200 text-center space-y-5">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Verification In Progress
            </span>
            <h2 className="text-xl font-bold text-slate-900 pt-2">
              Your pharmacist account is awaiting verification.
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our clinical administration team reviews all pharmacist credentials and registration numbers before granting dispensary access.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Applicant</span>
              <span className="font-bold text-slate-800">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Registered Email</span>
              <span className="text-slate-700">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Status</span>
              <span className="font-bold text-amber-600">PENDING ADMINISTRATIVE APPROVAL</span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              For expedited verification or assistance, contact support at <strong>admin@demo.com</strong> or call <strong>+1 (555) 000-1122</strong>.
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => logout()}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <Link
              to="/"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Return Home
            </Link>
          </div>
        </div>
      );
    }

    if (user.verificationStatus === 'REJECTED') {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-3xl shadow-sm border border-rose-200 text-center space-y-5">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldX className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
              Verification Rejected
            </span>
            <h2 className="text-xl font-bold text-slate-900 pt-2">
              Your pharmacist verification was not approved.
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The submitted state pharmacy board license number or credentials could not be verified by administration.
            </p>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-left text-xs space-y-2">
            <div>
              <span className="text-rose-500 font-semibold block text-[10px] uppercase">Applicant</span>
              <span className="font-bold text-slate-800">{user.name}</span>
            </div>
            <div>
              <span className="text-rose-500 font-semibold block text-[10px] uppercase">Reason</span>
              <span className="text-rose-800">License credentials did not match the state pharmaceutical registrar records.</span>
            </div>
            <div className="pt-2 border-t border-rose-200 text-[11px] text-slate-600">
              Please appeal or submit updated registration documents to <strong>compliance@mediconnect.local</strong>.
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      );
    }
  }

  return <Outlet />;
};
