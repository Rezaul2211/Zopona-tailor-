import React, { useState, useEffect } from 'react';
import {
  X,
  Scissors,
  ShoppingBag,
  Sparkles,
  Check,
  Ruler,
  ShieldCheck,
  Truck,
  RefreshCw,
  ArrowLeft,
  Star,
  MessageSquare,
  Send,
  UserCheck,
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { subscribeToProductReviews, addProductReviewToFirestore } from '../firebase';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onCustomTailor: (product: Product) => void;
  onAddToCartStandard: (product: Product, size: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onCustomTailor,
  onAddToCartStandard,
}) => {
  const [selectedOption, setSelectedOption] = useState<'custom' | 'standard'>('custom');
  const [selectedSize, setSelectedSize] = useState<string>('L');

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessNotice, setReviewSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!product) return;
    const unsubscribe = subscribeToProductReviews(product.id, (revs) => {
      setReviews(revs);
    });
    return () => unsubscribe();
  }, [product?.id]);

  if (!product) return null;

  const totalPrice =
    selectedOption === 'custom'
      ? product.basePrice + product.stitchingCharge
      : product.basePrice;

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await addProductReviewToFirestore({
        productId: product.id,
        userName: newUserName.trim(),
        rating: newRating,
        comment: newComment.trim(),
        createdAt: new Date().toISOString(),
      });

      setNewComment('');
      setIsAddingReview(false);
      setReviewSuccessNotice('Thank you! Your review has been published.');
      setTimeout(() => setReviewSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in overflow-hidden">
      <div className="glass-panel border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[88vh] shadow-2xl text-slate-900 overflow-hidden flex flex-col md:flex-row relative my-auto bg-white">
        
        {/* Mobile & Desktop Top Bar with Back to Package & Close Button */}
        <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
          {/* Back to Catalog / Package Button */}
          <button
            onClick={onClose}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-blue-700 text-xs font-bold rounded-full border border-blue-200 shadow-lg backdrop-blur-md transition active:scale-95"
            title="Return to Garment Catalog / Packages"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Packages</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="pointer-events-auto p-1.5 bg-white/90 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition backdrop-blur-md border border-slate-200 shadow-lg"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Side - Compact and responsive on mobile */}
        <div className="w-full md:w-1/2 relative bg-slate-100 h-48 sm:h-64 md:h-auto shrink-0 overflow-hidden group">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover object-top sm:object-center transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-white/90 text-slate-800 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200 backdrop-blur-md shadow-sm">
              {product.fabricType}
            </span>
            {product.isFeatured && (
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-white" /> Bespoke
              </span>
            )}
          </div>
        </div>

        {/* Content Side - Smooth Scrollable Area */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[calc(90vh-12rem)] md:max-h-[88vh] space-y-4 sm:space-y-5 bg-white">
          <div className="space-y-3 pt-2 sm:pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-200">
                {product.category}
              </span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-slate-500 text-xs font-medium">{product.subCategory}</span>
              <span className="text-slate-300 text-xs">•</span>
              
              {/* Rating Summary Badge */}
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 text-[11px] font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{avgRating}</span>
                <span className="text-slate-400 font-normal">({reviews.length})</span>
              </div>
            </div>

            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Fitting Choice Selector */}
            <div className="space-y-2.5 pt-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Choose Stitched Fitting Preference
              </label>

              {/* Option 1: Custom Tailored (Recommended) */}
              <div
                onClick={() => setSelectedOption('custom')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  selectedOption === 'custom'
                    ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                  <Scissors className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5 truncate">
                      Bespoke Master Tailoring
                    </span>
                    <span className="text-xs font-serif font-bold text-blue-800 shrink-0">
                      +৳{product.stitchingCharge.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5 leading-tight">
                    Custom measured with collar, pocket, and sleeve style choices.
                  </p>
                </div>
              </div>

              {/* Option 2: Unstitched / Standard Ready-to-Wear */}
              <div
                onClick={() => setSelectedOption('standard')}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                  selectedOption === 'standard'
                    ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="p-1.5 bg-slate-200 text-slate-700 rounded-lg shrink-0 mt-0.5">
                  <Ruler className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      Standard Size / Unstitched Fabric
                    </span>
                    <span className="text-xs font-serif font-bold text-slate-700 shrink-0">
                      ৳{product.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Standard S, M, L, XL chest size or unstitched raw fabric piece.
                  </p>

                  {selectedOption === 'standard' && (
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 font-medium">Size:</span>
                      {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                        <button
                          key={sz}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSize(sz);
                          }}
                          className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                            selectedSize === sz
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PRODUCT REVIEWS & RATINGS SECTION */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Customer Reviews ({reviews.length})</span>
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-800">{avgRating} out of 5</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Math.round(Number(avgRating))
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingReview(!isAddingReview)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
                >
                  {isAddingReview ? 'Cancel' : 'Write Review'}
                </button>
              </div>

              {/* Review Success Notice */}
              {reviewSuccessNotice && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{reviewSuccessNotice}</span>
                </div>
              )}

              {/* Review Form */}
              {isAddingReview && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 animate-fade-in"
                >
                  <h4 className="text-xs font-bold text-slate-800">Leave Your Rating & Feedback</h4>

                  {/* Rating Star Selection */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {newRating === 5 && 'Excellent'}
                        {newRating === 4 && 'Very Good'}
                        {newRating === 3 && 'Good'}
                        {newRating === 2 && 'Fair'}
                        {newRating === 1 && 'Poor'}
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tanvir Ahmed"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Comment Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Review / Feedback *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Share your experience regarding fabric quality, fit, or stitching finish..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    No reviews yet for this garment. Be the first to share your rating!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> Verified Buyer
                          </span>
                        </div>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700">{rev.comment}</p>
                      <p className="text-[10px] text-slate-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-1.5 text-[9px] sm:text-[10px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Perfect Fit</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Fast BD Delivery</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Free Alterations</span>
            </div>
          </div>

          {/* Footer Pricing & CTA */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sticky bottom-0 bg-white/95 backdrop-blur-md p-2 -mx-2 -mb-2 rounded-b-xl">
            <div className="flex items-center justify-between sm:block">
              <span className="text-[10px] text-slate-500 block font-medium">Total Price</span>
              <span className="text-base sm:text-lg font-bold text-blue-700 font-serif">
                ৳{totalPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1"
                title="Return to package list"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back</span>
              </button>

              {selectedOption === 'custom' ? (
                <button
                  onClick={() => {
                    onClose();
                    onCustomTailor(product);
                  }}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition active:scale-95"
                >
                  <Scissors className="w-4 h-4 shrink-0" /> Proceed to Custom Tailor
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAddToCartStandard(product, selectedSize);
                    onClose();
                  }}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition active:scale-95 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" /> Add Standard ({selectedSize})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

