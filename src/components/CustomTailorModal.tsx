import React, { useState, useEffect } from 'react';
import {
  X,
  Ruler,
  Scissors,
  BookmarkPlus,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Sparkles,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';
import {
  SubCategory,
  Measurements,
  DesignCustomization,
  MeasurementProfile,
  Product,
} from '../types';
import { getStoredProfiles, saveProfile } from '../utils/localStorage';
import { saveUserProfileToFirestore, auth } from '../firebase';
import { VisualMeasurementGuide } from './VisualMeasurementGuide';

interface CustomTailorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onAddToCart: (
    product: Product,
    measurements: Measurements,
    design: DesignCustomization,
    profileName: string
  ) => void;
}

const DEFAULT_MEASUREMENTS: Measurements = {
  length: 42,
  chest: 38,
  waist: 34,
  shoulder: 17.5,
  sleeve: 24.5,
  neck: 15.5,
  armhole: 18.5,
  hip: 40,
  bottomLength: 40,
};

const DEFAULT_DESIGN: DesignCustomization = {
  collarStyle: 'Mandarin',
  pocketOption: 'Double Side Pocket',
  fitPreference: 'Slim Fit',
  sleeveStyle: 'Cuff',
  buttonType: 'Metal Gold',
  specialInstructions: '',
};

