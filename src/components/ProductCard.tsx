import React from 'react';
import { motion } from 'motion/react';
import { Scissors, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index?: number;
  onSelectProduct: (product: Product) => void;
  onCustomTailor: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  onSelectProduct,
  onCustomTailor,
  onQuickAddToCart,
}) => {
  const totalPrice = product.basePrice + product.stitchingCharge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: (index % 5) * 0.06, ease: 'easeOut' }}
      className="group glass-card glass-card-hover rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col justify-between h-full border border-slate-200"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelectProduct(product)}>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />

        {/* Category & Tags Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 z-10">
          <span className="bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {product.subCategory}
          </span>
          {product.isFeatured && (
            <span className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" /> <span className="hidden sm:inline">Royal</span> Bespoke
            </span>
          )}
        </div>

        {/* View Details Text Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900/40 backdrop-blur-[2px] pointer-events-none z-20">
          <span className="text-white text-sm font-bold tracking-widest uppercase drop-shadow-lg flex items-center gap-2">
            <Eye className="w-4 h-4" /> View Details
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between bg-white">
        <div>
          <div className="text-[9px] sm:text-[11px] text-blue-600 font-bold uppercase tracking-widest mb-0.5 sm:mb-1">
            {product.fabricType}
          </div>
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-serif text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1 cursor-pointer leading-tight min-h-[16px] sm:min-h-[20px]"
          >
            {product.title}
          </h3>
          <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-2 mt-0.5 sm:mt-1 leading-relaxed min-h-[30px] sm:min-h-[34px]">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block">Base + Stitch</span>
              <span className="text-xs sm:text-base font-bold text-blue-700 font-serif">
                ৳{totalPrice.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">Fabric Only</span>
              <span className="text-[10px] sm:text-xs text-slate-600">
                ৳{product.basePrice.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions - Consistent touch-target sizing (44px min height touch target) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={() => onCustomTailor(product)}
              className="min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-1 sm:gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] sm:text-xs font-bold py-2 px-2 rounded-xl transition shadow-sm active:scale-95"
            >
              <Scissors className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Tailor Fit</span>
            </button>

            <button
              onClick={() => onQuickAddToCart(product)}
              className="min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-1 sm:gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold py-2 px-2 rounded-xl transition active:scale-95 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
