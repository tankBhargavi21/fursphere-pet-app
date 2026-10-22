import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, Star, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const productId = product._id || product.id;
  const isFav = isInWishlist(productId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(productId, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    await addToCart(productId, 1);
    navigate('/checkout');
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(13,92,70,0.08)] transition-all duration-300 flex flex-col justify-between relative hover:-translate-y-1">
      
      {/* Top action: Wishlist Heart & Pet Badge */}
      <div className="relative">
        <div className="aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer shadow-xs ${
            isFav
              ? 'bg-rose-50 text-rose-500 scale-105'
              : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Pet Tag / Discount */}
        {product.originalPrice && product.originalPrice > product.price && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Save ₹{product.originalPrice - product.price}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-medium text-slate-400 capitalize">
              {product.weight || product.category}
            </span>
            {product.rating && (
              <span className="flex items-center text-[11px] font-semibold text-amber-500 ml-auto">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                {product.rating}
              </span>
            )}
          </div>

          <Link
            to={`/product/${productId}`}
            className="block text-sm sm:text-base font-bold text-slate-800 group-hover:text-[#0d5c46] line-clamp-1 transition-colors"
          >
            {product.name}
          </Link>

          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {product.description}
          </p>
        </div>

        {/* Price & Action Buttons (Buy Now & Add to Cart) */}
        <div className="pt-3 mt-2 border-t border-slate-50 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </div>
              {product.originalPrice && (
                <div className="text-[11px] text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </div>
              )}
            </div>
            
            {/* Quick Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                added
                  ? 'bg-emerald-600 text-white scale-105'
                  : 'bg-[#0d5c46] text-white hover:bg-[#0a4837] active:scale-95 shadow-emerald-950/15'
              }`}
              title="Add to Cart"
            >
              {added ? (
                <Check className="w-4 h-4 animate-in zoom-in" />
              ) : (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full py-2 px-3 rounded-xl bg-emerald-50/80 hover:bg-[#0d5c46] border border-emerald-300 hover:border-[#0d5c46] text-[#0d5c46] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Buy Now
          </button>
        </div>

      </div>
    </div>
  );
}
