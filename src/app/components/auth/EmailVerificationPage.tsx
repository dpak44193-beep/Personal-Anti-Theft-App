import React, { useState, useEffect } from 'react';
import { Mail, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

export interface EmailVerificationPageProps {
  email: string;
  onVerificationComplete?: () => void;
}

export const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({
  email,
  onVerificationComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');

  // Check URL for verification token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      handleVerifyEmail(token);
    }

    // Enable resend after 30 seconds
    const timer = setTimeout(() => {
      setCanResend(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Handle email verification with token
  const handleVerifyEmail = async (token: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await authService.verifyEmailWithToken(token);

      if (!result.success) {
        setError(result.message || 'Email verification failed');
        setLoading(false);
        return;
      }

      setSuccess('Email verified successfully! Redirecting...');
      setVerificationToken(token);

      setTimeout(() => {
        onVerificationComplete?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setCanResend(false);

    try {
      const result = await authService.resendVerificationEmail(email);

      if (!result.success) {
        setError(result.message || 'Failed to resend verification email');
        setCanResend(true);
        setLoading(false);
        return;
      }

      setSuccess('Verification email sent! Check your inbox.');

      // Start resend timer
      let timer = 30;
      const interval = setInterval(() => {
        timer--;
        setResendTimer(timer);

        if (timer <= 0) {
          clearInterval(interval);
          setCanResend(true);
          setResendTimer(0);
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: '#070B14' }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-700 p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0, 212, 255, 0.1)', border: '2px solid #00D4FF' }}
            >
              <Mail size={32} style={{ color: '#00D4FF' }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E2E8F0' }}>
              Verify Your Email
            </h1>
            <p className="text-gray-400 text-sm">
              We sent a verification link to<br />
              <strong style={{ color: '#CBD5E1' }}>{email}</strong>
            </p>
          </div>

          {/* Success State */}
          {success && (
            <div
              className="p-4 rounded-lg border flex items-start gap-3"
              style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e' }}
            >
              <CheckCircle size={18} style={{ color: '#22c55e' }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm" style={{ color: '#86efac' }}>
                {success}
              </p>
            </div>
          )}

          {/* Error State */}
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

          {/* Instructions */}
          <div
            className="p-4 rounded-lg"
            style={{ background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.1)' }}
          >
            <h3 className="font-semibold text-white mb-3">What's next?</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>
                <span style={{ color: '#00D4FF' }}>1.</span> Check your email inbox for a verification
                link
              </li>
              <li>
                <span style={{ color: '#00D4FF' }}>2.</span> Click the link to verify your email
              </li>
              <li>
                <span style={{ color: '#00D4FF' }}>3.</span> You'll be automatically redirected back here
              </li>
            </ol>
          </div>

          {/* Auto-detect token from URL */}
          {verificationToken && (
            <div
              className="p-4 rounded-lg border flex items-center gap-3"
              style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: '#22c55e' }}
            >
              <CheckCircle size={20} style={{ color: '#22c55e' }} />
              <div>
                <p className="font-semibold text-white text-sm">Email Verified!</p>
                <p className="text-xs text-gray-400">Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {/* Resend Button */}
          {!verificationToken && (
            <div className="space-y-3">
              <p className="text-xs text-center text-gray-400">Didn't receive the email?</p>
              <button
                onClick={handleResendEmail}
                disabled={!canResend || loading}
                className="w-full py-3 font-semibold rounded-lg transition"
                style={{
                  background: canResend && !loading ? 'transparent' : 'transparent',
                  border: `2px solid ${canResend && !loading ? '#00D4FF' : '#333'}`,
                  color: canResend && !loading ? '#00D4FF' : '#666',
                  cursor: canResend && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {canResend ? 'Resend Verification Email' : `Resend in ${resendTimer}s`}
              </button>
            </div>
          )}

          {/* Help Text */}
          <div className="text-center text-xs text-gray-500 space-y-2">
            <p>💡 Check your spam/junk folder if you don't see the email</p>
            <p>🔒 The verification link expires in 24 hours</p>
          </div>

          {/* Additional Info */}
          <div
            className="p-4 rounded-lg"
            style={{ background: 'rgba(255, 159, 0, 0.05)', border: '1px solid rgba(255, 159, 0, 0.2)' }}
          >
            <p className="text-xs text-gray-400">
              <strong style={{ color: '#FFB800' }}>Why verify your email?</strong> Email verification
              ensures only legitimate users can access Anti-Theft and helps protect your account from
              unauthorized access.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl mb-2">🗺️</p>
            <p className="text-xs text-gray-400">Live GPS Tracking</p>
          </div>
          <div>
            <p className="text-2xl mb-2">🔒</p>
            <p className="text-xs text-gray-400">Remote Lock/Wipe</p>
          </div>
          <div>
            <p className="text-2xl mb-2">🚨</p>
            <p className="text-xs text-gray-400">Emergency SOS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
