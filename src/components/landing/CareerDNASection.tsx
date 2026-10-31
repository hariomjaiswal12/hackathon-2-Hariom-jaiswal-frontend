import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  Target,
  Scale,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const CareerDNASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      id="career-dna"
      className="scroll-mt-20 py-20 sm:py-24 md:py-32 px-5 sm:px-6 bg-[#070B14] border-t border-b border-white/5 text-slate-100 relative overflow-hidden select-none"
    >
      {/* Ambient Radial Lighting & Subtle Grid Texture */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_25%_50%,rgba(37,99,235,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: HD Career Collaboration Visual + Floating AI Profile Card (~58% width)
              ========================================================================= */}
          <div className="lg:col-span-7 relative">
            
            {/* Ambient Backlight Glow behind image */}
            <div className="absolute -inset-3 bg-gradient-to-tr from-blue-600/25 via-indigo-600/20 to-cyan-500/15 rounded-3xl blur-2xl -z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Main Image Container */}
            <div className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-slate-900/80 shadow-2xl shadow-blue-950/50">
              <picture>
                <source srcSet="/career-hd-office-exact.webp" type="image/webp" />
                <img
                  src="/career-hd-office-exact.jpg"
                  alt="Colleagues collaborating on personalized company career research"
                  className="w-full h-[360px] sm:h-[460px] lg:h-[520px] object-cover object-[center_15%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </picture>

              {/* Cinematic Vignette Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070B14]/90 via-[#070B14]/25 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#070B14]/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl sm:rounded-3xl pointer-events-none" />

              {/* Floating UI Profile Card: "Your Career Profile" / "6 Priorities Analyzed" */}
              <div className="absolute bottom-3.5 sm:bottom-5 left-3.5 sm:left-5 right-3.5 sm:right-auto sm:max-w-[340px] z-20 animate-float-slow">
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0B132B]/92 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/80 ring-1 ring-white/10 hover:border-blue-400/40 transition-colors">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 shrink-0">
                        <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-[13px] sm:text-[15px] tracking-tight leading-tight">
                          Your Career Profile
                        </h4>
                        <p className="text-blue-400 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          6 Priorities Analyzed
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={11} />
                      98% Fit
                    </span>
                  </div>

                  {/* Animated Shimmering Progress Indicator */}
                  <div className="space-y-1 sm:space-y-1.5 mb-2.5 sm:mb-3.5">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-300">
                      <span>Preference Alignment</span>
                      <span className="text-blue-400 font-semibold">Active Profile</span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 w-full animate-pulse" />
                    </div>
                  </div>

                  {/* Micro Signals / Preference Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      Salary: 95%
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      Growth: 92%
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      Culture: 90%
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Typography, Features & CTA (~42% width)
              ========================================================================= */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            
            {/* Small Eyebrow Label: CAREER DNA */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-[0.18em] uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              CAREER DNA
            </div>

            {/* Main Heading with Subtle Gradient Highlights */}
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-extrabold text-white tracking-tight leading-[1.14]">
              Your career is{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                personal.
              </span>
              <br />
              Your research should be,{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                too.
              </span>
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-[15px] sm:text-[16px] leading-relaxed max-w-lg">
              Tell CompanyIQ what matters to you. Discover how every company aligns with your ambitions, preferences, and career goals.
            </p>

            {/* Three Icon-Based Feature Rows / Cards */}
            <div className="space-y-2 sm:space-y-2.5 pt-1">
              
              {/* Feature 1: Weighted Priorities */}
              <div className="group flex items-start gap-3.5 sm:gap-4 p-3 sm:p-3.5 -mx-3 sm:-mx-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-sm shrink-0 group-hover:scale-105 group-hover:border-blue-400/40 group-hover:text-blue-300 transition-all duration-200">
                  <SlidersHorizontal size={19} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-base font-bold text-white group-hover:text-blue-200 transition-colors">
                    Weighted Priorities
                  </h3>
                  <p className="text-[13px] sm:text-sm text-slate-400 mt-0.5 leading-snug">
                    Salary, growth, culture, work-life balance, and more.
                  </p>
                </div>
              </div>

              {/* Feature 2: Personal Fit */}
              <div className="group flex items-start gap-3.5 sm:gap-4 p-3 sm:p-3.5 -mx-3 sm:-mx-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm shrink-0 group-hover:scale-105 group-hover:border-indigo-400/40 group-hover:text-indigo-300 transition-all duration-200">
                  <Target size={19} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                    Personal Fit
                  </h3>
                  <p className="text-[13px] sm:text-sm text-slate-400 mt-0.5 leading-snug">
                    Get company recommendations shaped around your preferences.
                  </p>
                </div>
              </div>

              {/* Feature 3: Clear Tradeoffs */}
              <div className="group flex items-start gap-3.5 sm:gap-4 p-3 sm:p-3.5 -mx-3 sm:-mx-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-sm shrink-0 group-hover:scale-105 group-hover:border-cyan-400/40 group-hover:text-cyan-300 transition-all duration-200">
                  <Scale size={19} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] sm:text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                    Clear Tradeoffs
                  </h3>
                  <p className="text-[13px] sm:text-sm text-slate-400 mt-0.5 leading-snug">
                    Understand what you gain and what you compromise.
                  </p>
                </div>
              </div>

            </div>

            {/* CTA Button & Time Subtext */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => navigate('/career-dna/build')}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-[15px] shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <span>Build Your Career DNA</span>
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2 font-medium">
                <span>⏱</span>
                <span>Takes about 2 minutes · 6 preferences</span>
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
