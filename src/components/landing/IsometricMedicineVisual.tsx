import React from 'react';

export const IsometricMedicineVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-[680px] mx-auto flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Background Ambient Neon Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-fuchsia-600/30 via-purple-600/20 to-pink-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-64 h-64 bg-pink-600/20 rounded-full blur-[80px] pointer-events-none" />

      <svg
        viewBox="0 0 950 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_25px_60px_rgba(112,26,117,0.45)] relative z-10 transition-transform duration-500 hover:scale-[1.01]"
      >
        <defs>
          {/* Neon Glow Filters */}
          <filter id="neonGlowPink" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="brightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur1" />
            <feGaussianBlur stdDeviation="5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="dropShadowFloor" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.15 0 0 0 0 0 0 0 0 0 0.3 0 0 0 0.6 0" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients */}
          <linearGradient id="monitorFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e054e" />
            <stop offset="50%" stopColor="#190230" />
            <stop offset="100%" stopColor="#0b0017" />
          </linearGradient>

          <linearGradient id="monitorScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#580877" />
            <stop offset="40%" stopColor="#350454" />
            <stop offset="100%" stopColor="#1a0230" />
          </linearGradient>

          <linearGradient id="monitorNeonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="40%" stopColor="#e02424" />
            <stop offset="80%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="standBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#24033c" />
            <stop offset="100%" stopColor="#0d0117" />
          </linearGradient>

          {/* Pill Bottle Gradients */}
          <linearGradient id="bottleCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f43f5e" />
            <stop offset="50%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#be185d" />
          </linearGradient>

          <linearGradient id="bottleLabelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <linearGradient id="bottleBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* 3D Cube Colors */}
          <linearGradient id="cubePinkTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7eb6" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          <linearGradient id="cubePinkLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          <linearGradient id="cubePinkRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Doctor Aura Gradient */}
          <radialGradient id="doctorAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e02424" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ========================================================= */}
        {/* 1. ISOMETRIC FLOOR REFLECTION RINGS & LASER LIGHTS         */}
        {/* ========================================================= */}
        <g id="floor-reflections">
          {/* Ambient Floor Glow Outer Ellipse */}
          <ellipse cx="650" cy="610" rx="220" ry="90" fill="#a855f7" opacity="0.15" filter="url(#brightGlow)" />
          <ellipse cx="650" cy="610" rx="160" ry="65" fill="#f43f5e" opacity="0.2" filter="url(#brightGlow)" />

          {/* Laser Reflection Rings under Stand */}
          <ellipse cx="660" cy="615" rx="140" ry="55" fill="none" stroke="#f43f5e" strokeWidth="2.5" opacity="0.6" />
          <ellipse cx="660" cy="615" rx="175" ry="70" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="12 8" opacity="0.7" />
          <ellipse cx="660" cy="615" rx="210" ry="85" fill="none" stroke="#e02424" strokeWidth="1.5" opacity="0.4" />
        </g>

        {/* ========================================================= */}
        {/* 2. ISOMETRIC MONITOR STAND & BASE                         */}
        {/* ========================================================= */}
        <g id="monitor-stand">
          {/* Stand Base Drop Shadow */}
          <ellipse cx="660" cy="590" rx="115" ry="48" fill="#000000" opacity="0.6" filter="url(#dropShadowFloor)" />

          {/* Stand Base 3D Geometry */}
          {/* Base Bottom Face */}
          <path
            d="M 560,580 C 560,605 760,605 760,580 L 760,592 C 760,617 560,617 560,592 Z"
            fill="#120124"
            stroke="#a855f7"
            strokeWidth="1.5"
          />
          {/* Base Top Face */}
          <ellipse cx="660" cy="580" rx="100" ry="40" fill="url(#standBaseGrad)" stroke="#f43f5e" strokeWidth="2.5" filter="url(#neonGlowPink)" />
          <ellipse cx="660" cy="580" rx="85" ry="34" fill="#1b0333" stroke="#c084fc" strokeWidth="1" opacity="0.8" />

          {/* Monitor Neck / Stem */}
          <path d="M 640,460 L 680,465 L 680,565 L 640,560 Z" fill="#170228" stroke="#a855f7" strokeWidth="1" />
          <path d="M 660,462 L 680,465 L 680,565 L 660,562 Z" fill="#290445" />
        </g>

        {/* ========================================================= */}
        {/* 3. ISOMETRIC COMPUTER MONITOR FRAME                       */}
        {/* ========================================================= */}
        <g id="monitor-frame">
          {/* Screen Outer Back Shadow */}
          <path
            d="M 520,110 L 820,240 Q 840,248 840,268 L 840,550 Q 840,570 820,562 L 520,432 Q 500,424 500,404 L 500,140 Q 500,118 520,110 Z"
            fill="#080012"
            opacity="0.8"
          />

          {/* Outer Bezel Box */}
          <path
            d="M 530,115 L 825,245 Q 840,252 840,270 L 840,545 Q 840,565 822,558 L 530,428 Q 512,420 512,400 L 512,142 Q 512,122 530,115 Z"
            fill="url(#monitorFrameGrad)"
            stroke="url(#monitorNeonBorder)"
            strokeWidth="5"
            filter="url(#neonGlowPink)"
          />

          {/* Inner Screen Display Bezel Area */}
          <path
            d="M 540,135 L 812,255 Q 822,260 822,272 L 822,530 Q 822,542 810,537 L 540,417 Q 528,412 528,400 L 528,152 Q 528,140 540,135 Z"
            fill="url(#monitorScreenGrad)"
            stroke="#a855f7"
            strokeWidth="2"
          />

          {/* Neon Light Accent Line on Top Right Edge */}
          <path d="M 720,198 L 825,245 L 840,270 L 840,360" fill="none" stroke="#f43f5e" strokeWidth="3" filter="url(#brightGlow)" />
        </g>

        {/* ========================================================= */}
        {/* 4. MONITOR SCREEN CONTENT (DOCTOR, ECG, CUBES, BADGES)    */}
        {/* ========================================================= */}
        <g id="screen-content">
          {/* ECG Heartbeat Line across Screen Backdrop */}
          <path
            d="M 530,310 L 590,325 L 610,330 L 620,270 L 630,360 L 640,290 L 650,340 L 660,325 L 820,365"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3.5"
            opacity="0.85"
            filter="url(#brightGlow)"
          />

          {/* Doctor Aura Circle */}
          <ellipse cx="665" cy="275" rx="75" ry="60" fill="url(#doctorAura)" />

          {/* 3D DOCTOR AVATAR */}
          <g id="doctor-avatar" transform="translate(605, 175)">
            {/* Doctor Hair (Purple styled 3D hair) */}
            <path
              d="M 40,35 C 30,15 50,5 65,10 C 80,5 98,15 90,38 C 95,45 92,60 85,65 C 80,68 75,55 75,55 C 75,55 60,65 45,58 C 38,50 38,40 40,35 Z"
              fill="#7c3aed"
              stroke="#a855f7"
              strokeWidth="1.5"
            />
            <path d="M 45,25 C 55,15 75,12 85,25 C 75,20 60,20 45,25 Z" fill="#c084fc" opacity="0.6" />

            {/* Doctor Head/Face */}
            <ellipse cx="65" cy="48" rx="22" ry="25" fill="#fde047" opacity="0.1" />
            <path
              d="M 45,45 C 45,35 85,35 85,45 C 85,68 78,78 65,78 C 52,78 45,68 45,45 Z"
              fill="#fed7aa"
              stroke="#f97316"
              strokeWidth="0.5"
            />

            {/* Ears */}
            <ellipse cx="43" cy="50" rx="4" ry="6" fill="#fbcfe8" />
            <ellipse cx="87" cy="50" rx="4" ry="6" fill="#fbcfe8" />

            {/* Neck */}
            <rect x="58" y="70" width="14" height="15" rx="3" fill="#fdba74" />

            {/* Shirt & Tie */}
            <path d="M 52,80 L 78,80 L 72,115 L 58,115 Z" fill="#0ea5e9" />
            {/* Blue Tie */}
            <path d="M 63,82 L 67,82 L 70,105 L 65,115 L 60,105 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />

            {/* White Lab Coat */}
            <path
              d="M 32,95 C 30,85 45,80 55,80 L 62,108 L 48,145 C 38,140 28,120 32,95 Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <path
              d="M 98,95 C 100,85 85,80 75,80 L 68,108 L 82,145 C 92,140 102,120 98,95 Z"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1"
            />

            {/* Stethoscope */}
            <path
              d="M 42,90 C 40,110 48,135 60,135 C 70,135 88,115 88,90"
              fill="none"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="60" cy="135" r="5.5" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
          </g>

          {/* STACKED 3D ISOMETRIC CUBES (RIGHT SIDE INSIDE MONITOR) */}
          {/* CUBE 1: MEDICAL CROSS (+) */}
          <g id="cube-cross" transform="translate(735, 170)">
            {/* Top Face */}
            <path d="M 30,0 L 60,15 L 30,30 L 0,15 Z" fill="url(#cubePinkTop)" stroke="#fda4af" strokeWidth="1" />
            {/* Left Face */}
            <path d="M 0,15 L 30,30 L 30,60 L 0,45 Z" fill="url(#cubePinkLeft)" />
            {/* Right Face */}
            <path d="M 30,30 L 60,15 L 60,45 L 30,60 Z" fill="url(#cubePinkRight)" />
            {/* Cross Symbol on Top Face */}
            <path d="M 27,8 L 33,8 L 33,22 L 27,22 Z" fill="#ffffff" />
            <path d="M 20,12 L 40,12 L 40,18 L 20,18 Z" fill="#ffffff" />
          </g>

          {/* CUBE 2: HEART (♥) */}
          <g id="cube-heart" transform="translate(735, 235)">
            {/* Top Face */}
            <path d="M 30,0 L 60,15 L 30,30 L 0,15 Z" fill="url(#cubePinkTop)" stroke="#fda4af" strokeWidth="1" />
            {/* Left Face */}
            <path d="M 0,15 L 30,30 L 30,60 L 0,45 Z" fill="url(#cubePinkLeft)" />
            {/* Right Face */}
            <path d="M 30,30 L 60,15 L 60,45 L 30,60 Z" fill="url(#cubePinkRight)" />
            {/* Heart Symbol on Top Face */}
            <path
              d="M 30,23 C 25,16 18,17 21,12 C 24,8 30,12 30,14 C 30,12 36,8 39,12 C 42,17 35,16 30,23 Z"
              fill="#ffffff"
            />
          </g>

          {/* CUBE 3: DROP (💧) */}
          <g id="cube-drop" transform="translate(735, 300)">
            {/* Top Face */}
            <path d="M 30,0 L 60,15 L 30,30 L 0,15 Z" fill="url(#cubePinkTop)" stroke="#fda4af" strokeWidth="1" />
            {/* Left Face */}
            <path d="M 0,15 L 30,30 L 30,60 L 0,45 Z" fill="url(#cubePinkLeft)" />
            {/* Right Face */}
            <path d="M 30,30 L 60,15 L 60,45 L 30,60 Z" fill="url(#cubePinkRight)" />
            {/* Drop Symbol on Top Face */}
            <path
              d="M 30,8 C 30,8 20,17 20,21 C 20,25 24,27 30,27 C 36,27 40,25 40,21 C 40,17 30,8 30,8 Z"
              fill="#ffffff"
            />
          </g>

          {/* LOWER LEFT DOCTOR CARD BADGE (CYAN/TEAL 3D CARD) */}
          <g id="doctor-card-badge" transform="translate(585, 360)">
            {/* 3D Isometric Card Container */}
            <path
              d="M 0,15 L 110,0 L 110,70 L 0,85 Z"
              fill="#06b6d4"
              stroke="#22d3ee"
              strokeWidth="2"
              filter="url(#neonGlowPink)"
            />
            {/* Doctor Icon inside card */}
            <circle cx="22" cy="35" r="12" fill="#ffffff" />
            <path d="M 16,33 C 16,28 28,28 28,33 C 28,42 16,42 16,33 Z" fill="#0891b2" />
            {/* Skeleton text lines */}
            <rect x="42" y="24" width="55" height="5" rx="2" fill="#ffffff" />
            <rect x="42" y="34" width="45" height="4" rx="2" fill="#cffaff" />
            <rect x="42" y="43" width="50" height="4" rx="2" fill="#cffaff" />
            <rect x="42" y="52" width="35" height="4" rx="2" fill="#cffaff" />
          </g>

          {/* LOWER RIGHT NOTIFICATION CARD BADGE (WARM PEACH/YELLOW 3D CARD) */}
          <g id="notification-card-badge" transform="translate(690, 465)">
            <path
              d="M 0,12 L 95,0 L 95,55 L 0,67 Z"
              fill="#fef08a"
              stroke="#facc15"
              strokeWidth="2.5"
              filter="url(#brightGlow)"
            />
            {/* User Icon */}
            <circle cx="18" cy="30" r="9" fill="#f97316" />
            <circle cx="18" cy="27" r="4" fill="#ffedd5" />
            {/* Skeleton text lines */}
            <rect x="33" y="20" width="50" height="4.5" rx="2" fill="#ca8a04" />
            <rect x="33" y="29" width="40" height="4" rx="2" fill="#eab308" />
            <rect x="33" y="37" width="45" height="4" rx="2" fill="#eab308" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* 5. FOREGROUND ISOMETRIC MEDICINE PILL BOTTLE & PILLS      */}
        {/* ========================================================= */}
        <g id="pill-bottle-and-pills">
          {/* Pill Bottle Floor Drop Shadow */}
          <ellipse cx="460" cy="595" rx="55" ry="25" fill="#000000" opacity="0.65" filter="url(#dropShadowFloor)" />
          <ellipse cx="460" cy="595" rx="70" ry="32" fill="#ec4899" opacity="0.25" filter="url(#brightGlow)" />

          {/* 3D PILL BOTTLE */}
          <g id="pill-bottle" transform="translate(415, 435)">
            {/* Bottle Cylinder Body */}
            {/* Body Back/Bottom Curved Base */}
            <path
              d="M 10,95 C 10,120 80,120 80,95 L 80,140 C 80,165 10,165 10,140 Z"
              fill="url(#bottleBodyGrad)"
              stroke="#ca8a04"
              strokeWidth="1.5"
            />
            <ellipse cx="45" cy="140" rx="35" ry="14" fill="#eab308" />

            {/* White Label Section around middle */}
            <path
              d="M 10,75 C 10,95 80,95 80,75 L 80,115 C 80,135 10,135 10,115 Z"
              fill="url(#bottleLabelGrad)"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Purple Label Badge Band */}
            <rect x="25" y="88" width="40" height="16" rx="2" fill="#a855f7" opacity="0.85" />

            {/* Ribbed Pink Cap (Top of Bottle) */}
            <path
              d="M 8,25 C 8,45 82,45 82,25 L 82,60 C 82,80 8,80 8,60 Z"
              fill="url(#bottleCapGrad)"
              stroke="#be185d"
              strokeWidth="1.5"
            />

            {/* Ribbed Grooves on Cap */}
            {[18, 28, 38, 48, 58, 68, 74].map((xPos, idx) => (
              <line key={idx} x1={xPos} y1="35" x2={xPos} y2="68" stroke="#f472b6" strokeWidth="1.5" opacity="0.7" />
            ))}

            {/* Top Cap Ellipse */}
            <ellipse cx="45" cy="25" rx="37" ry="16" fill="#f43f5e" stroke="#fb7185" strokeWidth="2" />
            <ellipse cx="45" cy="25" rx="30" ry="12" fill="#ec4899" />
          </g>

          {/* CAPSULES ON FLOOR */}
          {/* Capsule 1 (Left of bottle) */}
          <g id="capsule-1" transform="translate(460, 585) rotate(-25)">
            <rect x="0" y="0" width="18" height="36" rx="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M 0,0 L 18,0 L 18,18 L 0,18 Z" fill="#ec4899" />
            <circle cx="9" cy="9" r="9" fill="#ec4899" />
            <line x1="0" y1="18" x2="18" y2="18" stroke="#be185d" strokeWidth="1" />
          </g>

          {/* Capsule 2 (Right of bottle) */}
          <g id="capsule-2" transform="translate(515, 575) rotate(45)">
            <rect x="0" y="0" width="16" height="34" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M 0,0 L 16,0 L 16,17 L 0,17 Z" fill="#f43f5e" />
            <circle cx="8" cy="8" r="8" fill="#f43f5e" />
            <line x1="0" y1="17" x2="16" y2="17" stroke="#9f1239" strokeWidth="1" />
          </g>

          {/* ROUND WHITE TABLETS / PILLS SCATTERED ON FLOOR */}
          {/* Tablet 1 */}
          <g id="tablet-1" transform="translate(410, 595)">
            <ellipse cx="14" cy="14" rx="14" ry="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <ellipse cx="14" cy="12" rx="14" ry="7" fill="#ffffff" />
            <line x1="6" y1="12" x2="22" y2="12" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Tablet 2 */}
          <g id="tablet-2" transform="translate(500, 615)">
            <ellipse cx="12" cy="12" rx="12" ry="7" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
            <ellipse cx="12" cy="10" rx="12" ry="6" fill="#ffffff" />
            <line x1="5" y1="10" x2="19" y2="10" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Tablet 3 */}
          <g id="tablet-3" transform="translate(390, 570)">
            <ellipse cx="10" cy="10" rx="10" ry="6" fill="#cbd5e1" />
            <ellipse cx="10" cy="8" rx="10" ry="5" fill="#f8fafc" />
          </g>
        </g>
      </svg>
    </div>
  );
};
