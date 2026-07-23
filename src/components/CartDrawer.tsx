import React, { useState } from 'react';
import {
  X,
  Trash2,
  Scissors,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Ruler,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartId: string, qty: number) => void;
  onRemoveItem: (cartId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [promoCode, setPromoCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'ZOPONO200' || promoCode.trim().toUpperCase() === 'TAILOR500') {
      const disc = promoCode.trim().toUpperCase() === 'TAILOR500' ? 500 : 200;
      setDiscount(disc);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code. Try ZOPONO200 or TAILOR500 for instant discount!');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.basePrice * item.quantity, 0);
  const stitchingTotal = cart.reduce(
    (acc, item) => acc + (item.isCustomTailored ? item.product.stitchingCharge : 0) * item.quantity,
    0
  );
  const totalAmount = Math.max(0, subtotal + stitchingTotal - discount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="w-full max-w-md glass-panel border-l border-amber-500/30 h-full shadow-2xl text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-amber-200">
                Your Fashion Cart
              </h2>
              <p className="text-xs text-slate-400">
                {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-800/80 text-amber-500/50 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-base text-slate-300 font-medium">
                Your cart is empty
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our Men's and Women's collections or open our Custom Tailor Studio to design your garment.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartId}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-3 relative group"
              >
                <div className="flex gap-3">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-20 object-cover rounded-lg bg-slate-900 shrink-0"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10px] text-amber-400 font-medium">
                      Fabric: {item.product.fabricType}
                    </p>

                    {item.isCustomTailored ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                        <Scissors className="w-3 h-3 text-amber-400" />
                        Custom Tailored ({item.customProfileName || 'Bespoke'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-medium">
                        <Ruler className="w-3 h-3" /> Standard Size: {item.selectedSize}
                      </span>
                    )}

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-amber-400">
                        ৳{item.totalUnitPrice.toLocaleString()}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                          className="text-slate-400 hover:text-white px-1 font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold text-amber-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                          className="text-slate-400 hover:text-white px-1 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Specs Preview */}
                {item.isCustomTailored && item.customDesign && (
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 grid grid-cols-2 gap-1 font-mono">
                    <div>Collar: {item.customDesign.collarStyle}</div>
                    <div>Pocket: {item.customDesign.pocketOption}</div>
                    <div>Fit: {item.customDesign.fitPreference}</div>
                    <div>
                      Chest: {item.customMeasurements?.chest || 'N/A'}" / Length:{' '}
                      {item.customMeasurements?.length || 'N/A'}"
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Promo Code Input */}
          {cart.length > 0 && (
            <div className="pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo Code (e.g. TAILOR500)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 uppercase tracking-wider focus:outline-none focus:border-amber-400 pl-8"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Promo code applied! Saved ৳{discount}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Fabric Subtotal</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span className="flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5" /> Stitching & Tailoring Fee
                </span>
                <span>৳{stitchingTotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Special Discount</span>
                  <span>-৳{discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-amber-200">
                <span>Estimated Total</span>
                <span className="font-serif text-amber-400 text-base">
                  ৳{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl shadow-xl shadow-amber-500/20 transition transform active:scale-98"
            >
              Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
