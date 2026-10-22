import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ArrowRight, Sparkles, UserPlus } from 'lucide-react';

export const PreFooterCta: React.FC = () => {
  const { t, i18n } = useTranslation(['common', 'navigation']);
  const isAmharic = i18n.language === 'am';

  return (
    <section className="relative w-full bg-[#031d12] text-white py-20 lg:py-24 overflow-hidden border-t border-emerald-950/80">
      
      {/* 1. BACKGROUND SVG TRANSIT CONSTELLATION & NETWORK GRID (Platform brand styled) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        <svg
          viewBox="0 0 1200 500"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Central Radar Circle */}
          <circle cx="600" cy="250" r="80" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="600" cy="250" r="160" fill="none" stroke="#D9A441" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" />
          <circle cx="600" cy="250" r="240" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.15" />

          {/* Network Node Lines connecting Ethiopian Hubs */}
          <line x1="600" y1="250" x2="450" y2="100" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="600" y1="250" x2="720" y2="120" stroke="#D9A441" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="600" y1="250" x2="350" y2="230" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="600" y1="250" x2="850" y2="210" stroke="#D9A441" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="600" y1="250" x2="480" y2="390" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="600" y1="250" x2="650" y2="410" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="600" y1="250" x2="200" y2="320" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="450" y1="100" x2="350" y2="230" stroke="#10b981" strokeWidth="1" opacity="0.2" />
          <line x1="720" y1="120" x2="850" y2="210" stroke="#D9A441" strokeWidth="1" opacity="0.2" />

          {/* City Nodes & Labels */}
          {[
            { name: 'DESSIE', x: 450, y: 100 },
            { name: 'GEWANE', x: 720, y: 120 },
            { name: 'NEKEMTE', x: 350, y: 230 },
            { name: 'ADAMA', x: 600, y: 250, isCenter: true },
            { name: 'HARAR / JIJIGA', x: 850, y: 210 },
            { name: 'JIMMA', x: 480, y: 390 },
            { name: 'SHASHEMENE', x: 650, y: 390 },
            { name: 'HAWASSA', x: 660, y: 430 },
            { name: 'GAMBELA', x: 200, y: 320 },
          ].map((node, i) => (
            <g key={i} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                r={node.isCenter ? 5 : 3.5}
                fill={node.isCenter ? '#D9A441' : '#10b981'}
                stroke="#ffffff"
                strokeWidth={node.isCenter ? 2 : 1}
              />
              <text
                x="8"
                y="3"
                fill="#a7f3d0"
                fontSize="8.5"
                fontFamily="Inter, sans-serif"
                fontWeight="700"
                letterSpacing="1.5"
                opacity="0.75"
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 2. AMBIENT GLOW VIGNETTES */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-600/15 via-amber-500/10 to-emerald-600/15 blur-3xl pointer-events-none rounded-full" />

      {/* 3. FOREGROUND CONTENT (Exact layout from user image) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        
        {/* Uppercase Subheader */}
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-300/90 mb-4 inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{isAmharic ? 'ዝግጁ ሲሆኑ ከጎንዎ ነን' : 'READY WHEN YOU ARE'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </span>

        {/* Large Elegant Display Headline */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] leading-[1.15] font-bold text-white tracking-tight">
          <span className="font-serif">
            {isAmharic ? 'የእርስዎ ጉዞ፣ ' : 'Your journey, '}
          </span>
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F4D58D] via-[#f5db99] to-[#D9A441] drop-shadow-md">
            {isAmharic ? 'በአንድ ጠቅታ ይጀምራል።' : 'one tap away.'}
          </span>
        </h2>

        {/* Action Buttons matching layout with platform brand colors */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-10 w-full sm:w-auto px-4 sm:px-0">
          
          {/* Primary Button: FIND TRIPS */}
          <Link
            to="/search"
            className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-[0.18em] shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/25 border border-emerald-400/30 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Search className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>{isAmharic ? 'ጉዞዎችን ፈልግ' : 'FIND TRIPS'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Secondary Button: CREATE ACCOUNT */}
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-100 hover:text-white border border-emerald-500/30 hover:border-emerald-400/60 font-black text-xs uppercase tracking-[0.18em] backdrop-blur-sm shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>{isAmharic ? 'መለያ ፍጠር' : 'CREATE ACCOUNT'}</span>
          </Link>

        </div>

      </div>

    </section>
  );
};
