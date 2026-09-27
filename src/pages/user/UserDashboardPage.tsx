import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  FileText,
  ShoppingCart,
  Calendar,
  User,
  Heart,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Order, Appointment, Prescription } from '../../types';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [ordRes, aptRes, rxRes] = await Promise.all([
          api.get('/orders'),
          api.get('/appointments'),
          api.get('/prescriptions'),
        ]);
        setOrders(ordRes.data.orders || []);
        setAppointments(aptRes.data.appointments || []);
        setPrescriptions(rxRes.data.prescriptions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'ACCEPTED':
      case 'READY_FOR_PICKUP':
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">{status.replace('_', ' ')}</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">Pharmacist Review</span>;
      case 'REJECTED':
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Patient Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-emerald-100 max-w-xl">
            Track your health triage, medicine pickup orders, active prescriptions, and scheduled clinic appointments from your unified healthcare workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/ai-assistant"
            className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" /> Start Health Triage
          </Link>
          <Link
            to="/health-profile"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4" /> Medical Profile
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{orders.length}</div>
            <div className="text-xs text-slate-500 font-medium">Medicine Reservations</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{appointments.length}</div>
            <div className="text-xs text-slate-500 font-medium">Doctor Appointments</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{prescriptions.length}</div>
            <div className="text-xs text-slate-500 font-medium">Stored Prescriptions</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Medicine Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" /> Recent Medicine Reservations
            </h2>
            <Link to="/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No medicine orders placed yet.</p>
              <Link to="/pharmacies" className="inline-block text-emerald-600 font-bold hover:underline">
                Browse Pharmacies & Reserve Stock →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 4).map((order) => (
                <div key={order._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{order.orderNumber}</span>
                      {getOrderStatusBadge(order.status)}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {order.items?.length} items • Total: ${order.totalAmount?.toFixed(2)}
                    </div>
                    {order.pharmacistNotes && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        Pharmacist note: {order.pharmacistNotes}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" /> Upcoming Hospital Appointments
            </h2>
            <Link to="/hospitals" className="text-xs font-semibold text-purple-600 hover:underline">
              Book New
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <p>No appointments scheduled.</p>
              <Link to="/hospitals" className="inline-block text-purple-600 font-bold hover:underline">
                Find Doctors & Book Slots →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map((apt) => (
                <div key={apt._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{apt.doctor?.name || 'Assigned Physician'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {apt.department} • {apt.appointmentDate} at {apt.appointmentTime}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Ref: {apt.appointmentNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
