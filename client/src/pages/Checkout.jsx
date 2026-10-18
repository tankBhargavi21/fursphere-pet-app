import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, CreditCard, CheckCircle2, AlertCircle, Plus, Edit2, ShieldCheck, Truck } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total, clearCart } = useCart();
  const { user, addAddress } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New address form state
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  const addresses = user?.addresses?.length
    ? user.addresses
    : [
        {
          title: 'Home',
          street: '123, Green Park Society',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380015',
          isDefault: true,
        },
      ];

  const currentAddress = addresses[selectedAddressIndex] || addresses[0];

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      setError('Please fill in street, city, and pincode.');
      return;
    }
    try {
      await addAddress(addressForm);
      setShowAddressModal(false);
      setAddressForm({ title: 'Home', street: '', city: '', state: '', pincode: '', isDefault: true });
    } catch (err) {
      setError(err.message || 'Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product._id || item.product.id,
          quantity: item.quantity,
        })),
        deliveryAddress: currentAddress,
        paymentMethod,
      };

      const res = await apiFetch('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (res.success && res.order) {
        clearCart();
        navigate(`/order-success/${res.order._id || res.order.id}`, { state: { order: res.order } });
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { id: 'UPI', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm, BHIM' },
    { id: 'Credit / Debit Card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay, Amex' },
    { id: 'Net Banking', label: 'Net Banking', desc: 'All Indian Banks Supported' },
    { id: 'Cash on Delivery', label: 'Cash on Delivery', desc: 'Pay when order arrives at doorstep' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Checkout
        </h1>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Delivery Address Card (Matches Panel 10) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
            <MapPin className="w-4 h-4 text-[#0d5c46]" />
            Delivery Address
          </div>
          <button
            onClick={() => setShowAddressModal(true)}
            className="text-xs font-bold text-[#0d5c46] hover:underline cursor-pointer"
          >
            Change
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0d5c46] bg-emerald-100 px-2 py-0.5 rounded-md">
              {currentAddress.title || 'Home'}
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {user?.name || 'Pet Parent'} ({user?.phone || '+91 98765 43210'})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
            {currentAddress.street}, {currentAddress.city}, {currentAddress.state} - {currentAddress.pincode}
          </p>
        </div>
      </div>

      {/* 2. Payment Method Selector (Matches Panel 10 Radio Options) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
          <CreditCard className="w-4 h-4 text-[#0d5c46]" />
          Payment Method
        </div>

        <div className="space-y-2.5">
          {paymentOptions.map((opt) => {
            const isSelected = paymentMethod === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#0d5c46] bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="accent-[#0d5c46] w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{opt.label}</span>
                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                  </div>
                </div>

                {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0d5c46]" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Order Summary Breakdown (Matches Panel 10) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
          Order Summary
        </div>

        <div className="flex justify-between text-xs sm:text-sm text-slate-600">
          <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
          <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-xs sm:text-sm text-slate-600">
          <span>Shipping</span>
          <span className="font-bold text-emerald-600">
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
          <span className="text-base font-black text-slate-900">Total</span>
          <span className="text-2xl font-black text-[#0d5c46]">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Place Order Button */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer mt-4 flex items-center justify-center gap-2"
        >
          {loading ? 'Processing Order...' : 'Place Order'}
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted & 100% Secure Checkout</span>
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Delivery Address</h3>
            
            {/* Existing addresses list */}
            {addresses.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-3 rounded-2xl border cursor-pointer text-xs ${
                      selectedAddressIndex === idx ? 'border-[#0d5c46] bg-emerald-50/50' : 'border-slate-200'
                    }`}
                  >
                    <span className="font-bold text-slate-800">{addr.title}: </span>
                    <span className="text-slate-600">{addr.street}, {addr.city}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add new address */}
            <form onSubmit={handleSaveAddress} className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Add New Address</span>
              <input
                type="text"
                placeholder="Flat / House / Street"
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
              <input
                type="text"
                placeholder="Pincode"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Done
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0d5c46] text-white text-xs font-bold hover:bg-[#0a4837]"
                >
                  Save & Use
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
