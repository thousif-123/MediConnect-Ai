import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Shield,
  Clock,
  Trash2,
  Share2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { Prescription, ConsentRecord } from '../../types';

export const PrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Share consent modal state
  const [sharingRx, setSharingRx] = useState<Prescription | null>(null);
  const [recipientType, setRecipientType] = useState<'PHARMACIST' | 'DOCTOR' | 'PHARMACY'>('PHARMACIST');
  const [recipientName, setRecipientName] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [purpose, setPurpose] = useState('Order verification');
  const [durationHours, setDurationHours] = useState('72');
  const [sharingLoading, setSharingLoading] = useState(false);

  // View sharing history modal
  const [historyRx, setHistoryRx] = useState<Prescription | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage({ type: 'error', text: 'Please select a prescription document file.' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('prescriptionFile', file);
    formData.append('doctorName', doctorName);
    formData.append('prescriptionDate', prescriptionDate);
    formData.append('notes', notes);

    try {
      await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMessage({ type: 'success', text: 'Prescription uploaded into private vault successfully!' });
      setShowUploadModal(false);
      setFile(null);
      setDoctorName('');
      setNotes('');
      fetchPrescriptions();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Prescription upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this prescription? Any active sharing consents will be revoked.')) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
      setStatusMessage({ type: 'success', text: 'Prescription deleted securely.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete prescription' });
    }
  };

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingRx) return;
    setSharingLoading(true);
    try {
      await api.post(`/prescriptions/${sharingRx._id}/share`, {
        recipientType,
        recipientId: recipientId || 'ALL_VERIFIED_STAFF',
        recipientName: recipientName || 'Verified Clinical Staff',
        purpose,
        durationHours,
      });
      setStatusMessage({ type: 'success', text: 'Temporary consent granted. The healthcare provider can now securely access this document.' });
      setSharingRx(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to grant consent' });
    } finally {
      setSharingLoading(false);
    }
  };

  const openConsentHistory = async (rx: Prescription) => {
    setHistoryRx(rx);
    try {
      const res = await api.get(`/prescriptions/${rx._id}/consents`);
      setConsents(res.data.consents || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await api.put(`/prescriptions/consents/${consentId}/revoke`);
      setConsents((prev) =>
        prev.map((c) => (c._id === consentId ? { ...c, revoked: true } : c))
      );
      setStatusMessage({ type: 'success', text: 'Access consent revoked immediately.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to revoke consent' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-600" />
            Prescription Vault & Consent
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Zero-knowledge private storage. Only you control which pharmacist or physician can inspect your medical files.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Prescription</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Security Architecture Notice */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">Private Object Storage Isolation</span>
            <span className="text-slate-400">
              Files are saved in backend storage with hashed references. Direct URLs are disabled; viewing requires signed JWT + unexpired explicit consent.
            </span>
          </div>
        </div>
      </div>

      {/* Prescription List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading prescription vault...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Prescriptions Uploaded Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your doctor's prescriptions to reserve prescription-only medicines or share with pharmacists securely.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            Upload First Prescription
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rx.originalFilename}</h3>
                      <div className="text-[11px] text-slate-400">
                        Size: {(rx.fileSize / 1024).toFixed(1)} KB • Type: {rx.mimeType}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {rx.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="font-semibold text-slate-700">Prescribing Doctor:</span> {rx.doctorName || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Prescription Date:</span> {rx.prescriptionDate}
                  </div>
                  {rx.notes && (
                    <div>
                      <span className="font-semibold text-slate-700">Clinical Notes:</span> {rx.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/prescriptions/${rx._id}/view`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                  <button
                    onClick={() => {
                      setSharingRx(rx);
                      setRecipientName('');
                      setRecipientId('');
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1 border border-emerald-200"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button
                    onClick={() => openConsentHistory(rx)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-semibold flex items-center gap-1 border border-blue-200"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Consents
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(rx._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete prescription"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" /> Upload Prescription Document
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document File (PDF, PNG, JPEG) *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor / Clinic Name
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Emily Johnson, MD"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Issue *
                </label>
                <input
                  type="date"
                  required
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prescription Details / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Prescribed for respiratory illness, 5-day antibiotic course..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {uploading ? 'Encrypting & Storing...' : 'Upload Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grant Consent Modal */}
      {sharingRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" /> Grant Timed Consent
              </h2>
              <button onClick={() => setSharingRx(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">{sharingRx.originalFilename}</div>
              <div className="text-[11px] text-slate-500">Issued by {sharingRx.doctorName || 'Prescriber'}</div>
              <p className="font-semibold text-emerald-800 pt-1">
                Share this prescription with {recipientName || 'selected Healthcare Professional/Pharmacy'}?
              </p>
            </div>

            <form onSubmit={handleGrantConsent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Professional Type
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="PHARMACIST">Verified Pharmacist</option>
                  <option value="DOCTOR">Consulting Doctor</option>
                  <option value="PHARMACY">Local Partner Pharmacy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Name / Facility
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Dr. Marcus Vance / Beacon Hill Pharmacy"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Duration (Consent Expiry)
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="72">72 Hours (3 Days - Recommended)</option>
                  <option value="168">7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purpose of Access
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Clinical prescription audit for medication pickup"
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSharingRx(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharingLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {sharingLoading ? 'Granting...' : 'Allow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consent History Modal */}
      {historyRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" /> Active Consents for {historyRx.originalFilename}
              </h2>
              <button onClick={() => setHistoryRx(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {consents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active or past consents logged for this prescription.
                </div>
              ) : (
                consents.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900">{c.recipientName || 'Clinical Recipient'}</span>
                        <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                          {c.recipientType}
                        </span>
                      </div>
                      {c.revoked ? (
                        <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                          Revoked
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      <strong>Purpose:</strong> {c.purpose}
                    </div>
                    <div className="text-slate-400 text-[10px] flex justify-between items-center">
                      <span>Expires: {new Date(c.expiresAt).toLocaleString()}</span>
                      {!c.revoked && (
                        <button
                          onClick={() => handleRevokeConsent(c._id)}
                          className="text-rose-600 hover:underline font-semibold cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setHistoryRx(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
