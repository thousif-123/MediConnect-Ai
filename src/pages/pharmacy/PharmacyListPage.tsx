import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Search,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Compass,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { Pharmacy } from '../../types';
import { useLocation, PRESET_CITIES } from '../../context/LocationContext';
import { MapView } from '../../components/common/MapView';

export const PharmacyListPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  const { coords, cityName, requestCurrentLocation, setManualLocation, isLocating, error, clearError } = useLocation();

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (verifiedOnly) params.verifiedOnly = 'true';
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }
      const res = await api.get('/pharmacies', { params });
      setPharmacies(res.data.pharmacies);
      if (res.data.pharmacies.length > 0 && !selectedPharmacy) {
        setSelectedPharmacy(res.data.pharmacies[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [coords?.lat, coords?.lng, verifiedOnly]);

  const mapMarkers: Array<{
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    type?: 'pharmacy' | 'hospital' | 'user';
    onClick?: () => void;
  }> = pharmacies.map((p) => ({
    lat: p.latitude,
    lng: p.longitude,
    title: p.name,
    subtitle: `${p.address} • Tel: ${p.phone}`,
    type: 'pharmacy' as const,
    onClick: () => setSelectedPharmacy(p),
  }));

  if (coords) {
    mapMarkers.push({
      lat: coords.lat,
      lng: coords.lng,
      title: 'Your Selected Location',
      subtitle: cityName,
      type: 'user' as const,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Pill className="w-7 h-7 text-emerald-600" />
            Nearby Pharmacies & Medicine Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Locate licensed pharmacies, verify pharmacist credentials, view stock, and place pickup reservations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* City Preset Selector */}
          <select
            value={cityName}
            onChange={(e) => {
              const selected = PRESET_CITIES.find((c) => c.name === e.target.value);
              if (selected) {
                setManualLocation(selected.lat, selected.lng, selected.name);
              }
            }}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            {PRESET_CITIES.map((city) => (
              <option key={city.name} value={city.name}>
                📍 {city.name}
              </option>
            ))}
          </select>

          <button
            onClick={requestCurrentLocation}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>
      </div>

      {/* Location Error / Notice Banner */}
      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="p-1 hover:bg-amber-100 rounded-lg text-amber-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" /> Interactive Pharmacy Map ({pharmacies.length} locations)
          </span>
          <span className="text-slate-400">Green Pins = Pharmacies • Blue Pin = {cityName}</span>
        </div>
        <MapView
          center={coords ? [coords.lat, coords.lng] : [37.7749, -122.4194]}
          zoom={13}
          markers={mapMarkers}
          className="h-80 w-full rounded-xl overflow-hidden border border-slate-200"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPharmacies()}
            placeholder="Search by pharmacy name, street address, or license..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={fetchPharmacies}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          Search
        </button>
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
            verifiedOnly
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Verified Only</span>
        </button>
      </div>

      {/* Pharmacy Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading nearby pharmacies...</div>
      ) : pharmacies.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200 p-8">
          No pharmacies found matching your criteria. Try expanding search or resetting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy._id}
              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                selectedPharmacy?._id === pharmacy._id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{pharmacy.name}</h3>
                  {pharmacy.verificationStatus === 'VERIFIED' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{pharmacy.address}</span>
                  </div>
                  {pharmacy.distanceKm !== undefined && (
                    <div className="text-[11px] font-semibold text-emerald-700 pl-5">
                      ~ {pharmacy.distanceKm} km from your location
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pharmacy.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${pharmacy.phone}`} className="text-emerald-700 hover:underline">
                      {pharmacy.phone}
                    </a>
                  </div>
                </div>

                {/* Pharmacist contact if linked */}
                {pharmacy.pharmacistName && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span>Pharmacist on Duty:</span>
                      <span className="text-[11px] text-emerald-700 font-bold">Licensed</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{pharmacy.pharmacistName}</div>
                    {pharmacy.pharmacistPhone && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Direct Tel: {pharmacy.pharmacistPhone}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <Link
                  to={`/pharmacies/${pharmacy._id}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                >
                  <span>View Medicines & Order</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
