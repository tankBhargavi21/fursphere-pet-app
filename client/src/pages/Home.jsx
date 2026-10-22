import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  ChevronRight,
  Fish,
  Bone,
  Pill,
  Gamepad2,
  Tag,
  Scissors,
  HeartPulse,
  Package,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { apiFetch } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [foodProducts, setFoodProducts] = useState([]);
  const [selectedPetType, setSelectedPetType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAiChatBanner, setShowAiChatBanner] = useState(() => {
    return localStorage.getItem('fursphere_hide_ai_chat_banner') !== 'true';
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, popRes, allRes] = await Promise.all([
          apiFetch('/products?featured=true'),
          apiFetch('/products?popular=true'),
          apiFetch('/products'),
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products.slice(0, 4));
        if (popRes.success) setPopularProducts(popRes.products.slice(0, 4));
        if (allRes.success) setFoodProducts(allRes.products);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  // Category items matching screenshot panel 4
  const categories = [
    { name: 'Food', query: 'Food', icon: Fish, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { name: 'Medicines', query: 'Pet Medicines', icon: Pill, bg: 'bg-pink-50 text-pink-600 border-pink-100' },
    { name: 'Toys', query: 'Toys', icon: Gamepad2, bg: 'bg-purple-50 text-purple-600 border-purple-100' },
    { name: 'Accessories', query: 'Accessories', icon: Tag, bg: 'bg-sky-50 text-sky-600 border-sky-100' },
    { name: 'Grooming', query: 'Grooming', icon: Scissors, bg: 'bg-amber-50 text-amber-600 border-amber-100' },
    { name: 'Healthcare', query: 'Healthcare', icon: HeartPulse, bg: 'bg-rose-50 text-rose-600 border-rose-100' },
    { name: 'Other', query: 'Other', icon: Package, bg: 'bg-teal-50 text-teal-600 border-teal-100' },
  ];

  const filteredFood = foodProducts.filter((p) => {
    if (selectedPetType === 'all') return p.category.includes('Food');
    return p.category.includes('Food') && (p.petType === selectedPetType || p.petType === 'all');
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Hero Banner (Matches Panel 4) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-100 via-sky-100 to-amber-100 p-6 sm:p-10 border border-emerald-200/50 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div className="space-y-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-[#0d5c46] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
              FurSphere Care Club
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Healthy Pets <br />
              <span className="text-[#0d5c46]">Happy Lives</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-sm">
              Complete nutrition, tick-free protection, and AI veterinary assistant for cats and dogs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 active:scale-95 transition-all"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/90 hover:bg-white text-[#0d5c46] font-bold text-xs sm:text-sm shadow-xs border border-emerald-200/60 transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                Scan Pet Photo
              </Link>
            </div>
          </div>

          {/* Hero Pet Image */}
          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80"
                alt="Happy Golden Dog and Cat"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Grid (Matches Panel 4 category circles/cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Pet Categories
          </h2>
          <Link to="/shop" className="text-xs font-bold text-[#0d5c46] hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.query)}`)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center border shadow-xs group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ${cat.bg}`}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-2 text-center group-hover:text-[#0d5c46] transition-colors">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AI Feature Highlights Banner */}
      <div className={`grid grid-cols-1 ${showAiChatBanner ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
        {/* AI Chat Banner (Removable / Dismissible) */}
        {showAiChatBanner && (
          <div className="relative group/box">
            <Link
              to="/ai-chat"
              className="group p-5 rounded-3xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 hover:border-sky-200 shadow-sm transition-all flex items-center justify-between h-full"
            >
              <div className="space-y-1 pr-6">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-200/60 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-sky-600 fill-sky-300" />
                  Gemini AI
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  FurSphere AI Pet Assistant
                </h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Ask anything about your dog or cat's diet, symptoms, or daily care routine.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0 ml-4">
                <Sparkles className="w-6 h-6 fill-sky-200" />
              </div>
            </Link>

            {/* Remove / Dismiss AI Chat Banner button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAiChatBanner(false);
                localStorage.setItem('fursphere_hide_ai_chat_banner', 'true');
              }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200/60 shadow-2xs transition-all cursor-pointer opacity-80 hover:opacity-100"
              title="Remove AI Chat Banner from Home"
            >
              <span className="sr-only">Remove AI Chat Banner</span>
              ✕
            </button>
          </div>
        )}

        {/* Pet Photo Scanner Banner */}
        <Link
          to="/scanner"
          className="group p-5 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-200 shadow-sm transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-200/60 px-2.5 py-0.5 rounded-full">
              <Camera className="w-3 h-3 text-emerald-600" />
              Vision AI
            </span>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Pet Photo Health Scanner
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Upload your pet's photo to receive instant visual coat, eye, and wellness insights.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0d5c46] text-white flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform shrink-0 ml-4">
            <Camera className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* 4. Featured Products (Matches Panel 4) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-slate-500">Hand-picked veterinary endorsed favorites</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-[#0d5c46] hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-100 rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>

      {/* 5. Food Recommendations Tabs */}
      <div className="bg-slate-100/60 p-5 sm:p-6 rounded-3xl border border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Pet Food Recommendations
            </h2>
            <p className="text-xs text-slate-500">Targeted nutrition for active kittens and adult dogs</p>
          </div>

          <div className="inline-flex p-1 bg-white rounded-2xl shadow-xs border border-slate-200 self-start">
            <button
              onClick={() => setSelectedPetType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedPetType === 'all' ? 'bg-[#0d5c46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Food
            </button>
            <button
              onClick={() => setSelectedPetType('dog')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedPetType === 'dog' ? 'bg-[#0d5c46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🐶 Dogs
            </button>
            <button
              onClick={() => setSelectedPetType('cat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedPetType === 'cat' ? 'bg-[#0d5c46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🐱 Cats
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredFood.slice(0, 4).map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* 6. Popular Products Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Popular with Pet Parents
            </h2>
            <p className="text-xs text-slate-500">Top-rated chews, scratch posts & grooming brushes</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-[#0d5c46] hover:underline flex items-center gap-0.5">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularProducts.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      </div>

    </div>
  );
}
