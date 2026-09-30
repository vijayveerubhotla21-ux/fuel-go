import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Navigation,
  Crosshair,
  MapPin,
  Car,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle2,
  RefreshCw,
  Fuel,
  Maximize2,
  Clock,
  Zap,
  LocateFixed,
} from 'lucide-react';
import * as maplibregl from 'maplibre-gl';

export type MapTailorStyle = 'tactical-dark' | 'clean-slate' | 'fleet-amber' | 'satellite-hybrid';

interface MapTilerMapProps {
  customerLocation?: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number; name?: string; vehicle?: string };
  orderStatus?: string;
  className?: string;
  interactive?: boolean;
  enablePinpoint?: boolean;
  onLocationSelect?: (lat: number, lng: number, address?: string) => void;
  showUberDeepLink?: boolean;
  showMicroNudge?: boolean;
  initialStyle?: MapTailorStyle;
  autoDetectLocation?: boolean;
  autoFitBounds?: boolean;
  deliveryEtaMinutes?: number;
}

// Distance calculation using Haversine formula (km)
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Helper to construct free public tile styles that work without external API keys
function getMapStyleConfig(style: MapTailorStyle, mapTilerKey?: string): maplibregl.StyleSpecification | string {
  if (mapTilerKey && mapTilerKey.length > 5 && mapTilerKey !== 'get_your_key_at_maptiler_com') {
    switch (style) {
      case 'tactical-dark':
        return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapTilerKey}`;
      case 'fleet-amber':
        return `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${mapTilerKey}`;
      case 'satellite-hybrid':
        return `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`;
      case 'clean-slate':
      default:
        return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
    }
  }

  // Robust public raster basemaps requiring no API key
  let tileUrl = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
  if (style === 'clean-slate') {
    tileUrl = 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  } else if (style === 'fleet-amber') {
    tileUrl = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
  } else if (style === 'satellite-hybrid') {
    tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  }

  return {
    version: 8,
    sources: {
      'base-tiles': {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      },
    },
    layers: [
      {
        id: 'base-tiles-layer',
        type: 'raster',
        source: 'base-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}

export const MapTilerMap: React.FC<MapTilerMapProps> = ({
  customerLocation,
  driverLocation = { lat: 12.9716, lng: 77.5946, name: 'Rajesh Sharma', vehicle: 'KA 03 EV 4821' },
  orderStatus = 'On The Way',
  className = '',
  interactive = true,
  enablePinpoint = false,
  onLocationSelect,
  showUberDeepLink = true,
  showMicroNudge = true,
  initialStyle = 'tactical-dark',
  autoDetectLocation = true,
  autoFitBounds = true,
  deliveryEtaMinutes,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const customerMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Map Tailor Styling Profile
  const [activeStyle, setActiveStyle] = useState<MapTailorStyle>(initialStyle);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [showTelemetryHud, setShowTelemetryHud] = useState<boolean>(false);

  // Customer Target Coordinates: prefer customerLocation prop or initial default
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number }>({
    lat: customerLocation?.lat || 12.926,
    lng: customerLocation?.lng || 77.6762,
  });

  // GPS & Accuracy State
  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'tracking' | 'granted' | 'denied' | 'unavailable' | 'unsupported' | 'low_accuracy'
  >('idle');
  const [accuracyRadius, setAccuracyRadius] = useState<number | null>(null);
  const [satelliteLock, setSatelliteLock] = useState<boolean>(false);
  const [bowserLatency, setBowserLatency] = useState<number>(24);

  // Animated Driver coordinates
  const [animatedDriverCoords, setAnimatedDriverCoords] = useState<{ lat: number; lng: number }>(driverLocation);
  const [reverseGeocoding, setReverseGeocoding] = useState<boolean>(false);
  const [usingFallbackMap, setUsingFallbackMap] = useState<boolean>(false);

  // Reverse geocoding helper
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setReverseGeocoding(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'FuelGo-Delivery/1.0' } }
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.display_name) {
            const parts = data.display_name.split(',');
            const shortAddr = parts.slice(0, 3).join(',').trim();
            if (onLocationSelect) {
              onLocationSelect(lat, lng, shortAddr);
            }
            return;
          }
        }
      } catch {
        // network fallback
      } finally {
        setReverseGeocoding(false);
      }

      const fallbackAddr = `Live GPS Spot (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E)`;
      if (onLocationSelect) {
        onLocationSelect(lat, lng, fallbackAddr);
      }
    },
    [onLocationSelect]
  );

  // ACTIVE LIVE CUSTOMER DEVICE GPS ACQUISITION
  const acquireLiveDeviceGps = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('tracking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setTargetCoords({ lat: latitude, lng: longitude });
        setAccuracyRadius(Math.round(accuracy) || 6);
        setGpsStatus(accuracy > 60 ? 'low_accuracy' : 'granted');
        setSatelliteLock(true);

        // Center map immediately on customer's real device position
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true,
          });
        }

        performReverseGeocode(latitude, longitude);
      },
      (error) => {
        setSatelliteLock(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else {
          setGpsStatus('unavailable');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0,
      }
    );
  }, [performReverseGeocode]);

  // Automatically adjust zoom levels and center the map to fit both rider's and customer's markers simultaneously
  const fitMapToBounds = useCallback(
    (immediate: boolean = false) => {
      if (!mapInstanceRef.current) return;
      const cLat = targetCoords.lat;
      const cLng = targetCoords.lng;
      const rLat = animatedDriverCoords.lat;
      const rLng = animatedDriverCoords.lng;

      if (!cLat || !cLng || !rLat || !rLng) return;

      try {
        const bounds = new maplibregl.LngLatBounds();
        bounds.extend([cLng, cLat]);
        bounds.extend([rLng, rLat]);

        const span = Math.max(Math.abs(cLat - rLat), Math.abs(cLng - rLng));
        // Dynamic optimal zoom level: closer = zoom in further
        const maxZoom = span < 0.002 ? 16 : span < 0.01 ? 15 : span < 0.03 ? 14 : 13;

        mapInstanceRef.current.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 70, right: 70 },
          maxZoom,
          duration: immediate ? 0 : 800,
        });
      } catch {
        // graceful fallback
      }
    },
    [targetCoords.lat, targetCoords.lng, animatedDriverCoords.lat, animatedDriverCoords.lng]
  );

  // Focus directly on Rider Marker
  const focusRider = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.easeTo({
      center: [animatedDriverCoords.lng, animatedDriverCoords.lat],
      zoom: 16,
      duration: 700,
    });
  };

  // Focus directly on Customer Marker
  const focusCustomer = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.easeTo({
      center: [targetCoords.lng, targetCoords.lat],
      zoom: 16,
      duration: 700,
    });
  };

  // Sync prop updates if parent explicitly passes customerLocation
  useEffect(() => {
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      setTargetCoords({ lat: customerLocation.lat, lng: customerLocation.lng });
    }
  }, [customerLocation?.lat, customerLocation?.lng]);

  // Sync prop updates if parent explicitly passes driverLocation (e.g. animated movement in TrackingView)
  useEffect(() => {
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      setAnimatedDriverCoords({ lat: driverLocation.lat, lng: driverLocation.lng });
    }
  }, [driverLocation?.lat, driverLocation?.lng]);

  // Automatically adjust zoom levels and center the map to fit both rider's and customer's markers simultaneously
  useEffect(() => {
    if (!autoFitBounds) return;
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;

    const timer = setTimeout(() => {
      fitMapToBounds();
    }, 200);

    return () => clearTimeout(timer);
  }, [autoFitBounds, fitMapToBounds]);

  // Auto-acquire device GPS on mount if enabled
  useEffect(() => {
    if (autoDetectLocation) {
      acquireLiveDeviceGps();
    }
  }, [autoDetectLocation, acquireLiveDeviceGps]);

  // Continuous watchPosition for live location updates
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setAccuracyRadius(Math.round(accuracy) || 5);
        setSatelliteLock(true);
        setGpsStatus(accuracy > 60 ? 'low_accuracy' : 'granted');

        // Update coordinates if pinpoint mode is not locking a custom spot
        if (!enablePinpoint) {
          setTargetCoords({ lat: latitude, lng: longitude });
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enablePinpoint]);

  // Micro-Nudge Controls: 4-way precision directional controls (N/S/E/W by 10 meters)
  const handleMicroNudge = (direction: 'N' | 'S' | 'E' | 'W' | 'CENTER') => {
    if (direction === 'CENTER') {
      acquireLiveDeviceGps();
      return;
    }

    const deltaLat = 0.00009; // ~10 meters
    const deltaLng = 0.00009 / Math.cos((targetCoords.lat * Math.PI) / 180);

    let newLat = targetCoords.lat;
    let newLng = targetCoords.lng;

    if (direction === 'N') newLat += deltaLat;
    if (direction === 'S') newLat -= deltaLat;
    if (direction === 'E') newLng += deltaLng;
    if (direction === 'W') newLng -= deltaLng;

    newLat = Math.round(newLat * 1000000) / 1000000;
    newLng = Math.round(newLng * 1000000) / 1000000;

    setTargetCoords({ lat: newLat, lng: newLng });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.easeTo({ center: [newLng, newLat] });
    }

    performReverseGeocode(newLat, newLng);
  };

  // Simulate smooth driver movement towards destination when order is active (fallback when not provided by parent)
  useEffect(() => {
    // If parent provides active driverLocation coordinates (e.g., animated in TrackingView), do not override
    if (driverLocation && typeof driverLocation.lat === 'number' && typeof driverLocation.lng === 'number') {
      return;
    }

    if (orderStatus === 'Delivered') {
      setAnimatedDriverCoords({ lat: targetCoords.lat, lng: targetCoords.lng });
      return;
    }

    if (!['On The Way', 'Arriving Soon', 'Driver Assigned'].includes(orderStatus)) {
      setAnimatedDriverCoords(driverLocation);
      return;
    }

    const interval = setInterval(() => {
      setAnimatedDriverCoords((prev) => {
        const dLat = (targetCoords.lat - prev.lat) * 0.05;
        const dLng = (targetCoords.lng - prev.lng) * 0.05;
        return {
          lat: prev.lat + dLat,
          lng: prev.lng + dLng,
        };
      });

      setBowserLatency(Math.floor(18 + Math.random() * 10));
    }, 2500);

    return () => clearInterval(interval);
  }, [orderStatus, targetCoords, driverLocation]);

  // MapTiler API Key from env (optional, fallback raster style is used if not present)
  const mapTilerKey = (import.meta.env.VITE_MAPTILER_API_KEY as string) || '';

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const styleConfig = getMapStyleConfig(activeStyle, mapTilerKey);

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleConfig as any,
        center: [targetCoords.lng, targetCoords.lat],
        zoom: 14,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('error', () => {
        // If WebGL or style failed, switch gracefully to dynamic vector simulation
        setUsingFallbackMap(true);
      });

      map.on('load', () => {
        // Add dynamic route line GeoJSON layer between driver and customer
        map.addSource('route-line-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [animatedDriverCoords.lng, animatedDriverCoords.lat],
                [targetCoords.lng, targetCoords.lat],
              ],
            },
          },
        });

        map.addLayer({
          id: 'route-line-layer',
          type: 'line',
          source: 'route-line-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });

        // 1. Customer Live Marker
        const custEl = document.createElement('div');
        custEl.className = 'group relative flex flex-col items-center cursor-grab active:cursor-grabbing';
        custEl.innerHTML = `
          <div class="mb-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[9px] shadow-lg border border-white/40 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>Customer Live Spot</span>
          </div>
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 border-2 border-white shadow-[0_0_18px_rgba(16,185,129,0.8)] flex items-center justify-center text-white text-base">
              📍
            </div>
          </div>
        `;

        const custMarker = new maplibregl.Marker({ element: custEl, draggable: enablePinpoint || interactive })
          .setLngLat([targetCoords.lng, targetCoords.lat])
          .addTo(map);

        custMarker.on('dragend', () => {
          const lngLat = custMarker.getLngLat();
          setTargetCoords({ lat: lngLat.lat, lng: lngLat.lng });
          performReverseGeocode(lngLat.lat, lngLat.lng);
        });

        customerMarkerRef.current = custMarker;

        // 2. Driver Marker with Distance Badge
        const drvEl = document.createElement('div');
        drvEl.className = 'group relative flex flex-col items-center pointer-events-none transition-transform duration-300';
        drvEl.innerHTML = `
          <div class="mb-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-mono font-black text-[10px] shadow-lg flex items-center gap-1.5 border border-amber-300">
            <span class="w-1.5 h-1.5 rounded-full bg-neutral-950 animate-pulse"></span>
            <span>🚚 Rider</span>
            <span id="maptiler-rider-dist" class="bg-black/25 text-neutral-950 px-1.5 py-0.5 rounded text-[9px] font-bold">
              ${calculateHaversineKm(animatedDriverCoords.lat, animatedDriverCoords.lng, targetCoords.lat, targetCoords.lng).toFixed(2)} km
            </span>
          </div>
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-3 rounded-full bg-amber-400 opacity-60 animate-ping"></span>
            <span class="absolute -inset-1.5 rounded-full bg-amber-500 opacity-40 animate-pulse"></span>
            <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.9)] flex items-center justify-center text-neutral-950 text-base z-10 transition-transform duration-300">
              ⛽
            </div>
          </div>
        `;

        driverMarkerRef.current = new maplibregl.Marker({ element: drvEl })
          .setLngLat([animatedDriverCoords.lng, animatedDriverCoords.lat])
          .addTo(map);

        // Auto-fit bounding box to show BOTH rider and customer on screen
        if (autoFitBounds) {
          fitMapToBounds(true);
        }
      });

      if (interactive) {
        map.on('click', (e) => {
          setTargetCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
          if (customerMarkerRef.current) {
            customerMarkerRef.current.setLngLat(e.lngLat);
          }
          performReverseGeocode(e.lngLat.lat, e.lngLat.lng);
        });
      }

      mapInstanceRef.current = map;

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch {
      setUsingFallbackMap(true);
    }
  }, [mapTilerKey, activeStyle]);

  // EXACT DISTANCE BETWEEN RIDER AND CUSTOMER (Haversine)
  const liveDistanceKm = calculateHaversineKm(
    animatedDriverCoords.lat,
    animatedDriverCoords.lng,
    targetCoords.lat,
    targetCoords.lng
  );
  // Estimated arrival time in minutes (based on ~25 km/h urban speed)
  const liveEtaMinutes = deliveryEtaMinutes ?? Math.max(2, Math.round((liveDistanceKm / 25) * 60));

  // Update marker positions and dynamic route line on map
  useEffect(() => {
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLngLat([animatedDriverCoords.lng, animatedDriverCoords.lat]);
      const distBadge = document.getElementById('maptiler-rider-dist');
      if (distBadge) {
        distBadge.textContent = `${liveDistanceKm.toFixed(2)} km`;
      }
    }
    if (customerMarkerRef.current) {
      customerMarkerRef.current.setLngLat([targetCoords.lng, targetCoords.lat]);
    }

    if (mapInstanceRef.current && mapInstanceRef.current.isStyleLoaded()) {
      const source = mapInstanceRef.current.getSource('route-line-source') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [animatedDriverCoords.lng, animatedDriverCoords.lat],
              [targetCoords.lng, targetCoords.lat],
            ],
          },
        });
      }
    }
  }, [animatedDriverCoords, targetCoords, liveDistanceKm]);

  // Calculate dynamic percentage positions for fallback visualization
  const dLatDeg = animatedDriverCoords.lat - targetCoords.lat;
  const dLngDeg = animatedDriverCoords.lng - targetCoords.lng;
  const maxSpan = 0.04;
  const riderLeftPct = Math.max(12, Math.min(88, 50 + (dLngDeg / maxSpan) * 35));
  const riderTopPct = Math.max(15, Math.min(85, 50 - (dLatDeg / maxSpan) * 35));
  const custLeftPct = 50;
  const custTopPct = 50;

  return (
    <div
      className={`relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-neutral-800 bg-[#090a0f] shadow-2xl flex flex-col ${className}`}
    >
      {/* 1. MAP VIEWPORT */}
      {!usingFallbackMap ? (
        <div ref={mapContainerRef} className="w-full h-full flex-1" />
      ) : (
        /* Dynamic Vector Simulation when WebGL is unmounted */
        <div
          onClick={(e) => {
            if (!interactive) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = (e.clientY - rect.top) / rect.height;

            const dLat = (clickY - 0.5) * -0.006;
            const dLng = (clickX - 0.5) * 0.006;
            const newLat = Math.round((targetCoords.lat + dLat) * 1000000) / 1000000;
            const newLng = Math.round((targetCoords.lng + dLng) * 1000000) / 1000000;
            setTargetCoords({ lat: newLat, lng: newLng });
            performReverseGeocode(newLat, newLng);
          }}
          className="relative w-full h-full flex-1 bg-[#0a0d14] overflow-hidden flex items-center justify-center cursor-crosshair select-none"
        >
          {/* Neon Dark Grid & Arteries */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dark-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dark-grid)" />
            {/* Roads */}
            <path d="M 0 110 Q 220 160 420 95 T 820 210" stroke="#059669" strokeWidth="4" fill="none" opacity="0.6" />
            <path d="M 130 0 Q 160 260 360 460" stroke="#0284c7" strokeWidth="3" fill="none" opacity="0.5" />
            <path d="M 60 360 Q 310 290 620 330" stroke="#f59e0b" strokeWidth="3" fill="none" opacity="0.5" />

            {/* Dynamic Pulsing route line between rider and customer */}
            <line
              x1={`${riderLeftPct}%`}
              y1={`${riderTopPct}%`}
              x2={`${custLeftPct}%`}
              y2={`${custTopPct}%`}
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />
          </svg>

          {/* RIDER / BOWSER MARKER WITH REAL-TIME DISTANCE CALLOUT */}
          <div
            className="absolute transition-all duration-700 ease-out z-20 flex flex-col items-center pointer-events-none"
            style={{
              top: `${riderTopPct}%`,
              left: `${riderLeftPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="mb-1 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] font-mono shadow-[0_0_14px_rgba(245,158,11,0.6)] flex items-center gap-1">
              <Car className="w-3.5 h-3.5" />
              <span>{orderStatus === 'Delivered' ? 'Arrived!' : `${liveDistanceKm.toFixed(2)} km to delivery`}</span>
            </div>

            <div className="relative">
              <span className="absolute -inset-2.5 rounded-full bg-amber-400 opacity-60 animate-ping" />
              <span className="absolute -inset-1 rounded-full bg-amber-500 opacity-40 animate-pulse" />
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.8)] flex items-center justify-center text-neutral-950">
                <Car className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-1 px-2.5 py-0.5 rounded-md bg-neutral-950/95 border border-amber-500/50 text-amber-200 text-[10px] font-mono shadow-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{driverLocation.name || 'Rajesh Sharma'} ({driverLocation.vehicle || 'KA 03 EV 4821'})</span>
            </div>
          </div>

          {/* CUSTOMER LIVE POSITION MARKER */}
          <div
            className="absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing group"
            style={{
              top: `${custTopPct}%`,
              left: `${custLeftPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="mb-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] font-mono shadow-[0_0_14px_rgba(16,185,129,0.7)] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Customer Live Coordinates</span>
            </div>

            <div className="relative">
              <span className="absolute -inset-3 rounded-full bg-emerald-500 opacity-50 animate-ping" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 border-2 border-white shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center justify-center text-white ring-4 ring-emerald-500/30 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
            </div>

            <div className="mt-1.5 px-3 py-1 rounded-md bg-neutral-950/95 border border-emerald-500/60 text-emerald-300 text-[11px] font-bold shadow-2xl flex items-center gap-1.5">
              <span>{customerLocation?.address || 'Your Vehicle Spot'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. TOP FLOATING TELEMETRY BAR: REAL-TIME DISTANCE & GPS LOCK */}
      <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2">
        {/* Dynamic Distance Badge (Rider to Customer) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-emerald-500/60 shadow-[0_0_18px_rgba(16,185,129,0.3)] text-white text-xs font-mono">
          <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-neutral-400">Rider Distance:</span>
          <span className="font-black text-emerald-300 text-sm">{liveDistanceKm.toFixed(2)} km</span>
          <span className="text-neutral-600">•</span>
          <span className="text-amber-300 font-bold">~{liveEtaMinutes} min ETA</span>
        </div>

        {/* GPS Satellite Lock Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-neutral-700 text-white text-[11px] font-mono shadow">
          <span
            className={`w-2 h-2 rounded-full ${
              satelliteLock ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-neutral-300">
            {satelliteLock ? 'Live Device GPS Active' : 'Acquiring GPS...'}
          </span>
          {accuracyRadius && (
            <span className="text-emerald-400 font-bold">±{accuracyRadius}m</span>
          )}
        </div>
      </div>

      {/* 3. TOP RIGHT CONTROLS: "Acquire GPS", Map Tailor styles, and HUD */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <button
          onClick={acquireLiveDeviceGps}
          title="Refresh Device Live Location"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 shadow-lg active:scale-95 transition-all text-xs font-black cursor-pointer"
        >
          <Crosshair className={`w-3.5 h-3.5 ${gpsStatus === 'tracking' ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh My GPS</span>
        </button>

        {/* Map Tailor Visual Style Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md text-xs font-bold transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Styles</span>
          </button>

          {showStyleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-neutral-950 text-white rounded-2xl shadow-2xl border border-neutral-700 py-2 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Map Tailor Visual Profiles
              </div>
              {[
                { id: 'tactical-dark', label: 'Tactical Dark', desc: 'Low-glare night & fleet tracking' },
                { id: 'clean-slate', label: 'Clean Slate', desc: 'High-contrast modern daylight' },
                { id: 'fleet-amber', label: 'Fleet Amber', desc: 'Warm industrial FuelGo theme' },
                { id: 'satellite-hybrid', label: 'Satellite Hybrid', desc: 'Aerial photo & driveway bays' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setActiveStyle(st.id as MapTailorStyle);
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 flex flex-col hover:bg-neutral-800 transition-colors cursor-pointer ${
                    activeStyle === st.id ? 'bg-neutral-800 text-emerald-400 font-bold' : 'text-neutral-300'
                  }`}
                >
                  <span>{st.label}</span>
                  <span className="text-[10px] text-neutral-400">{st.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry HUD Toggle */}
        <button
          onClick={() => setShowTelemetryHud(!showTelemetryHud)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
            showTelemetryHud
              ? 'bg-neutral-900 text-emerald-400 border border-emerald-500'
              : 'bg-neutral-900/90 text-neutral-200 hover:bg-neutral-800 border border-neutral-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Telemetry</span>
        </button>
      </div>

      {/* 4. 4-WAY MICRO-NUDGE KEYPAD */}
      {showMicroNudge && (
        <div className="absolute left-3 bottom-14 z-30 bg-neutral-950/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-800 shadow-2xl flex flex-col items-center gap-1">
          <span className="text-[9px] uppercase font-bold text-neutral-400 font-mono tracking-wider">Nudge</span>
          <button
            onClick={() => handleMicroNudge('N')}
            title="Nudge North 10m"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronUp className="w-4 h-4 text-emerald-400" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMicroNudge('W')}
              title="Nudge West 10m"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => handleMicroNudge('CENTER')}
              title="Center GPS"
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-neutral-950 active:scale-95 transition-all cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMicroNudge('E')}
              title="Nudge East 10m"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
          <button
            onClick={() => handleMicroNudge('S')}
            title="Nudge South 10m"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {/* 5. TELEMETRY HUD OVERLAY (Check Map Status) */}
      {showTelemetryHud && (
        <div className="absolute right-3 bottom-14 z-30 w-72 bg-neutral-950/95 backdrop-blur-md rounded-2xl border border-neutral-800 p-4 shadow-2xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Telemetry HUD</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>GPS Satellite Lock:</span>
            <span className={satelliteLock ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {satelliteLock ? 'High-Precision 3D Lock' : 'Standby / Simulated'}
            </span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Accuracy Radius:</span>
            <span className="text-white font-bold">{accuracyRadius ? `±${accuracyRadius} meters` : '±6 meters'}</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Target Lat / Lng:</span>
            <span className="text-emerald-300 font-bold">
              {targetCoords.lat.toFixed(5)}, {targetCoords.lng.toFixed(5)}
            </span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Rider Lat / Lng:</span>
            <span className="text-amber-300 font-bold">
              {animatedDriverCoords.lat.toFixed(5)}, {animatedDriverCoords.lng.toFixed(5)}
            </span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Rider Distance:</span>
            <span className="text-emerald-400 font-black">{liveDistanceKm} km (~{liveEtaMinutes}m)</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Bowser Telemetry:</span>
            <span className="text-white">{bowserLatency} ms (4G LTE)</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Active Map Tailor:</span>
            <span className="text-amber-400 font-bold capitalize">{activeStyle.replace('-', ' ')}</span>
          </div>
        </div>
      )}

      {/* 6. BOTTOM TELEMETRY FOOTER BAR */}
      <div className="px-4 py-2.5 bg-neutral-950/95 border-t border-neutral-800 text-white flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-neutral-400 truncate max-w-xs sm:max-w-md font-mono text-[11px]">
            {reverseGeocoding ? 'Resolving street address...' : customerLocation?.address || `${targetCoords.lat.toFixed(5)}°N, ${targetCoords.lng.toFixed(5)}°E`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-neutral-400">Rider Gap:</span>
            <span className="font-bold text-amber-300">{liveDistanceKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
