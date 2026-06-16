import { useState, useEffect, useCallback } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser } from './supabaseClient';
import { deviceService, locationService, threatService, alertService, remoteCommandService } from './apiService';
import twilioService from './twilioService';
import { startForgotPasswordFlow, verifyOTP as verifyOTPService, resetPasswordWithOTP, verifyEmailWithToken, resendVerificationEmail, isEmailVerified, isProfileComplete, signUpWithProfile } from './authService';
import userProfileService from './userProfileService';

// ============================================================
// ENHANCED AUTH HOOK - Includes password reset, OTP, email verification
// ============================================================
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Check email verification status
        const isVerified = await isEmailVerified(currentUser.id);
        setEmailVerified(isVerified);

        // Check profile completion
        const profileStatus = await isProfileComplete(currentUser.id);
        setProfileComplete(profileStatus.complete);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          isEmailVerified(session.user.id).then(setEmailVerified);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Enhanced auth methods
  const forgotPassword = useCallback(async (email: string) => {
    const result = await startForgotPasswordFlow(email);
    if (!result.success) setError(result.error);
    return result;
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    const result = await verifyOTPService(email, otp);
    if (!result.success) setError(result.error);
    return result;
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string, otp: string) => {
    const result = await resetPasswordWithOTP(email, newPassword, otp);
    if (!result.success) setError(result.error);
    return result;
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const result = await verifyEmailWithToken(token);
    if (result.success) {
      setEmailVerified(true);
    } else {
      setError(result.error);
    }
    return result;
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    const result = await resendVerificationEmail(email);
    if (!result.success) setError(result.error);
    return result;
  }, []);

  const signUpWithProfileCallback = useCallback(
    async (email: string, password: string, phoneNumber?: string, fullName?: string) => {
      const result = await signUpWithProfile(email, password, phoneNumber, fullName);
      if (result.success && result.userId) {
        setUser(result.userId);
      } else {
        setError(result.error);
      }
      return result;
    },
    []
  );

  return {
    user,
    loading,
    error,
    emailVerified,
    profileComplete,
    signIn,
    signUp: signUpWithProfileCallback,
    signOut,
    forgotPassword,
    verifyOTP,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
  };
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

// ============================================================
// USER PROFILE HOOK - Manage user profile and preferences
// ============================================================
export const useUserProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await userProfileService.getUserProfile(userId);
    if (result.success) {
      setProfile(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (updates: any) => {
      if (!userId) return;
      const result = await userProfileService.updateUserProfile(userId, updates);
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId]
  );

  const completeProfile = useCallback(async () => {
    if (!userId) return;
    const result = await userProfileService.completeProfile(userId);
    if (result.success) {
      setProfile(result.data);
    } else {
      setError(result.error);
    }
    return result;
  }, [userId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    completeProfile,
    refetch: fetchProfile,
  };
};

// ============================================================
// DEVICE TRACKING HOOK - Multi-device management and lost device tracking
// ============================================================
export const useDeviceTracking = (userId: string | undefined) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [lostDevices, setLostDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchDevices = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await userProfileService.getUserDevices(userId);
    if (result.success) {
      setDevices(result.data);
      
      // Separate lost devices
      const lost = result.data.filter((d: any) => d.is_lost);
      setLostDevices(lost);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchDevices();
    // Poll for device updates every 30 seconds
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const registerDevice = useCallback(
    async (deviceInfo: any) => {
      if (!userId) return;
      const result = await userProfileService.registerDevice(userId, deviceInfo);
      if (result.success) {
        await fetchDevices();
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, fetchDevices]
  );

  const markDeviceLost = useCallback(
    async (deviceId: string, lastKnownLocation?: any) => {
      if (!userId) return;
      const result = await userProfileService.markDeviceLost(
        userId,
        deviceId,
        lastKnownLocation
      );
      if (result.success) {
        await fetchDevices();
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, fetchDevices]
  );

  const markDeviceFound = useCallback(
    async (deviceId: string) => {
      if (!userId) return;
      const result = await userProfileService.markDeviceFound(userId, deviceId);
      if (result.success) {
        await fetchDevices();
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, fetchDevices]
  );

  const updateDeviceStatus = useCallback(
    async (deviceId: string, updates: any) => {
      if (!userId) return;
      const result = await userProfileService.updateDeviceStatus(userId, deviceId, updates);
      if (result.success) {
        setDevices(
          devices.map((d) => (d.id === deviceId ? result.data : d))
        );
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, devices]
  );

  return {
    devices,
    lostDevices,
    loading,
    error,
    registerDevice,
    markDeviceLost,
    markDeviceFound,
    updateDeviceStatus,
    refetch: fetchDevices,
  };
};

// ============================================================
// PERMISSIONS HOOK - Handle app permissions (location, device access, etc)
// ============================================================
export const usePermissions = (userId: string | undefined, deviceId?: string) => {
  const [permissions, setPermissions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation not supported'));
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissions((prev: any) => ({
            ...prev,
            location_access: true,
          }));
          resolve(true);
        },
        (err) => {
          setError(err);
          resolve(false);
        }
      );
    });
  }, []);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissions((prev: any) => ({
        ...prev,
        photo_access: true,
      }));
      return true;
    } catch (err) {
      setError(err);
      return false;
    }
  }, []);

  const requestContactsPermission = useCallback(async () => {
    // Note: Contacts API has limited browser support
    // This is more relevant for mobile app
    setPermissions((prev: any) => ({
      ...prev,
      contacts_access: true,
    }));
    return true;
  }, []);

  const grantDevicePermissions = useCallback(
    async (permissionFlags: any) => {
      if (!userId || !deviceId) return;

      setLoading(true);
      const result = await userProfileService.grantDevicePermissions(
        userId,
        deviceId,
        permissionFlags
      );

      if (result.success) {
        setPermissions(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return result;
    },
    [userId, deviceId]
  );

  const getDevicePermissions = useCallback(async () => {
    if (!userId || !deviceId) return;

    setLoading(true);
    const result = await userProfileService.getDevicePermissions(userId, deviceId);
    if (result.success) {
      setPermissions(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [userId, deviceId]);

  useEffect(() => {
    getDevicePermissions();
  }, [getDevicePermissions]);

  return {
    permissions,
    loading,
    error,
    requestLocationPermission,
    requestCameraPermission,
    requestContactsPermission,
    grantDevicePermissions,
    refetch: getDevicePermissions,
  };
};

// ============================================================
// TRUSTED CONTACTS HOOK - Manage emergency contacts
// ============================================================
export const useTrustedContacts = (userId: string | undefined) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchContacts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await userProfileService.getTrustedContacts(userId);
    if (result.success) {
      setContacts(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = useCallback(
    async (contactInfo: any) => {
      if (!userId) return;
      const result = await userProfileService.addTrustedContact(userId, contactInfo);
      if (result.success) {
        await fetchContacts();
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, fetchContacts]
  );

  const updateContact = useCallback(
    async (contactId: string, updates: any) => {
      if (!userId) return;
      const result = await userProfileService.updateTrustedContact(userId, contactId, updates);
      if (result.success) {
        await fetchContacts();
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, fetchContacts]
  );

  const deleteContact = useCallback(
    async (contactId: string) => {
      if (!userId) return;
      const result = await userProfileService.deleteTrustedContact(userId, contactId);
      if (result.success) {
        setContacts(contacts.filter((c) => c.id !== contactId));
      } else {
        setError(result.error);
      }
      return result;
    },
    [userId, contacts]
  );

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
};
