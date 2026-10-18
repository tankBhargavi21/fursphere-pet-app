import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, ChevronLeft, Eye, EyeOff, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithPhoneOtp, sendPhoneOtp, loginWithPassword, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Tabs: 'phone' or 'email'
  const [activeTab, setActiveTab] = useState('phone');

  // Phone login mode: 'otp' or 'password'
  const [phoneMode, setPhoneMode] = useState('otp');

  // Form states
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      const res = await sendPhoneOtp(fullPhone);
      if (res.success) {
        setOtpSent(true);
        setCountdown(60);
        if (res.otp) {
          setOtp(res.otp); // Pre-fill for instant test convenience
          setInfoMessage(`Code ${res.otp} generated! (Sent or ready to verify)`);
        } else {
          setInfoMessage('Verification code sent to your mobile phone.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const fullPhone = `${countryCode}${phoneNumber}`;

    if (phoneMode === 'otp') {
      if (!otp) {
        setError('Please enter the 6-digit OTP code.');
        return;
      }
      setLoading(true);
      try {
        const res = await loginWithPhoneOtp(fullPhone, otp);
        if (res.success) {
          navigate('/home');
        }
      } catch (err) {
        setError(err.message || 'OTP verification failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // Phone + Password
      if (!password) {
        setError('Please enter your password.');
        return;
      }
      setLoading(true);
      try {
        const res = await loginWithPassword(fullPhone, password);
        if (res.success) {
          navigate('/home');
        }
      } catch (err) {
        setError(err.message || 'Invalid phone or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithPassword(email, password);
      if (res.success) {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      
      {/* Container card matching UI panel 2 */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        
        {/* Top Back and Brand */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#0d5c46] flex items-center justify-center text-white">
              <PawPrint className="w-4 h-4 fill-white" />
            </div>
            <span className="text-xl font-black text-[#0d5c46] tracking-tight">FurSphere</span>
          </div>

          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Title & subtitle */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Login to continue your pet care journey</p>
        </div>

        {/* Tab Toggle: Phone Login vs Email Login */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setError('');
              setInfoMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-white text-[#0d5c46] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Phone Login
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setError('');
              setInfoMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-[#0d5c46] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Login
          </button>
        </div>

        {/* Alerts / Error feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ================= PHONE LOGIN TAB ================= */}
        {activeTab === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            
            {/* Phone input with country code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="flex rounded-2xl border border-slate-200 focus-within:border-[#0d5c46] focus-within:ring-2 focus-within:ring-[#0d5c46]/20 bg-slate-50/50 overflow-hidden transition-all">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent pl-3 pr-1 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none border-r border-slate-200 cursor-pointer"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-transparent focus:outline-none text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Mode selector: OTP Login or Password Login */}
            <div className="flex items-center gap-6 py-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="phoneMode"
                  value="otp"
                  checked={phoneMode === 'otp'}
                  onChange={() => setPhoneMode('otp')}
                  className="accent-[#0d5c46] w-4 h-4"
                />
                OTP Login
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="phoneMode"
                  value="password"
                  checked={phoneMode === 'password'}
                  onChange={() => setPhoneMode('password')}
                  className="accent-[#0d5c46] w-4 h-4"
                />
                Password Login
              </label>
            </div>

            {/* OTP Mode Fields */}
            {phoneMode === 'otp' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm font-semibold tracking-wider text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || countdown > 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-bold text-[#0d5c46] hover:bg-emerald-50 disabled:text-slate-400 cursor-pointer transition-colors"
                  >
                    {countdown > 0 ? `Resend (${countdown}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>
            ) : (
              /* Phone Password Mode */
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-[#0d5c46] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm text-slate-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Verifying...' : phoneMode === 'otp' ? 'Login with OTP' : 'Login'}
            </button>
          </form>
        )}

        {/* ================= EMAIL LOGIN TAB ================= */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="petlover@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm text-slate-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#0d5c46] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm text-slate-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer mt-2"
            >
              {loading ? 'Logging in...' : 'Login with Email'}
            </button>
          </form>
        )}

        {/* Footer: Sign up link */}
        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#0d5c46] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
