import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import { api } from '../../services/api';
import { Hospital, Doctor, Appointment } from '../../types';

export const HospitalAdminDashboardPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hRes, dRes, aRes] = await Promise.all([
          api.get('/hospitals'),
          api.get('/hospitals/doctors/all'),
          api.get('/appointments'),
        ]);
        setHospitals(hRes.data.hospitals || []);
        setDoctors(dRes.data.doctors || []);
        setAppointments(aRes.data.appointments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading hospital administration...</div>;
  }

  const primaryHospital = hospitals[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Facility Administration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {primaryHospital?.name || 'City General Health Center'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">{primaryHospital?.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold">Active Departments</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{primaryHospital?.departments?.length || 5}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold">On-Duty Physicians</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{doctors.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-semibold">Total Hospital Bookings</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{appointments.length}</div>
        </div>
      </div>

      {/* Doctor Staff Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Clinical Department Staff & Consultation Schedules
        </h2>
        <div className="space-y-3">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">{doc.name}</div>
                <div className="text-slate-500">{doc.department} • Reg: {doc.registrationNumber}</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700">${doc.consultationFee}</span>
                <div className="text-[10px] text-slate-400">Available: {doc.availability?.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
