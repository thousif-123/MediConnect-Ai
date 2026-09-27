import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Building,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchDoctorAppointments();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
            Clinical Practice Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1">Review scheduled patient appointments and clinical consultation records.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Scheduled Patient Consultations ({appointments.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No scheduled appointments found.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt._id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {apt.user?.name || 'Patient'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                      {apt.status}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    <strong>Date & Time:</strong> {apt.appointmentDate} at {apt.appointmentTime}
                  </div>
                  {apt.symptoms && (
                    <div className="text-slate-500 italic">
                      "Symptoms: {apt.symptoms}"
                    </div>
                  )}
                  <div className="text-slate-400 text-[10px]">Ref: {apt.appointmentNumber} • Phone: {apt.user?.phone}</div>
                </div>

                <div className="flex items-center gap-2">
                  {apt.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(apt._id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                    >
                      Mark Completed
                    </button>
                  )}
                  {apt.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdateStatus(apt._id, 'CANCELLED')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold"
                    >
                      Cancel Slot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
