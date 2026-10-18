import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Fish, Bone, Pill, Gamepad2, Tag, Scissors, HeartPulse, Package } from 'lucide-react';
import { apiFetch } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPetType, setSelectedPetType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const categoryList = [
    { name: 'All', icon: Package },
    { name: 'Cat Food', icon: Fish },
    { name: 'Dog Food', icon: Bone },
    { name: 'Pet Medicines', icon: Pill },
    { name: 'Toys', icon: Gamepad2 },
    { name: 'Accessories', icon: Tag },
    { name: 'Grooming', icon: Scissors },
    { name: 'Healthcare', icon: HeartPulse },
  ];

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }
        if (selectedPetType && selectedPetType !== 'all') {
          params.append('petType', selectedPetType);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (sortBy) {
          params.append('sort', sortBy);
        }

        const res = await apiFetch(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error('Fetch shop error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedPetType, sortBy, searchQuery]);

  // Synchronize when query params update
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const s = searchParams.get('search');
    if (s !== null) setSearchQuery(s);
  }, [searchParams]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedPetType('all');
    setSortBy('newest');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            FurSphere Pet Shop
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Premium healthy food, safe toys, and medical care for your furry companions
          </p>
        </div>

        {/* Search input in shop */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c46]/30 text-xs sm:text-sm shadow-xs text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Icons Row (Matches Panel 7) */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-max">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0d5c46] text-white border-[#0d5c46] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary filter & sorting bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
        
        {/* Pet Filter Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Pet:</span>
          {['all', 'dog', 'cat'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPetType(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                selectedPetType === type
                  ? 'bg-emerald-100 text-[#0d5c46]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {type === 'all' ? 'All Pets' : type === 'dog' ? '🐶 Dogs' : '🐱 Cats'}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0d5c46] cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>

          {(selectedCategory !== 'All' || selectedPetType !== 'all' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-xl cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-slate-100 rounded-3xl h-68 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search keywords or filter settings.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-[#0d5c46] text-white text-xs font-bold hover:bg-[#0a4837] cursor-pointer"
          >
            Show All Products
          </button>
        </div>
      )}

    </div>
  );
}
