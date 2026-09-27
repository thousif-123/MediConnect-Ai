import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Pill,
  Building,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Activity,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog, PharmacistProfile, Pharmacy, UserProfile } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [pharmacists, setPharmacists] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'audit'>('verifications');

  const fetchAdminData = async () => {
    try {
      const [metRes, pharmRes, pRes, uRes, logRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/pharmacists'),
        api.get('/pharmacies'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);
      setMetrics(metRes.data.metrics);
      setPharmacists(pharmRes.data.pharmacists || []);
      setPharmacies(pRes.data.pharmacies || []);
      setUsers(uRes.data.users || []);
      setAuditLogs(logRes.data.auditLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyPharmacist = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.put(`/admin/pharmacists/${id}/verify`, { status });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleVerifyPharmacy = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.put(`/admin/pharmacies/${id}/verify`, { status });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await api.put(`/admin/users/${id}/status`, { status: nextStatus });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading system administration...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Administration & Security Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">System Oversight Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorize medical practitioners, audit compliance logs, inspect file access consents, and manage catalogue items.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-xs font-semibold">Total Users</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.users}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-xs font-semibold">Pharmacists</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.pharmacists}</div>
            <div className="text-[10px] text-amber-600 font-bold">{metrics.pendingPharmacists} Pending</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-xs font-semibold">Pharmacies</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{metrics.pharmacies}</div>
            <div className="text-[10px] text-amber-600 font-bold">{metrics.pendingPharmacies} Pending</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-xs font-semibold">Hospitals & Docs</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{metrics.hospitals} / {metrics.doctors}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-400 text-xs font-semibold">Orders & Bookings</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.orders} / {metrics.appointments}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'verifications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Clinical Verifications (Pharmacists & Pharmacies)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts & Access Control
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Audit Trail ({auditLogs.length} events)
        </button>
      </div>

      {/* Tab 1: Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-6">
          {/* Pharmacist verifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Pharmacist License Verifications
            </h2>
            <div className="space-y-3">
              {pharmacists.map((ph) => (
                <div
                  key={ph._id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ph.user?.name || 'Pharmacist Applicant'}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ph.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ph.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Reg Number: <strong>{ph.registrationNumber}</strong> • {ph.qualification}
                    </div>
                    <div className="text-slate-400 text-[10px]">{ph.user?.email} • Tel: {ph.phone}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ph.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyPharmacist(ph._id, 'VERIFIED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                      >
                        Approve License
                      </button>
                    )}
                    {ph.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleVerifyPharmacist(ph._id, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pharmacy verifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Dispensary & Pharmacy Facility Verifications
            </h2>
            <div className="space-y-3">
              {pharmacies.map((p) => (
                <div
                  key={p._id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      License: {p.licenseNumber} • Address: {p.address}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.verificationStatus !== 'VERIFIED' && (
                      <button
                        onClick={() => handleVerifyPharmacy(p._id, 'VERIFIED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                      >
                        Verify Pharmacy
                      </button>
                    )}
                    {p.verificationStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleVerifyPharmacy(p._id, 'REJECTED')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Registered Platform Accounts ({users.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      <div>{u.email}</div>
                      <div className="text-[10px]">{u.phone}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (u as any).status === 'SUSPENDED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {(u as any).status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, (u as any).status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            (u as any).status === 'SUSPENDED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {(u as any).status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Immutable Security Audit Trail
            </h2>
            <span className="text-xs text-slate-400">Captures authentication, consent, and clinical actions</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log._id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
                      {log.resource}
                    </span>
                    <span className="text-[10px] text-slate-500">by {log.userName} ({log.role})</span>
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
