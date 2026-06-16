# 🗄️ EXECUTE SUPABASE SCHEMA - Step by Step

## ⚠️ Why You're Getting This Error

```
Could not find the table 'public.user_profiles' in the schema cache
```

**Reason:** The database tables haven't been created yet. The `SUPABASE_SCHEMA.sql` file contains the SQL code to create all tables, but it needs to be executed in your Supabase dashboard.

---

## 🚀 Step 1: Open Supabase Dashboard

1. Go to **[Supabase Dashboard](https://app.supabase.com)**
2. Login with your account
3. Select your project: **Personal-Anti-Theft-App** (xvsjlxbojnewbrozghro)

---

## 🛠️ Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click the **"+ New Query"** button (top right)
3. You should see a blank SQL editor panel

---

## 📋 Step 3: Copy the Schema SQL

**Option A: Copy from File**
1. Open the file: `SUPABASE_SCHEMA.sql` (in your project root)
2. Select ALL the SQL code (Ctrl+A)
3. Copy it (Ctrl+C)

**Option B: Use This Complete Schema**

Copy and paste this entire SQL into your Supabase SQL editor:

```sql
-- ============================================================
-- SUPABASE DATABASE SCHEMA FOR ANTI-THEFT APP
-- Run this entire script in Supabase SQL Editor
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
  type VARCHAR(50) NOT NULL,
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
  relationship VARCHAR(50),
  can_track_location BOOLEAN DEFAULT FALSE,
  can_send_sos BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Lost Device Recovery Table
CREATE TABLE IF NOT EXISTS lost_device_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  marked_lost_at TIMESTAMP NOT NULL,
  marked_found_at TIMESTAMP,
  recovery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'recovered', 'not_found'
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
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_devices policies
CREATE POLICY "Users can view own devices" ON user_devices FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can update own devices" ON user_devices FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own devices" ON user_devices FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- otp_tokens policies (backend only - no user select)
CREATE POLICY "OTP tokens backend only" ON otp_tokens FOR SELECT USING (FALSE);

-- email_verification_tokens policies (backend only)
CREATE POLICY "Verification tokens backend only" ON email_verification_tokens FOR SELECT USING (FALSE);

-- device_permissions policies
CREATE POLICY "Users can view own permissions" ON device_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own permissions" ON device_permissions FOR ALL USING (auth.uid() = user_id);

-- trusted_contacts policies
CREATE POLICY "Users can view own contacts" ON trusted_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contacts" ON trusted_contacts FOR ALL USING (auth.uid() = user_id);

-- lost_device_recovery policies
CREATE POLICY "Users can view own lost devices" ON lost_device_recovery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own lost devices" ON lost_device_recovery FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_devices_owner ON user_devices(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_is_lost ON user_devices(is_lost);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_email ON otp_tokens(email);
CREATE INDEX IF NOT EXISTS idx_otp_tokens_expires ON otp_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_device_permissions_user ON device_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_lost_device_user ON lost_device_recovery(user_id);

-- ============================================================
-- SCHEMA CREATED SUCCESSFULLY
-- ============================================================
```

---

## 4️⃣ Step 4: Paste into SQL Editor

1. Click in the SQL editor text area
2. Paste the SQL (Ctrl+V)
3. You should see all the CREATE TABLE statements

---

## ▶️ Step 5: Execute the Schema

1. Click the **blue "Run" button** (bottom right of the editor, or press Ctrl+Enter)
2. Wait for execution (~5-10 seconds)
3. You should see: ✅ **Query successful** (bottom of screen)

---

## ✅ Step 6: Verify Tables Created

1. In the left sidebar, click **"Table Editor"**
2. You should see these tables:
   - ✅ `user_profiles`
   - ✅ `user_devices`
   - ✅ `otp_tokens`
   - ✅ `email_verification_tokens`
   - ✅ `device_permissions`
   - ✅ `trusted_contacts`
   - ✅ `lost_device_recovery`

3. Click each table to verify columns are created correctly

---

## 🧪 Step 7: Test Signup Again

1. Go back to your app: `http://localhost:5173`
2. Click **"Sign Up"**
3. Enter test data:
   - Email: `test@example.com`
   - Password: `Test1234`
   - Full Name: `Test User`
   - Phone: `+12345678901`
4. Click **"Sign Up"**
5. You should see: ✅ **"Account created successfully! Check your email to verify."**

---

## 🔒 Step 8: Enable Email Verification Requirement

The app **already has email verification enforced** in `App.tsx`. Here's how it works:

```
1. User signs up
   ↓
2. Must verify email (click link in email)
   ↓
3. Must grant permissions (location, device)
   ↓
4. Can access Dashboard
```

**This is already implemented!** The flow is:
- `LoginPage` → Signup with email
- `EmailVerificationPage` → Verify email
- `PermissionsScreen` → Grant permissions
- `Dashboard` → Full app access

---

## ❌ Common Issues

### **Issue: "Could not find table 'public.user_profiles'"**
- **Solution:** You haven't run the SQL schema yet. Follow Step 3-5 above.

### **Issue: "Relation does not exist"**
- **Solution:** Wait a moment and refresh Supabase. Tables take 2-3 seconds to appear.

### **Issue: "Duplicate key value violates unique constraint"**
- **Solution:** Email already exists. Use a different email for testing.

### **Issue: "Email not being sent"**
- **Solution:** This is expected on free tier. Check browser console to see the OTP code logged.

---

## 📊 Database Status Checklist

After executing the schema:

- [ ] Tables created in Supabase
- [ ] All 7 tables visible in Table Editor
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] User can sign up
- [ ] User data stored in `user_profiles`
- [ ] Device data stored in `user_devices`
- [ ] Email verification required to login
- [ ] App runs without "table not found" errors

---

## 🎯 What Happens After Schema Execution

1. **User Signs Up**
   - Data saved to `user_profiles` table ✅
   - Auth user created in `auth.users` ✅
   
2. **Email Verification**
   - Token saved to `email_verification_tokens` table ✅
   - User must verify email ✅

3. **Login with Verified Email Only**
   - Check email_verified = true ✅
   - Grant permissions ✅
   - Access dashboard ✅

4. **Multi-Device Support**
   - Each device saved to `user_devices` table ✅
   - Permissions tracked in `device_permissions` ✅

5. **Lost Device Tracking**
   - Mark device as lost ✅
   - Data saved to `lost_device_recovery` ✅
   - Location tracking enabled ✅

---

## 🚀 After Schema is Created

Once tables are created:

1. **Test signup**: `npm run dev` → Signup → Verify email ✅
2. **Test login**: Login only works after email verification ✅
3. **Deploy to Vercel**: Execute same schema on Vercel's database ✅
4. **Go live**: Your app is ready! 🎉

---

**Next: Execute this schema in Supabase, then come back to test!**

**Estimated Time: 5 minutes**
