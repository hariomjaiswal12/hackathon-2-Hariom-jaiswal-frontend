import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface CompanyLogo {
  id: string;
  name: string;
  ticker?: string;
  score: number;
  route: string;
  badge?: string;
  renderLogo: () => React.ReactNode;
}

const COMPANIES: CompanyLogo[] = [
  {
    id: 'google',
    name: 'Google',
    ticker: 'GOOGL',
    score: 92,
    route: '/company/google',
    badge: 'Verified Registry',
    renderLogo: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.35 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.93 6.72-4.93z"
        />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    ticker: 'MSFT',
    score: 89,
    route: '/company/microsoft',
    badge: 'Enterprise Leader',
    renderLogo: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    ticker: 'NVDA',
    score: 95,
    route: '/explore',
    badge: 'Hardware & AI',
    renderLogo: () => (
      <svg className="w-5 h-4" viewBox="0 0 24 20" fill="#76B900">
        <path d="M7.74 3.7c1.37-.8 2.97-1.2 4.7-1.2 3.1 0 5.9 1.3 7.8 3.5l2.4-2.2C20.1 1.4 16.4 0 12.44 0c-2.4 0-4.66.56-6.66 1.63L7.74 3.7zm-2.8 2.2C3.4 7.2 2.5 9 2.5 11c0 2 .9 3.8 2.44 5.1l1.9-2C5.9 13.2 5.4 12.1 5.4 11s.5-2.2 1.44-3.1L4.94 5.9zm5.5 1.5c-1.1.7-1.8 1.9-1.8 3.3 0 1.4.7 2.6 1.8 3.3v-6.6zm2.4-3.3c-2.2 0-4.1.9-5.4 2.3l1.8 1.9c.9-.9 2.1-1.5 3.6-1.5 2.7 0 4.9 2.2 4.9 4.9 0 1.5-.7 2.8-1.7 3.7l1.9 1.9c1.6-1.4 2.6-3.4 2.6-5.6 0-4.2-3.4-7.6-7.7-7.6z" />
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple',
    ticker: 'AAPL',
    score: 91,
    route: '/explore',
    badge: 'Hardware & OS',
    renderLogo: () => (
      <svg className="w-4 h-5" viewBox="0 0 170 170" fill="#E2E8F0">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.03-7.64-7.85-11.86-14.44-7.61-11.85-13.2-25.07-16.77-39.66-3.57-14.59-3.57-27.91 0-39.96 4.36-14.7 12.16-24.87 23.41-30.52 7.04-3.53 14.75-5.37 23.13-5.52 4.13 0 9.07 1.05 14.82 3.17 5.75 2.12 9.87 3.24 12.38 3.35 2.29-.11 6.53-1.28 12.74-3.53 6.2-2.25 11.45-3.18 15.75-2.8 11.53.86 20.9 5.38 28.1 13.56-10.05 6.09-15.01 14.47-14.88 25.14.13 8.35 3.4 15.42 9.81 21.2 6.41 5.78 14.07 9.17 22.98 10.18-2.3 6.86-5.28 14.31-8.94 22.35zM119.22 33.04c-.11 3.59-1.28 7.39-3.52 11.41-2.24 4.02-5.46 7.42-9.66 10.2-3.8 2.5-7.79 4.02-11.96 4.56-.22-3.48.87-7.23 3.27-11.24 2.4-4.02 5.57-7.29 9.51-9.82 3.94-2.53 8.05-4.22 12.36-5.11z" />
      </svg>
    ),
  },
  {
    id: 'amazon',
    name: 'Amazon',
    ticker: 'AMZN',
    score: 84,
    route: '/explore',
    badge: 'Cloud & Commerce',
    renderLogo: () => (
      <svg className="w-5 h-4" viewBox="0 0 24 16" fill="#FF9900">
        <path d="M13.9 12.2c-4.4 3.3-10.8 1.8-13.8-.4-.3-.2-.1-.5.2-.4 3.1 1.7 9.5 2.5 13.2-.2.4-.3.8.3.4 1zm1.2-1.6c-.3-.4-1.9-.2-2.7-.1-.2 0-.3-.2-.1-.3 1.2-.9 3.1-.6 3.4-.3.3.4-.1 2.3-1.3 3.3-.2.1-.3 0-.2-.2.5-.7.9-2 .9-2.4z" />
        <path
          fill="#FFFFFF"
          d="M13.6 2.3C12.8 1.4 11.4 1 9.8 1 6.5 1 4.5 3 4.5 5.7c0 2.2 1.4 3.6 3.4 3.6 1.4 0 2.5-.6 3.2-1.5v1.2h2.5V2.3zm-2.5 4.3c-.4.6-1.1.9-1.8.9-1.3 0-2.1-.9-2.1-2.2 0-1.4.8-2.2 2.1-2.2.7 0 1.4.3 1.8.9v2.6z"
        />
      </svg>
    ),
  },
  {
    id: 'tcs',
    name: 'Tata Consultancy Services',
    ticker: 'TCS',
    score: 82,
    route: '/company/tcs',
    badge: 'IT Services India',
    renderLogo: () => (
      <div className="w-5 h-5 rounded bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
        T
      </div>
    ),
  },
  {
    id: 'meta',
    name: 'Meta',
    ticker: 'META',
    score: 86,
    route: '/explore',
    badge: 'AI & Social',
    renderLogo: () => (
      <svg className="w-5 h-4" viewBox="0 0 24 16" fill="#0668E1">
        <path d="M12 6.5C10.2 3.6 8.3 2 6 2 2.7 2 0 4.8 0 8.3 0 11.8 2.7 14.6 6 14.6c2.5 0 4.4-1.8 6-4.6 1.6 2.8 3.5 4.6 6 4.6 3.3 0 6-2.8 6-6.3 0-3.5-2.7-6.3-6-6.3-2.3 0-4.2 1.6-6 4.5zm-6 5.8c-2 0-3.6-1.7-3.6-4 0-2.3 1.6-4 3.6-4 1.6 0 3 1.3 4.3 3.7-1.3 2.5-2.7 4.3-4.3 4.3zm12 0c-1.6 0-3-1.8-4.3-4.3 1.3-2.4 2.7-3.7 4.3-3.7 2 0 3.6 1.7 3.6 4 0 2.3-1.6 4-3.6 4z" />
      </svg>
    ),
  },
  {
    id: 'infosys',
    name: 'Infosys Limited',
    ticker: 'INFY',
    score: 80,
    route: '/company/infosys',
    badge: 'Global Consulting',
    renderLogo: () => (
      <div className="w-5 h-5 rounded bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-[9px] font-black text-white">
        INF
      </div>
    ),
  },
  {
    id: 'accenture',
    name: 'Accenture plc',
    ticker: 'ACN',
    score: 85,
    route: '/company/accenture',
    badge: 'Strategy & Cloud',
    renderLogo: () => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#A100FF">
        <path d="M0 18.5l14.2-6.5L0 5.5v3.2l7.2 3.3L0 15.3v3.2zm17.5-6.5L9.3 8.7V5.5l14.7 6.5-14.7 6.5v-3.2l8.2-3.3z" />
      </svg>
    ),
  },
  {
    id: 'netflix',
    name: 'Netflix',
    ticker: 'NFLX',
    score: 88,
    route: '/explore',
    badge: 'Streaming & Media',
    renderLogo: () => (
      <svg className="w-3.5 h-5" viewBox="0 0 24 36" fill="#E50914">
        <path d="M0 0h5.8v36H0V0zm18.2 0H24v36h-5.8V0zM4.9 0h5.5l8.7 36h-5.5L4.9 0z" />
      </svg>
    ),
  },
];

