import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Pill, Building2, UserCheck } from 'lucide-react';
import { OnlineMedicineHero } from '../../components/landing/OnlineMedicineHero';

export const HomePage: React.FC = () => {
  return (
    <div className="bg-[#0c001a] text-purple-100 min-h-screen font-sans selection:bg-pink-500 selection:text-white overflow-x-hidden">
      <main>
        {/* ========================================================= */}
        {/* 1. FULL LANDING PAGE HERO SECTION TEMPLATE                */}
        {/* ========================================================= */}
        <OnlineMedicineHero />

        {/* ========================================================= */}
        {/* 2. SIMPLE, CLEAR & PROFESSIONAL FEATURES SECTION          */}
        {/* ========================================================= */}
        <section className="py-20 bg-[#120126] border-t border-purple-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Complete Online Medical Care
              </h2>
              <p className="mt-4 text-base sm:text-lg text-purple-200/80">
                Everything you need for instant health guidance, pharmacy inventory, and professional consultations in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#1c0338]/80 rounded-2xl p-6 border border-purple-800/50 hover:border-pink-500/50 transition duration-300 shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Symptom Triage</h3>
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  Analyze health concerns immediately with clinical safety evaluation and preliminary guidance.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#1c0338]/80 rounded-2xl p-6 border border-purple-800/50 hover:border-pink-500/50 transition duration-300 shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Verified Pharmacists</h3>
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  Connect with licensed pharmacists for instant medicine advice and OTC consultations.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#1c0338]/80 rounded-2xl p-6 border border-purple-800/50 hover:border-pink-500/50 transition duration-300 shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                  <Pill className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Live Pharmacy Stock</h3>
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  Search nearby pharmacies, check real-time stock levels, and reserve prescriptions.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-[#1c0338]/80 rounded-2xl p-6 border border-purple-800/50 hover:border-pink-500/50 transition duration-300 shadow-xl group">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Doctor Appointments</h3>
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  Book direct in-person appointments with verified doctors and specialists near you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. SIMPLE & ELEGANT CTA BANNER                             */}
        {/* ========================================================= */}
        <section className="py-16 bg-[#0c001a] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#26044d] to-pink-950/80 border border-purple-700/50 shadow-2xl space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Experience Online Healthcare?
              </h2>
              <p className="text-base sm:text-lg text-purple-200/90 max-w-2xl mx-auto">
                Explore our Online Medical Store or start by checking symptoms with our AI assistant in seconds.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/medical-store"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e81977] via-[#f73859] to-[#ff7854] text-white font-bold text-sm shadow-lg shadow-pink-600/40 hover:scale-105 transition"
                >
                  Visit Medical Store
                </Link>
                <Link
                  to="/ai-assistant"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-semibold text-sm border border-purple-700 transition"
                >
                  Start AI Symptom Check
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
