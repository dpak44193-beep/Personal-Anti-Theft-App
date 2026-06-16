# 🚨 TROUBLESHOOTING - Signup & Database Errors

## Error: "Could not find table 'public.user_profiles'"

### **Root Cause**
The Supabase database schema hasn't been created yet. You need to run the SQL file to create all tables.

### **Solution (3 steps)**

**Step 1: Open Supabase**
```
1. Go to https://app.supabase.com
2. Login
3. Select project: xvsjlxbojnewbrozghro
4. Click "SQL Editor" (left sidebar)
5. Click "+ New Query"
```

**Step 2: Copy Schema**
```
Copy the entire file: SUPABASE_SCHEMA.sql
Or use: EXECUTE_SCHEMA_GUIDE.md (has the SQL included)
```

**Step 3: Run Query**
```
1. Paste SQL into editor
2. Click blue "RUN" button
3. Wait for "Query successful" ✅
4. Verify tables in "Table Editor"
```

**Expected tables after running:**
```
✓ user_profiles
✓ user_devices
✓ otp_tokens
✓ email_verification_tokens
✓ device_permissions
✓ trusted_contacts
✓ lost_device_recovery
```

---

## Error: "Relation does not exist"

### **Cause**
Same as above - tables not created

### **Solution**
See **"Could not find table"** above

---

## Error: "duplicate key value violates unique constraint"

### **Cause**
You're trying to signup with an email that already exists in the database

### **Solution**
```
Option 1: Use a different email
  test@example.com → test2@example.com

Option 2: Delete the existing user (Supabase)
  1. Go to Supabase → Authentication
  2. Find the user
  3. Click delete (trash icon)
  4. Try signup again

Option 3: Test with random email
  Use: test${Date.now()}@example.com
```

---

## Error: "User not found" at login

### **Cause**
The user doesn't exist in Supabase Auth

### **Solution**
```
1. Check email is correct
2. Make sure you completed signup (didn't just fill form)
3. Verify email was created:
   - Supabase → Authentication → Users
   - Look for your email in list
```

---

## Error: "Email not being sent"

### **Cause**
This is EXPECTED on free tier. Supabase email service is limited.

### **How to See the Email Code**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for message like:
   "📧 Verification email sent to test@example.com"
4. Copy the verification link from the message
5. Paste in browser or use the token manually
```

### **For Production Email Sending**
```
Option 1: Use Supabase Edge Functions
Option 2: Use SendGrid API
Option 3: Use Resend Email Service
Option 4: Use AWS SES
```

---

## Error: "email_verified is undefined"

### **Cause**
The useAuth hook can't find the email verification status

### **Solution**
```
1. Make sure tables were created (see top of this guide)
2. Try logging in again (clear browser cache: Ctrl+Shift+Delete)
3. Check browser console for errors (F12)
4. Restart dev server: 
   - Kill: Ctrl+C
   - Restart: npm run dev
```

---

## Error: "Cannot read property 'id' of null"

### **Cause**
User is null because not logged in

### **Solution**
```
1. Check you're actually logged in
2. Verify signup completed successfully
3. Check localStorage has auth token:
   - F12 → Application → LocalStorage
   - Look for key: "supabase.auth.token" or similar
4. If empty, try signup again
```

---

## Signup Doesn't Work - No Error Message

### **Cause**
Silent failure, likely network or permissions issue

### **Debug Steps**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Look for Network tab
5. Check the POST request to /auth/v1/signup
6. Is the response an error?
```

### **Common Issues**
```
- ❌ Weak password (must be 6+ chars)
- ❌ Invalid email format
- ❌ Email already exists
- ❌ Supabase credentials wrong
- ❌ CORS issue (unlikely with Vercel)
```

### **Solution**
```
If no error message:
1. Check password is 6+ characters
2. Check email format is valid (test@example.com)
3. Check browser console for errors
4. Try with different email
5. Restart dev server (npm run dev)
```

---

## "Verification link doesn't work"

### **Cause**
Token expired or already used

### **Debug**
```
1. Check token from email/console
2. Is it less than 24 hours old? (Tokens expire after 24h)
3. Did you already use this token?
```

### **Solution**
```
Option 1: Get new token
  1. Go to EmailVerificationPage
  2. Click "Resend Email"
  3. Wait 30 seconds
  4. Use new token from console

Option 2: Check if already verified
  1. Go to Supabase Table Editor
  2. Open user_profiles table
  3. Check email_verified_at column
  4. If not NULL, email is verified ✅
  5. Try to login instead of verify
```

---

## Data Not Appearing in Database

### **Cause**
Signup succeeded but data wasn't saved

### **Debug Steps**
```
1. Go to Supabase → Table Editor
2. Open user_profiles table
3. Do you see a row with your email?
   - YES → Data saved ✅ (no problem)
   - NO → Data not saved (problem)

4. Check otp_tokens table
   - Do you see a row for your email?
   - YES → OTP was created
   - NO → Email didn't trigger OTP creation
```

