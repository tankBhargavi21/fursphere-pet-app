import React from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  Heart,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  Award
} from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Genuine Nutrition',
      description: 'Strictly vetted ingredients, authentic kibble, wet food, and veterinary supplements without harmful additives.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Pet Care',
      description: 'Cutting-edge Google Gemini vision and interactive chat to instantly identify breeds, symptoms, and meal plans.',
      color: 'bg-sky-50 text-sky-600 border-sky-100'
    },
    {
      icon: Award,
      title: 'Veterinarian Approved',
      description: 'Every product in our shop is evaluated by clinical pet nutritionists and certified veterinary doctors.',
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      icon: Truck,
      title: 'Caring Doorstep Delivery',
      description: 'Express dispatch and gentle handling to ensure your pet essentials arrive fresh and right on time.',
      color: 'bg-rose-50 text-rose-600 border-rose-100'
    }
  ];

  const milestones = [
    { number: '15,000+', label: 'Happy Dogs & Cats' },
    { number: '99.8%', label: 'On-Time Delivery' },
    { number: '24/7', label: 'AI Pet Assistant' },
    { number: '4.9 ★', label: 'Average Pet Parent Rating' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 lg:pb-16">
      
      {/* Hero Banner matching FurSphere branding */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0d5c46] via-[#106b52] to-[#073629] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs sm:text-sm font-semibold">
            <PawPrint className="w-4 h-4 fill-emerald-200" />
            <span>About FurSphere & Our Mission</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Happy Pets, <span className="text-emerald-300">Healthy Lives.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            FurSphere was born from a simple belief: every pet deserves the very best nutrition, proactive health monitoring, and boundless love. We combine premium pet supplies with smart AI technology to empower pet parents everywhere.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0d5c46] font-bold text-sm shadow-lg hover:bg-emerald-50 transition-all hover:scale-105"
            >
              Explore Shop
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/ai-chat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-400/30 backdrop-blur-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Try AI Pet Chat
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white rounded-3xl p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
          {milestones.map((m, idx) => (
            <div key={idx} className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-black text-[#0d5c46] tracking-tight">{m.number}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story & Vision */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0d5c46] tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 fill-[#0d5c46]" />
              Our Story
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Crafted by Pet Parents, Backed by Modern Technology
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We started FurSphere when we noticed how overwhelming it was to find reliable pet food, verified tick-flea medicines, and prompt veterinary guidance for our furry companions. 
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Today, FurSphere serves thousands of dogs and cats with certified nutrition, interactive pet toys, and cutting-edge Google Gemini AI tools that analyze pet photos and offer 24/7 care advice at your fingertips.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Zero counterfeit pet products — 100% sourced directly from verified brands</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Comprehensive order tracking from our care warehouse to your doorstep</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>AI Photo Diagnostics for breed insights, weight tips, and skin health</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=900&auto=format&fit=crop&q=80"
                alt="Happy dog and cat"
                className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Community of 15k+ Pets</p>
                <p className="text-[11px] text-slate-500">Connecting animal lovers with top care</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Pillars / Values */}
      <section className="bg-white py-16 sm:py-20 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Why Pet Parents Trust FurSphere
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built with uncompromising standards for the health and happiness of every four-legged family member.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-slate-50/70 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${p.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location / About Place Section ("website ma about place banavo") */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                <MapPin className="w-3.5 h-3.5" />
                <span>FurSphere Experience & Distribution Center</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Visit Us or Reach Out to Our Care Team
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Whether you have queries about your pet's dietary requirements, order dispatches, or AI scanner advice, our certified team is here to assist 7 days a week.
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Central Pet Care Hub</span>
                    <span className="text-slate-400">FurSphere House, Ring Road, Ahmedabad, Gujarat - 380015, India</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Toll-Free Helpline: <strong className="text-white">+91 1800-FUR-SPHERE (1800-387-7743)</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Support Email: <strong className="text-white">care@fursphere.com</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Operation Hours: <strong className="text-white">Monday – Sunday (8:00 AM – 10:00 PM IST)</strong></span>
                </div>
              </div>
            </div>

            {/* Visual Location Card */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-emerald-400" />
                Order & Service Coverage
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We deliver pet nutrition, health supplements, and accessories across 500+ Indian cities with express courier tracking.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-center">
                  <div className="text-lg font-bold text-emerald-400">Express 24-48h</div>
                  <div className="text-[11px] text-slate-400">Metro Deliveries</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-center">
                  <div className="text-lg font-bold text-sky-400">Free Shipping</div>
                  <div className="text-[11px] text-slate-400">On Orders Over ₹499</div>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  to="/shop"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  Start Shopping for Your Furry Friend
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
