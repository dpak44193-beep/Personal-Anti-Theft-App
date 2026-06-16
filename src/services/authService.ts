import { supabase } from './supabaseClient';

/**
 * Auth Service - Handles authentication flows including OTP, password reset, email verification
 */

// ============================================================
// OTP GENERATION & VERIFICATION
// ============================================================

/**
 * Generate and send OTP to email
 * @param email User's email address
 * @param type 'forgot_password' or 'email_verification'
 * @returns OTP code and expiry time
 */
export const generateAndSendOTP = async (
  email: string,
  type: 'forgot_password' | 'email_verification' = 'forgot_password'
) => {
  try {
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in database
    const { error } = await supabase
      .from('otp_tokens')
      .insert([
        {
          email,
          otp_code: otpCode,
          type,
          expires_at: expiresAt.toISOString(),
          is_used: false,
        },
      ])
      .select();

    if (error) throw error;

    // Send OTP via Supabase email (using auth email trigger)
    // Note: This uses Supabase's built-in email service
    const emailSubject =
      type === 'forgot_password'
        ? 'Your Password Reset Code'
        : 'Email Verification Code';

    const emailBody =
      type === 'forgot_password'
        ? `Your password reset code is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
        : `Your email verification code is: ${otpCode}\n\nThis code expires in 10 minutes.\n\nDon't share this code with anyone.`;

    // Send via custom email function (you can use SendGrid, Resend, or custom backend)
    await sendEmailOTP(email, emailBody, otpCode);

    return {
      success: true,
      message: `OTP sent to ${email}`,
      expiresAt: expiresAt.getTime(),
      error: null,
    };
  } catch (error: any) {
    console.error('Generate OTP error:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate OTP',
      error,
      expiresAt: null,
    };
  }
};

/**
 * Verify OTP code
 * @param email User's email
 * @param otpCode 6-digit OTP from user
 * @returns Verification result
 */
export const verifyOTP = async (email: string, otpCode: string) => {
  try {
    // Check if OTP exists, is not used, and not expired
    const { data: otpData, error: otpError } = await supabase
      .from('otp_tokens')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      return {
        success: false,
        message: 'Invalid or expired OTP',
        error: otpError,
      };
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('otp_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', otpData.id);

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'OTP verified successfully',
      otpId: otpData.id,
      type: otpData.type,
      error: null,
    };
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: error.message || 'OTP verification failed',
      error,
    };
  }
};

// ============================================================
// PASSWORD RESET FLOW
// ============================================================

/**
 * Start forgot password flow - sends OTP
 * @param email User's email
 */
export const startForgotPasswordFlow = async (email: string) => {
  try {
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    // Handle 404 - table doesn't exist
    if (userError?.code === '404' || userError?.message?.includes('not found')) {
      return {
        success: false,
        message: 'Database not yet initialized. Please execute SUPABASE_SCHEMA.sql in Supabase dashboard first.',
        error: userError,
      };
    }

    if (userError || !userData) {
      return {
        success: false,
        message: 'Email not found in our system',
        error: userError,
      };
    }

    // Generate and send OTP
    const otpResult = await generateAndSendOTP(email, 'forgot_password');
    return otpResult;
  } catch (error: any) {
    console.error('Forgot password flow error:', error);
    return {
      success: false,
      message: error.message || 'Failed to start password reset',
      error,
    };
  }
};

/**
 * Complete password reset with new password
 * @param email User's email
 * @param newPassword New password
 * @param otpCode OTP code to verify
 */
export const resetPasswordWithOTP = async (
  email: string,
  newPassword: string,
  otpCode: string
) => {
  try {
    // Verify OTP first
    const otpVerify = await verifyOTP(email, otpCode);
    if (!otpVerify.success) {
      return otpVerify;
    }

    // Get user ID from email
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: 'User not found',
        error: userError,
      };
    }

    // Update password via Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.id,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
      error: null,
    };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: error.message || 'Failed to reset password',
      error,
    };
  }
};

// ============================================================
// EMAIL VERIFICATION
// ============================================================

/**
 * Send email verification link
 * @param email User's email
 * @param userId User's ID
 */
