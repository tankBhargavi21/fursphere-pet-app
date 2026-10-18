import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Sparkles, Heart } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-sky-50/40 to-amber-50/50 flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden">
      
      {/* Decorative pet paw icons in background */}
      <div className="absolute top-10 left-8 text-emerald-200/40 -rotate-12 pointer-events-none">
        <PawPrint className="w-16 h-16 fill-emerald-100" />
      </div>
      <div className="absolute bottom-32 right-6 text-amber-200/40 rotate-12 pointer-events-none">
        <PawPrint className="w-20 h-20 fill-amber-100" />
      </div>

      {/* Top Header Logo */}
      <div className="flex flex-col items-center mt-4">
        <div className="w-14 h-14 rounded-3xl bg-[#0d5c46] flex items-center justify-center text-white shadow-xl shadow-emerald-950/20 mb-3">
          <PawPrint className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0d5c46] tracking-tight">
          FurSphere
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-emerald-700 tracking-wide mt-0.5">
          Happy Pets, Healthy Lives
        </p>
      </div>

      {/* Hero Illustration / Photograph */}
      <div className="w-full max-w-sm my-6 relative flex flex-col items-center">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-emerald-100 via-amber-100 to-sky-100 p-2 shadow-inner flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700&auto=format&fit=crop&q=80"
            alt="FurSphere Puppy and Kitten"
            className="w-full h-full object-cover rounded-full shadow-lg"
          />

          {/* Floating AI badge */}
          <div className="absolute -bottom-2 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-1.5 text-xs font-bold text-[#0d5c46]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
            <span>AI Pet Care</span>
          </div>

          {/* Floating Heart badge */}
          <div className="absolute -top-1 left-4 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-lg border border-rose-100 text-rose-500">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
        </div>
      </div>

      {/* Tagline & Action Buttons */}
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Better Care <br />
          <span className="text-[#0d5c46]">For Your Furry Friends</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-8 max-w-xs">
          Premium pet food, healthcare, and smart Gemini-powered pet advice right at your fingertips.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <Link
            to="/home"
            className="w-full block py-3.5 px-6 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-center shadow-lg shadow-emerald-950/20 transition-all"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="w-full block py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-emerald-200 active:scale-[0.98] text-[#0d5c46] font-bold text-center shadow-sm transition-all"
          >
            Login
          </Link>
        </div>
      </div>

    </div>
  );
}
