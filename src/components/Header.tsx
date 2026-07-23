import React from 'react';
import {
  Scissors,
  Search,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Menu,
  X,
  UserCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MainCategory } from '../types';
import { ZOPONO_LOGO } from '../assets/logo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: MainCategory | 'All' | 'Custom';
  onSelectCategory: (cat: MainCategory | 'All' | 'Custom') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenCustomModal: () => void;
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
  currentUser: User | { email: string; displayName?: string; photoURL?: string } | null;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenCustomModal,
  onOpenTracker,
  onOpenAdmin,
  currentUser,
  isAdmin,
  onOpenLoginModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm text-slate-900">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 py-1.5 px-4 text-center text-[11px] text-slate-200 font-medium tracking-wide flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>100% Bespoke Fit Guarantee • Cloud Sync Account & Size Profiles</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-300 ml-auto">
          <button onClick={onOpenTracker} className="hover:text-blue-300 flex items-center gap-1 transition">
            <Truck className="w-3.5 h-3.5" /> Order Tracker
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo with Image */}
        <div
          onClick={() => onSelectCategory('All')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-blue-500/30 shadow-md group-hover:scale-105 transition-transform bg-slate-900">
            <img
              src={ZOPONO_LOGO}
              alt="Zopono Tailor Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              ZOPONO TAILOR
            </div>
            <div className="text-[9px] uppercase tracking-widest text-blue-600 font-sans font-semibold -mt-1">
              Bespoke Custom Fitting
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Panjabi, Abaya, Suits, Borka, Fabrics..."
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
          {[
            { id: 'All', label: 'All Catalog' },
            { id: 'Men', label: "Men's Collection" },
            { id: 'Women', label: "Women's Collection" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-full transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Custom Tailor Modal Trigger */}
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-1.5 rounded-full transition shadow-sm ml-1 font-bold"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-600" />
            <span>Custom Tailor Studio</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* GOOGLE ACCOUNT AUTH BUTTON */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition text-xs"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-blue-500 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-slate-800 max-w-[120px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-xs animate-fade-in">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 truncate">{currentUser.displayName || 'Customer'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    {isAdmin && (
                      <span className="mt-1 inline-block bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        Admin Access Active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenCustomModal();
                    }}
                    className="w-full text-left p-2 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-2"
                  >
                    <Scissors className="w-3.5 h-3.5 text-blue-600" /> My Saved Size Specs
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenTracker();
                    }}
                    className="w-full text-left p-2 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center gap-2"
                  >
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> My Orders History
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left p-2 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border-t border-slate-100 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md transition transform active:scale-95"
            >
              {/* Google SVG Icon */}
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline">Sign In / Google</span>
            </button>
          )}

          {/* Admin Toggle button ONLY IF USER IS AUTHORIZED ADMIN */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-xs text-white font-extrabold bg-blue-700 hover:bg-blue-800 px-3.5 py-2 rounded-xl transition shadow-md"
              title="Open Admin Dashboard"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span className="hidden md:inline">Admin Panel</span>
            </button>
          )}

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition transform active:scale-95"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 font-bold" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white border border-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3 animate-fade-in">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search garments..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onSelectCategory('All');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-left"
            >
              All Products
            </button>
            <button
              onClick={() => {
                onSelectCategory('Men');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-left"
            >
              Men's Collection
            </button>
            <button
              onClick={() => {
                onSelectCategory('Women');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-left"
            >
              Women's Collection
            </button>
            <button
              onClick={() => {
                onOpenCustomModal();
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30 text-left flex items-center gap-1"
            >
              <Scissors className="w-4 h-4" /> Custom Order
            </button>
          </div>

          <button
            onClick={() => {
              onOpenTracker();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 bg-slate-900 text-amber-300 rounded-xl border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" /> Live Order Tracker
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full p-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> অ্যাডমিন প্যানেল
            </button>
          )}
        </div>
      )}
    </header>
  );
};
