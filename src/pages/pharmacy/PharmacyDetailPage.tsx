import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Pill,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  FileText,
  ArrowLeft,
  Search,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { Pharmacy, InventoryItem, Prescription } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const PharmacyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Cart / Order State
  const [cart, setCart] = useState<{ [medId: string]: number }>({});
  const [selectedRxId, setSelectedRxId] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPharmacyDetails = async () => {
    try {
      const res = await api.get(`/pharmacies/${id}`);
      setPharmacy(res.data.pharmacy);
      setInventory(res.data.inventory || []);

      if (user) {
        const rxRes = await api.get('/prescriptions');
        setPrescriptions(rxRes.data.prescriptions || []);
        if (rxRes.data.prescriptions?.length > 0) {
          setSelectedRxId(rxRes.data.prescriptions[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyDetails();
  }, [id, user]);

  const updateCart = (medId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[medId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[medId];
        return copy;
      }
      return { ...prev, [medId]: next };
    });
  };

  const cartItems = Object.entries(cart)
    .map(([medId, qty]) => {
      const inv = inventory.find((i) => i.medicineId === medId);
      return {
        medicineId: medId,
        medicineName: inv?.medicine?.name || 'Medicine Item',
        genericName: inv?.medicine?.genericName,
        quantity: qty,
        unitPrice: inv?.price || 0,
        requiresPrescription: inv?.medicine?.requiresPrescription || false,
      };
    })
    .filter((item) => item.quantity > 0);

  const cartTotal = cartItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const hasPrescriptionItems = cartItems.some((it) => it.requiresPrescription);

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    if (hasPrescriptionItems && !selectedRxId) {
      setOrderError('One or more selected medicines require an uploaded prescription. Please select an active prescription or upload a new one.');
      return;
    }

    setSubmittingOrder(true);
    setOrderError(null);

    try {
      const res = await api.post('/orders', {
        pharmacyId: id,
        items: cartItems,
        prescriptionId: hasPrescriptionItems ? selectedRxId : undefined,
        notes: orderNotes,
      });

      setOrderSuccess(res.data.message);
      setCart({});
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place medicine reservation.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading pharmacy inventory...</div>;
  }

  if (!pharmacy) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Pharmacy Not Found</h2>
        <Link to="/pharmacies" className="text-xs text-emerald-600 font-semibold hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  const filteredInventory = inventory.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.medicine?.name.toLowerCase().includes(q) ||
      item.medicine?.genericName.toLowerCase().includes(q) ||
      item.medicine?.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link to="/pharmacies" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to All Pharmacies
      </Link>

      {/* Pharmacy Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pharmacy.name}</h1>
              {pharmacy.verificationStatus === 'VERIFIED' && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">License No: {pharmacy.licenseNumber}</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${pharmacy.phone}`}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Pharmacy: {pharmacy.phone}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">Pharmacy Location</span>
              <span>{pharmacy.address}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">Operating Hours</span>
              <span>{pharmacy.openingHours}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Pill className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">Attending Pharmacist</span>
              <span>{pharmacy.pharmacistName || 'Licensed Duty Pharmacist'}</span>
              {pharmacy.pharmacistPhone && (
                <div className="text-[11px] text-slate-400">Tel: {pharmacy.pharmacistPhone}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Order Reservation Received!</p>
              <p>{orderSuccess}</p>
            </div>
          </div>
          <Link
            to="/orders"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            View Orders
          </Link>
        </div>
      )}

      {orderError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{orderError}</span>
        </div>
      )}

      {/* Main Grid: Medicine Catalog on left, Order Checkout on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inventory Catalogue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              Available Medicine Inventory ({filteredInventory.length})
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stock..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredInventory.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No medicines match your search for this pharmacy.
              </div>
            ) : (
              filteredInventory.map((item) => {
                const qty = cart[item.medicineId] || 0;
                return (
                  <div
                    key={item._id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.medicine?.name}</span>
                        {item.medicine?.requiresPrescription ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                            Prescription Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            OTC Available
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Generic: <span className="font-medium text-slate-700">{item.medicine?.genericName}</span> • Form: {item.medicine?.dosageForm || 'Tablet'}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">
                        {item.medicine?.description}
                      </div>
                      <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                        Safety: {item.medicine?.safetyInformation}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-base font-extrabold text-slate-900">
                        ${item.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 pt-1">
                        {qty > 0 && (
                          <button
                            onClick={() => updateCart(item.medicineId, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                        )}
                        {qty > 0 && <span className="text-xs font-bold w-4 text-center">{qty}</span>}
                        <button
                          disabled={item.quantity <= 0}
                          onClick={() => updateCart(item.medicineId, 1)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>{qty > 0 ? 'Add More' : 'Add to Order'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Reservation / Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" /> Reserve for Pickup
              </span>
              <span className="text-xs font-normal text-slate-400">
                {cartItems.length} items
              </span>
            </h2>

            {cartItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Your order is empty. Select medicines from the inventory list to reserve them for pharmacy pickup.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((it) => (
                    <div key={it.medicineId} className="flex justify-between items-start text-xs pb-2 border-b border-slate-50">
                      <div>
                        <div className="font-semibold text-slate-800">{it.medicineName}</div>
                        <div className="text-[10px] text-slate-400">Qty: {it.quantity} × ${it.unitPrice.toFixed(2)}</div>
                        {it.requiresPrescription && (
                          <span className="text-[10px] font-bold text-rose-600">Prescription Required</span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900">
                        ${(it.quantity * it.unitPrice).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-100">
                  <span>Estimated Total:</span>
                  <span className="text-emerald-700 font-extrabold">${cartTotal.toFixed(2)}</span>
                </div>

                {/* Prescription Required Selection Block */}
                {hasPrescriptionItems && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <FileText className="w-4 h-4 text-rose-600" />
                      <span>Prescription Verification Required</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      This order contains prescription medications. A verified pharmacist must audit your prescription before dispensing.
                    </p>

                    {prescriptions.length === 0 ? (
                      <div className="pt-1">
                        <Link
                          to="/prescriptions"
                          className="block text-center py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
                        >
                          Upload Prescription First
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">
                          Select Prescribing Document:
                        </label>
                        <select
                          value={selectedRxId}
                          onChange={(e) => setSelectedRxId(e.target.value)}
                          className="w-full p-2 bg-white border border-rose-200 rounded-lg text-xs"
                        >
                          {prescriptions.map((rx) => (
                            <option key={rx._id} value={rx._id}>
                              {rx.originalFilename} ({rx.doctorName || 'Rx'} - {rx.prescriptionDate})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pickup Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g., Picking up after 5:00 PM..."
                    className="w-full p-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={submittingOrder || (hasPrescriptionItems && prescriptions.length === 0)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{submittingOrder ? 'Submitting Reservation...' : 'Confirm Medicine Reservation'}</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  No online payment is collected. You pay at the pharmacy counter upon physical collection after pharmacist verification.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
