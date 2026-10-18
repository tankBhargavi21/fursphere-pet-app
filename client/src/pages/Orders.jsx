import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, Truck, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/orders');
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please Login</h2>
        <p className="text-xs text-slate-500">Sign in to track your FurSphere pet orders.</p>
        <Link
          to="/login"
          state={{ from: { pathname: '/orders' } }}
          className="inline-block px-5 py-2.5 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold"
        >
          Login
        </Link>
      </div>
    );
  }

  const tabs = ['All', 'Processing', 'Shipped', 'Delivered'];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'All') return true;
    return order.orderStatus.toLowerCase() === activeTab.toLowerCase();
  });

  const getStepActiveIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing' || s === 'packed') return 1;
    return 0; // confirmed
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Header matching Panel 12 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          My Orders & Tracking
        </h1>
      </div>

      {/* Filter Tabs matching Panel 12: All, Processing, Shipped, Delivered */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#0d5c46] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const stepIndex = getStepActiveIndex(order.orderStatus);
            const isExpanded = expandedOrderId === order._id;

            return (
              <div
                key={order._id || order.orderNumber}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4"
              >
                {/* Order Top Bar (Matches Panel 12: #FS123456, Placed date, Status badge) */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 tracking-wider">
                      {order.orderNumber}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-100 text-[#0d5c46]'
                        : order.orderStatus === 'Shipped'
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Progress Tracking Bar (Matches Panel 12 Dots + Line) */}
                <div className="py-2">
                  <div className="relative flex items-center justify-between max-w-sm mx-auto">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                    <div
                      className="absolute top-1/2 left-4 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ width: `${(stepIndex / 3) * 100}%` }}
                    />

                    {/* Step nodes: Confirmed, Packed, Shipped, Delivered */}
                    {['Confirmed', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                      const isComplete = idx <= stepIndex;
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isComplete ? 'bg-[#0d5c46] text-white' : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                          <span className={`text-[10px] mt-1.5 font-bold ${isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items preview */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  {order.items.slice(0, isExpanded ? order.items.length : 1).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}

                  {order.items.length > 1 && !isExpanded && (
                    <p className="text-[11px] font-semibold text-slate-400 pl-1">
                      + {order.items.length - 1} more items in this order
                    </p>
                  )}
                </div>

                {/* Footer Total & View Details button */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Order Total: </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {isExpanded ? 'Hide Details' : 'Track Order / Details'}
                  </button>
                </div>

                {/* Detailed Timeline Breakdown when expanded */}
                {isExpanded && order.timeline && (
                  <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 mt-2 border border-slate-200/60 animate-in fade-in">
                    <span className="text-xs font-bold text-slate-700 block mb-1">Live Tracking History:</span>
                    {order.timeline.map((evt, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${evt.done ? 'text-[#0d5c46]' : 'text-slate-300'}`} />
                        <div>
                          <span className="font-bold text-slate-800">{evt.status}: </span>
                          <span className="text-slate-600">{evt.description}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 text-[11px] text-slate-500">
                      <strong>Delivery to:</strong> {order.deliveryAddress?.street}, {order.deliveryAddress?.city} ({order.deliveryAddress?.pincode})
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Browse our shop and treat your pet to nutritious food and toys!
          </p>
          <Link
            to="/shop"
            className="px-5 py-2.5 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold hover:bg-[#0a4837]"
          >
            Start Shopping
          </Link>
        </div>
      )}

    </div>
  );
}