### **Solution**
```
If no data saved:
1. Check RLS policies are enabled:
   - Supabase → Table Editor → user_profiles
   - Click "Policies" tab
   - Should see RLS enabled status
   - If not, run schema again

2. Check for database errors:
   - Supabase → Logs (bottom left)
   - Look for error messages about INSERT or constraints

3. Try with test email again
4. Restart dev server
```

---

## Can't Verify Email - Page Shows "Verification Failed"

### **Cause**
Token is invalid, expired, or already used

### **Debug**
```
1. Check token in URL:
   - Should be: /verify-email?token=abc123...
   - Token should be long (64+ chars)

2. Check if token already used:
   - Go to Supabase → Table Editor
   - Open email_verification_tokens
   - Find your token
   - Check is_used column (should be false)

3. Check if token expired:
   - Check expires_at column
   - Should be 24 hours from creation
```

### **Solution**
```
1. Click "Resend Email" button
2. Get new token from console
3. Use new token URL
4. If still fails, try again in 30 seconds (cooldown)
```

---

## Email Verified But Still Stuck on Verification Page

### **Cause**
App cache not updated or email_verified flag not set

### **Solution**
```
1. Hard refresh browser:
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R
   
2. Clear all cache and cookies:
   - F12 → Application → Clear site data
   - Or Ctrl+Shift+Delete

3. Restart dev server:
   - Kill: Ctrl+C
   - Restart: npm run dev

4. Try login again

5. If still stuck, check database:
   - Supabase → user_profiles
   - Find your email
   - Check email_verified_at (should have timestamp)
```

---

## "Permission Denied" on Signup

### **Cause**
RLS policies are too strict or not set correctly

### **Solution**
```
1. Go to Supabase → Table Editor → user_profiles
2. Click "Policies" tab
3. Make sure these policies exist:
   ✓ "Users can insert own profile"
   ✓ "Users can view own profile"
   ✓ "Users can update own profile"

4. If missing, run schema again:
   - SUPABASE_SCHEMA.sql contains all RLS policies
   - Execute the entire file again
   - It's safe to run multiple times (uses IF NOT EXISTS)
```

---

## Database Tables Exist But Getting "Relation Not Found"

### **Cause**
Table exists but schema/namespace is wrong

### **Solution**
```
1. Verify table exists:
   - Supabase → Table Editor
   - Do you see user_profiles? 
   - Count how many tables

2. Check schema (should be "public"):
   - Click on a table
   - Look at "Schema" dropdown
   - Should say "public"

3. If not in public schema:
   - Delete tables
   - Run schema again
   - Should create in public schema
```

---

## Completely Stuck? Follow This Checklist

```
□ Step 1: Execute Supabase Schema
  - Did you run SUPABASE_SCHEMA.sql?
  - Are all 7 tables visible?
  - Can you see data in tables?

□ Step 2: Check Environment Variables
  - Does .env.local exist?
  - Does it have all 7 variables?
  - Are values correct (not placeholders)?

□ Step 3: Restart Everything
  - Kill dev server (Ctrl+C)
  - Clear browser cache (Ctrl+Shift+R)
  - npm run dev
  - Try again

□ Step 4: Check Browser Console
  - F12 → Console tab
  - Any red errors?
  - Any orange warnings?
  - What do they say?

□ Step 5: Check Supabase Logs
  - Supabase Dashboard
  - Bottom left: Logs
  - Any errors about your email?

□ Step 6: Create New Test Account
  - Try with completely new email
  - Example: test${Date.now()}@gmail.com
  - Does it work? If YES → problem is database state

□ Step 7: Clean Start
  - Delete your test user from Supabase
  - Clear browser localStorage
  - Try signup again from scratch
```

---

## Getting Help

**Before asking for help, collect this info:**

```
1. What exact error message do you see?
   (Copy-paste from screen or console)

2. What step are you on?
   (Signup, email verify, login, etc)

3. Browser console errors (F12)?
   (Screenshot or copy-paste)

4. Supabase table check:
   - Can you see user_profiles in Table Editor?
   - Can you see your test email data?

5. What you've already tried:
   (Restarting, cache clear, etc)
```

---

## Quick Fix Commands

```bash
# Restart dev server
Ctrl+C (to stop)
npm run dev (to start)

# Clear all cache
In browser: Ctrl+Shift+Delete

# Hard refresh
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Check build for errors
npm run build

# Reinstall dependencies
npm install

# Clear node_modules and cache
rm -rf node_modules package-lock.json
npm install
```

---

## Still Not Working?

1. ✅ Verify you executed the schema (see top of this guide)
2. ✅ Check all environment variables in .env.local
3. ✅ Make sure tables exist in Supabase
4. ✅ Clear cache and restart everything
5. ✅ Try with completely new email address
6. ✅ Check browser console for errors
7. ✅ Check Supabase logs for errors

If still stuck, provide:
- Error message (exact text)
- What you're trying to do
- Browser console output
- Whether tables exist in Supabase

Then we can debug further! 🚀
