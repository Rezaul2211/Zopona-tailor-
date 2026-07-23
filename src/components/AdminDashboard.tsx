import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit,
  Upload,
  RotateCcw,
  Scissors,
  Printer,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  Search,
  PackageCheck,
  LayoutDashboard,
  UserCheck,
  Ban,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  Product,
  Order,
  MainCategory,
  SubCategory,
  OrderStatus,
} from '../types';
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  updateOrderStatusInFirestore,
  seedDefaultProducts,
  addAdminEmailToFirestore,
  removeAdminEmailFromFirestore,
  SUPER_ADMIN_EMAIL,
} from '../firebase';
import { saveProducts, resetProductsToDefault, saveOrders } from '../utils/localStorage';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  adminList: string[];
  currentUserEmail: string | null;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onViewOrderSlip: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  adminList,
  currentUserEmail,
  onUpdateProducts,
  onUpdateOrders,
  onViewOrderSlip,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'admins'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState<boolean>(false);

  // Filter Orders
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');

  // Status Sync Toast
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Admin Email Form
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [adminActionMsg, setAdminActionMsg] = useState<string | null>(null);

  // Product Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<MainCategory>('Men');
  const [subCategory, setSubCategory] = useState<SubCategory>('Panjabi');
  const [basePrice, setBasePrice] = useState<number>(3000);
  const [stitchingCharge, setStitchingCharge] = useState<number>(700);
  const [fabricType, setFabricType] = useState<string>('Cotton Silk');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');

  if (!isOpen) return null;

  // Handle Image Upload File -> Base64 Data URL (stored online in Firestore)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAddProduct = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('Men');
    setSubCategory('Panjabi');
    setBasePrice(3200);
    setStitchingCharge(800);
    setFabricType('Royal Cotton');
    setDescription('Exclusive bespoke hand-tailored garment.');
    setImageUrl('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800');
    setIsAddingNewProduct(true);
  };

  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setTitle(prod.title);
    setCategory(prod.category);
    setSubCategory(prod.subCategory);
    setBasePrice(prod.basePrice);
    setStitchingCharge(prod.stitchingCharge);
    setFabricType(prod.fabricType);
    setDescription(prod.description);
    setImageUrl(prod.imageUrl);
    setIsAddingNewProduct(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Please fill product title and image.');
      return;
    }

    const prodId = editingProduct ? editingProduct.id : `zp-prod-${Date.now()}`;
    const targetProd: Product = {
      id: prodId,
      title,
      category,
      subCategory,
      basePrice,
      stitchingCharge,
      fabricType,
      description,
      imageUrl,
      isCustomizable: true,
      stockStatus: 'In Stock',
      isFeatured: true,
    };

    try {
      await saveProductToFirestore(targetProd);
    } catch (err) {
      console.error('Failed to save to Firestore:', err);
    }

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? targetProd : p));
    } else {
      updatedList = [targetProd, ...products];
    }

    saveProducts(updatedList);
    onUpdateProducts(updatedList);
    setIsAddingNewProduct(false);
    setSyncNotice(`Product '${title}' published to Cloud Catalog successfully.`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product from catalog?')) {
      try {
        await deleteProductFromFirestore(id);
      } catch (err) {
        console.error('Failed to delete from Firestore:', err);
      }
      const updated = products.filter((p) => p.id !== id);
      saveProducts(updated);
      onUpdateProducts(updated);
      setSyncNotice('Product removed from catalog.');
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  const handleResetCatalog = async () => {
    if (confirm('Reset entire catalog to default Zopono Tailor collection in Firestore?')) {
      try {
        await seedDefaultProducts();
      } catch (err) {
        console.error('Failed seeding default products:', err);
      }
      const restored = resetProductsToDefault();
      onUpdateProducts(restored);
      setIsAddingNewProduct(false);
      setSyncNotice('Catalog reset to default bespoke collection.');
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  // Order Status Change Handler
  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => {
    try {
      await updateOrderStatusInFirestore(orderId, newStatus, notes);
    } catch (err) {
      console.error('Failed updating order status in Firestore:', err);
    }
    const updated = orders.map((o) =>
      o.id === orderId
        ? { ...o, status: newStatus, masterTailorNotes: notes !== undefined ? notes : o.masterTailorNotes }
        : o
    );
    saveOrders(updated);
    onUpdateOrders(updated);

    // Provide instant clear feedback on Cloud + Customer tracking broadcast
    setSyncNotice(
      `Order ${orderId} status set to '${newStatus}'. Saved to Cloud Firestore and live on Customer Order Tracker!`
    );
    setTimeout(() => setSyncNotice(null), 5000);
  };

  // Admin Permission Handlers
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    try {
      await addAdminEmailToFirestore(newAdminEmail.trim());
      setAdminActionMsg(`Granted admin permissions to '${newAdminEmail.trim()}'`);
      setNewAdminEmail('');
      setTimeout(() => setAdminActionMsg(null), 4000);
    } catch (err) {
      alert('Error adding admin: ' + err);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (confirm(`Remove admin access for ${email}?`)) {
      try {
        await removeAdminEmailFromFirestore(email);
        setAdminActionMsg(`Revoked admin permissions for '${email}'.`);
        setTimeout(() => setAdminActionMsg(null), 4000);
      } catch (err: any) {
        alert(err.message || 'Error removing admin.');
      }
    }
  };

  // Filtered Orders List
  const filteredOrders = orders.filter((ord) => {
    if (orderStatusFilter !== 'All' && ord.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchId = ord.id.toLowerCase().includes(q);
      const matchName = ord.customerName.toLowerCase().includes(q);
      const matchPhone = ord.phone.toLowerCase().includes(q);
      const matchDistrict = ord.district.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchDistrict) return false;
    }
    return true;
  });

  // Calculate Order Statistics
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter(
    (o) => o.status === 'Order Placed' || o.status === 'Order Confirmed' || o.status === 'Stitching'
  ).length;
  const cancelledCount = orders.filter((o) => o.status === 'Cancelled').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="glass-panel border-slate-200 rounded-2xl w-full max-w-6xl shadow-2xl text-slate-900 overflow-hidden flex flex-col md:flex-row h-[92vh] max-h-[850px] bg-white">
        {/* ================= SIDEBAR NAVIGATION (RESPONSIVE SPLIT VIEW) ================= */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-100 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0">
          {/* Brand Header */}
          <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-white">
                  <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-sm sm:text-base font-bold text-white truncate leading-tight">
                  Master Admin
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-mono">Cloud Synced</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 border border-slate-700 transition"
              title="Close Admin Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu Links - Horizontal scroll on mobile, vertical stack on desktop */}
          <nav className="p-2 sm:p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 md:flex-1">
            <button
              onClick={() => {
                setActiveTab('orders');
                setIsAddingNewProduct(false);
              }}
              className={`px-3 py-2 md:p-3 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-between gap-2.5 whitespace-nowrap shrink-0 group ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-md font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 shrink-0" />
                <span>Orders</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'orders'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-blue-500/20'
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                setIsAddingNewProduct(false);
              }}
              className={`px-3 py-2 md:p-3 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-between gap-2.5 whitespace-nowrap shrink-0 group ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-md font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 shrink-0" />
                <span>Garments</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'products'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-blue-500/20'
                }`}
              >
                {products.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admins');
                setIsAddingNewProduct(false);
              }}
              className={`px-3 py-2 md:p-3 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-between gap-2.5 whitespace-nowrap shrink-0 group ${
                activeTab === 'admins'
                  ? 'bg-blue-600 text-white shadow-md font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Admins</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'admins'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-800 text-slate-300 group-hover:bg-blue-500/20'
                }`}
              >
                {adminList.length}
              </span>
            </button>
          </nav>

          {/* Desktop Footer Close Action */}
          <div className="hidden md:block p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Close Panel
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT PANEL (SPLIT VIEW RIGHT) ================= */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-50 text-slate-900">
          {/* Top Panel Header */}
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                {activeTab === 'orders' && 'Order Oversight & Delivery Tracker'}
                {activeTab === 'products' && 'Product Management & Bespoke Pricing'}
                {activeTab === 'admins' && 'Admin Permissions & Security Access'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'orders' && 'Monitor customer orders, status updates, and dispatch slips.'}
                {activeTab === 'products' && 'Manage bespoke clothing catalog, base rates, and tailor stitching fees.'}
                {activeTab === 'admins' && 'Control authorized Gmail addresses for master admin panel access.'}
              </p>
            </div>

            {activeTab === 'products' && !isAddingNewProduct && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleStartAddProduct}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  <Plus className="w-4 h-4" /> Add Garment
                </button>
                <button
                  onClick={handleResetCatalog}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition"
                  title="Reset Catalog to Default Collection"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sync Feedback Toast Banner */}
          {syncNotice && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-900 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">{syncNotice}</span>
              </div>
              <button
                onClick={() => setSyncNotice(null)}
                className="text-blue-700 hover:text-blue-900 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Main Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
            {/* ================= TAB 1: ORDER OVERSIGHT ================= */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Stats Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Total Orders
                    </p>
                    <p className="text-xl font-bold font-mono text-slate-900 mt-1">{orders.length}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                      Active Processing
                    </p>
                    <p className="text-xl font-bold font-mono text-amber-300 mt-1">{pendingCount}</p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      Total Sales Revenue
                    </p>
                    <p className="text-xl font-bold font-mono text-emerald-300 mt-1">
                      ৳{totalRevenue.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 shadow-md">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                      Cancelled Orders
                    </p>
                    <p className="text-xl font-bold font-mono text-rose-400 mt-1">{cancelledCount}</p>
                  </div>
                </div>

                {/* Filter & Search Controls */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
                  <div className="relative w-full md:w-72">
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search Order ID, Customer Name, Phone..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                    <span className="text-slate-500 font-bold shrink-0 text-[11px] uppercase mr-1 font-mono">
                      Status:
                    </span>
                    {['All', 'Order Placed', 'Order Confirmed', 'Stitching', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          orderStatusFilter === st
                            ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Elevated Card-Based Order List */}
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="p-10 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
                      <PackageCheck className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-slate-500 text-xs font-medium">No orders match the selected search or filter status.</p>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 space-y-4 group"
                      >
                        {/* Header Row */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                                {ord.id}
                              </span>
                              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                                {ord.date ? new Date(ord.date).toLocaleDateString() : 'Recent'}
                              </span>
                              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                                {ord.paymentMethod} ({ord.paymentStatus || 'COD'})
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                              <span>Customer: {ord.customerName}</span>
                              <span className="text-slate-300">•</span>
                              <a href={`tel:${ord.phone}`} className="text-blue-600 hover:underline flex items-center gap-1 font-bold">
                                <PhoneCall className="w-3 h-3" /> {ord.phone}
                              </a>
                            </h3>
                            <p className="text-xs text-slate-500">
                              Address: {ord.address}, {ord.district}
                            </p>
                          </div>

                          {/* Quick Action Bar & Dropdown */}
                          <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0 min-w-[300px]">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-blue-700 font-mono">
                              <span>Set Status:</span>
                              <span className="text-slate-800 font-bold">{ord.status}</span>
                            </div>

                            {/* Status Buttons Grid */}
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { status: 'Order Confirmed', label: '✅ Confirm' },
                                { status: 'Stitching', label: '🪡 Stitching' },
                                { status: 'Shipped', label: '🚚 Shipped' },
                                { status: 'Delivered', label: '🎉 Delivered' },
                                { status: 'Cancelled', label: '🚫 Cancel' },
                              ].map((btn) => {
                                const isActive = ord.status === btn.status;
                                const isCancel = btn.status === 'Cancelled';
                                return (
                                  <button
                                    key={btn.status}
                                    onClick={() => handleOrderStatusChange(ord.id, btn.status as OrderStatus)}
                                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all text-center ${
                                      isActive
                                        ? isCancel
                                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm font-extrabold'
                                          : 'bg-blue-600 text-white border-blue-600 shadow-sm font-extrabold'
                                        : isCancel
                                        ? 'bg-slate-950 border-rose-500/30 text-rose-300 hover:bg-rose-950/40'
                                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                                    }`}
                                  >
                                    {btn.label}
                                  </button>
                                );
                              })}

                              {/* Measurement Slip Trigger */}
                              <button
                                onClick={() => onViewOrderSlip(ord)}
                                className="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1 shadow-sm"
                                title="Print Master Tailor Measurement Slip"
                              >
                                <Printer className="w-3 h-3" /> Slip
                              </button>
                            </div>

                            {/* Clean English Dropdown (No Bengali text) */}
                            <div className="pt-1 border-t border-slate-800/80">
                              <select
                                value={ord.status}
                                onChange={(e) =>
                                  handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                                }
                                className="w-full bg-slate-950 border border-slate-700/80 text-amber-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                              >
                                <option value="Order Placed">Order Placed</option>
                                <option value="Order Confirmed">Order Confirmed</option>
                                <option value="Fabric Cut">Fabric Cut</option>
                                <option value="Stitching">Stitching</option>
                                <option value="Quality Check">Quality Check</option>
                                <option value="Ready for Delivery">Ready for Delivery</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Order Items & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-mono">
                              Garments & Tailoring Breakdown
                            </p>
                            <div className="space-y-2">
                              {ord.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start justify-between border-b border-slate-800/60 pb-1.5 last:border-none"
                                >
                                  <div>
                                    <p className="font-semibold text-slate-200">
                                      {it.product.title} (x{it.quantity})
                                    </p>
                                    <p className="text-[11px] text-amber-300">
                                      {it.isCustomTailored
                                        ? `Bespoke Custom Fitting (${it.customProfileName || 'Custom'})`
                                        : `Standard Size: ${it.selectedSize}`}
                                    </p>
                                  </div>
                                  <span className="font-mono font-bold text-slate-200">
                                    ৳{(it.totalUnitPrice * it.quantity).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1">
                              <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-mono">
                                Payment Details
                              </p>
                              {ord.senderPhone && (
                                <div className="flex justify-between font-mono text-[11px] bg-slate-950 p-1.5 rounded border border-amber-500/20 text-amber-300">
                                  <span>Payment Mobile Number:</span>
                                  <span>{ord.senderPhone}</span>
                                </div>
                              )}
                              {ord.transactionId && (
                                <div className="flex justify-between font-mono text-[11px] bg-slate-950 p-1.5 rounded border border-amber-500/20 text-amber-200">
                                  <span>Transaction ID (TrxID):</span>
                                  <span className="font-bold uppercase">{ord.transactionId}</span>
                                </div>
                              )}
                              {ord.codPhone && (
                                <div className="flex justify-between font-mono text-[11px] bg-slate-950 p-1.5 rounded border border-emerald-500/20 text-emerald-300">
                                  <span>COD Contact Phone:</span>
                                  <span>{ord.codPhone}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-300 pt-1">
                                <span>Subtotal:</span>
                                <span>৳{ord.subtotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Custom Stitching Charge:</span>
                                <span>৳{ord.stitchingTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Delivery Fee:</span>
                                <span>৳{ord.deliveryCharge.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-bold text-amber-300 pt-1 border-t border-slate-800">
                                <span>Total Amount:</span>
                                <span>৳{ord.totalAmount.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Internal Tailor Notes */}
                            <div className="pt-2 border-t border-slate-800/80">
                              <input
                                type="text"
                                defaultValue={ord.masterTailorNotes || ''}
                                onBlur={(e) =>
                                  handleOrderStatusChange(ord.id, ord.status, e.target.value)
                                }
                                placeholder="Master tailor note (e.g. Courier tracking #BD98231)..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 2: PRODUCT CATALOG MANAGEMENT ================= */}
            {activeTab === 'products' && (
              <div>
                {isAddingNewProduct ? (
                  <form
                    onSubmit={handleSaveProductForm}
                    className="bg-slate-950 p-5 sm:p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl"
                  >
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                      <h3 className="font-serif text-base font-bold text-amber-300">
                        {editingProduct ? 'Edit Catalog Garment' : 'Add New Custom Garment Product'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewProduct(false)}
                        className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Product Title *</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Royal Cotton Silk Panjabi"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Fabric Type</label>
                        <input
                          type="text"
                          value={fabricType}
                          onChange={(e) => setFabricType(e.target.value)}
                          placeholder="e.g. 100% Egyptian Cotton"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Main Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as MainCategory)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Subcategory</label>
                        <select
                          value={subCategory}
                          onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        >
                          <option value="Panjabi">Panjabi</option>
                          <option value="Pajama">Pajama</option>
                          <option value="Suits">Suits</option>
                          <option value="Formal Shirts">Formal Shirts</option>
                          <option value="Waistcoats">Waistcoats</option>
                          <option value="Kurta">Kurta</option>
                          <option value="Borka">Borka</option>
                          <option value="Abaya">Abaya</option>
                          <option value="Salwar Kameez">Salwar Kameez</option>
                          <option value="Designer Gowns">Designer Gowns</option>
                          <option value="Kurtis">Kurtis</option>
                          <option value="Unstitched Fabrics">Unstitched Fabrics</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">Base Price (৳ BDT)</label>
                        <input
                          type="number"
                          value={basePrice}
                          onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1 font-medium">
                          Master Stitching Charge (৳ BDT)
                        </label>
                        <input
                          type="number"
                          value={stitchingCharge}
                          onChange={(e) => setStitchingCharge(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Image Upload Selection */}
                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-amber-400">
                          Product Image Upload (Stored Online)
                        </label>
                        <div className="flex gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setImageInputMode('file')}
                            className={`px-2.5 py-0.5 rounded font-medium ${
                              imageInputMode === 'file'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageInputMode('url')}
                            className={`px-2.5 py-0.5 rounded font-medium ${
                              imageInputMode === 'url'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Paste Web Link
                          </button>
                        </div>
                      </div>

                      {imageInputMode === 'file' ? (
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs px-3 py-2 rounded-xl border border-slate-700 transition">
                            <Upload className="w-4 h-4" /> Choose Real Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {imageUrl ? 'Real product photo loaded' : 'Upload photo from device'}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      )}

                      {imageUrl && (
                        <div className="flex items-center gap-3 pt-2">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-16 h-20 object-cover rounded-xl border border-amber-500/30"
                          />
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Saved online to Cloud Firestore database
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1 font-medium">Description</label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs py-3 rounded-xl transition hover:brightness-110 shadow-lg shadow-amber-500/20"
                    >
                      {editingProduct ? 'Update Product in Cloud' : 'Publish Product Online'}
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 group"
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-16 h-20 object-cover rounded-xl bg-slate-900 shrink-0 group-hover:scale-105 transition-transform duration-300"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition">
                            {p.title}
                          </h4>
                          <p className="text-[10px] text-amber-400 font-medium">
                            {p.category} • {p.subCategory}
                          </p>
                          <p className="text-xs font-bold font-serif text-slate-200">
                            ৳{(p.basePrice + p.stitchingCharge).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditProduct(p)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl border border-slate-800 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 bg-slate-900 hover:bg-rose-900/50 text-rose-400 rounded-xl border border-slate-800 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 3: ADMIN PERMISSIONS ================= */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-amber-200">
                        Admin Access & Security Permissions
                      </h3>
                      <p className="text-xs text-slate-400">
                        Grant or revoke Master Admin access for Gmail accounts. Only authorized emails can open this panel.
                      </p>
                    </div>
                  </div>

                  {adminActionMsg && (
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{adminActionMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddAdminSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="Enter Gmail address (e.g. name@gmail.com)"
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Grant Admin
                    </button>
                  </form>
                </div>

                {/* Current Authorized Admins List */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider font-mono">
                    Authorized Master Admin Accounts ({adminList.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {adminList.map((email) => {
                      const isSuper = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                      return (
                        <div
                          key={email}
                          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
                            isSuper
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <ShieldCheck className={`w-4 h-4 shrink-0 ${isSuper ? 'text-amber-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-mono font-medium truncate">{email}</span>
                            {isSuper && (
                              <span className="bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                                Primary Super Admin
                              </span>
                            )}
                          </div>

                          {!isSuper && (
                            <button
                              onClick={() => handleRemoveAdmin(email)}
                              className="p-2 bg-slate-900 hover:bg-rose-900/50 text-rose-400 rounded-xl border border-slate-800 text-xs transition shrink-0"
                              title="Remove Admin Access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

