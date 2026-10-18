import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0d5c46] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Please Login to View Cart</h2>
        <p className="text-xs text-slate-500">
          Sign in to your FurSphere account to see your saved items and complete checkout.
        </p>
        <Link
          to="/login"
          state={{ from: { pathname: '/cart' } }}
          className="inline-block px-6 py-3 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold shadow-md hover:bg-[#0a4837]"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Looks like you haven't added any pet food, medicines, or toys yet!
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d5c46] text-white text-xs font-bold shadow-md hover:bg-[#0a4837]"
        >
          Explore Pet Shop
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12 space-y-6">
      
      {/* Header matching Panel 9: < My Cart and Clear All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Cart
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {/* Cart Item Cards List (Matches Panel 9) */}
      <div className="space-y-3">
        {cart.map((item) => {
          const product = item.product || {};
          const productId = product._id || product.id;

          return (
            <div
              key={item._id || productId}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 relative group"
            >
              {/* Product Thumbnail */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${productId}`}
                  className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#0d5c46] truncate block transition-colors"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">
                  {product.weight || product.category}
                </p>
                <div className="text-sm sm:text-base font-black text-slate-900 mt-1">
                  ₹{(product.price || 0).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, Math.max(0, item.quantity - 1))}
                  className="w-7 h-7 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, item.quantity + 1)}
                  className="w-7 h-7 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFromCart(productId)}
                className="text-slate-300 hover:text-rose-500 p-1.5 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Cost Summary Card (Matches Panel 9) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-3">
        <div className="flex justify-between text-xs sm:text-sm text-slate-600 font-medium">
          <span>Subtotal</span>
          <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between text-xs sm:text-sm text-slate-600 font-medium">
          <span>Shipping</span>
          <span className="font-bold text-emerald-600">
            {shipping === 0 ? 'FREE' : `₹${shipping}`}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
          <span className="text-base sm:text-lg font-black text-slate-900">Total</span>
          <span className="text-xl sm:text-2xl font-black text-[#0d5c46]">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Proceed to Checkout Button */}
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-4 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all cursor-pointer mt-4"
        >
          Proceed to Checkout
        </button>
      </div>

    </div>
  );
}
