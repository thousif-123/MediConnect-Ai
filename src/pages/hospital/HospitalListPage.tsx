import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building,
  Phone,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';
import { Hospital, Doctor, Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MapView } from '../../components/common/MapView';
import { useLocation } from '../../context/LocationContext';

export const HospitalListPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Booking Modal State
  const [bookingDoc, setBookingDoc] = useState<Doctor | null>(null);
  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('2026-10-02');
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [symptoms, setSymptoms] = useState('');
  const [bookingStatus, setBookingStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { coords } = useLocation();
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hospRes, docRes] = await Promise.all([
        api.get('/hospitals', { params: { search, department: selectedDept } }),
        api.get('/hospitals/doctors/all', { params: { search, department: selectedDept } }),
      ]);
      setHospitals(hospRes.data.hospitals || []);
      setDoctors(docRes.data.doctors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedDept]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoc || !bookingHospital) return;

    if (!user) {
      setBookingStatus({ type: 'error', text: 'Please sign in to confirm an appointment.' });
      return;
    }

    setSubmitting(true);
    setBookingStatus(null);

    try {
      const res = await api.post('/appointments', {
        hospitalId: bookingHospital._id,
        doctorId: bookingDoc._id,
        department: bookingDoc.department,
        appointmentDate,
        appointmentTime,
        symptoms,
      });

      setBookingStatus({
        type: 'success',
        text: `Confirmed! Appointment Number: ${res.data.appointment.appointmentNumber}. A confirmation has been added to your dashboard.`,
      });
      setBookingDoc(null);
    } catch (err: any) {
      setBookingStatus({ type: 'error', text: err.message || 'Appointment booking failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const mapMarkers = hospitals.map((h) => ({
    lat: h.latitude,
    lng: h.longitude,
    title: h.name,
    subtitle: `${h.address} • Emergency: ${h.emergencyPhone || h.phone}`,
    type: 'hospital' as const,
  }));

  const allDepartments = [
    'Emergency Medicine',
    'Internal Medicine',
    'Cardiology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Neurology',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Building className="w-7 h-7 text-rose-600" />
          Hospitals, Clinics & Doctor Appointment Booking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore accredited healthcare facilities, specialty clinical departments, and reserve doctor consultation slots.
        </p>
      </div>

      {bookingStatus && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            bookingStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {bookingStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{bookingStatus.text}</span>
        </div>
      )}

      {/* Hospital Map View */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" /> Healthcare Facilities Map
          </span>
          <span className="text-slate-400">Red Pins = Hospitals & Trauma Centers</span>
        </div>
        <MapView
          center={coords ? [coords.lat, coords.lng] : [37.765, -122.42]}
          zoom={12}
          markers={mapMarkers}
          className="h-72 w-full rounded-xl overflow-hidden border border-slate-200"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals, doctors, or clinical conditions..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Specialty Departments</option>
          {allDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor & Clinic Slot Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Available Physicians & Consultation Slots ({doctors.length})
        </h2>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading specialist registry...</div>
        ) : doctors.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
            No doctors found matching the specified specialty or query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => {
              const hospital = hospitals.find((h) => h._id === doc.hospitalId);
              return (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                          {doc.department}
                        </span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        ${doc.consultationFee}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{doc.qualification}</p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hospital?.name || doc.hospitalName || 'Affiliated Hospital'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{hospital?.address}</div>
                    </div>

                    {doc.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                        "{doc.bio}"
                      </p>
                    )}

                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Days Available:</span>{' '}
                      {doc.availability?.join(', ') || 'Mon - Fri'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setBookingDoc(doc);
                        setBookingHospital(hospital || null);
                        setBookingStatus(null);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book Appointment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingDoc && bookingHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Confirm Appointment
              </h2>
              <button onClick={() => setBookingDoc(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">{bookingDoc.name}</div>
              <div className="text-emerald-700 font-semibold">{bookingDoc.department} • Fee: ${bookingDoc.consultationFee}</div>
              <div className="text-slate-500">{bookingHospital.name}</div>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Available Time Slot *
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {(bookingDoc.availableSlots || ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM']).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Visit / Symptoms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe current symptoms or consultation purpose..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingDoc(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Book & Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
