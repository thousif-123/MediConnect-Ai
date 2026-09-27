import React, { useState, useEffect } from 'react';
import {
  Pill,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  User,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Send,
  Building,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, PharmacistProfile, Pharmacy } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const PharmacistDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PharmacistProfile | null>(null);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['status']>('ACCEPTED');
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchPharmacistData = async () => {
    try {
      const [profRes, ordRes] = await Promise.all([
        api.get('/pharmacists/me'),
        api.get('/pharmacists/orders'),
      ]);
      setProfile(profRes.data.profile);
      setPharmacy(profRes.data.pharmacy);
      setOrders(ordRes.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      await api.put(`/pharmacists/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        pharmacistNotes,
      });
      setSelectedOrder(null);
      fetchPharmacistData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading pharmacist portal...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Licensed Clinical Pharmacist Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{user?.name}</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            {profile?.qualification} • License: {profile?.registrationNumber}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {profile?.verificationStatus === 'VERIFIED' ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Admin Verified Pharmacist
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> License Verification Pending
            </span>
          )}
        </div>
      </div>

      {/* Affiliated Pharmacy Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            Operating Dispensary
          </span>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            {pharmacy?.name || 'Beacon Hill Community Pharmacy (Default)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{pharmacy?.address || 'Medical Corridor, Suite 100'}</p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
          <div><strong>Hours:</strong> {pharmacy?.openingHours || '8:00 AM - 10:00 PM'}</div>
          <div><strong>Dispensary Tel:</strong> {pharmacy?.phone || '+1 (555) 888-2121'}</div>
        </div>
      </div>

      {/* Orders & Prescription Verification List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              Incoming Patient Medicine Reservations & Rx Verifications ({orders.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit patient-uploaded prescriptions before confirming pickup readiness.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active medicine orders or prescription verification requests pending.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const hasRx = Boolean(order.prescriptionId);
              return (
                <div
                  key={order._id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{order.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            order.status === 'UNDER_REVIEW'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : order.status === 'ACCEPTED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : order.status === 'READY_FOR_PICKUP'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                        {hasRx && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Rx Verification Required
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Placed on {new Date(order.createdAt).toLocaleString()} • Patient ID: {order.userId}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        ${order.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">Payment upon pickup</div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block mb-1">Requested Items:</span>
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>
                          {it.quantity}x {it.medicineName} {it.genericName ? `(${it.genericName})` : ''}
                        </span>
                        <span className="font-semibold">${(it.quantity * it.unitPrice).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Prescription document inspection */}
                  {order.prescription && (
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="font-bold text-rose-900 block">
                          Patient Uploaded Prescription Document
                        </span>
                        <span className="text-[11px] text-rose-700">
                          {order.prescription.originalFilename} (Doctor: {order.prescription.doctorName || 'Prescriber'})
                        </span>
                      </div>

                      <a
                        href={`/api/prescriptions/${order.prescription._id}/view`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect Prescription
                      </a>
                    </div>
                  )}

                  {/* Pharmacist Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-200/60">
                    <div className="text-xs text-slate-600">
                      {order.pharmacistNotes ? (
                        <span><strong>Notes:</strong> {order.pharmacistNotes}</span>
                      ) : (
                        <span className="text-slate-400 italic">No clinical notes recorded.</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                        setPharmacistNotes(order.pharmacistNotes || '');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" /> Audit & Update Order Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Update Order Status: {selectedOrder.orderNumber}
            </h2>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fulfillment State</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Auditing Prescription)</option>
                  <option value="ACCEPTED">ACCEPTED (Verified & Dispensing)</option>
                  <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (Bagged at counter)</option>
                  <option value="COMPLETED">COMPLETED (Collected by Patient)</option>
                  <option value="REJECTED">REJECTED (Invalid Rx or Contraindication)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pharmacist Clinical Notes (Visible to Patient)
                </label>
                <textarea
                  rows={3}
                  value={pharmacistNotes}
                  onChange={(e) => setPharmacistNotes(e.target.value)}
                  placeholder="e.g. Prescription validated against registry. Please bring government ID for pickup..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
