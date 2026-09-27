import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Pill, CheckCircle2 } from 'lucide-react';
import { IsometricMedicineVisual } from './IsometricMedicineVisual';

const PROJECT_IDEAS = [
  "Access instant AI-guided clinical symptom triage, verified local pharmacist consultations, and direct doctor care.",
  "Search real-time medicine inventory across nearby pharmacies and reserve prescriptions in seconds.",
  "Your complete 24/7 connected digital healthcare platform for safe, instant medical guidance.",
  "Built-in clinical red-flag screening ensuring emergency safety and fast professional healthcare response."
];

export const OnlineMedicineHero: React.FC = () => {
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentIdea = PROJECT_IDEAS[ideaIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayedText.length < currentIdea.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentIdea.slice(0, displayedText.length + 1));
        }, 35);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2400);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentIdea.slice(0, displayedText.length - 1));
        }, 18);
      } else {
        setIsDeleting(false);
        setIdeaIndex((prevIndex) => (prevIndex + 1) % PROJECT_IDEAS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, ideaIndex]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full bg-[#0c001a] text-white flex items-center justify-center overflow-hidden selection:bg-pink-500 selection:text-white py-12 lg:py-16">
      {/* Background Radial Neon Lights */}
      <div className="absolute top-1/4 left-1/4 w-[650px] h-[650px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-pink-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-fuchsia-800/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Title, Dynamic Typing Text, CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left max-w-2xl mx-auto lg:mx-0">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-pink-500/30 text-pink-300 text-xs font-medium tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Next-Gen Telemedicine & Health Platform</span>
            </div>

            {/* Template Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Online Medicine
            </h1>

            {/* Dynamic Typewriter Animation for Project Main Idea */}
            <div className="min-h-[85px] sm:min-h-[95px] flex items-start">
              <p className="text-base sm:text-lg text-purple-200/90 font-normal leading-relaxed max-w-xl font-sans">
                <span>{displayedText}</span>
                <span className="inline-block w-2 h-5 sm:h-6 bg-pink-400 ml-1.5 align-middle animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)] rounded-sm" />
              </p>
            </div>

            {/* Get Started Pill Button matching template */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/ai-assistant"
                className="px-9 py-4 rounded-full bg-gradient-to-r from-[#e81977] via-[#f73859] to-[#ff7854] text-white font-bold text-base shadow-[0_0_35px_rgba(232,25,119,0.6)] hover:shadow-[0_0_50px_rgba(232,25,119,0.9)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-center flex items-center justify-center gap-2.5 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/pharmacies"
                className="px-8 py-4 rounded-full bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 font-semibold text-sm border border-purple-700/60 hover:border-pink-500/50 transition text-center flex items-center justify-center gap-2"
              >
                <Pill className="w-4 h-4 text-pink-400" />
                <span>Explore Services</span>
              </Link>
            </div>

            {/* Simple Trust Feature Checklist */}
            <div className="pt-3 grid grid-cols-2 gap-3 text-xs text-purple-300/80 border-t border-purple-900/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Verified Pharmacists</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>AI Clinical Guidance</span>
              </div>
            </div>
          </div>

          {/* Right Column: Isometric 3D Visual Graphic */}
          <div className="lg:col-span-6 relative flex items-center justify-center w-full">
            <IsometricMedicineVisual />
          </div>

        </div>
      </div>
    </div>
  );
};
