import React, { useState } from 'react';
import { useAuth } from '../services';
import { AlertCircle, Loader } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess?: () => void }) => {
  const { user, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const { data, error: authError } = await signUp(email, password);
        if (authError) {
          setError(authError.message || 'Sign up failed');
        } else {
          setError('Check your email to confirm signup!');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        const { data, error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError.message || 'Sign in failed');
        } else {
          setEmail('');
          setPassword('');
          onAuthSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#070B14' }}>
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background: '#070B14' }}>
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-700 p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Anti-Theft</h1>
            <p className="text-gray-400">{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded bg-red-900/20 border border-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-gray-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-gray-600 focus:outline-none"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-800 text-white rounded px-3 py-2 border border-gray-700 focus:border-gray-600 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-green-400 hover:text-green-300 font-semibold transition"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">🗺️</p>
            <p className="text-xs text-gray-400 mt-2">Live GPS Tracking</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">🔒</p>
            <p className="text-xs text-gray-400 mt-2">Remote Lock/Wipe</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">🚨</p>
            <p className="text-xs text-gray-400 mt-2">Emergency SOS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
