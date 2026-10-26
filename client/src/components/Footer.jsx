import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, ShieldCheck, Truck, Sparkles, HeartHandshake, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine</h4>
              <p className="text-xs text-slate-400">Authentic Pet Care</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast Delivery</h4>
              <p className="text-xs text-slate-400">Doorstep Dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">AI Pet Scanner</h4>
              <p className="text-xs text-slate-400">Smart Care Insights</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Vet Endorsed</h4>
              <p className="text-xs text-slate-400">Safe Nutrition</p>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                <PawPrint className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">FurSphere</span>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Happy Pets, Healthy Lives. Your modern full-stack companion for premium nutrition, pet medicines, toys, and AI-powered health monitoring.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>Pet Parent Helpline: 1800-FUR-SPHERE</span>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white mb-3 tracking-wide uppercase">Pet Categories</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/shop?category=Dog Food" className="hover:text-emerald-400 transition-colors">Dog Food & Kibble</Link></li>
              <li><Link to="/shop?category=Cat Food" className="hover:text-emerald-400 transition-colors">Cat Wet & Dry Food</Link></li>
              <li><Link to="/shop?category=Pet Medicines" className="hover:text-emerald-400 transition-colors">Tick & Flea Chews</Link></li>
              <li><Link to="/shop?category=Toys" className="hover:text-emerald-400 transition-colors">Chew & Scratch Toys</Link></li>
              <li><Link to="/shop?category=Grooming" className="hover:text-emerald-400 transition-colors">Grooming & Shampoos</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white mb-3 tracking-wide uppercase">AI Features</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/ai-chat" className="hover:text-emerald-400 transition-colors">FurSphere AI Pet Assistant</Link></li>
              <li><Link to="/scanner" className="hover:text-emerald-400 transition-colors">AI Pet Photo Scanner</Link></li>
              <li><Link to="/pets" className="hover:text-emerald-400 transition-colors">My Pet Health Profiles</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400 transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold text-white mb-3 tracking-wide uppercase">Company & Support</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400/90">About FurSphere & Location</Link></li>
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Admin Management Portal</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">My Profile & Addresses</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400 transition-colors">Recent Orders & Tracking</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">View Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-emerald-400 transition-colors">Favorites / Wishlist</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} FurSphere Inc. All rights reserved. Happy Pets, Healthy Lives.
        </div>
      </div>
    </footer>
  );
}
