import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Eye,
  Layers,
  MapPin,
  Calendar,
  X
} from 'lucide-react';
import { apiFetch } from '../services/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'users', 'overview'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Product modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Dog Food',
    petType: 'dog',
    price: '',
    originalPrice: '',
    stock: 50,
    image: '',
    description: '',
    isFeatured: false,
    isPopular: false,
  });

  // Notification message
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, ordersRes, productsRes, usersRes] = await Promise.all([
        apiFetch('/admin/stats').catch(() => ({ success: false })),
        apiFetch('/admin/orders').catch(() => ({ success: false, orders: [] })),
        apiFetch('/products').catch(() => ({ success: false, products: [] })),
        apiFetch('/admin/users').catch(() => ({ success: false, users: [] })),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (productsRes.success) setProducts(productsRes.products || []);
      if (usersRes.success) setUsers(usersRes.users || []);
    } catch (err) {
      console.error('[Admin Fetch Error]', err);
      showToast('Failed to load some admin data.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update order status handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await apiFetch(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus, timeline: res.order.timeline } : ord))
        );
        showToast(res.message || `Order status updated to ${newStatus}!`);
        // Refresh stats
        apiFetch('/admin/stats').then((s) => s.success && setStats(s.stats));
      } else {
        showToast(res.message || 'Failed to update order status.', 'error');
      }
    } catch (err) {
      console.error('[Update Order Status Error]', err);
      showToast('Failed to connect to server.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Product modal handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Dog Food',
      petType: 'dog',
      price: '',
      originalPrice: '',
      stock: 50,
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
      description: '',
      isFeatured: false,
      isPopular: false,
    });
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      category: product.category || 'Dog Food',
      petType: product.petType || 'all',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock !== undefined ? product.stock : 50,
      image: product.image || '',
      description: product.description || '',
      isFeatured: Boolean(product.isFeatured),
      isPopular: Boolean(product.isPopular),
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (!productForm.name || !productForm.price) {
        showToast('Please provide product name and price.', 'error');
        return;
      }

      if (editingProduct) {
        // Edit existing product
        const res = await apiFetch(`/admin/products/${editingProduct._id || editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productForm),
        });
        if (res.success) {
          showToast('Product updated successfully!');
          setShowProductModal(false);
          fetchData();
        } else {
          showToast(res.message || 'Failed to update product.', 'error');
        }
      } else {
        // Create new product
        const res = await apiFetch('/admin/products', {
          method: 'POST',
          body: JSON.stringify(productForm),
        });
        if (res.success) {
          showToast('New product added to catalog!');
          setShowProductModal(false);
          fetchData();
        } else {
          showToast(res.message || 'Failed to create product.', 'error');
        }
      }
    } catch (err) {
      console.error('[Save Product Error]', err);
      showToast('Network error while saving product.', 'error');
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" from FurSphere?`)) return;

    try {
      const res = await apiFetch(`/admin/products/${productId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast(`"${productName}" has been removed.`);
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
      } else {
        showToast(res.message || 'Failed to delete product.', 'error');
      }
    } catch (err) {
      console.error('[Delete Product Error]', err);
      showToast('Error deleting product.', 'error');
    }
  };

  // Status Badge Styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      !orderSearchQuery ||
      o.orderNumber?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.deliveryAddress?.city?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.deliveryAddress?.street?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.items?.some((it) => it.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-16">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border animate-in slide-in-from-right duration-200 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.msg}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0d5c46] text-white flex items-center justify-center shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    FurSphere Admin Portal
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Manage orders, update dispatch statuses, edit catalog products, and monitor pet care sales.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#0d5c46]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                to="/shop"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View Shop</span>
              </Link>

              <Link
                to="/orders"
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0d5c46] text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Truck className="w-4 h-4" />
                <span className="hidden sm:inline">Customer Tracking</span>
              </Link>
            </div>

          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#0d5c46] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Manage Orders
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'orders' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'bg-[#0d5c46] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Product Catalog
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'products' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-[#0d5c46] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Pet Parents / Users
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'users' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                {users.length}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalOrders ?? orders.length}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Live from database</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0d5c46] flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '0'}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Active pet sales</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Products in Stock</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalProducts ?? products.length}</h3>
              <p className="text-[11px] text-sky-600 font-medium mt-1">Dog & Cat categories</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400">Registered Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers ?? users.length}</h3>
              <p className="text-[11px] text-purple-600 font-medium mt-1">Pet Parents</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* TAB 1: MANAGE ORDERS (CORE REQUIREMENT) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === st
                        ? 'bg-[#0d5c46] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search Order # or city..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

            </div>

            {/* Orders Table / Cards */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No orders found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {orderSearchQuery || orderStatusFilter !== 'All'
                    ? 'Try resetting your search query or status filter.'
                    : 'Customer orders will appear here in real-time as soon as pet parents checkout on the website.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  const isUpdating = updatingOrderId === order._id;

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
                    >
                      {/* Order Row Header */}
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-slate-900 tracking-tight">
                              {order.orderNumber}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(order.orderStatus)}`}>
                              {order.orderStatus}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                            <span>
                              Customer: <strong className="text-slate-800">{order.userId?.name || 'Pet Parent'}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Items: <strong className="text-slate-800">{order.items?.length || 0} product(s)</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Payment: <strong className="text-slate-800">{order.paymentMethod}</strong> ({order.paymentStatus})
                            </span>
                          </div>
                        </div>

                        {/* Order Actions & Status Selector */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-right mr-2 hidden sm:block">
                            <p className="text-[11px] text-slate-400 font-medium">Total Amount</p>
                            <p className="text-base font-black text-[#0d5c46]">₹{order.total?.toLocaleString('en-IN')}</p>
                          </div>

                          {/* Quick Status Dropdown for Admin */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-slate-600">Update Status:</label>
                            <select
                              value={order.orderStatus}
                              disabled={isUpdating}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0d5c46] cursor-pointer"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title={isExpanded ? 'Collapse' : 'View Details'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                      </div>

                      {/* Expandable Order Details & Tracking Timeline */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 space-y-6 animate-in slide-in-from-top-2 duration-150">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Ordered Items List */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                                Ordered Products
                              </h4>

                              <div className="space-y-2">
                                {order.items?.map((it, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200"
                                  >
                                    <img
                                      src={it.image}
                                      alt={it.name}
                                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-slate-800 truncate">{it.name}</p>
                                      <p className="text-[11px] text-slate-500">
                                        Qty: {it.quantity} × ₹{it.price}
                                      </p>
                                    </div>
                                    <div className="text-xs font-black text-slate-900 shrink-0">
                                      ₹{(it.quantity * it.price).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Address & Customer Info */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                Customer & Delivery Info
                              </h4>

                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                                <p>
                                  <strong className="text-slate-800">Recipient:</strong> {order.userId?.name || 'Pet Parent'}
                                </p>
                                <p>
                                  <strong className="text-slate-800">Phone:</strong> {order.userId?.phone || 'Not provided'}
                                </p>
                                <p>
                                  <strong className="text-slate-800">Email:</strong> {order.userId?.email || 'Not provided'}
                                </p>
                                <p className="leading-relaxed">
                                  <strong className="text-slate-800">Address:</strong>{' '}
                                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city},{' '}
                                  {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                                </p>
                              </div>

                              {/* Price breakdown */}
                              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between text-slate-500">
                                  <span>Subtotal:</span>
                                  <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                  <span>Delivery Shipping:</span>
                                  <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                                </div>
                                <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-100">
                                  <span>Grand Total:</span>
                                  <span className="text-[#0d5c46]">₹{order.total?.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Customer View of Tracking Timeline */}
                          <div className="pt-2">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-emerald-600" />
                              Customer Live Tracking Timeline
                            </h4>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                                const stepDone =
                                  (order.orderStatus === 'Delivered') ||
                                  (order.orderStatus === 'Shipped' && idx <= 2) ||
                                  (order.orderStatus === 'Processing' && idx <= 1) ||
                                  (order.orderStatus === 'Confirmed' && idx === 0);

                                return (
                                  <div
                                    key={step}
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                      stepDone
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center justify-center mb-1">
                                      {stepDone ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                      ) : (
                                        <Clock className="w-5 h-5 text-slate-300" />
                                      )}
                                    </div>
                                    <div className="text-xs">{step}</div>
                                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                                      {stepDone ? 'Completed' : 'Pending'}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Catalog Products</h3>
                <p className="text-xs text-slate-500">Add, edit prices, update stock, or remove pet items.</p>
              </div>

              <button
                onClick={openAddProductModal}
                className="px-4 py-2.5 rounded-xl bg-[#0d5c46] hover:bg-[#0a4837] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod._id || prod.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold">
                        {prod.category}
                      </span>
                      {prod.isFeatured && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{prod.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{prod.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-[#0d5c46]">₹{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">₹{prod.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">Stock: {prod.stock ?? 50}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod._id || prod.id, prod.name)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: USERS / PET PARENTS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Registered Pet Parents</h3>
                <p className="text-xs text-slate-500">All registered users and authenticated accounts.</p>
              </div>
              <span className="text-xs font-bold text-[#0d5c46] bg-emerald-50 px-3 py-1 rounded-full">
                {users.length} Total Users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">User Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0d5c46] text-white flex items-center justify-center font-bold text-[10px]">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{u.email || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Pet Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Canin Maxi Puppy Food (3kg)"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20 bg-white"
                  >
                    <option value="Dog Food">Dog Food</option>
                    <option value="Cat Food">Cat Food</option>
                    <option value="Pet Medicines">Pet Medicines</option>
                    <option value="Toys">Toys</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pet Type</label>
                  <select
                    value={productForm.petType}
                    onChange={(e) => setProductForm({ ...productForm, petType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20 bg-white"
                  >
                    <option value="dog">Dogs Only</option>
                    <option value="cat">Cats Only</option>
                    <option value="all">All Pets (Both)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="999"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original (₹)</label>
                  <input
                    type="number"
                    placeholder="1299"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Tell pet parents about nutrition ingredients, safety, and benefits..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/20"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded text-[#0d5c46] focus:ring-[#0d5c46]"
                  />
                  <span className="font-semibold text-slate-700">Featured on Home</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isPopular}
                    onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                    className="rounded text-[#0d5c46] focus:ring-[#0d5c46]"
                  />
                  <span className="font-semibold text-slate-700">Popular Product</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0d5c46] hover:bg-[#0a4837] text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
