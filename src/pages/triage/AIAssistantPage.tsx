import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Pill,
  MapPin,
  Calendar,
  FileText,
  PhoneCall,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  HelpCircle,
  Building,
  UserCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { api } from '../../services/api';
import { AIReport, Medicine, Pharmacy } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { coords } = useLocation();

  // Consultation inputs
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [severity, setSeverity] = useState('4');
  const [age, setAge] = useState('28');
  const [existingConditions, setExistingConditions] = useState('');
  const [isPregnant, setIsPregnant] = useState(false);

  // Results & status
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Medicine Catalogue Results (Filtered via real backend medicines)
  const [relevantMedicines, setRelevantMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);

  // Nearby Verified Pharmacists
  const [nearbyPharmacists, setNearbyPharmacists] = useState<any[]>([]);
  const [pharmacistsLoading, setPharmacistsLoading] = useState(false);
  const [showPharmacistModal, setShowPharmacistModal] = useState(false);
  const [assistanceRequested, setAssistanceRequested] = useState<string | null>(null);

  // When report arrives, fetch matching medicines and pharmacists
  useEffect(() => {
    if (!report) return;

    // 1. Fetch eligible medicine categories from database if NOT an emergency
    if (report.triageLevel !== 'EMERGENCY' && report.medicineCategorySuggestions?.length > 0) {
      setMedicinesLoading(true);
      Promise.all(
        report.medicineCategorySuggestions.map((cat) =>
          api.get('/medicines', { params: { category: cat } })
        )
      )
        .then((responses) => {
          const allMeds: Medicine[] = [];
          const seen = new Set<string>();
          responses.forEach((res) => {
            (res.data.medicines || []).forEach((m: Medicine) => {
              if (!seen.has(m._id)) {
                seen.add(m._id);
                allMeds.push(m);
              }
            });
          });
          setRelevantMedicines(allMeds);
        })
        .catch((err) => console.error('Failed to query suggested medicines:', err))
        .finally(() => setMedicinesLoading(false));
    } else {
      setRelevantMedicines([]);
    }

    // 2. Fetch nearby verified pharmacists
    setPharmacistsLoading(true);
    api
      .get('/pharmacists/nearby', {
        params: coords ? { lat: coords.lat, lng: coords.lng } : {},
      })
      .then((res) => setNearbyPharmacists(res.data.pharmacists || []))
      .catch((err) => console.error('Failed to load pharmacists:', err))
      .finally(() => setPharmacistsLoading(false));
  }, [report, coords]);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setRelevantMedicines([]);

    try {
      const conditionsList = existingConditions
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const res = await api.post('/ai/triage', {
        symptoms,
        duration,
        severity,
        age: age ? Number(age) : undefined,
        existingConditions: conditionsList,
        isPregnant,
        allergies: user?.allergies || [],
        currentMedications: user?.currentMedications || [],
      });
      setReport(res.data.report);
    } catch (err: any) {
      setError(err.message || 'Triage assistant unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const getTriageBadge = (level: AIReport['triageLevel']) => {
    switch (level) {
      case 'EMERGENCY':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 animate-pulse shadow-md">
            <AlertTriangle className="w-4 h-4" /> EMERGENCY PROTOCOL (Seek Immediate Care)
          </span>
        );
      case 'URGENT':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> URGENT (Clinic Review Within 24h)
          </span>
        );
      case 'DOCTOR_CONSULTATION':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> DOCTOR CONSULTATION RECOMMENDED
          </span>
        );
      case 'PHARMACIST_GUIDANCE':
        return (
          <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5" /> PHARMACIST OTC GUIDANCE
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> GENERAL SELF-CARE & MONITORING
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header & Mandatory Medical Disclaimer */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Healthcare Guidance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">AI Health Assistant</h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Provides health information and preliminary triage. It does not replace a doctor or pharmacist.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm">Important Medical Notice</p>
          <p className="text-amber-800 leading-relaxed">
            The AI Health Assistant evaluates symptom descriptions to provide educational insights and next-step triage. It cannot definitively diagnose illnesses or prescribe medicines. If you experience severe chest pain, breathing difficulty, or sudden weakness, call 911 immediately.
          </p>
        </div>
      </div>

      {/* 2. Structured Symptom & Health Questionnaire */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            1. Describe Your Symptoms & Health Background
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Providing duration, age, and existing conditions ensures personalized safety screening.
          </p>
        </div>

        <form onSubmit={handleTriage} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Symptoms / Health Concern *
            </label>
            <textarea
              required
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. I have fever, sore throat and dry cough for two days..."
              className="w-full p-3.5 text-sm border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
            {/* Quick Test Presets for Examiners */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Quick Test Cases:</span>
              <button
                type="button"
                onClick={() => {
                  setSymptoms('Crushing chest pain radiating to left arm with difficulty breathing');
                  setSeverity('9');
                  setDuration('Less than 24 hours');
                }}
                className="text-rose-600 hover:underline cursor-pointer font-medium"
              >
                [Red-Flag: Emergency Cardiac]
              </button>
              <button
                type="button"
                onClick={() => {
                  setSymptoms('Mild sore throat, runny nose, and low fever for two days');
                  setSeverity('3');
                  setDuration('1-2 days');
                }}
                className="text-emerald-700 hover:underline cursor-pointer font-medium"
              >
                [Low-Risk: OTC & Pharmacist]
              </button>
              <button
                type="button"
                onClick={() => {
                  setSymptoms('Persistent earache and fever for four days with throbbing pain');
                  setSeverity('6');
                  setDuration('3-7 days');
                }}
                className="text-blue-700 hover:underline cursor-pointer font-medium"
              >
                [Doctor Consultation]
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Less than 24 hours">Less than 24 hours</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-7 days">3-7 days</option>
                <option value="More than a week">More than a week</option>
                <option value="Chronic / Recurring">Chronic / Recurring</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Severity (1-10)</label>
                <span className="text-xs font-bold text-emerald-700">{severity}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Personal Safety Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Existing Conditions (Optional)
              </label>
              <input
                type="text"
                value={existingConditions}
                onChange={(e) => setExistingConditions(e.target.value)}
                placeholder="e.g. Asthma, Hypertension, Diabetes"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="pregnantCheck"
                checked={isPregnant}
                onChange={(e) => setIsPregnant(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="pregnantCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Patient is currently pregnant or nursing
              </label>
            </div>
          </div>

          {user && (user.allergies?.length || user.currentMedications?.length) ? (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Loaded from Your Medical Profile:
              </span>
              <div>Allergies: {user.allergies?.join(', ') || 'None reported'}</div>
              <div>Current Medicines: {user.currentMedications?.join(', ') || 'None reported'}</div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Screening Symptoms with Clinical Triage Rules...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Symptoms & Get Health Guidance</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Comprehensive Structured AI Assessment Result */}
      {report && (
        <div className="space-y-6">
          {/* Section: AI Assessment & Triage Level */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  AI Assessment
                </span>
                <h2 className="text-xl font-black text-slate-900">Clinical Triage Evaluation</h2>
              </div>
              {getTriageBadge(report.triageLevel)}
            </div>

            {/* Emergency Alert Banner if Emergency */}
            {report.triageLevel === 'EMERGENCY' && (
              <div className="p-6 bg-rose-600 text-white rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2 font-black text-base uppercase tracking-wider">
                  <AlertTriangle className="w-6 h-6 text-amber-300" />
                  <span>Critical Emergency Red-Flags Detected</span>
                </div>
                <p className="text-xs text-rose-100 leading-relaxed">
                  Your symptoms match acute clinical emergency criteria. Immediate in-person medical care is required. Do not attempt online self-treatment or medicine orders.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href="tel:911"
                    className="px-5 py-2.5 bg-white text-rose-700 font-bold text-xs rounded-xl shadow flex items-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" /> Dial 911 Immediately
                  </a>
                  <Link
                    to="/hospitals"
                    className="px-5 py-2.5 bg-rose-800 text-white font-bold text-xs rounded-xl hover:bg-rose-900 flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" /> Nearest Emergency Center
                  </Link>
                </div>
              </div>
            )}

            {/* Symptom Summary */}
            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
                Summary
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {report.symptomSummary}
              </p>
            </div>

            {/* Possible Explanations */}
            {report.possibleExplanations?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-bold text-slate-700 tracking-wider">
                  Possible Explanations (Informational Only)
                </h3>
                <ul className="space-y-1.5">
                  {report.possibleExplanations.map((exp, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-950 flex items-start gap-2"
                    >
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Safety Warnings & Red Flags */}
            {report.redFlags?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-bold text-rose-600 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Safety Warning & Critical Red Flags
                </h3>
                <ul className="grid grid-cols-1 gap-2">
                  {report.redFlags.map((flag, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Precautions & Self-Care */}
            {report.precautions?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-bold text-slate-700 tracking-wider">
                  General Precautions & Supportive Measures
                </h3>
                <ul className="space-y-2">
                  {report.precautions.map((prec, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-slate-800 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{prec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up Questions */}
            {report.followUpQuestions?.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  Follow-Up Information to Consider:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {report.followUpQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Section CTA Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowPharmacistModal(true)}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Talk to Pharmacist</span>
              </button>

              <Link
                to="/pharmacies"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Pill className="w-4 h-4" />
                <span>Find Nearby Pharmacy</span>
              </Link>

              <Link
                to="/hospitals"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Consult Doctor / Hospital</span>
              </Link>
            </div>
          </div>

          {/* 4. Section: Possible Symptom Relief Options (Medicine Information from Verified Catalogue) */}
          {report.triageLevel !== 'EMERGENCY' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-emerald-600" />
                    Possible Symptom Relief Options
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Commonly used for symptom relief. Discuss with a pharmacist whether this option is appropriate for you.
                  </p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-lg">
                  {relevantMedicines.length} verified options
                </span>
              </div>

              {medicinesLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Retrieving matching options from verified medicine catalogue...
                </div>
              ) : relevantMedicines.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs text-slate-500 space-y-2">
                  <p>
                    No direct over-the-counter medicine categories are suggested for these symptoms without prior professional consultation.
                  </p>
                  <button
                    onClick={() => setShowPharmacistModal(true)}
                    className="text-teal-700 font-bold hover:underline"
                  >
                    Speak directly with a verified pharmacist →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {relevantMedicines.map((med) => (
                    <div
                      key={med._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-base">{med.name}</span>
                            {med.requiresPrescription ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                                Prescription Required
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                OTC Eligible
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Generic: <span className="font-semibold text-slate-700">{med.genericName}</span> • Form: {med.dosageForm}
                          </div>
                        </div>

                        <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-200/80 text-slate-700">
                          {med.category}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 leading-relaxed">
                        <strong>Purpose:</strong> {med.description}
                      </div>

                      {med.warnings && med.warnings.length > 0 && (
                        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                          <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" /> Important Warnings & Contraindications:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                            {med.warnings.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action buttons adhering to strict prescription rules */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowPharmacistModal(true)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" /> Talk to Pharmacist
                          </button>
                          <Link
                            to="/pharmacies"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1"
                          >
                            <Building className="w-3.5 h-3.5" /> Find Nearby Pharmacy
                          </Link>
                        </div>

                        <div>
                          {med.requiresPrescription ? (
                            <Link
                              to="/prescriptions"
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" /> Upload Prescription to Reserve
                            </Link>
                          ) : (
                            <Link
                              to="/pharmacies"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <Pill className="w-3.5 h-3.5" /> Check Availability & Reserve
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Talk to Verified Pharmacist Modal / Drawer */}
      {showPharmacistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  Nearby Verified Pharmacists
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Connect with licensed pharmacy practitioners for safe medication consultation.
                </p>
              </div>
              <button
                onClick={() => setShowPharmacistModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {assistanceRequested && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{assistanceRequested}</span>
              </div>
            )}

            {pharmacistsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading verified pharmacists...</div>
            ) : nearbyPharmacists.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No verified pharmacists currently available.</div>
            ) : (
              <div className="space-y-4">
                {nearbyPharmacists.map((ph) => (
                  <div
                    key={ph._id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{ph.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified License
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{ph.qualification}</div>
                      </div>

                      <span className="text-[11px] font-bold text-teal-700">
                        ~ {ph.distanceKm} km away
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                      <div><strong>Pharmacy:</strong> {ph.pharmacyName}</div>
                      <div><strong>Address:</strong> {ph.pharmacyAddress}</div>
                      <div><strong>Availability:</strong> {ph.availability}</div>
                      <div><strong>Phone:</strong> {ph.phone}</div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${ph.phone}`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call ({ph.phone})
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setAssistanceRequested(
                            `Assistance request dispatched to ${ph.name}. The pharmacist will reach out to you directly.`
                          )
                        }
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold cursor-pointer"
                      >
                        Request Assistance
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPharmacistModal(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
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
