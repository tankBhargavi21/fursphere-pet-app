import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Star, Plus, Minus, ShoppingCart, Zap, ShieldCheck, Truck, RefreshCw, Check } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/products/${id}`);
        if (res.success && res.product) {
          setProduct(res.product);
        }
      } catch (err) {
        console.error('Fetch product failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#0d5c46] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The item you are looking for may have been moved or is currently unavailable.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-5 py-2.5 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const productId = product._id || product.id;
  const isFav = isInWishlist(productId);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    setAddingToCart(true);
    await addToCart(productId, quantity);
    setAddingToCart(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
      return;
    }
    await addToCart(productId, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Top Header with Back button and Wishlist */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-slate-400 capitalize">
          {product.category}
        </span>

        <button
          onClick={() => toggleWishlist(product)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
            isFav
              ? 'bg-rose-50 border-rose-200 text-rose-500'
              : 'bg-white border-slate-200 text-slate-500 hover:text-rose-500'
          }`}
          title="Wishlist"
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main product view grid (Matches Panel 8) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Product Image Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex items-center justify-center">
          <div className="w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-5">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#0d5c46]">
                {product.weight || 'Standard Pack'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 capitalize">
                {product.petType === 'all' ? 'Dogs & Cats' : product.petType}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                {product.rating || 4.7}
              </div>
              <span className="text-xs text-slate-400">
                ({product.reviewCount || 820} verified pet parent reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pt-2 border-t border-slate-100">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Save ₹{product.originalPrice - product.price}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Benefit Tags (Matches Panel 8: Healthy Skin, Shiny Coat, Strong Immunity) */}
          {product.highlights && product.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Key Care Benefits
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">Quantity</label>
            <div className="inline-flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-slate-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons (Matches Panel 8) */}
          <div className="space-y-3 pt-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full py-3.5 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
            >
              {addedSuccess ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 active:scale-[0.98] border-2 border-[#0d5c46] text-[#0d5c46] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#0d5c46]" />
              Buy Now
            </button>
          </div>

          {/* Delivery & Authenticity Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Free Delivery above ₹499</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Genuine & Sealed</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
