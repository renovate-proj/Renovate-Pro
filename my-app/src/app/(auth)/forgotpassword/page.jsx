"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// step: 'email' | 'otp' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputs = useRef([]);
  const router = useRouter();

  // Auto-focus first OTP box when step changes to otp
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputs.current[0]?.focus(), 50);
    }
  }, [step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgotpassword`, { email });
      setResendCooldown(60);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: OTP input handlers ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    if (value && index < 3) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputs.current[index - 1]?.focus();
    if (e.key === 'ArrowLeft' && index > 0) otpInputs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 3) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const next = ['', '', '', ''];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);
    otpInputs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 4) { setError('Please enter all 4 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verifyotp`, { email, otp: code });
      router.push('/resetpassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
      setOtp(['', '', '', '']);
      otpInputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgotpassword`, { email });
      setResendCooldown(60);
      setOtp(['', '', '', '']);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-blue-100">

        {/* Logo */}
        <h1 className="text-4xl font-serif font-bold text-center mb-2 text-[var(--color-primary)]">
          Renovate<span className="text-[var(--color-secondary)]">Pro</span>
        </h1>

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <>
            <p className="text-center text-gray-500 mb-2 font-light">Forgot your password?</p>
            <p className="text-center text-gray-400 text-sm mb-8">
              Enter your email and we'll send you a code to reset it.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:bg-white transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg bg-[var(--color-primary)] hover:bg-blue-800 text-white font-semibold transition-all shadow-lg hover:shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'otp' && (
          <>
            <p className="text-center text-gray-500 mb-2 font-light">Check your inbox</p>
            <p className="text-center text-gray-400 text-sm mb-8">
              Enter the 4-digit code sent to{' '}
              <span className="font-medium text-gray-600">{email}</span>.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="flex gap-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpInputs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-full px-0 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-center text-xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:bg-white transition-all"
                      placeholder="·"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 4}
                className="w-full py-3.5 rounded-lg bg-[var(--color-primary)] hover:bg-blue-800 text-white font-semibold transition-all shadow-lg hover:shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Didn't receive it?{' '}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-[var(--color-secondary)] hover:underline font-medium disabled:opacity-60"
                >
                  Resend code
                </button>
              )}
            </p>
          </>
        )}

        {/* Footer link */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          {step === 'email' ? (
            <>
              Remember your password?{' '}
              <Link href="/login" className="text-[var(--color-secondary)] hover:text-blue-700 font-medium hover:underline">
                Back to Sign In
              </Link>
            </>
          ) : (
            <button
              onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '']); }}
              className="text-[var(--color-secondary)] hover:text-blue-700 font-medium hover:underline"
            >
              ← Start over
            </button>
          )}
        </p>

      </div>
    </div>
  );
}