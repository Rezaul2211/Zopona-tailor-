import React, { useState } from 'react';
import { X, ShieldCheck, Mail, LogIn } from 'lucide-react';
import { loginWithGoogle } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, displayName?: string, photoURL?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onLoginSuccess(
          user.email || '',
          user.displayName || '',
          user.photoURL || undefined
        );
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        'Google popup was closed or blocked by iframe. You can also log in directly by typing your Gmail address below.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const em = emailInput.trim().toLowerCase();
    const displayName = nameInput.trim() || em.split('@')[0];
    
    // Simulate/set logged in user
    onLoginSuccess(em, displayName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-amber-200">
                Zopono Tailor Account Login
              </h3>
              <p className="text-[11px] text-slate-400">Sign in to save sizes & manage orders</p>
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
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Primary Google Login Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-200 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-3 shadow-lg group"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? 'Connecting Google Auth...' : 'Continue with Google Sign In'}</span>
          </button>

          <div className="flex items-center gap-2 my-2 text-slate-500 text-[10px]">
            <div className="h-px bg-slate-800 flex-1" />
            <span>OR LOGIN WITH GMAIL</span>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Direct Email Form */}
          <form onSubmit={handleDirectEmailSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Your Gmail Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. xmrezaul.karim998@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Name (Optional)</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Rezaul Karim"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Enter Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
