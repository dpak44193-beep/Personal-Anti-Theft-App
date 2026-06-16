import React, { useState } from 'react';
import { MapPin, Smartphone, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export interface PermissionsScreenProps {
  onPermissionsGranted?: () => void;
  canSkip?: boolean;
}

export const PermissionsScreen: React.FC<PermissionsScreenProps> = ({
  onPermissionsGranted,
  canSkip = false,
}) => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [deviceAccessGranted, setDeviceAccessGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skippedPermissions, setSkippedPermissions] = useState(false);

  // Request location permission
  const handleRequestLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationGranted(true);
        setLoading(false);
        console.log('Location granted:', position.coords);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLoading(false);
      }
    );
  };

  // Request device access (camera, microphone, etc)
  const handleRequestDeviceAccess = async () => {
    setLoading(true);
    setError('');

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      // Stop the stream after getting permission
      stream.getTracks().forEach((track) => track.stop());

      setDeviceAccessGranted(true);
      console.log('Device access granted');
    } catch (err: any) {
      setError(`Device access error: ${err.message}`);
      console.error('Device access error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle continue (check if minimum permissions granted)
  const handleContinue = () => {
    if (locationGranted || skippedPermissions) {
      onPermissionsGranted?.();
    } else {
      setError('Please grant at least location permission or skip this step');
    }
  };

  // Handle skip
  const handleSkip = () => {
    setSkippedPermissions(true);
    setError('⚠️ Some features may not work without permissions');

    setTimeout(() => {
      onPermissionsGranted?.();
    }, 2000);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      style={{ background: '#070B14' }}
    >
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-700 p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#E2E8F0' }}>
              App Permissions
            </h1>
            <p className="text-gray-400 text-sm">
              We need a few permissions to protect your device effectively
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-4 rounded-lg border flex items-start gap-3"
              style={{
                background: error.includes('⚠️')
                  ? 'rgba(255, 159, 0, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderColor: error.includes('⚠️') ? '#ff9f00' : '#ef4444',
              }}
            >
              <AlertCircle
                size={18}
                style={{ color: error.includes('⚠️') ? '#ff9f00' : '#ef4444' }}
                className="flex-shrink-0 mt-0.5"
              />
              <p className="text-sm" style={{ color: error.includes('⚠️') ? '#fcd34d' : '#fca5a5' }}>
                {error}
              </p>
            </div>
          )}

          {/* Permission Cards */}
          <div className="space-y-3">
            {/* Location Permission */}
            <div
              className="p-4 rounded-lg border-2 cursor-pointer transition"
              style={{
                background: locationGranted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 212, 255, 0.05)',
                borderColor: locationGranted ? '#22c55e' : 'rgba(0, 212, 255, 0.2)',
                opacity: loading && !locationGranted ? 0.6 : 1,
              }}
              onClick={!locationGranted && !loading ? handleRequestLocation : undefined}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: locationGranted ? '#22c55e' : '#00D4FF',
                  }}
                >
                  {locationGranted ? (
                    <CheckCircle size={20} style={{ color: '#070B14' }} />
                  ) : (
                    <MapPin size={20} style={{ color: '#070B14' }} />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Location Access</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Track your device location and geofencing features
                  </p>

                  {!locationGranted ? (
                    <button
                      onClick={handleRequestLocation}
                      disabled={loading}
                      className="px-3 py-1 text-xs font-semibold rounded transition flex items-center gap-1"
                      style={{
                        background: '#00D4FF',
                        color: '#070B14',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        'Grant Access'
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                      ✓ Granted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Device Access Permission */}
            <div
              className="p-4 rounded-lg border-2 cursor-pointer transition"
              style={{
                background: deviceAccessGranted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0, 212, 255, 0.05)',
                borderColor: deviceAccessGranted ? '#22c55e' : 'rgba(0, 212, 255, 0.2)',
                opacity: loading && !deviceAccessGranted ? 0.6 : 1,
              }}
              onClick={!deviceAccessGranted && !loading ? handleRequestDeviceAccess : undefined}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: deviceAccessGranted ? '#22c55e' : '#00D4FF',
                  }}
                >
                  {deviceAccessGranted ? (
                    <CheckCircle size={20} style={{ color: '#070B14' }} />
                  ) : (
                    <Smartphone size={20} style={{ color: '#070B14' }} />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Device Information</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Access camera and device data for emergency features
                  </p>

                  {!deviceAccessGranted ? (
                    <button
                      onClick={handleRequestDeviceAccess}
                      disabled={loading}
                      className="px-3 py-1 text-xs font-semibold rounded transition flex items-center gap-1"
                      style={{
                        background: '#00D4FF',
                        color: '#070B14',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Requesting...
                        </>
                      ) : (
                        'Grant Access'
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                      ✓ Granted
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permission Summary */}
          <div
            className="p-4 rounded-lg text-sm"
            style={{ background: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.1)' }}
          >
            <h4 className="font-semibold text-white mb-2">What we use these for:</h4>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li>
                <span style={{ color: '#00D4FF' }}>📍 Location</span> - Real-time device tracking &
                alerts
              </li>
              <li>
                <span style={{ color: '#00D4FF' }}>📱 Device</span> - Emergency SOS & remote features
              </li>
              <li>
                <span style={{ color: '#00D4FF' }}>🔒 Security</span> - Protect your phone from theft
              </li>
            </ul>
          </div>

          {/* Info about privacy */}
          <div
            className="p-3 rounded-lg text-xs text-center"
            style={{ background: 'rgba(0, 212, 255, 0.03)', color: '#94A3B8' }}
          >
            🔒 Your location and device data is encrypted and never shared with third parties.
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleContinue}
              disabled={loading || (!locationGranted && !skippedPermissions)}
              className="w-full rounded-lg py-3 font-semibold transition"
              style={{
                background:
                  !loading && (locationGranted || skippedPermissions) ? '#39FF14' : '#333',
                color: '#070B14',
                cursor:
                  !loading && (locationGranted || skippedPermissions)
                    ? 'pointer'
                    : 'not-allowed',
                opacity:
                  !loading && (locationGranted || skippedPermissions) ? 1 : 0.5,
              }}
            >
              {skippedPermissions ? 'Continue Anyway' : 'Continue'}
            </button>

            {canSkip && !skippedPermissions && (
              <button
                onClick={handleSkip}
                disabled={loading}
                className="w-full rounded-lg py-3 font-semibold transition border-2"
                style={{
                  borderColor: '#666',
                  background: 'transparent',
                  color: '#E2E8F0',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Skip for Now
              </button>
            )}
          </div>

          {/* Status Bar */}
          {(locationGranted || deviceAccessGranted) && (
            <div className="text-center text-sm" style={{ color: '#22c55e' }}>
              ✓ {locationGranted && 'Location'} {locationGranted && deviceAccessGranted && '&'}{' '}
              {deviceAccessGranted && 'Device access'} granted!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionsScreen;
