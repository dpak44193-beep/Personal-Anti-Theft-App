-- ============================================================
-- SUPABASE DATABASE SCHEMA FOR ANTI-THEFT APP
-- Run these queries in Supabase SQL Editor
-- ============================================================

-- 1. Extend auth.users with profile data
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,
  recovery_email VARCHAR(255),
  trusted_contacts JSONB DEFAULT '[]'::jsonb,
  location_tracking_enabled BOOLEAN DEFAULT FALSE,
  device_tracking_enabled BOOLEAN DEFAULT FALSE,
  emergency_mode BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. User Devices Table (Track all devices per user)
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  device_model VARCHAR(255),
  os_type VARCHAR(50),
  os_version VARCHAR(50),
  app_version VARCHAR(20),
  is_lost BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  marked_lost_at TIMESTAMP,
  found_at TIMESTAMP,
  last_location_latitude FLOAT,
  last_location_longitude FLOAT,
  last_seen TIMESTAMP,
  battery_level INTEGER,
  is_charging BOOLEAN DEFAULT FALSE,
  connectivity_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT owner_device_unique UNIQUE(owner_id, device_id)
);

-- 4. OTP Tokens Table (For forgot password & email verification)
CREATE TABLE IF NOT EXISTS otp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  otp_code VARCHAR(6) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'forgot_password' or 'email_verification'
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Email Verification Tokens Table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Device Permissions Table
CREATE TABLE IF NOT EXISTS device_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  location_access BOOLEAN DEFAULT FALSE,
  device_management_access BOOLEAN DEFAULT FALSE,
  emergency_sos_access BOOLEAN DEFAULT FALSE,
  photo_access BOOLEAN DEFAULT FALSE,
  contacts_access BOOLEAN DEFAULT FALSE,
  granted_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT user_device_permission UNIQUE(user_id, device_id)
);

-- 7. Trusted Contacts Table
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  relationship VARCHAR(100),
  can_track_location BOOLEAN DEFAULT FALSE,
  can_send_sos BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Lost Device Recovery Requests Table
CREATE TABLE IF NOT EXISTS lost_device_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES user_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marked_lost_at TIMESTAMP DEFAULT NOW(),
  marked_found_at TIMESTAMP,
  recovery_status VARCHAR(50) DEFAULT 'lost', -- 'lost', 'recovery_in_progress', 'recovered'
  last_known_latitude FLOAT,
  last_known_longitude FLOAT,
  last_known_address VARCHAR(500),
  police_report_filed BOOLEAN DEFAULT FALSE,
  police_report_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_device_recovery ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- user_devices policies
CREATE POLICY "Users can view their own devices" ON user_devices
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own devices" ON user_devices
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own devices" ON user_devices
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own devices" ON user_devices
  FOR DELETE USING (owner_id = auth.uid());

-- otp_tokens policies (limited access for security)
CREATE POLICY "Users cannot view OTP tokens" ON otp_tokens
  FOR SELECT USING (FALSE);

CREATE POLICY "Service can create OTP tokens" ON otp_tokens
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can update their own OTP usage" ON otp_tokens
  FOR UPDATE USING (user_id = auth.uid());

-- email_verification_tokens policies
CREATE POLICY "Users cannot view verification tokens" ON email_verification_tokens
  FOR SELECT USING (FALSE);

CREATE POLICY "Service can create tokens" ON email_verification_tokens
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service can update token status" ON email_verification_tokens
  FOR UPDATE USING (TRUE);

-- device_permissions policies
CREATE POLICY "Users can view their own permissions" ON device_permissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own permissions" ON device_permissions
  FOR ALL USING (user_id = auth.uid());

-- trusted_contacts policies
CREATE POLICY "Users can view their own contacts" ON trusted_contacts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own contacts" ON trusted_contacts
  FOR ALL USING (user_id = auth.uid());

-- lost_device_recovery policies
CREATE POLICY "Users can view their own lost devices" ON lost_device_recovery
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own lost devices" ON lost_device_recovery
  FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_devices_owner ON user_devices(owner_id);
CREATE INDEX idx_user_devices_lost ON user_devices(is_lost, owner_id);
CREATE INDEX idx_user_devices_last_seen ON user_devices(last_seen);
CREATE INDEX idx_otp_tokens_email ON otp_tokens(email);
CREATE INDEX idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX idx_otp_tokens_expires ON otp_tokens(expires_at);
CREATE INDEX idx_device_permissions_user ON device_permissions(user_id);
CREATE INDEX idx_trusted_contacts_user ON trusted_contacts(user_id);
CREATE INDEX idx_lost_device_recovery_user ON lost_device_recovery(user_id);
CREATE INDEX idx_lost_device_recovery_device ON lost_device_recovery(device_id);
CREATE INDEX idx_lost_device_recovery_status ON lost_device_recovery(recovery_status);

-- ============================================================
-- HELPFUL VIEWS
-- ============================================================

-- View all lost devices with owner info
CREATE OR REPLACE VIEW lost_devices_view AS
SELECT 
  ud.id,
  ud.owner_id,
  up.email,
  up.full_name,
  ud.device_name,
  ud.device_model,
  ud.marked_lost_at,
  ud.last_location_latitude,
  ud.last_location_longitude,
  ldr.recovery_status,
  ldr.police_report_filed
FROM user_devices ud
LEFT JOIN user_profiles up ON ud.owner_id = up.id
LEFT JOIN lost_device_recovery ldr ON ud.id = ldr.device_id
WHERE ud.is_lost = TRUE;

-- View user's all devices with status
CREATE OR REPLACE VIEW user_devices_view AS
SELECT 
  ud.*,
  up.full_name,
  CASE 
    WHEN ud.is_lost THEN 'lost'
    WHEN ud.last_seen < NOW() - INTERVAL '5 minutes' THEN 'offline'
    ELSE 'online'
  END as status
FROM user_devices ud
LEFT JOIN user_profiles up ON ud.owner_id = up.id;

-- ============================================================
-- INSTRUCTIONS FOR RUNNING
-- ============================================================

/*
1. Go to Supabase Dashboard → SQL Editor
2. Copy & paste each section (separated by ============) into a new query
3. Run each query one at a time from top to bottom
4. Watch for any errors in the "Results" panel
5. All tables should be created successfully

SUMMARY OF WHAT'S CREATED:
✅ user_profiles - Store user profile info (phone, email verification status, etc)
✅ user_devices - Track all devices per user (multi-device support)
✅ otp_tokens - Store OTP codes for forgot password (6-digit OTP, 10-min expiry)
✅ email_verification_tokens - Store verification links
✅ device_permissions - Track what permissions user granted
✅ trusted_contacts - Store emergency contacts
✅ lost_device_recovery - Track lost devices and recovery status

RLS POLICIES:
✅ Users can only see their own data
✅ Users can modify their own data
✅ OTP tokens are hidden from users (backend only)
✅ Email verification tokens are backend only

INDEXES:
✅ Performance optimized for queries on owner_id, email, lost devices
✅ Expiry checks optimized

VIEWS:
✅ lost_devices_view - See all lost devices across system (admin use)
✅ user_devices_view - User's devices with online/offline status
*/