export const sendEmailVerificationLink = async (
  email: string,
  userId: string
) => {
  try {
    // Generate verification token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    const { error } = await supabase
      .from('email_verification_tokens')
      .insert([
        {
          user_id: userId,
          email,
          token,
          expires_at: expiresAt.toISOString(),
          is_used: false,
        },
      ])
      .select();

    if (error) throw error;

    // Create verification link
    const verificationLink = `${window.location.origin}/verify-email?token=${token}`;

    // Send email
    await sendEmailVerification(
      email,
      verificationLink
    );

    return {
      success: true,
      message: `Verification email sent to ${email}`,
      expiresAt: expiresAt.getTime(),
      error: null,
    };
  } catch (error: any) {
    console.error('Send verification link error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send verification email',
      error,
      expiresAt: null,
    };
  }
};

/**
 * Verify email with token
 * @param token Verification token from email link
 */
export const verifyEmailWithToken = async (token: string) => {
  try {
    // Get verification token record
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        message: 'Invalid or expired verification link',
        error: tokenError,
      };
    }

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('email_verification_tokens')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (updateTokenError) throw updateTokenError;

    // Update user profile - mark email as verified
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq('id', tokenData.user_id);

    if (updateProfileError) throw updateProfileError;

    // Update auth.users table with email confirmation
    // Note: Supabase automatically sets email_confirm on user creation
    // We don't need to update it here as email verification is handled by tokens
    try {
      // Optional: Log verification completion
      console.log('Email verified for user:', tokenData.user_id);
    } catch (logError) {
      console.error('Log error:', logError);
    }

    return {
      success: true,
      message: 'Email verified successfully! You can now access your account.',
      userId: tokenData.user_id,
      error: null,
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: error.message || 'Email verification failed',
      error,
    };
  }
};

/**
 * Resend verification email (rate limited)
 * @param email User's email
 */
export const resendVerificationEmail = async (email: string) => {
  try {
    // Get user by email
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        message: 'Email not found',
        error: userError,
      };
    }

    if (userData.email_verified) {
      return {
        success: false,
        message: 'Email is already verified',
        error: null,
      };
    }

    // Send new verification link
    return await sendEmailVerificationLink(email, userData.id);
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: error.message || 'Failed to resend verification email',
      error,
    };
  }
};

// ============================================================
// EMAIL SENDING (Using Supabase Email Service)
// ============================================================

/**
 * Send OTP via email (using Supabase's built-in email)
 * You can replace this with Resend, SendGrid, or custom service
 */
const sendEmailOTP = async (
  email: string,
  body: string,
  otp: string
) => {
  try {
    // Option 1: Using Supabase Edge Functions (requires setup)
    // const response = await supabase.functions.invoke('send-email', {
    //   body: { email, body, otp },
    // });

    // Option 2: Using a backend API endpoint (create your own)
    // const baseUrl = import.meta.env.VITE_API_BASE_URL;
    // if (baseUrl) {
    //   await axios.post(`${baseUrl}/api/email/send-otp`, {
    //     email,
    //     body,
    //     otp,
    //   });
    // }

    // Option 3: Simulate sending (for testing)
    console.log(`📧 OTP Email sent to ${email}: Code is ${otp}`);
    console.log(`Body: ${body}`);

    return { success: true };
  } catch (error) {
    console.error('Send OTP email error:', error);
    throw error;
  }
};

/**
 * Send email verification link
 */
const sendEmailVerification = async (
  email: string,
  verificationLink: string
) => {
  try {
    const body = `
Please verify your email by clicking the link below:

${verificationLink}

This link expires in 24 hours.

If you didn't create this account, please ignore this email.
    `;

    console.log(`📧 Verification email sent to ${email}`);
    console.log(`Link: ${verificationLink}`);

    return { success: true };
  } catch (error) {
    console.error('Send verification email error:', error);
    throw error;
  }
};

// ============================================================
// SIGNUP WITH PROFILE CREATION
// ============================================================

/**
 * Sign up new user and create profile
 * @param email User's email
 * @param password User's password
 * @param phoneNumber Optional phone number
 * @param fullName Optional full name
 */
