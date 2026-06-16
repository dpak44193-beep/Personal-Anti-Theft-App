import React, { useEffect, useRef } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { useDeviceLocation, useDevices, useAuth } from '../services';
import { mapboxService } from '../services/mapboxService';
import 'mapbox-gl/dist/mapbox-gl.css';

export const LiveTrackingWithMapbox = () => {
  const { user } = useAuth();
  const { devices } = useDevices(user?.id);
  const activeDevice = devices?.[0];
  const { location, history, refetchLocation } = useDeviceLocation(activeDevice?.id);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current) return;

    try {
      mapboxService.initMap({
        container: mapContainer.current,
        center: location ? [location.longitude, location.latitude] : [-74.006, 40.7128],
        zoom: 13,
      });
      mapInitialized.current = true;
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (mapInitialized.current) {
        mapboxService.destroy();
        mapInitialized.current = false;
      }
    };
  }, []);

  // Update device marker
  useEffect(() => {
    if (!location || !mapInitialized.current) return;

    mapboxService.addMarker('device-current', {
      lnglat: [location.longitude, location.latitude],
      color: '#39FF14',
      title: `Current Location: ${location.address}`,
    });

    mapboxService.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 14,
    });
  }, [location]);

  // Add location history route
  useEffect(() => {
    if (!history || history.length < 2 || !mapInitialized.current) return;

    const coordinates = history
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(loc => [loc.longitude, loc.latitude]);

    mapboxService.addRoute('location-history', coordinates);
  }, [history]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={20} style={{ color: '#39FF14' }} />
          <h2 className="text-white font-semibold">Live Tracking</h2>
        </div>
        <button
          onClick={() => refetchLocation()}
          className="p-2 rounded hover:bg-gray-800 transition"
        >
          <RefreshCw size={18} style={{ color: '#39FF14' }} />
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="flex-1"
        style={{ background: '#070B14' }}
      />

      {/* Location Details */}
      {location && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="text-sm text-white font-mono">{location.address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Coordinates</p>
              <p className="text-sm text-white font-mono">
                {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° W
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Last Updated</p>
              <p className="text-sm text-white">
                {new Date(location.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Location Type</p>
              <p className="text-sm text-white capitalize">{location.type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location History */}
      {history && history.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-2">Recent Locations</p>
          <div className="space-y-1">
            {history.slice(0, 5).map((loc: any, idx: number) => (
              <div key={idx} className="text-xs text-gray-300 flex justify-between">
                <span>{loc.address}</span>
                <span className="text-gray-500">{new Date(loc.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingWithMapbox;
