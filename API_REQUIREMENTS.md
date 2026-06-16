# Personal Anti-Theft App - API Requirements & Usage Guide

## App Overview
A comprehensive device security and anti-theft application with real-time GPS tracking, remote device control, emergency alerts, and forensic evidence collection.

---

## 🎯 App Features & Screens

### 1. **Dashboard** - Security Overview
- Real-time security score (0-100)
- Active threats counter
- Recent activity timeline
- Device status (battery, connectivity, location)
- Alert history

### 2. **Live Tracking** - GPS Location
- Real-time device location on map
- Location history with timestamps
- Address lookup and coordinates
- Location zones (home, work, transit)
- Movement tracking with pulsing indicators

### 3. **Remote Control** - Device Management
- Remote lock/unlock
- Wipe device data
- Ring device alarm
- Turn on/off device
- Display custom message on device screen

### 4. **Security Monitor** - Threat Detection
- Network analysis (suspicious IPs, unusual traffic)
- Unauthorized access attempts
- Permission misuse alerts
- Malware scanning status
- Real-time threat blocking

### 5. **Evidence Vault** - Forensic Data
- Screenshot captures
- Video recordings
- Photo library backups
- Call logs and message history
- Location history timestamps

### 6. **Recovery Center** - Device Recovery
- Stolen/lost device recovery process
- Recovery code generation/verification
- Contact emergency services
- Remote wipe scheduling
- Recovery status tracking

### 7. **Emergency SOS** - Crisis Alert
- One-tap emergency alert
- Contact emergency services/police
- Automatic location sharing
- Live audio/video stream
- Incident report generation

### 8. **Settings** - Configuration
- Account management
- Device pairing
- Notification preferences
- Privacy settings
- Subscription/billing info

---

## 🔌 Required APIs

### **Authentication & User Management**
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/verify-email` - Email verification
- `POST /auth/refresh-token` - Token refresh

### **Device Management**
- `POST /devices/register` - Register new device
- `GET /devices` - Get all paired devices
- `GET /devices/{deviceId}` - Get device details
- `PUT /devices/{deviceId}` - Update device info
- `DELETE /devices/{deviceId}` - Unpair device
- `GET /devices/{deviceId}/status` - Real-time device status

### **Location & Tracking**
- `GET /devices/{deviceId}/location` - Current location
- `GET /devices/{deviceId}/location-history` - Location history with filters
- `POST /devices/{deviceId}/geofence` - Create geofence zone
- `GET /geofence/{zoneId}` - Get geofence details
- `DELETE /geofence/{zoneId}` - Delete geofence zone
- `GET /devices/{deviceId}/movement-alerts` - Geofence breach alerts

### **Remote Control**
- `POST /devices/{deviceId}/lock` - Remote lock device
- `POST /devices/{deviceId}/unlock` - Remote unlock (with 2FA)
- `POST /devices/{deviceId}/wipe` - Remote wipe data
- `POST /devices/{deviceId}/ring` - Trigger device alarm
- `POST /devices/{deviceId}/power` - Power on/off
- `POST /devices/{deviceId}/display-message` - Show screen message
- `GET /devices/{deviceId}/command-status` - Check command execution status

### **Security & Threats**
- `GET /devices/{deviceId}/security-score` - Get security score
- `GET /devices/{deviceId}/threats` - List active threats
- `POST /devices/{deviceId}/scan` - Initiate malware scan
- `GET /devices/{deviceId}/network-analysis` - Network threat analysis
- `POST /devices/{deviceId}/block-threat/{threatId}` - Block detected threat
- `GET /security/alerts` - Get all security alerts

### **Evidence & Forensics**
- `POST /evidence/upload` - Upload evidence file
- `GET /evidence/{deviceId}` - Get device evidence list
- `GET /evidence/{evidenceId}/download` - Download evidence file
- `POST /evidence/{evidenceId}/verify` - Verify evidence integrity
- `DELETE /evidence/{evidenceId}` - Delete evidence
- `POST /evidence/export-report` - Generate forensic report

### **Emergency & SOS**
- `POST /sos/trigger` - Trigger emergency alert
- `GET /sos/status/{sosId}` - Get SOS incident status
- `POST /sos/{sosId}/contact-police` - Alert law enforcement
- `POST /sos/{sosId}/stream-start` - Start live stream
- `POST /sos/{sosId}/stream-stop` - Stop live stream
- `POST /sos/{sosId}/generate-report` - Generate incident report

### **Recovery**
- `POST /recovery/initiate` - Start device recovery process
- `POST /recovery/generate-code` - Generate recovery code
- `POST /recovery/verify-code` - Verify recovery code
- `GET /recovery/status/{deviceId}` - Get recovery status
- `POST /recovery/emergency-contact` - Contact emergency services

### **Notifications & Alerts**
- `POST /notifications/preferences` - Update notification settings
- `GET /notifications` - Get user notifications
- `POST /notifications/{notificationId}/read` - Mark as read
- `POST /notifications/{notificationId}/archive` - Archive notification

### **User Account**
- `GET /account/profile` - Get user profile
- `PUT /account/profile` - Update profile
- `PUT /account/password` - Change password
- `GET /account/devices` - Get paired devices
- `GET /account/subscription` - Get subscription status
- `POST /account/subscription/upgrade` - Upgrade subscription

### **Analytics & Reporting**
- `GET /analytics/dashboard` - Dashboard analytics
- `GET /analytics/activity-timeline` - Activity history
- `POST /reports/generate` - Generate custom report
- `GET /reports/{reportId}` - Get generated report

---

## 📊 Data Models

### Device
```
{
  deviceId: string,
  userId: string,
  name: string,
  model: string,
  osVersion: string,
  battery: number,
  connectivity: {
    wifi: boolean,
    mobile: boolean,
    signal: number
  },
  location: { lat: number, lng: number },
  lastSeen: timestamp,
  securityScore: number
}
```

### Alert
```
{
  alertId: string,
  type: "danger" | "warning" | "info",
  message: string,
  timestamp: timestamp,
  deviceId: string,
  resolved: boolean
}
```

### Location
```
{
  locationId: string,
  deviceId: string,
  lat: number,
  lng: number,
  address: string,
  timestamp: timestamp,
  accuracy: number,
  type: "current" | "home" | "work" | "transit"
}
```

### Threat
```
{
  threatId: string,
  deviceId: string,
  type: string,
  severity: "critical" | "high" | "medium" | "low",
  description: string,
  blocked: boolean,
  timestamp: timestamp
}
```

---

## 🔐 Authentication
**Bearer Token Required** for all API calls
```
Authorization: Bearer {accessToken}
```

---

## ⚡ Real-time Features
- WebSocket support for live location updates
- Push notifications for threats/alerts
- Real-time dashboard updates

---

**Ready to integrate APIs!** Provide the API endpoints and authentication details.