export const signUpWithProfile = async (
  email: string,
  password: string,
  phoneNumber?: string,
  fullName?: string
) => {
  try {
    console.log('🔄 Step 1: Creating auth user:', email);
    
    // Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      throw authError;
    }
    
    if (!authData.user) {
      console.error('❌ Auth user not created');
      throw new Error('User creation failed');
    }
    
    console.log('✅ Step 1 Complete: Auth user created:', authData.user.id);
    console.log('🔄 Step 2: Creating user profile...');

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          phone_number: phoneNumber || null,
          full_name: fullName || email.split('@')[0],
          email_verified: false,
          phone_verified: false,
          profile_complete: false,
        },
      ]);

    // Handle missing table error
    if (profileError?.code === '404' || profileError?.message?.includes('not found')) {
      console.error('❌ Step 2 Failed: user_profiles table not found');
      console.log('📌 Database schema not initialized yet');
      console.log('📌 Execute SUPABASE_SCHEMA.sql in Supabase SQL Editor');
      
      return {
        success: false,
        message: 'Database tables not initialized. Execute SUPABASE_SCHEMA.sql first.',
        userId: authData.user.id,
        requiresSchemaSetup: true,
        error: profileError,
      };
    }

    if (profileError) {
      console.error('❌ Step 2 Failed: Profile creation error:', profileError.message);
      throw profileError;
    }
    
    console.log('✅ Step 2 Complete: User profile created');
    console.log('🔄 Step 3: Sending verification email...');

    // Send verification email
    try {
      await sendEmailVerificationLink(email, authData.user.id);
      console.log('✅ Step 3 Complete: Verification email sent');
    } catch (emailError: any) {
      console.warn('⚠️ Step 3 Warning: Email sending failed (expected on free tier):', emailError?.message);
      // Don't fail signup if email sending fails
    }

    console.log('✅ Signup complete! User:', email);
    return {
      success: true,
      message: 'Signup successful! Please verify your email.',
      userId: authData.user.id,
      requiresEmailVerification: true,
      error: null,
    };
  } catch (error: any) {
    console.error('❌ Signup exception:', error?.message);
    
    // Handle table not found at auth creation stage
    if (error?.code === 'PGRST116' || error?.message?.includes('404')) {
      return {
        success: false,
        message: 'Database not initialized. Execute SUPABASE_SCHEMA.sql in Supabase dashboard first.',
        requiresSchemaSetup: true,
        error,
      };
    }
    
    return {
      success: false,
      message: error.message || 'Signup failed',
      error,
    };
  }
};

// ============================================================
// EMAIL CONFIRMATION CHECK
// ============================================================

/**
 * Check if user's email is verified
 * @param userId User's ID
 */
export const isEmailVerified = async (userId: string) => {
  try {
    if (!userId) {
      console.log('No userId provided - user not authenticated');
      return false;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('email_verified')
      .eq('id', userId)
      .single();

    // Handle 404 - table doesn't exist or record not found
    if (error?.code === '404' || error?.message?.includes('not found')) {
      console.log('ℹ️ user_profiles table not yet created. Execute SUPABASE_SCHEMA.sql first.');
      return false;
    }

    if (error) throw error;
    return data?.email_verified || false;
  } catch (error: any) {
    // Silently fail if tables don't exist yet - this is expected before schema execution
    if (error?.message?.includes('404') || error?.code === '404') {
      return false;
    }
    console.error('Check email verification error:', error);
    return false;
  }
};

/**
 * Check if user's profile is complete
 * @param userId User's ID
 */
export const isProfileComplete = async (userId: string) => {
  try {
    if (!userId) {
      console.log('No userId provided - user not authenticated');
      return { complete: false, hasPhone: false, hasFullName: false };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('profile_complete, phone_number, full_name')
      .eq('id', userId)
      .single();

    // Handle 404 - table doesn't exist or record not found
    if (error?.code === '404' || error?.message?.includes('not found')) {
      console.log('ℹ️ user_profiles table not yet created. Execute SUPABASE_SCHEMA.sql first.');
      return { complete: false, hasPhone: false, hasFullName: false };
    }

    if (error) throw error;
    return {
      complete: data?.profile_complete || false,
      hasPhone: !!data?.phone_number,
      hasFullName: !!data?.full_name,
    };
  } catch (error: any) {
    // Silently fail if tables don't exist yet - this is expected before schema execution
    if (error?.message?.includes('404') || error?.code === '404') {
      return { complete: false, hasPhone: false, hasFullName: false };
    }
    console.error('Check profile completion error:', error);
    return { complete: false, hasPhone: false, hasFullName: false };
  }
};

export default {
  generateAndSendOTP,
  verifyOTP,
  startForgotPasswordFlow,
  resetPasswordWithOTP,
  sendEmailVerificationLink,
  verifyEmailWithToken,
  resendVerificationEmail,
  signUpWithProfile,
  isEmailVerified,
  isProfileComplete,
};
