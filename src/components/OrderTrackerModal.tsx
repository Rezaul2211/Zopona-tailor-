import React, { useState } from 'react';
import {
  X,
  Search,
  Clock,
  Scissors,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { getStoredOrders } from '../utils/localStorage';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrderSlip: (order: Order) => void;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
  {
    status: 'Order Placed',
    label: 'Order Placed',
    desc: 'Order received & queued for tailor assignment',
    icon: Clock,
  },
  {
    status: 'Order Confirmed',
    label: 'Order Confirmed',
    desc: 'Measurement profile verified by Master Tailor',
    icon: CheckCircle2,
  },
  {
    status: 'Fabric Cut',
    label: 'Fabric Cut',
    desc: 'Pattern created & fabric accurately cut',
    icon: Scissors,
  },
  {
    status: 'Stitching',
    label: 'Stitching',
    desc: 'Bespoke hand stitching in progress',
    icon: Sparkles,
  },
  {
    status: 'Quality Check',
    label: 'Quality Check',
    desc: 'Measuring against your size profile',
    icon: CheckCircle2,
  },
  {
    status: 'Ready for Delivery',
    label: 'Ready for Delivery',
    desc: 'Steam pressed & luxury packed',
    icon: Package,
  },
  {
    status: 'Shipped',
    label: 'Shipped',
    desc: 'Handed over to courier service',
    icon: Truck,
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    desc: 'Bespoke parcel delivered to customer',
    icon: CheckCircle2,
  },
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  onViewOrderSlip,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('ZP-98210');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const orders = getStoredOrders();
    const query = searchQuery.trim().toLowerCase();
    const match = orders.find(
      (o) => o.id.toLowerCase() === query || o.phone.includes(query)
    );
    setFoundOrder(match || null);
    setSearched(true);
  };

  const getStepIndex = (status: OrderStatus) => {
    return STATUS_STEPS.findIndex((s) => s.status === status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="glass-panel border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-medium text-amber-200">
                Live Tailor Order Tracker
              </h2>
              <p className="text-xs text-slate-400">
                Track real-time stitching & delivery progress
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. ZP-98210) or Phone Number"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-100 uppercase tracking-wider focus:outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-amber-500/20"
            >
              Track Order
            </button>
          </form>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Try sample order:</span>
            <button
              onClick={() => {
                setSearchQuery('ZP-98210');
                const orders = getStoredOrders();
                setFoundOrder(orders.find((o) => o.id === 'ZP-98210') || null);
                setSearched(true);
              }}
              className="text-amber-300 hover:underline bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
            >
              ZP-98210
            </button>
            <button
              onClick={() => {
                setSearchQuery('ZP-98211');
                const orders = getStoredOrders();
                setFoundOrder(orders.find((o) => o.id === 'ZP-98211') || null);
                setSearched(true);
              }}
              className="text-amber-300 hover:underline bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
            >
              ZP-98211
            </button>
          </div>

          {/* Result View */}
          {searched && !foundOrder ? (
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500/60 mx-auto" />
              <h3 className="font-serif text-sm font-semibold text-amber-200">
                No matching order found
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Please verify your Order ID or phone number. Sample IDs: ZP-98210, ZP-98211
              </p>
            </div>
          ) : foundOrder ? (
            <div className="space-y-6">
              {/* Order Info Card */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-amber-300">
                      {foundOrder.id}
                    </span>
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
                      {foundOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Customer: {foundOrder.customerName} ({foundOrder.phone})
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400" /> {foundOrder.address}, {foundOrder.district}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> Estimated Delivery
                  </span>
                  <span className="text-sm font-serif font-bold text-amber-300">
                    {foundOrder.estimatedDelivery}
                  </span>
                  <button
                    onClick={() => onViewOrderSlip(foundOrder)}
                    className="mt-2 text-[11px] text-amber-400 hover:underline block"
                  >
                    View Master Tailor Order Slip →
                  </button>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Stitching & Delivery Milestone Timeline
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {STATUS_STEPS.map((stepItem, idx) => {
                    const currentIdx = getStepIndex(foundOrder.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    const IconComponent = stepItem.icon;

                    return (
                      <div key={stepItem.status} className="relative flex items-start gap-4">
                        {/* Circle Bullet */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                            isCurrent
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
                              : isCompleted
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        <div
                          className={`flex-1 p-3.5 rounded-xl border transition ${
                            isCurrent
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                              : isCompleted
                              ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                              : 'bg-slate-950/30 border-slate-900 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-2">
                              <IconComponent className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : ''}`} />
                              {stepItem.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                                Active Phase
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            {stepItem.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tailor Notes */}
              {foundOrder.masterTailorNotes && (
                <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200">
                  <strong className="block font-semibold mb-0.5">Master Tailor Log:</strong>
                  {foundOrder.masterTailorNotes}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
