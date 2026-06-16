import { supabase } from './supabaseClient';

/**
 * User Profile Service - Manages user profiles, devices, permissions, and contacts
 */

// ============================================================
// USER PROFILE MANAGEMENT
// ============================================================

/**
 * Get complete user profile
 * @param userId User's ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Get profile error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Update user profile
 * @param userId User's ID
 * @param updates Profile updates
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    full_name?: string;
    phone_number?: string;
    avatar_url?: string;
    bio?: string;
    recovery_email?: string;
    location_tracking_enabled?: boolean;
    device_tracking_enabled?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Mark profile as complete
 * @param userId User's ID
 */
export const completeProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        profile_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Complete profile error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

// ============================================================
// DEVICE MANAGEMENT
// ============================================================

/**
 * Register a new device for user
 * @param userId User's ID
 * @param deviceInfo Device information
 */
export const registerDevice = async (
  userId: string,
  deviceInfo: {
    device_id: string;
    device_name: string;
    device_model?: string;
    os_type?: string;
    os_version?: string;
    app_version?: string;
    is_primary?: boolean;
  }
) => {
  try {
    // If marked as primary, unmark others
    if (deviceInfo.is_primary) {
      await supabase
        .from('user_devices')
        .update({ is_primary: false })
        .eq('owner_id', userId);
    }

    const { data, error } = await supabase
      .from('user_devices')
      .insert([
        {
          owner_id: userId,
          ...deviceInfo,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Register device error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Get all devices for a user
 * @param userId User's ID
 */
export const getUserDevices = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('owner_id', userId)
      .order('is_primary', { ascending: false })
      .order('last_seen', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error: any) {
    console.error('Get devices error:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
};

/**
 * Get specific device
 * @param userId User's ID
 * @param deviceId Device ID
 */
export const getDevice = async (userId: string, deviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('owner_id', userId)
      .eq('id', deviceId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Get device error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Update device status
 * @param userId User's ID
 * @param deviceId Device ID
 * @param updates Device updates
 */
export const updateDeviceStatus = async (
  userId: string,
  deviceId: string,
  updates: {
    last_seen?: string;
    battery_level?: number;
    is_charging?: boolean;
    connectivity_status?: string;
    last_location_latitude?: number;
    last_location_longitude?: number;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('user_devices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userId)
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Update device status error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

// ============================================================
// LOST DEVICE MANAGEMENT
// ============================================================

/**
 * Mark device as lost
 * @param userId User's ID
 * @param deviceId Device ID
 * @param lastKnownLocation Optional last known location
 */
export const markDeviceLost = async (
  userId: string,
  deviceId: string,
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  }
) => {
  try {
    // Update device as lost
    const { data: deviceData, error: deviceError } = await supabase
      .from('user_devices')
      .update({
        is_lost: true,
        marked_lost_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userId)
      .eq('id', deviceId)
      .select()
      .single();

    if (deviceError) throw deviceError;

    // Create lost device recovery record
    const { data: recoveryData, error: recoveryError } = await supabase
      .from('lost_device_recovery')
      .insert([
        {
          device_id: deviceId,
          user_id: userId,
          marked_lost_at: new Date().toISOString(),
          recovery_status: 'lost',
          last_known_latitude: lastKnownLocation?.latitude || null,
          last_known_longitude: lastKnownLocation?.longitude || null,
          last_known_address: lastKnownLocation?.address || null,
        },
      ])
      .select()
      .single();

    if (recoveryError) throw recoveryError;

    return {
      success: true,
      device: deviceData,
      recovery: recoveryData,
      error: null,
    };
  } catch (error: any) {
    console.error('Mark device lost error:', error);
    return {
      success: false,
      device: null,
      recovery: null,
      error,
    };
  }
};

/**
 * Mark device as found
 * @param userId User's ID
 * @param deviceId Device ID
 */
export const markDeviceFound = async (userId: string, deviceId: string) => {
  try {
    // Update device as found
    const { data: deviceData, error: deviceError } = await supabase
      .from('user_devices')
      .update({
        is_lost: false,
        found_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userId)
      .eq('id', deviceId)
      .select()
      .single();

    if (deviceError) throw deviceError;

    // Update recovery record
    const { data: recoveryData, error: recoveryError } = await supabase
      .from('lost_device_recovery')
      .update({
        marked_found_at: new Date().toISOString(),
        recovery_status: 'recovered',
      })
      .eq('device_id', deviceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (recoveryError) throw recoveryError;

    return {
      success: true,
      device: deviceData,
      recovery: recoveryData,
      error: null,
    };
  } catch (error: any) {
    console.error('Mark device found error:', error);
    return {
      success: false,
      device: null,
      recovery: null,
      error,
    };
  }
};

/**
 * Get lost devices for user
 * @param userId User's ID
 */
export const getLostDevices = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_devices')
      .select('*')
      .eq('owner_id', userId)
      .eq('is_lost', true)
      .order('marked_lost_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error: any) {
    console.error('Get lost devices error:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
};

/**
 * Get lost device recovery info
 * @param userId User's ID
 * @param deviceId Device ID
 */
export const getLostDeviceRecoveryInfo = async (
  userId: string,
  deviceId: string
) => {
  try {
    const { data, error } = await supabase
      .from('lost_device_recovery')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Get recovery info error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

// ============================================================
// DEVICE PERMISSIONS
// ============================================================

/**
 * Grant device permissions
 * @param userId User's ID
 * @param deviceId Device ID (physical device)
 * @param permissions Permission object
 */
export const grantDevicePermissions = async (
  userId: string,
  deviceId: string,
  permissions: {
    location_access?: boolean;
    device_management_access?: boolean;
    emergency_sos_access?: boolean;
    photo_access?: boolean;
    contacts_access?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('device_permissions')
      .upsert(
        [
          {
            user_id: userId,
            device_id: deviceId,
            ...permissions,
            granted_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,device_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Grant permissions error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Get device permissions
 * @param userId User's ID
 * @param deviceId Device ID
 */
export const getDevicePermissions = async (userId: string, deviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('device_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

    return {
      success: true,
      data: data || null,
      error: null,
    };
  } catch (error: any) {
    console.error('Get permissions error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

// ============================================================
// TRUSTED CONTACTS
// ============================================================

/**
 * Add trusted contact
 * @param userId User's ID
 * @param contact Contact information
 */
export const addTrustedContact = async (
  userId: string,
  contact: {
    contact_name: string;
    contact_email?: string;
    contact_phone?: string;
    relationship?: string;
    can_track_location?: boolean;
    can_send_sos?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert([
        {
          user_id: userId,
          ...contact,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Add contact error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Get trusted contacts
 * @param userId User's ID
 */
export const getTrustedContacts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      error: null,
    };
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
};

/**
 * Update trusted contact
 * @param userId User's ID
 * @param contactId Contact ID
 * @param updates Updates to apply
 */
export const updateTrustedContact = async (
  userId: string,
  contactId: string,
  updates: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    relationship?: string;
    can_track_location?: boolean;
    can_send_sos?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error: any) {
    console.error('Update contact error:', error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

/**
 * Delete trusted contact
 * @param userId User's ID
 * @param contactId Contact ID
 */
export const deleteTrustedContact = async (userId: string, contactId: string) => {
  try {
    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('user_id', userId)
      .eq('id', contactId);

    if (error) throw error;

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return {
      success: false,
      error,
    };
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  completeProfile,
  registerDevice,
  getUserDevices,
  getDevice,
  updateDeviceStatus,
  markDeviceLost,
  markDeviceFound,
  getLostDevices,
  getLostDeviceRecoveryInfo,
  grantDevicePermissions,
  getDevicePermissions,
  addTrustedContact,
  getTrustedContacts,
  updateTrustedContact,
  deleteTrustedContact,
};
