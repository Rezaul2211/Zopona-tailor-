import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [queryText, setQueryText] = useState('');

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultPhone = '8801700000000'; // Default Zopono Tailor Customer Service WhatsApp
    const msg = encodeURIComponent(
      queryText || 'Hello Zopono Tailor! I have an inquiry about custom fitting and fabrics.'
    );
    window.open(`https://wa.me/${defaultPhone}?text=${msg}`, '_blank');
    setIsOpen(false);
    setQueryText('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl w-72 text-slate-900 space-y-3 animate-fade-in mb-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                WA
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Master Tailor Support</h4>
                <p className="text-[10px] text-blue-600 font-bold">● Online Instant Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSendWhatsApp} className="space-y-2">
            <textarea
              rows={2}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Ask about measurement help, fabric availability, or order status..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Start Chat on WhatsApp
            </button>
          </form>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-full shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
        title="Direct WhatsApp Order & Measurement Help"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
        <span className="hidden md:inline font-bold text-xs pr-1">WhatsApp Tailor</span>
      </button>
    </div>
  );
};
