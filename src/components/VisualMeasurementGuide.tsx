import React, { useState } from 'react';
import { Ruler, Info, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface GuideItem {
  id: string;
  name: string;
  bengaliName: string;
  description: string;
  tip: string;
}

const MEASUREMENT_GUIDES: GuideItem[] = [
  {
    id: 'length',
    name: 'Length',
    bengaliName: 'ঝুল',
    description: 'Measure vertically from the highest point of your shoulder seam near the collar down to your desired hemline.',
    tip: 'Stand straight without bending forward. For Panjabi, hem typically stops just below the knees. For Shirts, measure to mid-hip.'
  },
  {
    id: 'chest',
    name: 'Chest / Bust',
    bengaliName: 'ছাতি',
    description: 'Wrap the tape measure around the fullest part of your chest, keeping tape horizontal under armpits.',
    tip: 'Keep two fingers between the tape measure and your body for natural movement and comfortable breathing.'
  },
  {
    id: 'waist',
    name: 'Waist',
    bengaliName: 'কোমর',
    description: 'Measure around your natural waistline, where your body narrows or where you normally wear trouser bands.',
    tip: 'Do not pull the tape too tight or hold your breath in.'
  },
  {
    id: 'shoulder',
    name: 'Shoulder Width',
    bengaliName: 'কাঁধ',
    description: 'Measure across the back from the outer edge of one shoulder bone to the outer edge of the other.',
    tip: 'Wear a well-fitting shirt to easily locate the shoulder seam line.'
  },
  {
    id: 'sleeve',
    name: 'Sleeve Length',
    bengaliName: 'হাতা',
    description: 'Measure from the top tip of the shoulder bone down the outside of your arm to your wrist joint.',
    tip: 'Bend your elbow slightly for extra ease if you prefer a relaxed cuff movement.'
  },
  {
    id: 'neck',
    name: 'Neck / Collar',
    bengaliName: 'গলা',
    description: 'Measure around the base of the neck where the collar sits.',
    tip: 'Place one finger under the tape for mandarin collar or regular collar comfort.'
  },
  {
    id: 'hip',
    name: 'Hip',
    bengaliName: 'হিপ',
    description: 'Measure around the fullest part of your hips and seat while standing feet together.',
    tip: 'Essential for Borka, Abaya, Salwar Kameez, and tailored Panjabi side slits.'
  },
  {
    id: 'armhole',
    name: 'Armhole',
    bengaliName: 'আরমহোল',
    description: 'Measure in a loop from the top of shoulder, around under armpit, back to shoulder tip.',
    tip: 'Prevents tightness when lifting arms in custom fitted suits and sherwanis.'
  }
];

export const VisualMeasurementGuide: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [selectedGuide, setSelectedGuide] = useState<GuideItem>(MEASUREMENT_GUIDES[0]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-amber-200">
              Master Tailor Measurement Guide
            </h3>
            <p className="text-xs text-slate-400">
              Precise body measurement instructions for perfect fit
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
        {/* Left Interactive List */}
        <div className="md:col-span-5 space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {MEASUREMENT_GUIDES.map((item) => {
            const isSelected = selectedGuide.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedGuide(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-medium transition ${
                  isSelected
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span>{item.name}</span>
                  <span className="text-amber-500/80 font-normal">({item.bengaliName})</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-amber-400' : 'text-slate-500'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Graphic Diagram & Instructions */}
        <div className="md:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                {selectedGuide.name} <span className="text-slate-400 font-normal">({selectedGuide.bengaliName})</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full font-mono">
                Step Guide
              </span>
            </div>

            <div className="my-3 flex items-center gap-4">
              {/* Diagram Graphic Mock */}
              <div className="relative w-20 h-28 bg-slate-900 border border-slate-800 rounded-lg flex flex-col items-center justify-center shrink-0">
                <svg className="w-14 h-24 text-slate-700" viewBox="0 0 100 160" fill="none" stroke="currentColor">
                  {/* Head */}
                  <circle cx="50" cy="20" r="12" strokeWidth="2" className="text-slate-600" />
                  {/* Shoulders & Arms */}
                  <path d="M 25 45 L 50 35 L 75 45 L 85 85 L 78 85 L 70 50 L 30 50 L 22 85 L 15 85 Z" strokeWidth="2" className="text-slate-600" />
                  {/* Torso & Leg */}
                  <path d="M 30 50 L 32 100 L 46 150 L 54 150 L 68 100 L 70 50 Z" strokeWidth="2" className="text-slate-600" />
                  
                  {/* Dynamic highlight indicator line according to measurement */}
                  {selectedGuide.id === 'length' && (
                    <line x1="50" y1="35" x2="50" y2="120" stroke="#E5C158" strokeWidth="3" strokeDasharray="3 3" />
                  )}
                  {selectedGuide.id === 'chest' && (
                    <line x1="28" y1="52" x2="72" y2="52" stroke="#E5C158" strokeWidth="4" />
                  )}
                  {selectedGuide.id === 'waist' && (
                    <line x1="31" y1="70" x2="69" y2="70" stroke="#E5C158" strokeWidth="4" />
                  )}
                  {selectedGuide.id === 'shoulder' && (
                    <line x1="25" y1="42" x2="75" y2="42" stroke="#E5C158" strokeWidth="4" />
                  )}
                  {selectedGuide.id === 'sleeve' && (
                    <line x1="75" y1="45" x2="85" y2="85" stroke="#E5C158" strokeWidth="4" />
                  )}
                  {selectedGuide.id === 'neck' && (
                    <circle cx="50" cy="35" r="7" stroke="#E5C158" strokeWidth="3" fill="none" />
                  )}
                  {selectedGuide.id === 'hip' && (
                    <line x1="32" y1="90" x2="68" y2="90" stroke="#E5C158" strokeWidth="4" />
                  )}
                  {selectedGuide.id === 'armhole' && (
                    <ellipse cx="28" cy="50" rx="4" ry="8" stroke="#E5C158" strokeWidth="3" fill="none" />
                  )}
                </svg>
                <span className="absolute bottom-1 text-[9px] text-amber-400 font-medium">Inch Tape</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedGuide.description}
                </p>
                <div className="flex items-start gap-1.5 p-2 bg-amber-950/30 border border-amber-500/20 rounded-lg text-[11px] text-amber-200/90">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Master Tailor Tip:</strong> {selectedGuide.tip}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/90 px-2.5 py-1.5 rounded-md border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>If you prefer, select a standard size (S/M/L/XL) or our tailors can call you to guide your measurements!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
