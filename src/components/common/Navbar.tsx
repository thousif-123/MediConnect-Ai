import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  Activity,
  Shield,
  Pill,
  LogOut,
  Menu,
  X,
  Sparkles,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout, quickLoginAs } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLoginOpen, setQuickLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'PHARMACIST':
        return '/pharmacist/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'HOSPITAL_ADMIN':
        return '/hospital/dashboard';
      default:
        return '/dashboard';
    }
  };

  const isHomePage = routerLocation.pathname === '/';

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      <nav
        className={`transition-all duration-300 ${
          isHomePage
            ? scrolled
              ? 'bg-[#0c001a]/95 backdrop-blur-md shadow-2xl py-3.5 border-b border-purple-900/60'
              : 'bg-[#0c001a] py-4 border-b border-purple-900/40'
            : scrolled
              ? 'bg-slate-900/95 backdrop-blur-md shadow-lg py-3.5 border-b border-slate-800/80'
              : 'bg-slate-900/90 backdrop-blur-sm py-4 border-b border-slate-800/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-rose-400 text-white shadow-md shadow-pink-900/50 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            </div>
            <div>
              <div className="font-black text-xl sm:text-2xl leading-none text-white tracking-wider flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-300 to-rose-300 uppercase font-black tracking-wider animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
                  ONLINE MEDICINE
                </span>
              </div>
              <div className="text-[10px] text-pink-300/80 font-semibold tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
                <span>HEALTHCARE ECOSYSTEM</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping inline-block" />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-200">
            <Link to="/" className="hover:text-pink-400 transition-colors">
              Home
            </Link>
            <Link to="/medical-store" className="hover:text-pink-400 transition-colors flex items-center gap-1.5 font-semibold text-pink-400">
              <Pill className="w-4 h-4 text-pink-400 animate-pulse" />
              Medical Store
            </Link>
            <Link to="/ai-assistant" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              AI Assistant
            </Link>
            <Link to="/pharmacies" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-pink-400/80" />
              Pharmacies
            </Link>
            <Link to="/hospitals" className="hover:text-pink-400 transition-colors flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-pink-400/80" />
              Doctors Care
            </Link>
          </div>

          {/* Right Actions & CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/80 text-pink-300 border border-purple-800 text-xs font-semibold hover:bg-purple-900 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-pink-400" />
                  <span>{user.name.split(' ')[0]} ({user.role.replace('_', ' ')})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-purple-300 hover:text-rose-400 hover:bg-purple-900/60 rounded-xl transition cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-purple-200 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-[#e81977] via-[#f73859] to-[#ff7854] text-white shadow-[0_0_20px_rgba(232,25,119,0.5)] hover:shadow-[0_0_30px_rgba(232,25,119,0.85)] transition transform hover:scale-[1.03]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-purple-200 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-pink-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0c001a] border-t border-purple-900/80 px-5 pt-4 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 text-purple-200 font-medium hover:text-pink-400"
            >
              Home
            </Link>
            <Link
              to="/medical-store"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 text-pink-400 font-bold hover:text-pink-300"
            >
              <Pill className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>Medical Store</span>
            </Link>
            <Link
              to="/ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 text-purple-200 font-medium hover:text-pink-400"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>AI Assistant</span>
            </Link>

            <Link
              to="/pharmacies"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 text-purple-200 font-medium hover:text-pink-400"
            >
              <Pill className="w-4 h-4 text-pink-400" />
              <span>Pharmacies</span>
            </Link>

            <Link
              to="/hospitals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 text-purple-200 font-medium hover:text-pink-400"
            >
              <Building2 className="w-4 h-4 text-pink-400" />
              <span>Doctors Care</span>
            </Link>

            <div className="pt-3 border-t border-purple-900/80 space-y-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-full bg-purple-900/80 text-pink-300 font-semibold text-sm border border-purple-700"
                  >
                    Go to Dashboard ({user.role.replace('_', ' ')})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-center py-2 text-rose-400 text-sm font-medium hover:underline"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-full bg-purple-950 text-white font-semibold text-sm border border-purple-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-full bg-gradient-to-r from-[#e81977] to-[#ff7854] text-white font-bold text-sm shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
