import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('📝 Check .env.local file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper function to check auth status
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
};

// Sign up new user
export const signUp = async (email: string, password: string) => {
  try {
    console.log('🔄 Starting signup for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      console.error('❌ Signup error:', error.message);
      throw error;
    }
    
    console.log('✅ Signup successful for:', email);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Signup exception:', error?.message || error);
    return { data: null, error };
  }
};

// Sign in user
export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔄 Starting signin for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('❌ Signin error:', error.message);
      throw error;
    }
    console.log('✅ Signin successful for:', email);
    return { data, error: null };
  } catch (error: any) {
    console.error('❌ Signin exception:', error?.message || error);
    return { data: null, error };
  }
};

// Sign out user
export const signOut = async () => {
  try {
    console.log('🔄 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Signout error:', error.message);
      throw error;
    }
    console.log('✅ Signout successful');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Signout exception:', error?.message || error);
    return { error };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // AuthSessionMissingError is expected when not logged in
      if (error.message?.includes('Auth session missing')) {
        console.log('✅ No active session (user not logged in)');
        return null;
      }
      throw error;
    }
    
    if (user) {
      console.log('✅ User authenticated:', user.email);
    }
    return user;
  } catch (error: any) {
    console.error('Get user error:', error?.message || error);
    return null;
  }
};

// Wait for auth to load (useful on app startup)
export const waitForAuth = async (maxWait = 5000) => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    const session = await checkAuthStatus();
    if (session) return session;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return null;
};
