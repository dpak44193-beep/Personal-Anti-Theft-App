# 🔌 API Integration Guide

## Complete Setup & Usage Documentation

---

## ✅ What's Installed

```
✓ Supabase Client
✓ Twilio SMS
✓ Mapbox GL
✓ Axios for HTTP requests
✓ React Hooks for API calls
✓ Example components
```

---

## 🗂️ File Structure

```
src/
├── services/
│   ├── supabaseClient.ts      # Supabase auth & initialization
│   ├── apiService.ts          # All API endpoints (devices, locations, threats)
│   ├── twilioService.ts       # SMS alerts & calls
│   ├── mapboxService.ts       # Maps & tracking
│   ├── hooks.ts               # React hooks for easy API usage
│   ├── index.ts               # Exports all services
│   └── examples/
│       ├── AuthScreen.tsx     # Login/signup example
│       ├── DashboardWithAPI.tsx     # Dashboard with real data
│       ├── LiveTrackingWithMapbox.tsx # Map tracking
│       └── RemoteControlWithAPI.tsx  # Remote commands
```

---

## 🔐 Environment Variables

All set in `.env.local`:
```env
VITE_SUPABASE_URL=https://xvsjlxbojnewbrozghro.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_SUPABASE_SECRET_KEY=sb_secret_...
VITE_MAPBOX_TOKEN=pk.eyJ1Ijo...
VITE_MAPBOX_PERSONAL_TOKEN=pk.eyJ1Ijo...
VITE_TWILIO_ACCOUNT_SID=AC79d586...
VITE_TWILIO_AUTH_TOKEN=79ed9313...
VITE_CLIENT_ID=OQ1e2445...
VITE_CLIENT_SECRET=nb631Dcj...
VITE_OAUTH_TOKEN=USC6Fu7r...
```

---

## 📱 Quick Start - Using Services in Components

### 1. Authentication

```tsx
import { useAuth } from '../services';

function LoginPage() {
  const { user, signIn, signUp, loading } = useAuth();

  const handleLogin = async () => {
    const { data, error } = await signIn('user@example.com', 'password');
    if (error) console.error(error);
    else console.log('Logged in!', data);
  };

  return (
    <button onClick={handleLogin}>
      {loading ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### 2. Get Devices

```tsx
import { useAuth, useDevices } from '../services';