export function CompanyMarquee() {
  const navigate = useNavigate();

  // Quadruple items to ensure completely seamless infinite loop
  const marqueeItems = [...COMPANIES, ...COMPANIES, ...COMPANIES, ...COMPANIES];

  return (
    <div id="company-marquee" className="relative w-full bg-[#080D1A] border-y border-white/[0.06] py-5 overflow-hidden select-none">
      {/* Subtle Ambient Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-cyan-900/10 pointer-events-none" />

      {/* Header Eyebrow */}
      <div className="max-w-7xl mx-auto px-6 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Continuous Evidence Ticker</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 font-normal">Researched across 1,000+ Enterprises & Tech Leaders</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          <Sparkles size={10} />
          <span>Streaming Left → Right</span>
        </div>
      </div>

      {/* Marquee Wrapper with Edge Fade Gradients */}
      <div className="relative w-full overflow-hidden group">
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#080D1A] to-transparent z-10" />

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#080D1A] to-transparent z-10" />

        {/* Continuous Marquee Track Moving LEFT TO RIGHT */}
        <div
          className="flex items-center gap-4 w-max hover:[animation-play-state:paused]"
          style={{
            animation: 'company-marquee-ltr 32s linear infinite',
            willChange: 'transform',
          }}
        >
          {marqueeItems.map((comp, idx) => (
            <button
              key={`${comp.id}-${idx}`}
              onClick={() => navigate(comp.route)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 text-left transition-all duration-200 cursor-pointer group/pill shrink-0 shadow-sm shadow-black/20"
            >
              <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5 group-hover/pill:scale-105 transition-transform">
                {comp.renderLogo()}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white group-hover/pill:text-cyan-300 transition-colors">
                    {comp.name}
                  </span>
                  {comp.ticker && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {comp.ticker}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                  <span className="text-cyan-400 font-mono font-medium">
                    Score {comp.score}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <CheckCircle2 size={9} className="text-emerald-400" />
                    {comp.badge}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Global Style for Marquee Animation */}
      <style>{`
        @keyframes company-marquee-ltr {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
}
