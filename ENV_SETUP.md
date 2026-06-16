# 🔐 Environment Setup Guide

## Important: Keep Secrets Safe! 🚨

Your `.env.local` file contains **SECRET API KEYS** and should **NEVER** be committed to Git.

It's already in `.gitignore` - keep it that way!

---

## ⚙️ Setup Instructions

### Step 1: Create `.env.local` file

In the root directory of the project, create a new file named `.env.local`:

```bash
# On Windows (PowerShell)
New-Item -Path ".env.local" -ItemType File

# On Mac/Linux
touch .env.local
```

### Step 2: Add Your Credentials

Copy the contents from `.env.example` and add your actual credentials.

**YOUR CREDENTIALS** (provided separately):
- Supabase URL and Keys
- Mapbox Tokens
- Twilio Account SID and Auth Token
- OAuth credentials

Example structure:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SECRET_KEY=your_secret_key_here
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_MAPBOX_PERSONAL_TOKEN=your_personal_token_here
VITE_TWILIO_ACCOUNT_SID=your_account_sid_here
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_CLIENT_ID=your_client_id_here
VITE_CLIENT_SECRET=your_client_secret_here
VITE_OAUTH_TOKEN=your_oauth_token_here
VITE_API_BASE_URL=https://your-project.supabase.co/rest/v1
VITE_SOCKET_URL=ws://localhost:3000
```

### Step 3: Verify Setup

Start the dev server and check for errors:

```bash
npm run dev
```

If you see errors about missing env variables, double-check your `.env.local` file.

---

## 🔍 Where to Find Your Credentials

### Supabase

1. Go to https://supabase.com
2. Open your project
3. Click Settings → API
4. Copy:
   - **URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → `VITE_SUPABASE_SECRET_KEY`

### Mapbox

1. Go to https://www.mapbox.com
2. Open your account
3. Go to Tokens page
4. Copy your token → `VITE_MAPBOX_TOKEN`

### Twilio

1. Go to https://www.twilio.com/console
2. Copy:
   - **Account SID** → `VITE_TWILIO_ACCOUNT_SID`
   - **Auth Token** → `VITE_TWILIO_AUTH_TOKEN`

---

## ⚠️ Security Best Practices

✅ **DO:**
- Keep `.env.local` local only
- Never share your tokens publicly
- Rotate tokens regularly
- Use separate tokens for dev and production

❌ **DON'T:**
- Commit `.env.local` to Git
- Paste tokens in chat/emails
- Use production tokens in development
- Expose tokens in client-side code

---

## 🧪 Testing Setup

```bash
# 1. Start dev server
npm run dev

# 2. Check console for errors
# You should see no warnings about missing env variables

# 3. Test Supabase connection
# Log in with demo@example.com

# 4. Test Mapbox
# Map should load on the Tracking page

# 5. Test Twilio
# Send a test SMS from Emergency SOS
```

---

## 🆘 Troubleshooting

### "Missing environment variable"
→ Check `.env.local` is in root directory and has correct variable names

### Map not loading
→ Verify `VITE_MAPBOX_TOKEN` is correct and has map:read permission

### SMS not sending
→ Verify `VITE_TWILIO_ACCOUNT_SID` and `VITE_TWILIO_AUTH_TOKEN` are correct

### Supabase connection fails
→ Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` match your project

---

## 📝 Next Time You Clone

After cloning the repository:

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Add your credentials to .env.local
# (Edit the file with your actual keys)

# 4. Start the app
npm run dev
```

---

**Ready?** Your app is fully configured! 🚀
