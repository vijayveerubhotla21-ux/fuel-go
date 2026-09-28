import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Navigation,
  Crosshair,
  AlertTriangle,
  Compass,
  MapPin,
  ExternalLink,
  Car,
  Clock,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Radio,
  Wifi,
  Activity,
  Maximize2,
  CheckCircle2,
  RefreshCw,
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
}

// Distance calculation using Haversine formula
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
  return Math.round(R * c * 10) / 10;
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const driverMarkerRef = useRef<maplibregl.Marker | null>(null);
  const customerMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Map Tailor Styling Profile
  const [activeStyle, setActiveStyle] = useState<MapTailorStyle>(initialStyle);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [showTelemetryHud, setShowTelemetryHud] = useState<boolean>(false);

  // Default coordinate fallback if geolocation is not yet permitted
  const initialLat = customerLocation?.lat || 12.926;
  const initialLng = customerLocation?.lng || 77.6762;

  // Exact Customer / Delivery Target Coordinates
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  // GPS & Accuracy State
  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'tracking' | 'granted' | 'denied' | 'unavailable' | 'unsupported' | 'low_accuracy'
  >('idle');
  const [accuracyRadius, setAccuracyRadius] = useState<number | null>(null);
  const [satelliteLock, setSatelliteLock] = useState<boolean>(false);
  const [bowserLatency, setBowserLatency] = useState<number>(24);
  const [hasAcquiredInitialGps, setHasAcquiredInitialGps] = useState<boolean>(false);

  // Rider animated coordinates
  const [animatedDriverCoords, setAnimatedDriverCoords] = useState<{ lat: number; lng: number }>(driverLocation);
  const [reverseGeocoding, setReverseGeocoding] = useState<boolean>(false);
  const [usingFallbackMap, setUsingFallbackMap] = useState<boolean>(false);

  // Sync prop updates if parent explicitly updates customerLocation
  useEffect(() => {
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      setTargetCoords({ lat: customerLocation.lat, lng: customerLocation.lng });
    }
  }, [customerLocation?.lat, customerLocation?.lng]);

  // MapTiler API Key from env
  const mapTilerKey = (import.meta.env.VITE_MAPTILER_API_KEY as string) || '';
  const isKeyConfigured = mapTilerKey && mapTilerKey !== 'get_your_key_at_maptiler_com' && mapTilerKey.length > 5;

  // Reverse Geocode helper
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

  // LIVE DEVICE GPS ACQUISITION
  const acquireLiveDeviceGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('tracking');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setTargetCoords({ lat: latitude, lng: longitude });
        setAccuracyRadius(Math.round(accuracy) || 5);
        setGpsStatus(accuracy > 60 ? 'low_accuracy' : 'granted');
        setSatelliteLock(true);
        setHasAcquiredInitialGps(true);

        // Center map on customer's genuine location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
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
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [performReverseGeocode]);

  // CRITICAL REQUIREMENT: Automatically detect customer's live GPS on mount!
  useEffect(() => {
    if (autoDetectLocation && !hasAcquiredInitialGps) {
      acquireLiveDeviceGps();
    }
  }, [autoDetectLocation, hasAcquiredInitialGps, acquireLiveDeviceGps]);

  // Continuous watchPosition for live location updates
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setAccuracyRadius(Math.round(accuracy) || 5);
        setSatelliteLock(true);
        setGpsStatus(accuracy > 60 ? 'low_accuracy' : 'granted');

        // Only auto-update if order is not pinned to a specific custom spot
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

  // Simulate smooth driver movement towards destination when order is active
  useEffect(() => {
    if (orderStatus === 'Delivered') {
      setAnimatedDriverCoords({ lat: targetCoords.lat, lng: targetCoords.lng });
      return;
    }

    if (!['On The Way', 'Arriving Soon'].includes(orderStatus)) {
      setAnimatedDriverCoords(driverLocation);
      return;
    }

    const interval = setInterval(() => {
      setAnimatedDriverCoords((prev) => {
        const dLat = (targetCoords.lat - prev.lat) * 0.06;
        const dLng = (targetCoords.lng - prev.lng) * 0.06;
        return {
          lat: prev.lat + dLat,
          lng: prev.lng + dLng,
        };
      });

      setBowserLatency(Math.floor(20 + Math.random() * 8));
    }, 3000);

    return () => clearInterval(interval);
  }, [orderStatus, targetCoords, driverLocation]);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!isKeyConfigured) {
      setUsingFallbackMap(true);
      return;
    }

    try {
      const styleUrl =
        activeStyle === 'tactical-dark'
          ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${mapTilerKey}`
          : activeStyle === 'fleet-amber'
          ? `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${mapTilerKey}`
          : activeStyle === 'satellite-hybrid'
          ? `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerKey}`
          : `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [targetCoords.lng, targetCoords.lat],
        zoom: 14,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('error', () => {
        setUsingFallbackMap(true);
      });

      map.on('load', () => {
        // Customer / Target Marker
        const custEl = document.createElement('div');
        custEl.className =
          'w-10 h-10 bg-emerald-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-white font-bold text-sm cursor-grab active:cursor-grabbing ring-4 ring-emerald-500/40 animate-pulse';
        custEl.innerHTML = '📍';

        const custMarker = new maplibregl.Marker({ element: custEl, draggable: enablePinpoint || interactive })
          .setLngLat([targetCoords.lng, targetCoords.lat])
          .addTo(map);

        custMarker.on('dragend', () => {
          const lngLat = custMarker.getLngLat();
          setTargetCoords({ lat: lngLat.lat, lng: lngLat.lng });
          performReverseGeocode(lngLat.lat, lngLat.lng);
        });

        customerMarkerRef.current = custMarker;

        // Driver / Bowser Marker
        const drvEl = document.createElement('div');
        drvEl.className =
          'w-10 h-10 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-white text-sm font-bold ring-4 ring-amber-500/30';
        drvEl.innerHTML = '🚚';

        driverMarkerRef.current = new maplibregl.Marker({ element: drvEl })
          .setLngLat([animatedDriverCoords.lng, animatedDriverCoords.lat])
          .addTo(map);
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
  }, [isKeyConfigured, mapTilerKey, activeStyle]);

  // Update marker positions
  useEffect(() => {
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLngLat([animatedDriverCoords.lng, animatedDriverCoords.lat]);
    }
    if (customerMarkerRef.current) {
      customerMarkerRef.current.setLngLat([targetCoords.lng, targetCoords.lat]);
    }
  }, [animatedDriverCoords, targetCoords]);

  // EXACT DISTANCE BETWEEN RIDER AND CUSTOMER
  const liveDistanceKm = calculateHaversineKm(
    animatedDriverCoords.lat,
    animatedDriverCoords.lng,
    targetCoords.lat,
    targetCoords.lng
  );
  // Estimated arrival time in minutes (based on 25 km/h urban speed)
  const liveEtaMinutes = Math.max(2, Math.round((liveDistanceKm / 25) * 60));

  // Uber Deep Link URL
  const uberDeepLink = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${targetCoords.lat}&dropoff[longitude]=${targetCoords.lng}&dropoff[nickname]=FuelGo%20Delivery%20Point`;

  return (
    <div className={`relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-neutral-800 bg-[#090a0f] shadow-2xl flex flex-col ${className}`}>
      {/* 1. MAP VIEWPORT */}
      {!usingFallbackMap ? (
        <div ref={mapContainerRef} className="w-full h-full flex-1" />
      ) : (
        /* Dark Cyber Vector Simulation */
        <div
          onClick={(e) => {
            if (!interactive) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = (e.clientY - rect.top) / rect.height;

            const dLat = (clickY - 0.5) * -0.005;
            const dLng = (clickX - 0.5) * 0.005;
            const newLat = Math.round((targetCoords.lat + dLat) * 1000000) / 1000000;
            const newLng = Math.round((targetCoords.lng + dLng) * 1000000) / 1000000;
            setTargetCoords({ lat: newLat, lng: newLng });
            performReverseGeocode(newLat, newLng);
          }}
          className="relative w-full h-full flex-1 bg-[#090b10] overflow-hidden flex items-center justify-center cursor-crosshair select-none"
        >
          {/* Neon Dark Grid & Arteries */}
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dark-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dark-grid)" />

            {/* Road network */}
            <path d="M 0 110 Q 220 160 420 95 T 820 210" stroke="#059669" strokeWidth="4.5" fill="none" opacity="0.6" />
            <path d="M 130 0 Q 160 260 360 460" stroke="#0284c7" strokeWidth="3.5" fill="none" opacity="0.5" />
            <path d="M 60 360 Q 310 290 620 330" stroke="#f59e0b" strokeWidth="4" fill="none" opacity="0.5" />

            {/* DYNAMIC ROUTE LINE CONNECTING RIDER AND CUSTOMER */}
            <line
              x1="28%"
              y1="36%"
              x2="72%"
              y2="64%"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />
          </svg>

          {/* RIDER / BOWSER MARKER WITH DISTANCE PILL */}
          <div
            className="absolute transition-all duration-1000 ease-out z-20 flex flex-col items-center pointer-events-none"
            style={{
              top: '36%',
              left: '28%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Live Distance Callout Floating Above Rider */}
            <div className="mb-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-[11px] font-mono shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center gap-1 animate-bounce">
              <Car className="w-3.5 h-3.5" />
              <span>{orderStatus === 'Delivered' ? 'Arrived!' : `${liveDistanceKm} km to you`}</span>
            </div>

            <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-amber-400 opacity-70 animate-ping" />
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.8)] flex items-center justify-center text-neutral-950">
                <Car className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-1 px-2.5 py-0.5 rounded-md bg-neutral-950/95 border border-amber-500/50 text-amber-200 text-[10px] font-mono shadow-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{driverLocation.name || 'Rajesh Sharma'} ({driverLocation.vehicle || 'KA 03 EV 4821'})</span>
            </div>
          </div>

          {/* CUSTOMER GENUINE LIVE LOCATION MARKER */}
          <div
            className="absolute z-20 flex flex-col items-center cursor-grab active:cursor-grabbing group"
            style={{
              top: '64%',
              left: '72%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Customer Live GPS Indicator */}
            <div className="mb-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] font-mono shadow-[0_0_12px_rgba(16,185,129,0.7)] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Customer Live Position</span>
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950/95 backdrop-blur-md border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white text-xs font-mono">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-neutral-400">Rider Distance:</span>
          <span className="font-black text-emerald-300 text-sm">{liveDistanceKm} km</span>
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg active:scale-95 transition-all text-xs font-bold"
        >
          <Crosshair className={`w-3.5 h-3.5 ${gpsStatus === 'tracking' ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh My GPS</span>
        </button>

        {/* Map Tailor Visual Style Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md text-xs font-bold transition-all"
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
                  className={`w-full text-left px-3.5 py-2 flex flex-col hover:bg-neutral-800 transition-colors ${
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all ${
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
        <div className="absolute left-3 bottom-16 z-30 bg-neutral-950/90 backdrop-blur-md p-2 rounded-2xl border border-neutral-800 shadow-2xl flex flex-col items-center gap-1">
          <span className="text-[9px] uppercase font-bold text-neutral-400 font-mono tracking-wider">Nudge</span>
          <button
            onClick={() => handleMicroNudge('N')}
            title="Nudge North 10m"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all"
          >
            <ChevronUp className="w-4 h-4 text-emerald-400" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleMicroNudge('W')}
              title="Nudge West 10m"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => handleMicroNudge('CENTER')}
              title="Center on Live GPS"
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 font-black text-[10px] w-6 h-6 flex items-center justify-center shadow"
            >
              •
            </button>
            <button
              onClick={() => handleMicroNudge('E')}
              title="Nudge East 10m"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
          <button
            onClick={() => handleMicroNudge('S')}
            title="Nudge South 10m"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 transition-all"
          >
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {/* 5. TELEMETRY HUD OVERLAY */}
      {showTelemetryHud && (
        <div className="absolute inset-x-3 top-14 z-40 p-4 rounded-2xl bg-neutral-950/98 backdrop-blur-md border border-neutral-700 text-white shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 font-mono">
                Live GPS & Bowser Telematics HUD
              </h4>
            </div>
            <button
              onClick={() => setShowTelemetryHud(false)}
              className="text-neutral-400 hover:text-white text-xs font-bold"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase block">Distance to Customer</span>
              <p className="font-bold text-emerald-400 text-base">{liveDistanceKm} km</p>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase block">Arrival ETA</span>
              <p className="font-bold text-amber-400 text-base">~{liveEtaMinutes} mins</p>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase block">Customer GPS Lock</span>
              <p className="font-bold text-white text-xs">
                {satelliteLock ? `Active (±${accuracyRadius || 5}m)` : 'Acquiring Fix...'}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase block">Bowser 4G Stream</span>
              <p className="font-bold text-emerald-300 text-xs">4G LTE • {bowserLatency}ms</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-neutral-400">Customer Target Lat/Lng:</span>
            <span className="text-emerald-400 font-bold">
              {targetCoords.lat.toFixed(6)}° N, {targetCoords.lng.toFixed(6)}° E
            </span>
          </div>
        </div>
      )}

      {/* 6. BOTTOM TELEMETRY FOOTER */}
      <div className="relative z-30 p-3 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[9px] uppercase text-neutral-500 font-bold">Live Distance</p>
              <p className="text-xs font-black text-emerald-400">{liveDistanceKm} km</p>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-800" />

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[9px] uppercase text-neutral-500 font-bold">Est. Arrival</p>
              <p className="text-xs font-black text-amber-300">
                {orderStatus === 'Delivered' ? 'Delivered' : `~${liveEtaMinutes} mins`}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-neutral-800" />

          <div className="hidden sm:block">
            <p className="text-[9px] uppercase text-neutral-500 font-bold">Customer Coordinates</p>
            <p className="text-[11px] text-neutral-300">
              {targetCoords.lat.toFixed(4)}°N, {targetCoords.lng.toFixed(4)}°E
            </p>
          </div>
        </div>

        {/* Uber Deep Link (Preserved requirement) */}
        {showUberDeepLink && (
          <a
            href={uberDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold transition-all shadow"
            title="Open Uber to navigate or hail a ride to this drop point"
          >
            <span>Uber Deep Link</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        )}
      </div>
    </div>
  );
};
