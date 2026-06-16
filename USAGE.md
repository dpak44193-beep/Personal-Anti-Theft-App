# 🚀 Quick Start Guide - Personal Anti-Theft App

## Installation & Setup

### Prerequisites
- Node.js 18+ or npm 9+
- pnpm (optional, but recommended)

### Quick Start (2 minutes)

```bash
# 1. Install dependencies
npm install
# OR
pnpm install

# 2. Start development server
npm run dev
# OR
pnpm dev

# 3. Open in browser
# Navigate to http://localhost:5173
```

### Build for Production
```bash
npm run build
# OR
pnpm build
```

---

## 📱 App User Flow

### First-Time User
1. **Register/Login** → Create account with email
2. **Pair Device** → Link smartphone via recovery code
3. **Dashboard** → View security overview
4. **Settings** → Configure notifications & zones

### Daily Usage

#### Monitor Device Security
- **Dashboard** → Check security score & alerts
- **Security Monitor** → Review threats
- **Live Tracking** → Track device location

#### Set Up Protection
- **Settings** → Create geofence zones (home, work)
- **Emergency SOS** → Configure emergency contacts

#### If Device is Lost/Stolen
1. **Live Tracking** → Locate device
2. **Remote Control** → Lock device immediately
3. **Emergency SOS** → Contact police
4. **Recovery Center** → Initiate recovery process
5. **Evidence Vault** → Collect forensic data

---

## 🔧 Environment Setup

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.yourserver.com
VITE_AUTH_ENDPOINT=https://auth.yourserver.com
VITE_MAPBOX_TOKEN=your_mapbox_api_key
VITE_SOCKET_URL=wss://socket.yourserver.com
```

---

## 🎨 UI Components

All UI components are built with **shadcn/ui** and **Tailwind CSS**.
Located in: `src/app/components/ui/`

Common components used:
- Buttons, Cards, Dialogs
- Forms, Inputs, Selectors
- Alerts, Badges, Toasts

---

## 📦 Project Structure

```
src/
├── main.tsx              # App entry point
├── app/
│   ├── App.tsx          # Main app shell
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── LiveTracking.tsx
│   │   ├── RemoteControl.tsx
│   │   ├── SecurityMonitor.tsx
│   │   ├── EvidenceVault.tsx
│   │   ├── RecoveryCenter.tsx
│   │   ├── EmergencySOS.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── Sidebar.tsx
│   │   └── ui/          # shadcn components
│   └── components/figma/
└── styles/              # Global styles & themes
```

---

## 🌙 Theme & Styling

- **Dark Mode** by default (#070B14 background)
- **Font**: Inter + JetBrains Mono (for data)
- **Color Scheme**: Neon Green (#39FF14), Warning Orange (#FF9F00)
- **Responsive Design**: Mobile-first approach

---

## 🚨 Key Features at a Glance

| Feature | Purpose | Access |
|---------|---------|--------|
| **Live Tracking** | Real-time GPS tracking | Tracking tab |
| **Remote Control** | Lock/wipe/ring device | Remote Control tab |
| **Security Monitor** | Threat detection | Security tab |
| **Evidence Vault** | Store forensic data | Evidence tab |
| **Emergency SOS** | Crisis alerts | SOS tab |
| **Recovery Center** | Device recovery | Recovery tab |

---

## 🔑 Core APIs You'll Need

See [API_REQUIREMENTS.md](./API_REQUIREMENTS.md) for complete API reference.

**Essential APIs:**
- Authentication (login, register)
- Device management (register, status)
- Location tracking (current, history)
- Remote control (lock, wipe, ring)
- Threat alerts (security monitoring)

---

## 📝 Development Tips

- Use React hooks for state management
- Components are modular and screen-based
- Styling uses Tailwind CSS utility classes
- Dark theme colors predefined in globals.css

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5173
kill -9 <PID>
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Vite cache
rm -rf dist .vite
npm run build
```

---

## 📞 Next Steps

1. **Set up backend APIs** using [API_REQUIREMENTS.md](./API_REQUIREMENTS.md)
2. **Configure environment variables** in `.env`
3. **Test API integration** with live device data
4. **Deploy** to production

---

**Ready to integrate?** Share your API endpoints! 🚀
