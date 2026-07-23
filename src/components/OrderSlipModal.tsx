import React from 'react';
import { X, Printer, Scissors, Download, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Order } from '../types';

interface OrderSlipModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSlipModal: React.FC<OrderSlipModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    let txt = `=================================================\n`;
    txt += `          ZOPONO TAILOR - MASTER SLIP           \n`;
    txt += `=================================================\n`;
    txt += `ORDER REF: ${order.id}\n`;
    txt += `DATE: ${order.date}\n`;
    txt += `CUSTOMER: ${order.customerName}\n`;
    txt += `PHONE: ${order.phone}\n`;
    txt += `ADDRESS: ${order.address}, ${order.district}\n`;
    txt += `DELIVERY DUE: ${order.estimatedDelivery}\n`;
    txt += `-------------------------------------------------\n`;
    txt += `SPECIFICATIONS:\n`;

    order.items.forEach((item, idx) => {
      txt += `\n[${idx + 1}] ${item.product.title}\n`;
      txt += `Category: ${item.product.subCategory} | Fabric: ${item.product.fabricType}\n`;

      if (item.isCustomTailored && item.customMeasurements) {
        txt += `MEASUREMENTS (Inches):\n`;
        txt += `  - Length (ঝুল): ${item.customMeasurements.length}"\n`;
        txt += `  - Chest (ছাতি): ${item.customMeasurements.chest}"\n`;
        txt += `  - Waist (কোমর): ${item.customMeasurements.waist}"\n`;
        txt += `  - Shoulder (কাঁধ): ${item.customMeasurements.shoulder}"\n`;
        txt += `  - Sleeve (হাতা): ${item.customMeasurements.sleeve}"\n`;
        txt += `  - Neck (গলা): ${item.customMeasurements.neck}"\n`;
        if (item.customMeasurements.hip) txt += `  - Hip: ${item.customMeasurements.hip}"\n`;
        if (item.customMeasurements.armhole) txt += `  - Armhole: ${item.customMeasurements.armhole}"\n`;

        if (item.customDesign) {
          txt += `DESIGN CUSTOMIZATION:\n`;
          txt += `  - Collar: ${item.customDesign.collarStyle}\n`;
          txt += `  - Pocket: ${item.customDesign.pocketOption}\n`;
          txt += `  - Fit: ${item.customDesign.fitPreference}\n`;
          txt += `  - Sleeve: ${item.customDesign.sleeveStyle}\n`;
          txt += `  - Button: ${item.customDesign.buttonType || 'Default'}\n`;
          if (item.customDesign.specialInstructions) {
            txt += `  - Notes: ${item.customDesign.specialInstructions}\n`;
          }
        }
      } else {
        txt += `Standard Size: ${item.selectedSize}\n`;
      }
    });

    txt += `\n-------------------------------------------------\n`;
    txt += `TOTAL BILL: BDT ${order.totalAmount}\n`;
    txt += `=================================================\n`;

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zopono_Master_Tailor_Slip_${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="glass-panel border-amber-500/30 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Actions */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-lg font-medium text-amber-200">
              Master Tailor Order Slip
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              <Printer className="w-4 h-4" /> Print Order Slip
            </button>
            <button
              onClick={handleDownloadText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700 transition"
            >
              <Download className="w-4 h-4" /> Download Slip
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-6 overflow-y-auto print-container space-y-6 bg-white text-slate-900 print:bg-white print:text-black print:p-0">
          {/* Slip Header */}
          <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-black text-amber-700 tracking-tight">
                  ZOPONO TAILOR
                </span>
                <span className="bg-slate-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  BOUTIQUE BESPOKE
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-sans">
                Premium Custom Tailoring & Master Stitched Fashion • Dhaka, Bangladesh
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">
                Tailor Job Reference
              </span>
              <span className="font-mono text-xl font-black text-slate-900">
                {order.id}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                Issued: {order.date}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Specs Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Customer Profile
              </span>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-700 font-mono mt-0.5">Phone: {order.phone}</p>
              <p className="text-slate-600 mt-0.5">{order.address}, {order.district}</p>
            </div>

            <div className="border-l border-slate-300 pl-4">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                Stitching & Queue Info
              </span>
              <p className="text-slate-800 font-medium">
                Delivery Deadline: <strong className="text-amber-700 font-serif">{order.estimatedDelivery}</strong>
              </p>
              <p className="text-slate-700 mt-0.5">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
              {order.senderPhone && (
                <p className="text-slate-700 font-mono text-[11px] mt-0.5">Sender Phone: {order.senderPhone}</p>
              )}
              {order.transactionId && (
                <p className="text-slate-700 font-mono text-[11px] mt-0.5">TrxID: {order.transactionId}</p>
              )}
              {order.codPhone && (
                <p className="text-slate-700 font-mono text-[11px] mt-0.5">COD Verification Phone: {order.codPhone}</p>
              )}
              <p className="text-slate-600 font-mono mt-0.5">Current Status: {order.status}</p>
            </div>
          </div>

          {/* Itemized Garment Specs */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 border-b border-amber-200 pb-1 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-amber-600" />
              Master Tailor Measurement Sheet
            </h3>

            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="border border-slate-300 rounded-xl p-4 bg-white shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">
                      {item.product.title}
                    </h4>
                    <span className="text-xs font-medium text-slate-600">
                      Fabric: {item.product.fabricType} | Garment Category: {item.product.subCategory}
                    </span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 font-mono font-bold text-xs px-2.5 py-1 rounded">
                    Qty: {item.quantity}
                  </span>
                </div>

                {/* Measurements Table */}
                {item.isCustomTailored && item.customMeasurements ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      Body Measurements (All values in inches "):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { label: 'Length (ঝুল)', val: item.customMeasurements.length },
                        { label: 'Chest (ছাতি)', val: item.customMeasurements.chest },
                        { label: 'Waist (কোমর)', val: item.customMeasurements.waist },
                        { label: 'Shoulder (কাঁধ)', val: item.customMeasurements.shoulder },
                        { label: 'Sleeve (হাতা)', val: item.customMeasurements.sleeve },
                        { label: 'Neck (গলা)', val: item.customMeasurements.neck },
                        { label: 'Hip (হিপ)', val: item.customMeasurements.hip },
                        { label: 'Armhole (আরমহোল)', val: item.customMeasurements.armhole },
                      ].map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="bg-slate-100 p-2 rounded border border-slate-200"
                        >
                          <span className="text-[10px] text-slate-500 block">{m.label}</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {m.val || '-'} "
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Design Specs */}
                    {item.customDesign && (
                      <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-amber-900 block text-[11px]">
                          Styling & Finishing Preferences:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-medium text-slate-800">
                          <div>• Collar: {item.customDesign.collarStyle}</div>
                          <div>• Pocket: {item.customDesign.pocketOption}</div>
                          <div>• Fit: {item.customDesign.fitPreference}</div>
                          <div>• Sleeve: {item.customDesign.sleeveStyle}</div>
                          <div>• Button: {item.customDesign.buttonType || 'Standard'}</div>
                        </div>
                        {item.customDesign.specialInstructions && (
                          <div className="pt-1 text-slate-700 text-[11px] font-sans">
                            <strong>Note:</strong> {item.customDesign.specialInstructions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded">
                    Standard Ready-to-Wear Size: <strong>{item.selectedSize}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Verification Footer & Signatures */}
          <div className="pt-6 border-t-2 border-slate-300 flex justify-between items-end text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800">Quality Check Checklist:</p>
              <p>[ ] Fabric Inspection [ ] Pattern Cutting [ ] Double Stitching [ ] Iron & Steam</p>
            </div>
            <div className="text-right">
              <div className="w-36 border-b border-slate-800 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Master Tailor Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
