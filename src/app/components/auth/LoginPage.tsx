import React, { useState } from 'react';
import { AlertCircle, Loader, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../services/hooks';

export interface LoginPageProps {
  onLoginSuccess?: () => void;
  onSignUpClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSignUpClick,
  onForgotPasswordClick,
}) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await signIn(email, password);
      
      if (authError) {
        setError(authError.message || 'Sign in failed');
        setLoading(false);
        return;
      }

      // Clear form
      setEmail('');
      setPassword('');
      setShowPassword(false);

      // Callback
      onLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, phoneNumber, fullName);

      if (!result.success) {
        // Check if this is a schema setup error
        if (result.requiresSchemaSetup) {
          setError(
            '⚠️ Database not initialized.\n\n' +
            'Steps to fix:\n' +
            '1. Go to Supabase Dashboard\n' +
            '2. Click SQL Editor → New Query\n' +
            '3. Copy entire SUPABASE_SCHEMA.sql\n' +
            '4. Click Run\n\n' +
            'See EXECUTE_SCHEMA_GUIDE.md for details'
          );
        } else {
          setError(result.message || 'Sign up failed');
        }
        setLoading(false);
        return;
      }

      // Success - show message and guide to email verification
      setError('');
      alert(
        'Account created successfully! You can now log in.'
      );

      // Clear form and switch back to login
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhoneNumber('');
      setFullName('');
      setIsSignUp(false);
      setShowPassword(false);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
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
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: '#39FF14', textShadow: '0 0 20px rgba(57,255,20,0.3)' }}
            >
              Anti-Theft
            </h1>
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Create your secure account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-4 rounded-lg border flex items-start gap-3"
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}
            >
              <AlertCircle size={18} style={{ color: '#ef4444' }} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm whitespace-pre-wrap" style={{ color: '#fca5a5' }}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: '#64748B' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password (Sign Up only) */}
            {isSignUp && (
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 font-semibold transition flex items-center justify-center gap-2"
              style={{
                background: loading ? '#22c55e99' : '#39FF14',
                color: '#070B14',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password Link (Login only) */}
          {!isSignUp && (
            <div className="text-center">
              <button
                onClick={onForgotPasswordClick}
                className="text-sm hover:underline"
                style={{ color: '#00D4FF' }}
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setShowPassword(false);
                }}
                className="font-semibold hover:opacity-80 transition"
                style={{ color: '#39FF14' }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
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

export default LoginPage;
