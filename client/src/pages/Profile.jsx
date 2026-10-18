import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Dog,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  X,
  CheckCircle2,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, addAddress } = useAuth();

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Address modal form
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0d5c46] flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Pet Parent Profile</h2>
        <p className="text-xs text-slate-500">
          Sign in to manage your addresses, orders, pets, and favorite products.
        </p>
        <Link
          to="/login"
          state={{ from: { pathname: '/profile' } }}
          className="inline-block px-6 py-2.5 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold"
        >
          Login
        </Link>
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, email, phone });
      setFeedback('Profile updated successfully!');
      setShowEditProfileModal(false);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.pincode) {
      alert('Please fill in street, city, and pincode.');
      return;
    }
    setLoading(true);
    try {
      await addAddress(addressForm);
      setFeedback('Address added successfully!');
      setShowAddressModal(false);
      setAddressForm({ title: 'Home', street: '', city: '', state: '', pincode: '', isDefault: true });
    } catch (err) {
      alert(err.message || 'Failed to add address.');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const menuItems = [
    { label: 'My Pets', path: '/pets', icon: Dog, color: 'text-amber-500 bg-amber-50' },
    { label: 'My Orders', path: '/orders', icon: Package, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Favorites / Wishlist', path: '/wishlist', icon: Heart, color: 'text-rose-500 bg-rose-50' },
    { label: 'Saved Addresses', action: () => setShowAddressModal(true), icon: MapPin, color: 'text-sky-500 bg-sky-50' },
    { label: 'Payment Methods', action: () => alert('FurSphere supports UPI, Cards, Net Banking, and Cash on Delivery at Checkout!'), icon: CreditCard, color: 'text-purple-500 bg-purple-50' },
    { label: 'Settings', action: () => setShowEditProfileModal(true), icon: Settings, color: 'text-slate-600 bg-slate-100' },
    { label: 'Help & Support', action: () => alert('Need assistance? Call our toll-free 24/7 Pet Parent line: 1800-FUR-SPHERE or chat with Gemini AI in the AI Chat tab!'), icon: HelpCircle, color: 'text-teal-600 bg-teal-50' },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Header matching Panel 13 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Profile
          </h1>
        </div>

        <button
          onClick={() => {
            setName(user?.name || '');
            setEmail(user?.email || '');
            setPhone(user?.phone || '');
            setShowEditProfileModal(true);
          }}
          className="p-2 rounded-xl text-[#0d5c46] hover:bg-emerald-50 cursor-pointer transition-colors"
          title="Edit Profile"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* User Info Card matching Panel 13 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-3">
        <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#0d5c46] to-emerald-500 text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-emerald-950/20">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Pet Parent'}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email || 'No email attached'}</p>
          <p className="text-xs text-slate-400">{user?.phone || '+91 98765 43210'}</p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#0d5c46] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verified Pet Care Member
        </div>
      </div>

      {/* Menu Options List matching Panel 13 */}
      <div className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm space-y-1">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const content = (
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-slate-900">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          );

          if (item.path) {
            return (
              <Link key={idx} to={item.path}>
                {content}
              </Link>
            );
          }

          return (
            <button key={idx} onClick={item.action} className="w-full text-left">
              {content}
            </button>
          );
        })}

        {/* Logout Option */}
        <div className="pt-2 border-t border-slate-100 mt-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out of FurSphere?')) {
                logout();
                navigate('/');
              }
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-bold">Logout</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-300" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="cursor-pointer text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0d5c46] text-white text-xs font-bold"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Addresses Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Saved Addresses</h3>
              <button onClick={() => setShowAddressModal(false)} className="cursor-pointer text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List saved */}
            <div className="space-y-2">
              {(user?.addresses || []).map((addr, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-[#0d5c46]">{addr.title}: </span>
                  <p className="text-slate-700 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              ))}
            </div>

            {/* Add address form */}
            <form onSubmit={handleAddAddress} className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">Add New Delivery Address</span>
              <input
                type="text"
                placeholder="Title (e.g. Home, Office)"
                value={addressForm.title}
                onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
              <input
                type="text"
                placeholder="Street Address"
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
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0d5c46] text-white text-xs font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
