import React, { useState } from 'react';
import { Pill, Search, CheckCircle2, ShoppingBag, X, ShieldCheck, Tag, Filter } from 'lucide-react';

export interface TabletItem {
  id: string;
  name: string;
  dosage: string;
  category: string;
  useCase: string;
  price: number;
  stockStatus: string;
  badge: string;
  rxRequired: boolean;
  image: string;
}

const TABLETS_DATA: TabletItem[] = [
  {
    id: 'tab-1',
    name: 'Paracetamol 650mg',
    dosage: '10 Tablets Strip',
    category: 'Pain & Fever',
    useCase: 'Rapid relief from fever, headache, body aches, muscle pain, and mild discomfort.',
    price: 4.50,
    stockStatus: 'In Stock (240+ packs)',
    badge: 'Fast Acting',
    rxRequired: false,
    image: '/images/medicine_tablets_pack_1790473032038.jpg'
  },
  {
    id: 'tab-2',
    name: 'Amoxicillin 500mg',
    dosage: '10 Capsules Strip',
    category: 'Antibiotic',
    useCase: 'Effective treatment for bacterial infections including chest, throat, ear, and sinus infections.',
    price: 12.99,
    stockStatus: 'In Stock (150+ packs)',
    badge: 'Rx Required',
    rxRequired: true,
    image: '/images/antibiotic_capsules_box_1790473403067.jpg'
  },
  {
    id: 'tab-3',
    name: 'Cetirizine 10mg',
    dosage: '10 Tablets Strip',
    category: 'Allergy Care',
    useCase: 'Relieves runny nose, sneezing, itchy eyes, skin rashes, and seasonal allergic rhinitis.',
    price: 5.20,
    stockStatus: 'In Stock (300+ packs)',
    badge: 'Non-Drowsy',
    rxRequired: false,
    image: '/images/cetirizine_allergy_box_1790473548667.jpg'
  },
  {
    id: 'tab-4',
    name: 'Ibuprofen 400mg',
    dosage: '15 Tablets Strip',
    category: 'Pain & Fever',
    useCase: 'Reduces inflammation, joint pain, toothache, menstrual cramps, and swelling.',
    price: 6.80,
    stockStatus: 'In Stock (180+ packs)',
    badge: 'Dual Action',
    rxRequired: false,
    image: '/images/medicine_tablets_pack_1790473032038.jpg'
  },
  {
    id: 'tab-5',
    name: 'Pantoprazole 40mg',
    dosage: '10 Tablets Strip',
    category: 'Digestive',
    useCase: 'Long-lasting relief from acid reflux, GERD, severe heartburn, and stomach ulcers.',
    price: 8.40,
    stockStatus: 'In Stock (210+ packs)',
    badge: 'Gastro-Shield',
    rxRequired: false,
    image: '/images/cetirizine_allergy_box_1790473548667.jpg'
  },
  {
    id: 'tab-6',
    name: 'Azithromycin 500mg',
    dosage: '5 Tablets Strip',
    category: 'Antibiotic',
    useCase: 'Broad-spectrum 3-to-5 day antibiotic course for respiratory and soft tissue infections.',
    price: 14.50,
    stockStatus: 'In Stock (95+ packs)',
    badge: 'Rx Required',
    rxRequired: true,
    image: '/images/antibiotic_capsules_box_1790473403067.jpg'
  },
  {
    id: 'tab-7',
    name: 'Metformin 500mg',
    dosage: '20 Tablets Strip',
    category: 'Diabetes Care',
    useCase: 'Controls blood sugar levels in Type 2 Diabetes alongside proper diet and activity.',
    price: 7.90,
    stockStatus: 'In Stock (400+ packs)',
    badge: 'Daily Care',
    rxRequired: true,
    image: '/images/medicine_tablets_pack_1790473032038.jpg'
  },
  {
    id: 'tab-8',
    name: 'Montelukast 10mg',
    dosage: '10 Tablets Strip',
    category: 'Allergy Care',
    useCase: 'Prevents asthma symptoms, wheezing, and relieves indoor and seasonal allergy triggers.',
    price: 9.60,
    stockStatus: 'In Stock (130+ packs)',
    badge: 'Respiratory',
    rxRequired: true,
    image: '/images/cetirizine_allergy_box_1790473548667.jpg'
  },
  {
    id: 'tab-9',
    name: 'Vitamin C + Zinc Complex',
    dosage: '30 Effervescent Tablets',
    category: 'Wellness & Vitamins',
    useCase: 'Strengthens daily immune system defenses, supports tissue recovery, and boosts energy.',
    price: 11.20,
    stockStatus: 'In Stock (500+ bottles)',
    badge: 'Immunity Boost',
    rxRequired: false,
    image: '/images/vitamin_tablets_bottle_1790473071638.jpg'
  },
  {
    id: 'tab-10',
    name: 'Atorvastatin 10mg',
    dosage: '15 Tablets Strip',
    category: 'Heart Care',
    useCase: 'Lowers LDL cholesterol and triglycerides, promoting long-term cardiovascular health.',
    price: 10.50,
    stockStatus: 'In Stock (160+ packs)',
    badge: 'Rx Required',
    rxRequired: true,
    image: '/images/antibiotic_capsules_box_1790473403067.jpg'
  },
];