function DeviceList() {
  const { user } = useAuth();
  const { devices, loading, refetch } = useDevices(user?.id);

  return (
    <div>
      {devices.map(device => (
        <div key={device.id}>{device.name} - Battery: {device.battery}%</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### 3. Live Location Tracking

```tsx
import { useAuth, useDevices, useDeviceLocation } from '../services';
import { mapboxService } from '../services';

function TrackingMap() {
  const { user } = useAuth();
  const { devices } = useDevices(user?.id);
  const device = devices?.[0];
  const { location } = useDeviceLocation(device?.id);

  useEffect(() => {
    if (location) {
      mapboxService.addMarker('device', {
        lnglat: [location.longitude, location.latitude],
        color: '#39FF14',
      });
    }
  }, [location]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
}
```

### 4. Threats & Alerts

```tsx
import { useThreats, useAlerts } from '../services';

function SecurityMonitor({ deviceId }) {
  const { threats, loading, blockThreat } = useThreats(deviceId);
  const { alerts } = useAlerts(deviceId);

  return (
    <div>
      <h3>Threats: {threats.length}</h3>
      {threats.map(threat => (
        <div key={threat.id}>
          <p>{threat.description}</p>
          <button onClick={() => blockThreat(threat.id)}>Block</button>
        </div>
      ))}

      <h3>Alerts: {alerts.length}</h3>
      {alerts.map(alert => (
        <div key={alert.id}>{alert.message}</div>
      ))}
    </div>
  );
}
```

### 5. Remote Control Commands

```tsx
import { useRemoteControl } from '../services';

function RemotePanel({ deviceId }) {
  const { executeCommand, loading } = useRemoteControl(deviceId);

  return (
    <div>
      <button onClick={() => executeCommand('lock')} disabled={loading}>
        🔒 Lock
      </button>
      <button onClick={() => executeCommand('ring')} disabled={loading}>
        📢 Ring
      </button>
      <button onClick={() => executeCommand('wipe')} disabled={loading}>
        ⚠️ Wipe
      </button>
    </div>
  );
}
```

### 6. Send SMS Alerts

```tsx
import { useSMSNotification } from '../services';

function EmergencyAlert({ phoneNumber, location }) {
  const { sendEmergencyAlert } = useSMSNotification();

  const handleAlert = async () => {
    const { data, error } = await sendEmergencyAlert(phoneNumber, location);
    if (error) console.error(error);
    else console.log('Alert sent!');
  };

  return <button onClick={handleAlert}>Send Emergency Alert</button>;
}
```

---

## 🔗 Direct API Calls (Advanced)

### Without React Hooks

```tsx
import { deviceService, locationService, threatService } from '../services';

// Get devices
const { data: devices } = await deviceService.getDevices(userId);

// Get current location
const { data: location } = await locationService.getCurrentLocation(deviceId);

// Add location
await locationService.addLocation({
  device_id: deviceId,
  latitude: 40.7128,
  longitude: -74.0060,
  address: 'New York, NY',
  type: 'current'
});

// Get threats
const { data: threats } = await threatService.getThreats(deviceId);

// Block threat
await threatService.blockThreat(threatId);
```

---

## 🗺️ Mapbox Advanced Usage

```tsx
import { mapboxService } from '../services/mapboxService';

// Initialize
const map = mapboxService.initMap({
  container: 'map-container',
  center: [-74.0060, 40.7128],
  zoom: 12
});

// Add marker
mapboxService.addMarker('device-1', {
  lnglat: [-74.0060, 40.7128],
  color: '#39FF14',
  title: 'Device Location'
});

// Add geofence (500m radius)
mapboxService.addGeofence('home-zone', [-74.0060, 40.7128], 500);

// Draw route
mapboxService.addRoute('path', [
  [-74.0060, 40.7128],
  [-73.9776, 40.7549],
  [-73.9896, 40.7549]
]);

// Fly to location
mapboxService.flyTo({
  center: [-74.0060, 40.7128],
  zoom: 14,
  duration: 1500
});
```

---

## 📞 Twilio Examples

```tsx
import { twilioService } from '../services';

// Send SMS
await twilioService.sendSMS({
  to: '+1234567890',
  body: 'Your device alert!'
});

// Send emergency alert
await twilioService.sendEmergencyAlert('+1234567890', 'Times Square, NYC');

// Send location update
await twilioService.sendLocationSMS(
  '+1234567890',
  '123 Main St, NYC',
  '40.7128° N, 74.0060° W'
);

// Send threat alert
await twilioService.sendThreatAlert('+1234567890', 'Malware detected');
```

---

## 🔄 Real-time Updates

All hooks automatically refresh data at intervals:
- Location: Every 5 seconds
- Threats: Every 10 seconds
- Alerts: Every 5 seconds

Customize by editing `src/services/hooks.ts`

---

## 🚀 Example: Complete Flow

```tsx
import React, { useEffect } from 'react';
import { useAuth, useDevices, useDeviceLocation, useThreats, useRemoteControl } from '../services';
import { mapboxService } from '../services';

function AppDemo() {
  // 1. Authenticate user
  const { user, signIn } = useAuth();

  useEffect(() => {
    if (!user) {
      signIn('demo@example.com', 'password123');
    }
  }, []);

  // 2. Get devices
  const { devices } = useDevices(user?.id);
  const activeDevice = devices?.[0];

  // 3. Track location
  const { location, history } = useDeviceLocation(activeDevice?.id);

  // 4. Monitor threats
  const { threats } = useThreats(activeDevice?.id);

  // 5. Execute commands
  const { executeCommand } = useRemoteControl(activeDevice?.id);

  // 6. Initialize map
  useEffect(() => {
    mapboxService.initMap({ container: 'map' });
  }, []);

  // 7. Update markers
  useEffect(() => {
    if (location) {
      mapboxService.addMarker('device', {
        lnglat: [location.longitude, location.latitude],
        color: '#39FF14'
      });
    }
  }, [location]);

  // 8. Display route
  useEffect(() => {
    if (history.length > 1) {
      mapboxService.addRoute('path', history.map(h => [h.longitude, h.latitude]));
    }
  }, [history]);

  return (
    <div className="h-screen flex">
      {/* Map */}
      <div id="map" className="flex-1" />

      {/* Control Panel */}
      <div className="w-64 p-4 bg-gray-900 text-white">
        <h2>{activeDevice?.name}</h2>
        <p>Battery: {activeDevice?.battery}%</p>
        <p>Threats: {threats.length}</p>
        <button onClick={() => executeCommand('lock')}>Lock</button>
        <button onClick={() => executeCommand('ring')}>Ring</button>
      </div>
    </div>
  );
}

export default AppDemo;
```

---

## 🐛 Troubleshooting

### Mapbox not showing
```tsx
// Make sure token is set
console.log(import.meta.env.VITE_MAPBOX_TOKEN);

// Import CSS
import 'mapbox-gl/dist/mapbox-gl.css';
```

### Supabase connection error
```tsx
// Check credentials
console.log(import.meta.env.VITE_SUPABASE_URL);

// Test connection
import { supabase } from '../services';
const { data, error } = await supabase.auth.getSession();
```

### Twilio SMS not sending
```tsx
// Verify account SID and token
// Check phone numbers are E.164 format: +1234567890
// Ensure account has SMS credits
```

---

## 📚 API Reference

### Services Available

1. **supabaseClient** - Authentication & Supabase setup
2. **apiService** - All CRUD operations
3. **twilioService** - SMS & calls
4. **mapboxService** - Maps & tracking
5. **hooks** - React integration

### Common Patterns

```tsx
// Pattern 1: Use hook (recommended)
const { devices, loading } = useDevices(userId);

// Pattern 2: Direct call
const { data } = await deviceService.getDevices(userId);

// Pattern 3: Real-time with supabase
supabase
  .from('devices')
  .on('*', payload => console.log(payload))
  .subscribe();
```

---

## 🎯 Next Steps

1. ✅ Copy example components to your app
2. ✅ Replace dummy data with API calls
3. ✅ Test authentication flow
4. ✅ Verify map loads correctly
5. ✅ Test SMS alerts
6. ✅ Deploy to production

---

## 📝 Notes

- All API calls are async - use `await` or `.then()`
- Error handling included in all services
- Real-time updates happen automatically
- All tokens in environment variables
- Security: Never expose secret keys in frontend code

---

**Questions?** Check the example components in `src/services/examples/`

Happy building! 🚀
