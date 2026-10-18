import React, { useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0d5c46', '#10b981', '#38bdf8', '#fbbf24'],
      });
    } catch (e) {
      // safe fallback if canvas-confetti is not loaded
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50 text-center space-y-6">
        
        {/* Cute puppy illustration / photograph (Matches Panel 11) */}
        <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80"
            alt="Happy pet"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1 right-2 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Success Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Your pet care order has been confirmed. You will receive a tracking update soon.
          </p>

          {order?.orderNumber && (
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0d5c46] text-xs font-black tracking-wider">
              {order.orderNumber}
            </div>
          )}
        </div>

        {/* Buttons (Matches Panel 11) */}
        <div className="space-y-3 pt-2">
          <Link
            to="/orders"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm block shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
          >
            View My Orders
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 active:scale-[0.98] text-slate-700 font-bold text-sm block transition-all cursor-pointer"
          >
            Go to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
