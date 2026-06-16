import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set Mapbox access token
const MAPBOX_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN || '') as string;

if (!MAPBOX_TOKEN) {
  console.error('Mapbox token not found in environment variables');
}

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapOptions {
  container: HTMLElement | string;
  style?: string;
  center?: [number, number];
  zoom?: number;
}

interface MarkerOptions {
  lnglat: [number, number];
  color?: string;
  title?: string;
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    title: string;
    description?: string;
    type?: string;
  };
}

export class MapboxService {
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();

  constructor() {
    if (!MAPBOX_TOKEN) {
      throw new Error('Mapbox token not configured');
    }
  }

  // Initialize map
  initMap(options: MapOptions): mapboxgl.Map {
    this.map = new mapboxgl.Map({
      container: options.container,
      style: options.style || 'mapbox://styles/mapbox/dark-v11',
      center: options.center || [0, 0],
      zoom: options.zoom || 12,
    });

    // Add navigation controls
    this.map.addControl(new mapboxgl.NavigationControl());

    return this.map;
  }

  // Add marker to map
  addMarker(id: string, options: MarkerOptions): mapboxgl.Marker {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    // Remove existing marker if present
    if (this.markers.has(id)) {
      this.markers.get(id)?.remove();
    }

    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${options.color || "%23FF6B6B"}" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>')`;
    el.style.backgroundSize = '100%';
    el.style.width = '32px';
    el.style.height = '32px';
    el.style.cursor = 'pointer';

    const marker = new mapboxgl.Marker(el)
      .setLngLat(options.lnglat)
      .addTo(this.map);

    if (options.title) {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setText(options.title);
      marker.setPopup(popup);
    }

    this.markers.set(id, marker);
    return marker;
  }

  // Update marker position
  updateMarkerPosition(id: string, lnglat: [number, number]): void {
    const marker = this.markers.get(id);
    if (marker) {
      marker.setLngLat(lnglat);
    }
  }

  // Remove marker
  removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  // Fly to location
  flyTo(options: { center: [number, number]; zoom?: number; duration?: number }): void {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    this.map.flyTo({
      center: options.center,
      zoom: options.zoom || 14,
      duration: options.duration || 1500,
    });
  }

  // Add route layer
  addRoute(id: string, coordinates: [number, number][]): void {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    const source = this.map.getSource(id);
    if (!source) {
      this.map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
          properties: {},
        },
      });

      this.map.addLayer({
        id: `${id}-layer`,
        type: 'line',
        source: id,
        paint: {
          'line-color': '#39FF14',
          'line-width': 3,
          'line-opacity': 0.7,
        },
      });
    } else {
      // Update existing source
      (source as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
        properties: {},
      } as unknown as GeoJSONFeature);
    }
  }

  // Add geofence circle
  addGeofence(id: string, center: [number, number], radiusInMeters: number): void {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    const points = 64;
    const km = radiusInMeters / 1000;
    const lat = center[1];
    const lng = center[0];
    const latOffset = km / 111.32;
    const lngOffset = km / (111.32 * Math.cos((lat * Math.PI) / 180));

    const coordinates = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * (2 * Math.PI);
      const x = lng + lngOffset * Math.cos(angle);
      const y = lat + latOffset * Math.sin(angle);
      coordinates.push([x, y]);
    }
    coordinates.push(coordinates[0]);

    const source = this.map.getSource(id);
    if (!source) {
      this.map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
          properties: {},
        },
      });

      this.map.addLayer({
        id: `${id}-fill`,
        type: 'fill',
        source: id,
        paint: {
          'fill-color': '#39FF14',
          'fill-opacity': 0.1,
        },
      });

      this.map.addLayer({
        id: `${id}-outline`,
        type: 'line',
        source: id,
        paint: {
          'line-color': '#39FF14',
          'line-width': 2,
        },
      });
    }
  }

  // Remove geofence
  removeGeofence(id: string): void {
    if (!this.map) return;

    if (this.map.getLayer(`${id}-fill`)) {
      this.map.removeLayer(`${id}-fill`);
    }
    if (this.map.getLayer(`${id}-outline`)) {
      this.map.removeLayer(`${id}-outline`);
    }
    if (this.map.getSource(id)) {
      this.map.removeSource(id);
    }
  }

  // Fit bounds
  fitBounds(bounds: [[number, number], [number, number]]): void {
    if (!this.map) {
      throw new Error('Map not initialized');
    }

    this.map.fitBounds(bounds, { padding: 50 });
  }

  // Get map instance
  getMap(): mapboxgl.Map | null {
    return this.map;
  }

  // Destroy map
  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers.clear();
  }
}

export const mapboxService = new MapboxService();
export default mapboxService;
