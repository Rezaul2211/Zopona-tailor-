import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Phone,
  MapPin,
  CreditCard,
  Building,
  Printer,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { addOrder } from '../utils/localStorage';
import { saveOrderToFirestore, auth } from '../firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onClearCart: () => void;
  onViewOrderSlip: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onClearCart,
  onViewOrderSlip,
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [deliveryType, setDeliveryType] = useState<'Standard Dhaka' | 'Outside Dhaka' | 'Express'>('Standard Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash on Delivery'>('bKash');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [codPhone, setCodPhone] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const isValidMobileNumber = (num: string): boolean => {
    const cleaned = num.trim().replace(/[\s-]/g, '');
    return /^(\+?88)?01[3-9]\d{8}$/.test(cleaned);
  };

  const getDeliveryCharge = () => {
    if (deliveryType === 'Standard Dhaka') return 70;
    if (deliveryType === 'Outside Dhaka') return 130;
    return 200; // Express
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.basePrice * item.quantity, 0);
  const stitchingTotal = cart.reduce(
    (acc, item) => acc + (item.isCustomTailored ? item.product.stitchingCharge : 0) * item.quantity,
    0
  );
  const deliveryCharge = getDeliveryCharge();
  const totalAmount = subtotal + stitchingTotal + deliveryCharge;

  const handlePaymentMethodSelect = (pm: 'bKash' | 'Nagad' | 'Cash on Delivery') => {
    setPaymentMethod(pm);
    setValidationError(null);
    if (pm === 'Cash on Delivery' && !codPhone) {
      setCodPhone(phone);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setValidationError('Please fill in Customer Name, Phone Number, and Delivery Address.');
      return;
    }

    if (!isValidMobileNumber(phone)) {
      setValidationError('Please enter a valid 11-digit mobile number for Customer Contact (e.g., 01711XXXXXX).');
      return;
    }

    if (paymentMethod === 'Cash on Delivery') {
      const targetCodPhone = codPhone.trim() || phone.trim();
      if (!targetCodPhone || !isValidMobileNumber(targetCodPhone)) {
        setValidationError('Cash on Delivery requires a valid mobile phone number for rider confirmation (e.g., 01711XXXXXX).');
        return;
      }
    }

    if (paymentMethod === 'Nagad') {
      if (!senderPhone.trim()) {
        setValidationError('Please enter your Nagad Account Mobile Number.');
        return;
      }
      if (!isValidMobileNumber(senderPhone)) {
        setValidationError('Please enter a valid 11-digit Nagad account mobile number (e.g., 01711XXXXXX).');
        return;
      }
      if (!transactionId.trim()) {
        setValidationError('Please enter your Nagad Transaction ID (TrxID).');
        return;
      }
    }

    if (paymentMethod === 'bKash') {
      if (!senderPhone.trim()) {
        setValidationError('Please enter your bKash Account Mobile Number.');
        return;
      }
      if (!isValidMobileNumber(senderPhone)) {
        setValidationError('Please enter a valid 11-digit bKash account mobile number (e.g., 01711XXXXXX).');
        return;
      }
      if (!transactionId.trim()) {
        setValidationError('Please enter your bKash Transaction ID (TrxID).');
        return;
      }
    }

    const finalCodPhone = paymentMethod === 'Cash on Delivery' ? (codPhone.trim() || phone.trim()) : undefined;

    const newOrder: Order = {
      id: `ZP-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      district,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'COD' : 'Paid',
      senderPhone: (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? senderPhone.trim() : undefined,
      transactionId: (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? transactionId.trim() : undefined,
      codPhone: finalCodPhone,
      items: cart,
      subtotal,
      stitchingTotal,
      deliveryCharge,
      discount: 0,
      totalAmount,
      status: 'Order Placed',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      masterTailorNotes: 'Order received into tailor queue. Fabric pending cut.',
    };

    saveOrderToFirestore({
      ...newOrder,
      ...(auth.currentUser ? { userId: auth.currentUser.uid } : {}),
    } as any).catch((err) => console.error('Firestore order save error:', err));

    addOrder(newOrder);
    setCompletedOrder(newOrder);
    setIsSuccess(true);
    onClearCart();
  };

  // WhatsApp formatted string generator
  const getWhatsAppMessage = (order: Order) => {
    let msg = `*ZOPONO TAILOR NEW ORDER* %0A`;
    msg += `*Order ID:* ${order.id}%0A`;
    msg += `*Customer:* ${order.customerName}%0A`;
    msg += `*Phone:* ${order.phone}%0A`;
    msg += `*Address:* ${order.address}, ${order.district}%0A`;
    msg += `*Payment Method:* ${order.paymentMethod}%0A`;
    if (order.senderPhone) msg += `*Sender Phone:* ${order.senderPhone}%0A`;
    if (order.transactionId) msg += `*TrxID:* ${order.transactionId}%0A`;
    if (order.codPhone) msg += `*COD Contact:* ${order.codPhone}%0A`;
    msg += `%0A*Garments Order Details:*%0A`;

    order.items.forEach((it, idx) => {
      msg += `${idx + 1}. ${it.product.title} (x${it.quantity})%0A`;
      if (it.isCustomTailored && it.customMeasurements) {
        msg += `   - Custom Fits: Chest ${it.customMeasurements.chest}", Length ${it.customMeasurements.length}", Shoulder ${it.customMeasurements.shoulder}", Collar ${it.customDesign?.collarStyle}%0A`;
      }
    });

    msg += `%0A*Total Payable:* ৳${order.totalAmount.toLocaleString()}%0A`;
    msg += `Please confirm my tailor order!`;
    return msg;
  };

  const handleWhatsAppRedirect = () => {
    if (!completedOrder) return;
    const msg = getWhatsAppMessage(completedOrder);
    const whatsappUrl = `https://wa.me/8801700000000?text=${msg}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="glass-panel border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-amber-200">
                {isSuccess ? 'Order Confirmed!' : 'Tailor Order & Delivery Details'}
              </h2>
              <p className="text-xs text-slate-400">
                {isSuccess
                  ? 'Your bespoke garment specs have been sent to our Master Tailor'
                  : 'Enter delivery information to process your order'}
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

        {/* Content */}
        {isSuccess && completedOrder ? (
          <div className="p-6 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs text-amber-400 uppercase tracking-widest font-mono">
                Order Reference Code
              </span>
              <h3 className="font-serif text-3xl font-bold text-amber-200 mt-1">
                {completedOrder.id}
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Thank you, <strong className="text-amber-300">{completedOrder.customerName}</strong>! Your order is registered in our stitching system.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="text-slate-200 font-medium">
                  {completedOrder.address}, {completedOrder.district}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Payment Method:</span>
                <span className="text-amber-300 font-semibold">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-400 pt-1">
                <span>Total Amount:</span>
                <span className="font-serif text-sm">৳{completedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions for Confirmed Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onViewOrderSlip(completedOrder)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-lg transition hover:brightness-110"
              >
                <Printer className="w-4 h-4" /> Print Master Tailor Slip
              </button>

              <button
                onClick={handleWhatsAppRedirect}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition"
              >
                <MessageSquare className="w-4 h-4" /> Send Specs to WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 overflow-y-auto space-y-5">
            {/* Validation Error Banner */}
            {validationError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-medium">{validationError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setValidationError(null)}
                  className="text-red-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Customer Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Customer Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="e.g. Tanvir Hossain"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="01711XXXXXX"
                    className={`w-full bg-slate-950 border rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-400 ${
                      phone && !isValidMobileNumber(phone) ? 'border-red-500/60' : 'border-slate-800'
                    }`}
                  />
                  {phone && !isValidMobileNumber(phone) && (
                    <p className="text-[10px] text-red-400 mt-1">Must be 11-digit mobile number (e.g. 01711XXXXXX)</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address & Zone */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Delivery Address & Zone
              </h3>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Street Address / House / Flat *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House 12, Road 5, Block C, Banani, Dhaka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">District / City</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Delivery Speed & Rate</label>
                  <select
                    value={deliveryType}
                    onChange={(e) =>
                      setDeliveryType(e.target.value as 'Standard Dhaka' | 'Outside Dhaka' | 'Express')
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Standard Dhaka">Inside Dhaka (৳70)</option>
                    <option value="Outside Dhaka">Outside Dhaka Courier (৳130)</option>
                    <option value="Express">Express Urgent Delivery (৳200)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Payment Gateway Choice
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bKash', label: 'bKash Mobile Banking', color: 'border-pink-500/40 text-pink-300' },
                  { id: 'Nagad', label: 'Nagad Mobile Banking', color: 'border-orange-500/40 text-orange-300' },
                  { id: 'Cash on Delivery', label: 'Cash on Delivery', color: 'border-emerald-500/40 text-emerald-300' },
                ].map((pm) => (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => handlePaymentMethodSelect(pm.id as any)}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition ${
                      paymentMethod === pm.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Payment Details Inputs */}
              {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Send Payment via {paymentMethod} Send Money / Payment:</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] space-y-1">
                    <p className="font-bold text-amber-200">
                      {paymentMethod} Personal/Merchant Number: <span className="text-amber-400 text-xs">01700-000000</span>
                    </p>
                    <p className="text-slate-400">Total Amount to Send: <span className="text-amber-300 font-serif font-bold">৳{totalAmount.toLocaleString()}</span></p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-slate-300 mb-1">Your {paymentMethod} Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => {
                          setSenderPhone(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="e.g. 01711XXXXXX"
                        className={`w-full bg-slate-900 border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono ${
                          senderPhone && !isValidMobileNumber(senderPhone) ? 'border-red-500/60' : 'border-slate-800'
                        }`}
                      />
                      {senderPhone && !isValidMobileNumber(senderPhone) && (
                        <p className="text-[10px] text-red-400 mt-1">Must be 11-digit mobile number</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Transaction ID (TrxID) *</label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="e.g. 9J82KS10X"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 uppercase focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Cash on Delivery' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cash on Delivery (COD) Active</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    You can pay the full amount (<strong className="text-amber-300">৳{totalAmount.toLocaleString()}</strong>) in cash to the delivery rider upon receiving your bespoke tailor parcel.
                  </p>
                  <div>
                    <label className="block text-slate-300 mb-1">Confirmation Mobile Number for Delivery Rider *</label>
                    <input
                      type="tel"
                      required
                      value={codPhone}
                      onChange={(e) => {
                        setCodPhone(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="e.g. 01711XXXXXX"
                      className={`w-full bg-slate-900 border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono ${
                        codPhone && !isValidMobileNumber(codPhone) ? 'border-red-500/60' : 'border-slate-800'
                      }`}
                    />
                    {codPhone && !isValidMobileNumber(codPhone) && (
                      <p className="text-[10px] text-red-400 mt-1">Must be a valid 11-digit mobile number</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Total Overview */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cart.length} items)</span>
                <span>৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Total Stitching & Customization Charge</span>
                <span>৳{stitchingTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge ({deliveryType})</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-amber-200 text-sm">
                <span>Total Amount Payable</span>
                <span className="font-serif text-base text-amber-400">
                  ৳{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl shadow-xl shadow-amber-500/20 transition transform active:scale-98"
            >
              Confirm Order & Send to Master Tailor <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
