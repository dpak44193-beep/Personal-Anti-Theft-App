import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SUPABASE_SECRET_KEY = import.meta.env.VITE_SUPABASE_SECRET_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Device Management
export const deviceService = {
  // Register new device
  registerDevice: async (deviceData: {
    user_id: string;
    name: string;
    device_id: string;
    model: string;
    os_version: string;
  }) => {
    try {
      const response = await apiClient.post('/devices', deviceData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get all devices
  getDevices: async (userId: string) => {
    try {
      const response = await apiClient.get(`/devices?user_id=eq.${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get device by ID
  getDeviceById: async (deviceId: string) => {
    try {
      const response = await apiClient.get(`/devices?id=eq.${deviceId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update device status
  updateDeviceStatus: async (deviceId: string, status: {
    battery?: number;
    connectivity?: boolean;
    last_seen?: string;
  }) => {
    try {
      const response = await apiClient.patch(`/devices?id=eq.${deviceId}`, status);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Unpair device
  unpairDevice: async (deviceId: string) => {
    try {
      const response = await apiClient.delete(`/devices?id=eq.${deviceId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Location Tracking
export const locationService = {
  // Add new location
  addLocation: async (locationData: {
    device_id: string;
    latitude: number;
    longitude: number;
    address: string;
    type: 'current' | 'home' | 'work' | 'transit';
  }) => {
    try {
      const response = await apiClient.post('/locations', locationData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get location history
  getLocationHistory: async (deviceId: string, limit = 50) => {
    try {
      const response = await apiClient.get(
        `/locations?device_id=eq.${deviceId}&order=timestamp.desc&limit=${limit}`
      );
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current location
  getCurrentLocation: async (deviceId: string) => {
    try {
      const response = await apiClient.get(
        `/locations?device_id=eq.${deviceId}&order=timestamp.desc&limit=1`
      );
      return { data: response.data?.[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create geofence
  createGeofence: async (geofenceData: {
    device_id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  }) => {
    try {
      const response = await apiClient.post('/geofences', geofenceData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get geofences
  getGeofences: async (deviceId: string) => {
    try {
      const response = await apiClient.get(`/geofences?device_id=eq.${deviceId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Threats & Security
export const threatService = {
  // Add threat
  addThreat: async (threatData: {
    device_id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  }) => {
    try {
      const response = await apiClient.post('/threats', threatData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get threats
  getThreats: async (deviceId: string) => {
    try {
      const response = await apiClient.get(`/threats?device_id=eq.${deviceId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Block threat
  blockThreat: async (threatId: string) => {
    try {
      const response = await apiClient.patch(`/threats?id=eq.${threatId}`, {
        blocked: true,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Alerts
export const alertService = {
  // Create alert
  createAlert: async (alertData: {
    device_id: string;
    type: 'danger' | 'warning' | 'info';
    message: string;
  }) => {
    try {
      const response = await apiClient.post('/alerts', alertData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get alerts
  getAlerts: async (deviceId: string, limit = 50) => {
    try {
      const response = await apiClient.get(
        `/alerts?device_id=eq.${deviceId}&order=timestamp.desc&limit=${limit}`
      );
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark alert as read
  markAlertAsRead: async (alertId: string) => {
    try {
      const response = await apiClient.patch(`/alerts?id=eq.${alertId}`, {
        resolved: true,
      });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Remote Control Commands
export const remoteCommandService = {
  // Execute command
  executeCommand: async (commandData: {
    device_id: string;
    command: 'lock' | 'unlock' | 'wipe' | 'ring' | 'power' | 'message';
    parameters?: Record<string, any>;
  }) => {
    try {
      const response = await apiClient.post('/commands', commandData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get command status
  getCommandStatus: async (commandId: string) => {
    try {
      const response = await apiClient.get(`/commands?id=eq.${commandId}`);
      return { data: response.data?.[0] || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

// Evidence Management
export const evidenceService = {
  // Upload evidence
  uploadEvidence: async (evidenceData: {
    device_id: string;
    type: 'screenshot' | 'video' | 'photo' | 'log';
    file_url: string;
    timestamp: string;
  }) => {
    try {
      const response = await apiClient.post('/evidence', evidenceData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get evidence
  getEvidence: async (deviceId: string) => {
    try {
      const response = await apiClient.get(`/evidence?device_id=eq.${deviceId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default apiClient;
