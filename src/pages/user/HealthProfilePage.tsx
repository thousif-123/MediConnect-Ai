import React, { useState, useEffect } from 'react';
import {
  Heart,
  Shield,
  AlertTriangle,
  Pill,
  Phone,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';

export const HealthProfilePage: React.FC = () => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');

  const [newAllergy, setNewAllergy] = useState('');
  const [newMed, setNewMed] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedProfile = async () => {
      try {
        const res = await api.get('/users/medical-profile');
        setAllergies(res.data.allergies || []);
        setCurrentMedications(res.data.currentMedications || []);
        if (res.data.emergencyContact) {
          setEmergencyName(res.data.emergencyContact.name || '');
          setEmergencyPhone(res.data.emergencyContact.phone || '');
          setEmergencyRel(res.data.emergencyContact.relationship || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/users/medical-profile', {
        allergies,
        currentMedications,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: emergencyRel,
        },
      });
      setMessage('Medical profile updated successfully. This data informs AI triage safety checks.');
    } catch (err: any) {
      alert(err.message || 'Failed to update medical profile');
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const addMed = () => {
    if (newMed.trim() && !currentMedications.includes(newMed.trim())) {
      setCurrentMedications([...currentMedications, newMed.trim()]);
      setNewMed('');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading medical profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Heart className="w-7 h-7 text-rose-600" />
          Personal Medical Profile & Emergency Contacts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Securely record documented allergies and current medications. Used by AI triage and consulting pharmacists to screen for clinical contraindications.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Documented Allergies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Documented Drug & Environmental Allergies</h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addAllergy();
                }
              }}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={addAllergy}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {allergies.length === 0 ? (
              <span className="text-xs text-slate-400">No allergies listed.</span>
            ) : (
              allergies.map((all, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{all}</span>
                  <button
                    type="button"
                    onClick={() => setAllergies(allergies.filter((_, idx) => idx !== i))}
                    className="hover:text-rose-900"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Current Regular Medications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Current Regular Medications</h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMed}
              onChange={(e) => setNewMed(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMed();
                }
              }}
              placeholder="e.g. Metformin 500mg daily, Albuterol inhaler..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={addMed}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {currentMedications.length === 0 ? (
              <span className="text-xs text-slate-400">No current medications listed.</span>
            ) : (
              currentMedications.map((med, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{med}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentMedications(currentMedications.filter((_, idx) => idx !== i))}
                    className="hover:text-emerald-950"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Designated Emergency Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. John Connor"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <input
                type="text"
                value={emergencyRel}
                onChange={(e) => setEmergencyRel(e.target.value)}
                placeholder="e.g. Brother / Spouse"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+1 (555) 987-6543"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
        >
          {saving ? 'Encrypting & Saving...' : 'Save Medical Profile'}
        </button>
      </form>
    </div>
  );
};