const CATEGORIES = ['All', 'Pain & Fever', 'Antibiotic', 'Allergy Care', 'Digestive', 'Wellness & Vitamins', 'Diabetes Care', 'Heart Care'];

export const OnlineMedicalStore: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTablet, setSelectedTablet] = useState<TabletItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [imgErrors, setImgErrors] = useState<{ [key: string]: boolean }>({});

  const filteredTablets = TABLETS_DATA.filter((tablet) => {
    const matchesCategory = selectedCategory === 'All' || tablet.category === selectedCategory;
    const matchesSearch =
      tablet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tablet.useCase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tablet.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookNow = (tablet: TabletItem) => {
    setSelectedTablet(tablet);
    setQuantity(1);
    setBookingConfirmed(false);
  };

  const confirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setSelectedTablet(null);
    }, 2500);
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="online-store" className="py-12 sm:py-20 bg-[#0e0122] text-white relative overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-center">
      {/* Background Radial Light Highlights */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-pink-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-pink-500/30 text-pink-300 text-xs font-semibold tracking-wide mb-3">
              <Pill className="w-3.5 h-3.5 text-pink-400" />
              <span>Verified Prescription & OTC Medicines</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              Online Medical Store
            </h1>
            <p className="mt-3 text-base text-purple-200/80 max-w-2xl">
              Explore essential tablets, view use cases & verified dosages, and reserve items for instant local pickup or fast delivery.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tablet name or symptom..."
              className="w-full pl-10 pr-4 py-2.5 bg-purple-950/70 border border-purple-800/80 rounded-xl text-xs sm:text-sm text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-purple-400 hover:text-white text-xs">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <span className="text-xs text-purple-300/70 flex items-center gap-1 shrink-0 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-600/30'
                  : 'bg-purple-950/60 text-purple-200 hover:bg-purple-900/80 border border-purple-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TABLETS CARDS GRID (10 Tablets) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTablets.map((tablet) => (
            <div
              key={tablet.id}
              className="bg-[#180330]/90 rounded-2xl border border-purple-800/60 hover:border-pink-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-900/20 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Product Card Visual Image Header */}
                <div className="h-44 bg-gradient-to-b from-purple-950/90 to-[#180330] p-3 relative flex items-center justify-center overflow-hidden">
                  {/* Subtle Background Radial */}
                  <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-all duration-300" />
                  
                  {tablet.image && !imgErrors[tablet.id] ? (
                    <img
                      src={tablet.image}
                      alt={tablet.name}
                      onError={() => handleImageError(tablet.id)}
                      className="h-36 w-full object-cover rounded-xl z-10 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-500/40 flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-inner">
                      <Pill className="w-12 h-12 text-pink-400 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Badge Overlay */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-purple-950/90 border border-pink-500/40 text-pink-300 text-[10px] font-bold tracking-wide z-20 backdrop-blur-md">
                    {tablet.badge}
                  </span>

                  {tablet.rxRequired && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800 text-[10px] font-semibold z-20 backdrop-blur-md">
                      Rx
                    </span>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                        {tablet.name}
                      </h3>
                      <span className="text-[11px] text-purple-300/80 font-medium">
                        {tablet.dosage}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-pink-400">
                      ${tablet.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Category Tag */}
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/60 text-[10px] font-medium">
                      {tablet.category}
                    </span>
                  </div>

                  {/* Tablet Use Case Description */}
                  <div className="bg-purple-950/60 rounded-xl p-3 border border-purple-900/80">
                    <div className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Primary Use Case
                    </div>
                    <p className="text-xs text-purple-100/90 leading-relaxed font-normal">
                      {tablet.useCase}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-purple-300/80">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {tablet.stockStatus}
                  </span>
                </div>

                <button
                  onClick={() => handleBookNow(tablet)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#e81977] via-[#f73859] to-[#ff7854] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-pink-600/30 hover:shadow-pink-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state when search returns zero */}
        {filteredTablets.length === 0 && (
          <div className="text-center py-16 bg-purple-950/40 rounded-2xl border border-purple-800/60">
            <Pill className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Tablets Found</h3>
            <p className="text-xs text-purple-300 mt-1">Try changing your search keyword or selected category filter.</p>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOOK NOW INTERACTIVE RESERVATION MODAL                    */}
        {/* ========================================================= */}
        {selectedTablet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-[#17022e] rounded-3xl border border-purple-800 shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setSelectedTablet(null)}
                className="absolute top-4 right-4 text-purple-400 hover:text-white p-2 rounded-full hover:bg-purple-900/60 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {bookingConfirmed ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Booking Confirmed!</h3>
                  <p className="text-xs text-purple-200 max-w-xs mx-auto">
                    Your order for <span className="text-pink-400 font-bold">{quantity}x {selectedTablet.name}</span> has been reserved successfully.
                  </p>
                  <div className="text-[11px] text-purple-300/80 bg-purple-950 p-3 rounded-xl border border-purple-800">
                    Order Reference: <span className="text-white font-mono font-bold">MED-#{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={confirmReservation} className="space-y-5">
                  <div>
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider bg-pink-950 px-2.5 py-1 rounded border border-pink-800">
                      Reserve Tablet
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2">{selectedTablet.name}</h3>
                    <p className="text-xs text-purple-200 mt-1">{selectedTablet.dosage} • {selectedTablet.category}</p>
                  </div>

                  <div className="bg-purple-950/80 p-3.5 rounded-xl border border-purple-900 text-xs space-y-2">
                    <div className="font-semibold text-pink-300">Use Case Summary:</div>
                    <p className="text-purple-200/90 leading-relaxed text-[11px]">{selectedTablet.useCase}</p>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between bg-purple-900/50 p-3 rounded-xl border border-purple-800">
                    <span className="text-xs font-semibold text-white">Select Quantity:</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-purple-950 text-white font-bold hover:bg-purple-800 transition"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-white w-6 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-purple-950 text-white font-bold hover:bg-purple-800 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="flex justify-between items-center pt-2 border-t border-purple-900 text-sm">
                    <span className="text-purple-300">Total Price:</span>
                    <span className="text-xl font-black text-pink-400">${(selectedTablet.price * quantity).toFixed(2)}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e81977] via-[#f73859] to-[#ff7854] text-white font-extrabold text-sm shadow-lg shadow-pink-600/40 hover:scale-[1.02] transition"
                  >
                    Confirm Booking Now
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-purple-300/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                    <span>Instant Pharmacy Stock Reservation</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
