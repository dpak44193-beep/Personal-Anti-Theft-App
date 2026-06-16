import { useState, useEffect, useCallback } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser } from './supabaseClient';
import { deviceService, locationService, threatService, alertService, remoteCommandService } from './apiService';
import twilioService from './twilioService';

// Auth hooks
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading, error, signIn, signUp, signOut };
};

// Device hooks
export const useDevices = (userId: string | undefined) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevices = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: err } = await deviceService.getDevices(userId);
    if (err) {
      setError(err);
    } else {
      setDevices(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, refetch: fetchDevices };
};

// Location hooks
export const useDeviceLocation = (deviceId: string | undefined) => {
  const [location, setLocation] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCurrentLocation = useCallback(async () => {
    if (!deviceId) return;

    setLoading(true);
    const { data, error } = await locationService.getCurrentLocation(deviceId);
    if (!error) {
      setLocation(data);
    }
    setLoading(false);
  }, [deviceId]);

  const fetchLocationHistory = useCallback(async (limit = 50) => {
    if (!deviceId) return;

    setLoading(true);
    const { data, error } = await locationService.getLocationHistory(deviceId, limit);
    if (!error) {
      setHistory(data || []);
    }
    setLoading(false);
  }, [deviceId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!deviceId) return;

    fetchCurrentLocation();
    const interval = setInterval(fetchCurrentLocation, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [deviceId, fetchCurrentLocation]);

  return { location, history, loading, refetchLocation: fetchCurrentLocation, refetchHistory: fetchLocationHistory };
};

// Threats hooks
export const useThreats = (deviceId: string | undefined) => {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const fetchThreats = async () => {
      setLoading(true);
      const { data } = await threatService.getThreats(deviceId);
      setThreats(data || []);
      setLoading(false);
    };

    fetchThreats();
    const interval = setInterval(fetchThreats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [deviceId]);

  const blockThreat = async (threatId: string) => {
    await threatService.blockThreat(threatId);
    setThreats(threats.filter(t => t.id !== threatId));
  };

  return { threats, loading, blockThreat };
};

// Alerts hooks
export const useAlerts = (deviceId: string | undefined) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const fetchAlerts = async () => {
      setLoading(true);
      const { data } = await alertService.getAlerts(deviceId);
      setAlerts(data || []);
      setLoading(false);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, [deviceId]);

  const markAsRead = async (alertId: string) => {
    await alertService.markAlertAsRead(alertId);
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  return { alerts, loading, markAsRead };
};

// Remote control hooks
export const useRemoteControl = (deviceId: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeCommand = useCallback(
    async (command: string, parameters?: Record<string, any>) => {
      if (!deviceId) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await remoteCommandService.executeCommand({
          device_id: deviceId,
          command: command as any,
          parameters,
        });

        if (err) {
          setError(err);
        }

        // Show confirmation message
        const messages: Record<string, string> = {
          lock: '🔒 Device locked successfully',
          unlock: '🔓 Device unlocked',
          ring: '📢 Alarm ringing on device',
          wipe: '⚠️ Device wipe initiated',
          power: '⚡ Power command sent',
          message: '💬 Message displayed on device',
        };

        alert(messages[command] || 'Command executed');
        setLoading(false);

        return data;
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    },
    [deviceId]
  );

  return { executeCommand, loading, error };
};

// SMS notification hook
export const useSMSNotification = () => {
  const sendEmergencyAlert = async (phone: string, location: string) => {
    return await twilioService.sendEmergencyAlert(phone, location);
  };

  const sendLocationUpdate = async (phone: string, address: string, coords: string) => {
    return await twilioService.sendLocationSMS(phone, address, coords);
  };

  return { sendEmergencyAlert, sendLocationUpdate };
};
