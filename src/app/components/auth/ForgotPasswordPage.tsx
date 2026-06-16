import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';

export interface ForgotPasswordPageProps {
  onBackClick?: () => void;
  onResetSuccess?: () => void;
}

type Step = 'email' | 'otp' | 'reset';

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onBackClick,
  onResetSuccess,
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Handle OTP expiry countdown
  useEffect(() => {
    if (!otpExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = otpExpiry - now;

      if (remaining <= 0) {
        setOtpExpiry(null);
        setCanResend(true);
        clearInterval(interval);
      } else {
        setResendTimer(Math.floor(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await authService.startForgotPasswordFlow(email);

      if (!result.success) {
        setError(result.message || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setSuccess('OTP sent to your email!');
      setOtpExpiry(result.expiresAt || Date.now() + 10 * 60 * 1000); // 10 minutes
      setCanResend(false);
      setResendTimer(600); // 10 minutes in seconds
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and move to password reset
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.verifyOTP(email, otp);

      if (!result.success) {
        setError(result.message || 'Invalid OTP');
        setLoading(false);
        return;
      }

      setSuccess('OTP verified! Now set your new password.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPasswordWithOTP(email, newPassword, otp);

      if (!result.success) {
        setError(result.message || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        onResetSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setCanResend(false);
    const result = await authService.startForgotPasswordFlow(email);
    
    if (result.success) {
      setSuccess('New OTP sent to your email!');
      setOtpExpiry(result.expiresAt || Date.now() + 10 * 60 * 1000);
      setResendTimer(600);
      setOtp('');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: '#070B14' }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-700 p-8 space-y-6">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onBackClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <ArrowLeft size={20} style={{ color: '#00D4FF' }} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: '#E2E8F0' }}>
              Reset Password
            </h1>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2">
            <div
              className="flex-1 h-1 rounded"
              style={{
                background: step === 'email' ? '#39FF14' : '#333',
                transition: 'all 0.3s ease',
              }}
            />
            <div
              className="flex-1 h-1 rounded"
              style={{
                background: step !== 'email' && (step === 'otp' || step === 'reset') ? '#39FF14' : '#333',
                transition: 'all 0.3s ease',
              }}
            />
            <div
              className="flex-1 h-1 rounded"
              style={{
                background: step === 'reset' ? '#39FF14' : '#333',
                transition: 'all 0.3s ease',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-4 rounded-lg border flex items-start gap-3"
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}
            >
              <AlertCircle size={18} style={{ color: '#ef4444' }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: '#fca5a5' }}>
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="p-4 rounded-lg border flex items-start gap-3"
              style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e' }}
            >
              <p className="text-sm" style={{ color: '#86efac' }}>
                ✓ {success}
              </p>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  Enter the email associated with your account. We'll send you an OTP to reset your
                  password.
                </p>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#64748B' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-10 border border-gray-700 focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
                style={{
                  background: loading ? '#22c55e99' : '#39FF14',
                  color: '#070B14',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading && <Loader size={18} className="animate-spin" />}
                Send OTP
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter OTP Code
                </label>
                <p className="text-xs text-gray-400 mb-3">
                  We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
                </p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition text-center text-2xl tracking-widest"
                  style={{ letterSpacing: '0.5em' }}
                />
              </div>

              {/* OTP Expiry Info */}
              {otpExpiry && (
                <div className="text-xs text-gray-400 text-center">
                  OTP expires in{' '}
                  <span style={{ color: resendTimer < 120 ? '#ff6b6b' : '#64748B' }}>
                    {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Resend Button */}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || loading}
                className="w-full py-2 text-sm rounded-lg transition"
                style={{
                  color: canResend ? '#00D4FF' : '#64748B',
                  border: `1px solid ${canResend ? '#00D4FF' : '#333'}`,
                  cursor: canResend ? 'pointer' : 'not-allowed',
                  opacity: canResend ? 1 : 0.5,
                }}
              >
                {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
                style={{
                  background: loading ? '#22c55e99' : '#39FF14',
                  color: '#070B14',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading && <Loader size={18} className="animate-spin" />}
                Verify OTP
              </button>
            </form>
          )}

          {/* STEP 3: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#64748B' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-10 pr-10 border border-gray-700 focus:border-green-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: '#64748B' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 pl-10 pr-10 border border-gray-700 focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Password must be at least 6 characters long.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
                style={{
                  background: loading ? '#22c55e99' : '#39FF14',
                  color: '#070B14',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading && <Loader size={18} className="animate-spin" />}
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