export const CustomTailorModal: React.FC<CustomTailorModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}) => {
  const [step, setStep] = useState<number>(1);
  const [garmentType, setGarmentType] = useState<SubCategory | string>('Panjabi');
  const [measurements, setMeasurements] = useState<Measurements>(DEFAULT_MEASUREMENTS);
  const [design, setDesign] = useState<DesignCustomization>(DEFAULT_DESIGN);
  const [profileName, setProfileName] = useState<string>('My Custom Fitting');
  const [customerName, setCustomerName] = useState<string>('');
  const [savedProfiles, setSavedProfiles] = useState<MeasurementProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [profileSavedToast, setProfileSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setGarmentType(product.subCategory);
      setProfileName(`${product.subCategory} Custom Profile`);
    }
    const profiles = getStoredProfiles();
    setSavedProfiles(profiles);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (profId: string) => {
    setSelectedProfileId(profId);
    const found = savedProfiles.find((p) => p.id === profId);
    if (found) {
      setMeasurements(found.measurements);
      setDesign(found.design);
      setProfileName(found.profileName);
      if (found.customerName) setCustomerName(found.customerName);
      if (found.garmentType) setGarmentType(found.garmentType);
    }
  };

  const handleSaveProfileClick = () => {
    const newProf: MeasurementProfile = {
      id: selectedProfileId || `prof-${Date.now()}`,
      profileName: profileName || `${garmentType} Fitting`,
      customerName: customerName || 'Valued Customer',
      garmentType,
      measurements,
      design,
      updatedAt: new Date().toISOString(),
    };
    if (auth.currentUser) {
      saveUserProfileToFirestore(auth.currentUser.uid, newProf).catch((err) =>
        console.error('Error saving profile to Firestore:', err)
      );
    }
    const updated = saveProfile(newProf);
    setSavedProfiles(updated);
    setSelectedProfileId(newProf.id);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  const handleMeasurementChange = (field: keyof Measurements, val: string) => {
    const num = parseFloat(val) || 0;
    setMeasurements((prev) => ({ ...prev, [field]: num }));
  };

  // Generic fallback product if opened from top header without specific item
  const currentProduct: Product = product || {
    id: 'zp-custom-order',
    title: `Custom Tailored ${garmentType}`,
    category: ['Panjabi', 'Pajama', 'Suits', 'Formal Shirts', 'Waistcoats', 'Kurta'].includes(garmentType)
      ? 'Men'
      : 'Women',
    subCategory: garmentType as SubCategory,
    basePrice: 3200,
    stitchingCharge: 800,
    description: 'Bespoke custom tailoring service with master tailor craftsmanship.',
    fabricType: 'Premium Tailoring Material',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800',
    isCustomizable: true,
    stockStatus: 'In Stock',
  };

  const totalCost = currentProduct.basePrice + currentProduct.stitchingCharge;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="glass-panel border-amber-500/40 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Ultra Luxury Gold Accent */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Scissors className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent truncate">
                  Custom Tailor Studio
                </h2>
                <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Bespoke Fitting
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                Crafting <span className="text-amber-300 font-semibold">{currentProduct.title}</span> to your exact body specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition shadow-sm"
              title="View Visual Measurement Guide"
            >
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Measurement Guide</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition shrink-0"
              title="Close Tailor Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Saved Profiles Horizontal Quick Bar */}
        {savedProfiles.length > 0 && (
          <div className="bg-slate-950/80 px-4 sm:px-6 py-2.5 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-amber-400 shrink-0 font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
              Saved Profiles:
            </span>
            <div className="flex items-center gap-2 shrink-0 pb-0.5">
              {savedProfiles.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => handleSelectProfile(prof.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedProfileId === prof.id
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate max-w-[140px]">{prof.profileName}</span>
                  {selectedProfileId === prof.id && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Steps Indicator */}
        <div className="bg-slate-950/60 px-4 sm:px-6 py-2.5 border-b border-slate-800/80">
          <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
            {[
              { num: 1, label: '1. Garment & Profile' },
              { num: 2, label: '2. Measurements' },
              { num: 3, label: '3. Style Design' },
            ].map((st) => {
              const isActive = step === st.num;
              const isCompleted = step > st.num;
              return (
                <button
                  key={st.num}
                  onClick={() => setStep(st.num)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-900 text-amber-400/80 hover:bg-slate-800 border border-slate-800'
                      : 'bg-slate-900/40 text-slate-500 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : isCompleted
                        ? 'bg-amber-500/30 text-amber-300'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5" /> : st.num}
                  </div>
                  <span className="truncate">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {showGuide && (
            <div className="mb-4">
              <VisualMeasurementGuide onClose={() => setShowGuide(false)} />
            </div>
          )}

          {/* STEP 1: Garment Type & Saved Profile Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" /> Select Garment Category
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">11 Custom Fitting Options Available</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { name: 'Panjabi', tag: 'Royal Panjabi & Kurta', icon: '✨' },
                    { name: 'Abaya', tag: 'Dubaian Silk Abaya', icon: '🌙' },
                    { name: 'Suits', tag: 'Italian Wool Suit', icon: '👔' },
                    { name: 'Salwar Kameez', tag: '3-Piece Salwar Suit', icon: '🌸' },
                    { name: 'Formal Shirts', tag: 'Executive Cotton Fit', icon: '👔' },
                    { name: 'Borka', tag: 'Designer Modest Borka', icon: '💎' },
                    { name: 'Waistcoats', tag: 'Velvet & Raw Silk', icon: '🥼' },
                    { name: 'Kurta', tag: 'Casual & Festive Kurta', icon: '✨' },
                    { name: 'Designer Gowns', tag: 'Luxury Evening Gown', icon: '👑' },
                    { name: 'Kurtis', tag: 'Custom Tailored Kurti', icon: '🌺' },
                    { name: 'Pajama', tag: 'Panjabi Fitting Pajama', icon: '✂️' },
                  ].map((item) => {
                    const isSelected = garmentType === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setGarmentType(item.name);
                          if (!profileName) setProfileName(`${item.name} Fit Profile`);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative group overflow-hidden flex flex-col justify-between min-h-[82px] ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500/25 via-amber-600/10 to-slate-900 border-amber-400/80 shadow-lg shadow-amber-500/15 ring-1 ring-amber-400/50 scale-[1.02]'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-lg">{item.icon}</span>
                          {isSelected ? (
                            <span className="bg-amber-400 text-slate-950 p-1 rounded-full shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-amber-400/50 transition" />
                          )}
                        </div>

                        <div>
                          <h4 className={`text-xs sm:text-sm font-bold font-serif leading-tight transition ${
                            isSelected ? 'text-amber-200' : 'text-slate-200 group-hover:text-amber-300'
                          }`}>
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block font-sans truncate mt-0.5">
                            {item.tag}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Profile Name (e.g., My Eid Fit, Office Suit)
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter Profile Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-amber-200">
                      Pricing & Tailoring Breakdown
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Fabric Price: ৳{currentProduct.basePrice.toLocaleString()} + Master Stitching Charge: ৳{currentProduct.stitchingCharge.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Unit Price</span>
                  <span className="text-base font-bold text-amber-400 font-serif">
                    ৳{totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Measurement Input Fields (in inches with Bengali labels) */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Exact Body Measurements (Inches)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="text-xs text-amber-300 hover:underline flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" /> Need Measurement Guide?
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                  { key: 'length', label: 'Length', bn: 'ঝুল' },
                  { key: 'chest', label: 'Chest / Bust', bn: 'ছাতি' },
                  { key: 'waist', label: 'Waist', bn: 'কোমর' },
                  { key: 'shoulder', label: 'Shoulder Width', bn: 'কাঁধ' },
                  { key: 'sleeve', label: 'Sleeve Length', bn: 'হাতা' },
                  { key: 'neck', label: 'Neck / Collar', bn: 'গলা' },
                  { key: 'hip', label: 'Hip', bn: 'হিপ' },
                  { key: 'armhole', label: 'Armhole', bn: 'আরমহোল' },
                ].map((m) => {
                  const key = m.key as keyof Measurements;
                  return (
                    <div
                      key={m.key}
                      className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-medium text-slate-200">
                          {m.label}
                        </label>
                        <span className="text-[10px] text-amber-500 font-serif">
                          ({m.bn})
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.25"
                          min="5"
                          max="100"
                          value={measurements[key] || ''}
                          onChange={(e) => handleMeasurementChange(key, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-500 font-medium">
                          in
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Save current measurements & design to your local size profile?
                </span>
                <button
                  onClick={handleSaveProfileClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" /> Save Profile
                </button>
              </div>

              {profileSavedToast && (
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg text-center font-medium animate-fade-in">
                  Measurement Profile saved successfully to LocalStorage!
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Design Customization Options */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 pb-2 border-b border-slate-800">
                Design Customization Options
              </h3>

              {/* Collar Style */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Collar Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Mandarin',
                    'Regular',
                    'Shirt Collar',
                    'V-Neck',
                    'Band Collar',
                    'Designer Notch',
                  ].map((col) => (
                    <button
                      key={col}
                      onClick={() =>
                        setDesign((prev) => ({
                          ...prev,
                          collarStyle: col as DesignCustomization['collarStyle'],
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                        design.collarStyle === col
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pocket Options */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Pocket Options
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Single Pocket',
                    'Double Side Pocket',
                    'Hidden Pocket',
                    'Chest Pocket',
                    'No Pocket',
                  ].map((poc) => (
                    <button
                      key={poc}
                      onClick={() =>
                        setDesign((prev) => ({
                          ...prev,
                          pocketOption: poc as DesignCustomization['pocketOption'],
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                        design.pocketOption === poc
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {poc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Preference & Sleeve Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Fit Preference
                  </label>
                  <div className="space-y-1.5">
                    {['Slim Fit', 'Regular Fit', 'Loose Fit', 'Tailored Fitting'].map((fit) => (
                      <button
                        key={fit}
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            fitPreference: fit as DesignCustomization['fitPreference'],
                          }))
                        }
                        className={`w-full p-2 text-xs font-medium text-left rounded-lg border transition ${
                          design.fitPreference === fit
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {fit}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Sleeve Style
                  </label>
                  <div className="space-y-1.5">
                    {['Cuff', 'Open Straight', 'Elasticated', 'Embroidered Cuff'].map((slv) => (
                      <button
                        key={slv}
                        onClick={() =>
                          setDesign((prev) => ({
                            ...prev,
                            sleeveStyle: slv as DesignCustomization['sleeveStyle'],
                          }))
                        }
                        className={`w-full p-2 text-xs font-medium text-left rounded-lg border transition ${
                          design.sleeveStyle === slv
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {slv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Button Selection & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Button Style
                  </label>
                  <select
                    value={design.buttonType || 'Metal Gold'}
                    onChange={(e) =>
                      setDesign((prev) => ({
                        ...prev,
                        buttonType: e.target.value as DesignCustomization['buttonType'],
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Metal Gold">Antique Metal Gold</option>
                    <option value="Horn">Natural Horn / Wooden</option>
                    <option value="Pearl">Mother of Pearl</option>
                    <option value="Concealed Zip">Hidden Zipper</option>
                    <option value="Fabric Covered">Matching Fabric Covered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Special Tailoring Instructions
                  </label>
                  <input
                    type="text"
                    value={design.specialInstructions || ''}
                    onChange={(e) =>
                      setDesign((prev) => ({
                        ...prev,
                        specialInstructions: e.target.value,
                      }))
                    }
                    placeholder="e.g. Extra ease in armholes, side pocket depth 8in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onAddToCart(currentProduct, measurements, design, profileName);
                  onClose();
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/30 transition transform active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" /> Save Specifications & Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
