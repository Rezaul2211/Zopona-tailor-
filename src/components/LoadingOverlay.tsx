import React from 'react';
import { Scissors, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Synchronizing Bespoke Catalog & Cloud Firestore...',
}) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center max-w-sm w-full space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Outer Rotating Accent Ring */}
          <div className="w-24 h-24 rounded-full border-2 border-blue-200 border-t-blue-600 border-r-blue-600 animate-spin transition-all duration-1000" />

          {/* Inner Counter-Rotating Ring */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-blue-100 border-b-blue-500 animate-[spin_1.5s_linear_infinite_reverse]" />

          {/* Glowing Central Blue Medallion */}
          <div className="absolute w-12 h-12 rounded-2xl bg-blue-600 p-0.5 shadow-lg shadow-blue-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-600">
              <Scissors className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Brand Title & Subtitle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif text-xl font-bold tracking-wide text-slate-900">
              Zopono Tailor
            </h2>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-blue-600 font-bold">
            Bespoke Custom Fitting
          </p>
          <p className="text-xs text-slate-500 font-medium pt-1">
            {message}
          </p>
        </div>

        {/* Loading Progress Line */}
        <div className="w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div className="w-full h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

