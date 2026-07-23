import React from 'react';
import { Scissors, ArrowDownRight, Sparkles } from 'lucide-react';

interface BannerProps {
  onOpenCustomModal: () => void;
  onSelectCategory: (cat: 'Men' | 'Women') => void;
}

export const Banner: React.FC<BannerProps> = ({
  onOpenCustomModal,
  onSelectCategory,
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-100 text-slate-900 min-h-[480px] sm:min-h-[520px] flex items-center border-b border-slate-200">
      {/* Background Video Loop - Bright & Clearly Visible */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600"
          className="w-full h-full object-cover object-center scale-105 filter brightness-95 contrast-105 opacity-85 transition-opacity duration-700"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-stitching-fabric-41551-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Subtle Ambient Light Wash */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-slate-900/30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Liquid Glass Hero Content Card */}
        <div className="lg:col-span-7 space-y-6 liquid-glass-hero p-6 sm:p-8 rounded-3xl backdrop-blur-xl border border-white/90 shadow-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 text-blue-700 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Master Tailor Bespoke Fit</span>
          </div>

          {/* Clean Main Headings Only - No Dense Paragraphs */}
          <div className="space-y-1">
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Perfect Bespoke Fit.
            </h1>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold accent-gradient-text leading-[1.15]">
              Custom Tailored to Your Body.
            </h2>
          </div>

          {/* High Impact Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenCustomModal}
              className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <Scissors className="w-4 h-4 text-white" />
              <span>Custom Tailor Studio</span>
            </button>

            <button
              onClick={() => onSelectCategory('Men')}
              className="bg-white/90 hover:bg-white text-slate-900 text-xs sm:text-sm font-bold px-5 py-3.5 rounded-xl border border-slate-200 transition shadow-md flex items-center gap-1.5"
            >
              <span>Explore Men's</span>
              <ArrowDownRight className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={() => onSelectCategory('Women')}
              className="bg-white/90 hover:bg-white text-slate-900 text-xs sm:text-sm font-bold px-5 py-3.5 rounded-xl border border-slate-200 transition shadow-md flex items-center gap-1.5"
            >
              <span>Explore Women's</span>
              <ArrowDownRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Right Liquid Glass Showcase Widget */}
        <div className="lg:col-span-5 relative">
          <div className="liquid-glass-hero border border-white/90 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="font-serif text-sm font-bold text-slate-900">
                Craftsmanship Collection
              </span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-200">
                100% Bespoke
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => onSelectCategory('Men')}
                className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-md cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
                  alt="Royal Panjabi Tailoring"
                  className="w-full h-32 sm:h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                    Men's Bespoke
                  </span>
                  <span className="text-xs font-serif font-bold text-white truncate block">
                    Panjabi & Suits
                  </span>
                </div>
              </div>

              <div
                onClick={() => onSelectCategory('Women')}
                className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-md cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
                  alt="Dubaian Abaya Custom Tailor"
                  className="w-full h-32 sm:h-36 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block">
                    Women's Bespoke
                  </span>
                  <span className="text-xs font-serif font-bold text-white truncate block">
                    Abaya & Kameez
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


