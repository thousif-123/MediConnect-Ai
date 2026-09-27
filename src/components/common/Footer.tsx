import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#080012] text-purple-300/70 border-t border-purple-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 text-white flex items-center justify-center font-black shadow-md shadow-pink-900/40">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 tracking-wide uppercase">
                ONLINE MEDICINE
              </span>
            </div>
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Online Medicine & Connected Healthcare Platform for AI symptom triage, verified pharmacist consultations, and doctor booking.
            </p>
            <div className="flex items-center gap-2 text-xs text-pink-300 font-medium bg-purple-950/60 p-2.5 rounded-xl border border-purple-800/60">
              <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Clinical Safety & Red-Flag Active</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/ai-assistant" className="hover:text-pink-400 transition">AI Health Assistant</Link></li>
              <li><Link to="/pharmacies" className="hover:text-pink-400 transition">Nearby Pharmacies</Link></li>
              <li><Link to="/pharmacies" className="hover:text-pink-400 transition">Live Stock Search</Link></li>
              <li><Link to="/hospitals" className="hover:text-pink-400 transition">Doctors Directory</Link></li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/dashboard" className="hover:text-pink-400 transition">Patient Dashboard</Link></li>
              <li><Link to="/pharmacist/dashboard" className="hover:text-pink-400 transition">Pharmacist Portal</Link></li>
              <li><Link to="/doctor/dashboard" className="hover:text-pink-400 transition">Doctor Dashboard</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-pink-400 transition">Admin Console</Link></li>
            </ul>
          </div>

          {/* Column 4: Disclaimer */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Medical Notice</h4>
            <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-[11px] text-purple-200/80 leading-relaxed">
              <span className="font-bold text-pink-400 block mb-1">MEDICAL DISCLAIMER:</span>
              AI guidance and online information are for general triage purposes and do not replace professional medical diagnosis.
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-purple-950 flex flex-col sm:flex-row justify-between items-center text-xs text-purple-400/60 gap-4">
          <p>© 2026 ONLINE MEDICINE Platform. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-purple-300/70">
            <span>Verified Pharmacists</span>
            <span>•</span>
            <span>Encrypted Health Vault</span>
            <span>•</span>
            <span>Clinical Triage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
