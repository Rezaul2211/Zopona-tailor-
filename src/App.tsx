import React, { useState, useEffect } from 'react';
import {
  MainCategory,
  SubCategory,
  Product,
  CartItem,
  Order,
  Measurements,
  DesignCustomization,
} from './types';
import {
  getStoredCart,
  saveCart,
} from './utils/localStorage';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomTailorModal } from './components/CustomTailorModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSlipModal } from './components/OrderSlipModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Footer } from './components/Footer';
import { Scissors, Sparkles } from 'lucide-react';
import {
  subscribeToAuth,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToAdmins,
  checkIsAdmin,
  logoutUser,
  SUPER_ADMIN_EMAIL,
} from './firebase';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User Auth & Admin State
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    displayName?: string;
    photoURL?: string;
  } | null>(null);
  const [adminList, setAdminList] = useState<string[]>([SUPER_ADMIN_EMAIL]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Navigation & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | 'All' | 'Custom'>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | 'All'>('All');

  // Modals & Sliders
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [customModalProduct, setCustomModalProduct] = useState<Product | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [orderSlipModalOrder, setOrderSlipModalOrder] = useState<Order | null>(null);

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = checkIsAdmin(currentUser?.email, adminList);

  useEffect(() => {
    // 1. Local Storage Cart
    const loadedCart = getStoredCart();
    setCart(loadedCart);

    // 2. Real-time Firebase Auth
    const unsubAuth = subscribeToAuth((user) => {
      if (user) {
        setCurrentUser({
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL || undefined,
        });
      } else if (!currentUser) {
        // If not logged in via Firebase Auth, default to null unless logged in via manual modal
      }
    });

    // 3. Real-time Products Sync from Firestore
    const unsubProducts = subscribeToProducts((prods) => {
      setProducts(prods);
      setIsLoading(false);
    });

    // Safeguard timeout to hide loading overlay if network takes more than 1.2s
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    // 4. Real-time Orders Sync from Firestore
    const unsubOrders = subscribeToOrders((ords) => {
      setOrders(ords);
    });

    // 5. Real-time Admin List Sync from Firestore
    const unsubAdmins = subscribeToAdmins((admins) => {
      setAdminList(admins);
    });

    return () => {
      clearTimeout(timer);
      unsubAuth();
      unsubProducts();
      unsubOrders();
      unsubAdmins();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLoginSuccess = (email: string, displayName?: string, photoURL?: string) => {
    const userObj = {
      email,
      displayName: displayName || email.split('@')[0],
      photoURL,
    };
    setCurrentUser(userObj);
    
    const isUserAdmin = checkIsAdmin(email, adminList);
    if (isUserAdmin) {
      triggerToast(`Welcome Admin ${userObj.displayName}! Admin Panel is now unlocked.`);
    } else {
      triggerToast(`Signed in as ${userObj.displayName}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setIsAdminOpen(false);
    triggerToast('Logged out successfully');
  };

  const handleSelectCategory = (cat: MainCategory | 'All' | 'Custom') => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All');
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // CART OPERATIONS
  const handleUpdateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    saveCart(newCart);
  };

  const handleQuickAddToCart = (product: Product) => {
    const cartId = `cart-${product.id}-std-L-${Date.now()}`;
    const newItem: CartItem = {
      cartId,
      product,
      quantity: 1,
      selectedSize: 'L',
      isCustomTailored: false,
      totalUnitPrice: product.basePrice,
    };
    const updated = [...cart, newItem];
    handleUpdateCart(updated);
    triggerToast(`Added standard ${product.title} (L) to cart!`);
  };

  const handleAddToCartStandard = (product: Product, size: string) => {
    const cartId = `cart-${product.id}-std-${size}-${Date.now()}`;
    const newItem: CartItem = {
      cartId,
      product,
      quantity: 1,
      selectedSize: size,
      isCustomTailored: false,
      totalUnitPrice: product.basePrice,
    };
    const updated = [...cart, newItem];
    handleUpdateCart(updated);
    triggerToast(`Added ${product.title} (${size}) to cart!`);
  };

  const handleAddToCartCustom = (
    product: Product,
    measurements: Measurements,
    design: DesignCustomization,
    profileName: string
  ) => {
    const cartId = `cart-${product.id}-custom-${Date.now()}`;
    const newItem: CartItem = {
      cartId,
      product,
      quantity: 1,
      selectedSize: 'Custom Tailored',
      isCustomTailored: true,
      customMeasurements: measurements,
      customDesign: design,
      customProfileName: profileName,
      totalUnitPrice: product.basePrice + product.stitchingCharge,
    };
    const updated = [...cart, newItem];
    handleUpdateCart(updated);
    setIsCustomModalOpen(false);
    triggerToast(`Bespoke specs saved & added to cart!`);
  };

  const handleUpdateQuantity = (cartId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(cartId);
      return;
    }
    const updated = cart.map((item) =>
      item.cartId === cartId ? { ...item, quantity: qty } : item
    );
    handleUpdateCart(updated);
  };

  const handleRemoveItem = (cartId: string) => {
    const updated = cart.filter((item) => item.cartId !== cartId);
    handleUpdateCart(updated);
  };

  const handleClearCart = () => {
    handleUpdateCart([]);
  };

  // OPEN CUSTOM TAILOR MODAL
  const handleOpenCustomModalForProduct = (product: Product | null) => {
    setCustomModalProduct(product);
    setIsCustomModalOpen(true);
  };

  const handleOpenAdminClick = () => {
    if (!isAdmin) {
      triggerToast('অ্যাডমিন প্যানেল এক্সেস করতে অনুমোদিত জিমেইল দিয়ে লগইন করুন');
      setIsLoginModalOpen(true);
      return;
    }
    setIsAdminOpen(true);
  };

  // FILTERED PRODUCTS
  const filteredProducts = products.filter((prod) => {
    if (selectedCategory !== 'All' && selectedCategory !== 'Custom') {
      if (prod.category !== selectedCategory) return false;
    }
    if (selectedSubCategory !== 'All') {
      if (prod.subCategory !== selectedSubCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = prod.title.toLowerCase().includes(q);
      const matchSub = prod.subCategory.toLowerCase().includes(q);
      const matchFabric = prod.fabricType.toLowerCase().includes(q);
      const matchCat = prod.category.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchFabric && !matchCat) return false;
    }
    return true;
  });

  const availableSubCategories: SubCategory[] =
    selectedCategory === 'Men'
      ? ['Panjabi', 'Pajama', 'Suits', 'Formal Shirts', 'Waistcoats', 'Kurta']
      : selectedCategory === 'Women'
      ? ['Borka', 'Abaya', 'Salwar Kameez', 'Designer Gowns', 'Kurtis', 'Unstitched Fabrics']
      : [
          'Panjabi',
          'Pajama',
          'Suits',
          'Formal Shirts',
          'Waistcoats',
          'Kurta',
          'Borka',
          'Abaya',
          'Salwar Kameez',
          'Designer Gowns',
          'Kurtis',
          'Unstitched Fabrics',
        ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Global Luxury Loading Spinner Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-blue-400">
          <Sparkles className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Luxury Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCustomModal={() => handleOpenCustomModalForProduct(null)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={handleOpenAdminClick}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Hero Banner */}
      <Banner
        onOpenCustomModal={() => handleOpenCustomModalForProduct(null)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Content Catalog Area */}
      <main id="catalog-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Category & SubCategory Filter Toolbar */}
        <div className="space-y-4 glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                {selectedCategory === 'All'
                  ? 'Bespoke Fashion Catalog'
                  : `${selectedCategory}'s Stitched Collection`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Showing {filteredProducts.length} custom-tailored garments & fabrics
              </p>
            </div>

            {/* Custom Tailor Studio CTA Bar */}
            <button
              onClick={() => handleOpenCustomModalForProduct(null)}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0"
            >
              <Scissors className="w-4 h-4 text-blue-600" />
              <span>Launch Custom Measurement Wizard</span>
            </button>
          </div>

          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedSubCategory('All')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 ${
                selectedSubCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Types
            </button>
            {availableSubCategories.map((subCat) => (
              <button
                key={subCat}
                onClick={() => setSelectedSubCategory(subCat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition shrink-0 ${
                  selectedSubCategory === subCat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {subCat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Scissors className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-900">
              No products found matching your search
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting category filters or search terms. You can also design any garment type directly in our Custom Tailor Studio.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedSubCategory('All');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
            >
              Reset Search Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 lg:gap-6">
            {filteredProducts.map((prod, idx) => (
              <ProductCard
                key={prod.id}
                product={prod}
                index={idx}
                onSelectProduct={(p) => setSelectedProductDetail(p)}
                onCustomTailor={(p) => handleOpenCustomModalForProduct(p)}
                onQuickAddToCart={(p) => handleQuickAddToCart(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating WhatsApp Widget */}
      <WhatsAppButton />

      {/* Footer */}
      <Footer
        onOpenCustomModal={() => handleOpenCustomModalForProduct(null)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory('All');
        }}
      />

      {/* MODALS & DRAWERS */}
      {/* 1. Account / Google Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 2. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onCustomTailor={(p) => handleOpenCustomModalForProduct(p)}
        onAddToCartStandard={handleAddToCartStandard}
      />

      {/* 3. Interactive Custom Measurement & Design Studio Modal */}
      <CustomTailorModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        product={customModalProduct}
        onAddToCart={handleAddToCartCustom}
      />

      {/* 4. Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 5. Localized Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onClearCart={handleClearCart}
        onViewOrderSlip={(order) => {
          setIsCheckoutOpen(false);
          setOrderSlipModalOrder(order);
        }}
      />

      {/* 6. Master Tailor Printable Order Slip Modal */}
      <OrderSlipModal
        order={orderSlipModalOrder}
        onClose={() => setOrderSlipModalOrder(null)}
      />

      {/* 7. Live Order Progress Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onViewOrderSlip={(order) => {
          setIsTrackerOpen(false);
          setOrderSlipModalOrder(order);
        }}
      />

      {/* 8. Dynamic Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        adminList={adminList}
        currentUserEmail={currentUser?.email || null}
        onUpdateProducts={(prods) => setProducts(prods)}
        onUpdateOrders={(ords) => setOrders(ords)}
        onViewOrderSlip={(order) => setOrderSlipModalOrder(order)}
      />
    </div>
  );
}
