import React from 'react';
import {
  Scissors,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  RefreshCw,
  Ruler,
} from 'lucide-react';

interface FooterProps {
  onOpenCustomModal: () => void;
  onOpenTracker: () => void;
  onSelectCategory: (cat: 'Men' | 'Women' | 'All') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenCustomModal,
  onOpenTracker,
  onSelectCategory,
}) => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-700 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Value Guarantees Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">100% Fit Guarantee</h4>
              <p className="text-[11px] text-slate-500">Free alterations if measurements mismatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Master Tailor Stitched</h4>
              <p className="text-[11px] text-slate-500">Hand-finished collar, cuff, & placket</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Bangladesh Courier</h4>
              <p className="text-[11px] text-slate-500">Dhaka & all 64 districts delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">Save Size Profiles</h4>
              <p className="text-[11px] text-slate-500">Browser LocalStorage persistent fitting</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg font-bold text-slate-900">
                ZOPONO TAILOR
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Premium custom tailoring & bespoke stitched fashion boutique. Crafted for discerning men and women seeking unmatched elegance.
            </p>
          </div>

          {/* Men's Collections */}
          <div className="space-y-2">
            <h4 className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">
              Men's Bespoke Tailoring
            </h4>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <button onClick={() => onSelectCategory('Men')} className="hover:text-blue-600 transition">
                  Royal Panjabi & Pajama
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Men')} className="hover:text-blue-600 transition">
                  Italian Wool Suits & Tuxedos
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Men')} className="hover:text-blue-600 transition">
                  Executive Linen Formal Shirts
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Men')} className="hover:text-blue-600 transition">
                  Velvet Prince Coats & Waistcoats
                </button>
              </li>
            </ul>
          </div>

          {/* Women's Collections */}
          <div className="space-y-2">
            <h4 className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">
              Women's Custom Tailoring
            </h4>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <button onClick={() => onSelectCategory('Women')} className="hover:text-blue-600 transition">
                  Dubai Nida Abaya & Borka
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Women')} className="hover:text-blue-600 transition">
                  Embroidered Salwar Kameez
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Women')} className="hover:text-blue-600 transition">
                  Designer Anarkali Gowns
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Women')} className="hover:text-blue-600 transition">
                  Unstitched Heritage Jamdani Fabrics
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Shortcuts */}
          <div className="space-y-2">
            <h4 className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">
              Boutique Customer Care
            </h4>
            <div className="space-y-2 text-slate-600">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>+880 1700-000000 (WhatsApp)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>orders@zoponotailor.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Banani Road 11, Dhaka, Bangladesh</span>
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={onOpenCustomModal}
                  className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-blue-100 transition flex items-center gap-1"
                >
                  <Ruler className="w-3 h-3" /> Size Studio
                </button>
                <button
                  onClick={onOpenTracker}
                  className="bg-white text-slate-700 border border-slate-200 px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-slate-50 transition"
                >
                  Order Tracker
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Badges & Copyright */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Zopono Tailor. All rights reserved. Premium Custom Tailoring & Stitched Fashion.</p>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-semibold">Accepted Gateways:</span>
            <span className="bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded font-mono font-bold">
              bKash
            </span>
            <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded font-mono font-bold">
              Nagad
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-mono font-bold">
              Cash On Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
