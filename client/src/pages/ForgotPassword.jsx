import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your registered phone number or email.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: identifier }),
      });
      if (res.success) {
        setStep(2);
        if (res.otp) setOtp(res.otp);
        setInfo(`Verification OTP sent: ${res.otp || 'Check SMS'}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError('Please provide the OTP and a new password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ identifier, otp, newPassword }),
      });
      if (res.success) {
        setInfo('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        
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
            <span className="text-xl font-black text-[#0d5c46]">FurSphere</span>
          </div>
          <div className="w-9" />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 ? 'Enter your registered phone or email to receive a code.' : 'Enter the code and set your new password.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{info}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number or Email
              </label>
              <input
                type="text"
                placeholder="e.g. +919876543210 or user@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm font-semibold tracking-wider text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-[#0d5c46] focus:ring-2 focus:ring-[#0d5c46]/20 bg-slate-50/50 text-sm text-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0d5c46] hover:bg-[#0a4837] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Resetting Password...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-[#0d5c46]">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}
