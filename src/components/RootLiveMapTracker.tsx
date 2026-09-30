import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Navigation,
  Crosshair,
  MapPin,
  Car,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCw,
  Fuel,
  ShieldCheck,
  Radio,
  Zap,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import * as maplibregl from 'maplibre-gl';
import { calculateHaversineKm } from './MapTilerMap';
import { store } from '../services/store';
import { FuelType } from '../types';

export type MapStyleType = 'tactical-dark' | 'clean-slate' | 'fleet-amber' | 'satellite-hybrid';

interface RootLiveMapTrackerProps {
  initialLocation?: { lat: number; lng: number; address?: string } | null;
  onOrderAtLocation?: (fuelType: FuelType, coords: { lat: number; lng: number; address: string }) => void;
  className?: string;
}

// Certified OMC Bunk Supply Points
const CERTIFIED_BUNKS = [
  {
    id: 'bunk-1',
    name: 'Indian Oil (IOCL) — Indiranagar Station',
    brand: 'IOCL',
    lat: 12.9784,
    lng: 77.6408,
    color: '#059669',
  },
  {
    id: 'bunk-2',
    name: 'Bharat Petroleum (BPCL) — Koramangala Hub',
    brand: 'BPCL',
    lat: 12.9345,
    lng: 77.6190,
    color: '#0284c7',
  },
  {
    id: 'bunk-3',
    name: 'Hindustan Petroleum (HPCL) — Whitefield Bunk',
    brand: 'HPCL',
    lat: 12.9698,
    lng: 77.7499,
    color: '#d97706',
  },
  {
    id: 'bunk-4',
    name: 'Shell Fuel Station — Electronic City Corridor',
    brand: 'Shell',
    lat: 12.8452,
    lng: 77.6602,
    color: '#dc2626',
  },
];

export const RootLiveMapTracker: React.FC<RootLiveMapTrackerProps> = ({
  initialLocation,
  onOrderAtLocation,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const fleetMarkersRef = useRef<maplibregl.Marker[]>([]);
  const bunkMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Map state
  const [mapStyle, setMapStyle] = useState<MapStyleType>('tactical-dark');
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(10);

  // Area Visibility Toggles
  const [showCoverageZones, setShowCoverageZones] = useState<boolean>(true);
  const [showFleetUnits, setShowFleetUnits] = useState<boolean>(true);
  const [showCertifiedBunks, setShowCertifiedBunks] = useState<boolean>(true);
  const [showRadarScanner, setShowRadarScanner] = useState<boolean>(true);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);

  // User Target Coordinates
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || 12.926,
    lng: initialLocation?.lng || 77.6762,
  });
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    initialLocation?.address || 'Outer Ring Road, Bellandur, Bengaluru'
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(6);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Live Patrolling Bowsers
  const drivers = store.getDrivers();
  const [activeFleet, setActiveFleet] = useState(
    drivers.map((d, i) => ({
      id: d.id,
      name: d.name,
      vehicle: d.vehicleNumber,
      lat: d.currentLocation.lat + (i === 0 ? 0.005 : i === 1 ? -0.008 : 0.012),
      lng: d.currentLocation.lng + (i === 0 ? -0.006 : i === 1 ? 0.01 : -0.007),
      status: d.status,
      speedKmh: Math.floor(22 + Math.random() * 15),
    }))
  );

  // Dynamic Fleet movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFleet((prev) =>
        prev.map((bowser) => {
          const deltaLat = (Math.random() - 0.5) * 0.001;
          const deltaLng = (Math.random() - 0.5) * 0.001;
          return {
            ...bowser,
            lat: Math.round((bowser.lat + deltaLat) * 1000000) / 1000000,
            lng: Math.round((bowser.lng + deltaLng) * 1000000) / 1000000,
            speedKmh: Math.floor(18 + Math.random() * 20),
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Reverse geocoding helper
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'FuelGo-RootMap/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const parts = data.display_name.split(',');
          const shortAddr = parts.slice(0, 3).join(',').trim();
          setResolvedAddress(shortAddr);
          return;
        }
      }
    } catch {
      // fallback
    }
    setResolvedAddress(`Pinpoint (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
  }, []);

  // Live GPS Acquisition
  const acquireDeviceGps = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setIsDetectingGps(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(Math.round(accuracy) || 5);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 14.5,
            essential: true,
          });
        }
        reverseGeocode(latitude, longitude);
      },
      () => {
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [reverseGeocode]);

  useEffect(() => {
    acquireDeviceGps();
  }, [acquireDeviceGps]);

  // Nearest Bowser Calculation
  const nearestBowser = activeFleet.reduce(
    (closest, bowser) => {
      const dist = calculateHaversineKm(userCoords.lat, userCoords.lng, bowser.lat, bowser.lng);
      if (dist < closest.distance) {
        return { bowser, distance: dist };
      }
      return closest;
    },
    { bowser: activeFleet[0], distance: 999 }
  );

  const nearestEtaMinutes = Math.max(3, Math.round((nearestBowser.distance / 25) * 60));
  const isInsideCoverage = nearestBowser.distance <= selectedRadiusKm;

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let tileUrl = 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
    if (mapStyle === 'clean-slate') {
      tileUrl = 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
    } else if (mapStyle === 'fleet-amber') {
      tileUrl = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
    } else if (mapStyle === 'satellite-hybrid') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [tileUrl],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            },
          },
          layers: [
            {
              id: 'base-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [userCoords.lng, userCoords.lat],
        zoom: 13,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('error', () => {
        setUsingFallback(true);
      });

      map.on('load', () => {
        // 1. User Position Marker
        const userEl = document.createElement('div');
        userEl.className = 'cursor-pointer flex flex-col items-center';
        userEl.innerHTML = `
          <div class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-bold text-[9px] shadow-lg flex items-center gap-1 border border-white/50">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>Your Spot</span>
          </div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center justify-center text-white text-base">
            📍
          </div>
        `;

        const userMarker = new maplibregl.Marker({ element: userEl, draggable: true })
          .setLngLat([userCoords.lng, userCoords.lat])
          .addTo(map);

        userMarker.on('dragend', () => {
          const lngLat = userMarker.getLngLat();
          setUserCoords({ lat: lngLat.lat, lng: lngLat.lng });
          reverseGeocode(lngLat.lat, lngLat.lng);
        });

        userMarkerRef.current = userMarker;

        // 2. Active Bowser Fleet Markers
        fleetMarkersRef.current = activeFleet.map((bowser) => {
          const el = document.createElement('div');
          el.className = 'flex flex-col items-center pointer-events-none';
          el.innerHTML = `
            <div class="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-mono font-black text-[9px] shadow-lg flex items-center gap-1">
              <span>🚚 ${bowser.vehicle.slice(-7)}</span>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.8)] flex items-center justify-center text-neutral-950 text-xs font-bold">
              ⛽
            </div>
          `;
          return new maplibregl.Marker({ element: el })
            .setLngLat([bowser.lng, bowser.lat])
            .addTo(map);
        });

        // 3. Certified OMC Bunk Station Markers
        bunkMarkersRef.current = CERTIFIED_BUNKS.map((bunk) => {
          const el = document.createElement('div');
          el.className = 'flex flex-col items-center pointer-events-none opacity-90';
          el.innerHTML = `
            <div class="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-white font-mono text-[8px] shadow">
              ${bunk.brand}
            </div>
            <div class="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-[10px]">
              🏪
            </div>
          `;
          return new maplibregl.Marker({ element: el })
            .setLngLat([bunk.lng, bunk.lat])
            .addTo(map);
        });
      });

      // Click to place delivery pin
      map.on('click', (e) => {
        setUserCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat(e.lngLat);
        }
        reverseGeocode(e.lngLat.lat, e.lngLat.lng);
      });

      mapInstanceRef.current = map;

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch {
      setUsingFallback(true);
    }
  }, [mapStyle, reverseGeocode]);

  // Update Fleet markers as coordinates animate
  useEffect(() => {
    if (fleetMarkersRef.current.length === activeFleet.length) {
      activeFleet.forEach((bowser, idx) => {
        fleetMarkersRef.current[idx]?.setLngLat([bowser.lng, bowser.lat]);
      });
    }
  }, [activeFleet]);

  const handleOrderFuelNow = (type: FuelType) => {
    if (onOrderAtLocation) {
      onOrderAtLocation(type, {
        lat: userCoords.lat,
        lng: userCoords.lng,
        address: resolvedAddress,
      });
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-neutral-800 bg-[#0a0d14] shadow-2xl flex flex-col ${className}`}>
      {/* 1. TOP STATUS BAR: Area Visibility & Sector Telemetry */}
      <div className="px-5 py-3.5 bg-neutral-950/95 border-b border-neutral-800 text-white flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-black text-sm text-white tracking-wide flex items-center gap-1.5">
              <span>Live Fuel Fleet Tracking & Sector Radar</span>
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            {isInsideCoverage ? 'Active Coverage: Verified' : 'Standard Delivery'}
          </span>
        </div>

        {/* Coverage Radius Selector (5km, 10km, 15km) */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          <span className="text-neutral-400 px-2 text-[10px] uppercase font-bold flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400" /> Radius
          </span>
          {[5, 10, 15].map((km) => (
            <button
              key={km}
              onClick={() => setSelectedRadiusKm(km)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedRadiusKm === km
                  ? 'bg-emerald-600 text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN MAP VIEWPORT */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-[#090b10] overflow-hidden">
        {!usingFallback ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* High-Tech Vector Simulation fallback */
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = (e.clientX - rect.left) / rect.width;
              const clickY = (e.clientY - rect.top) / rect.height;
              const dLat = (clickY - 0.5) * -0.01;
              const dLng = (clickX - 0.5) * 0.01;
              const newLat = Math.round((userCoords.lat + dLat) * 1000000) / 1000000;
              const newLng = Math.round((userCoords.lng + dLng) * 1000000) / 1000000;
              setUserCoords({ lat: newLat, lng: newLng });
              reverseGeocode(newLat, newLng);
            }}
            className="relative w-full h-full bg-[#07090e] cursor-crosshair select-none flex items-center justify-center"
          >
            {/* Dark Grid Background */}
            <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radar-grid)" />
              {/* Arteries */}
              <path d="M 0 160 Q 250 220 500 120 T 900 280" stroke="#059669" strokeWidth="3" fill="none" opacity="0.6" />
              <path d="M 180 0 Q 220 320 480 600" stroke="#0284c7" strokeWidth="3" fill="none" opacity="0.5" />
            </svg>

            {/* Simulated Live User Marker */}
            <div className="absolute z-20 flex flex-col items-center" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="mb-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.8)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Your Live Vehicle Location</span>
              </div>
              <div className="relative">
                <span className="absolute -inset-3 rounded-full bg-emerald-500/40 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 border-2 border-white shadow-2xl flex items-center justify-center text-white ring-4 ring-emerald-500/30">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Simulated Patrolling Fleet */}
            {activeFleet.map((bowser, idx) => {
              const offsets = [
                { top: '35%', left: '32%' },
                { top: '68%', left: '65%' },
                { top: '28%', left: '72%' },
              ];
              const pos = offsets[idx % offsets.length];
              return (
                <div key={bowser.id} className="absolute z-10 flex flex-col items-center" style={pos}>
                  <div className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-black text-[9px] font-mono shadow">
                    🚚 {bowser.vehicle}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-lg text-xs">
                    ⛽
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. VISUAL AREA COVERAGE RINGS OVERLAY */}
        {showCoverageZones && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
            {/* 5km Inner Express Zone */}
            <div
              className="absolute rounded-full border border-emerald-400/40 bg-emerald-500/5 transition-all duration-700"
              style={{
                width: `${Math.min(520, selectedRadiusKm * 28)}px`,
                height: `${Math.min(520, selectedRadiusKm * 28)}px`,
              }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-950/90 text-emerald-300 font-mono text-[9px] border border-emerald-500/40 shadow">
                {selectedRadiusKm}km Geofence Service Zone
              </div>
            </div>

            {/* Radar Beam Scanning Animation */}
            {showRadarScanner && (
              <div
                className="absolute rounded-full border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/10 to-transparent animate-spin duration-1000"
                style={{
                  width: `${Math.min(520, selectedRadiusKm * 28)}px`,
                  height: `${Math.min(520, selectedRadiusKm * 28)}px`,
                  animationDuration: '6s',
                }}
              />
            )}
          </div>
        )}

        {/* 4. FLOATING TOP-LEFT TELEMETRICS HUD */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-xs sm:max-w-sm">
          {/* Live Dispatch Radar Card */}
          <div className="bg-neutral-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-neutral-800 shadow-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Sector Telemetry Radar</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-neutral-400">
                <span>Nearest Mobile Bowser:</span>
                <span className="text-amber-300 font-bold">
                  {nearestBowser.distance} km away
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Estimated Arrival:</span>
                <span className="text-emerald-400 font-black">
                  ~{nearestEtaMinutes} Minutes
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Active City Units:</span>
                <span className="text-white font-bold">
                  {activeFleet.length} Mobile Dispensers
                </span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="truncate max-w-[200px]">📍 {resolvedAddress}</span>
              <span className="text-emerald-400 font-mono">±{gpsAccuracy}m</span>
            </div>
          </div>
        </div>

        {/* 5. FLOATING TOP-RIGHT CONTROLS */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Refresh GPS Button */}
          <button
            onClick={acquireDeviceGps}
            title="Detect My Live Device Location"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">My Live Location</span>
          </button>

          {/* Style Selector */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-md text-xs font-bold transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Styles</span>
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-neutral-950 text-white rounded-2xl shadow-2xl border border-neutral-700 py-2 z-50 text-xs">
                {[
                  { id: 'tactical-dark', label: 'Tactical Dark' },
                  { id: 'clean-slate', label: 'Clean Slate' },
                  { id: 'fleet-amber', label: 'Fleet Amber' },
                  { id: 'satellite-hybrid', label: 'Satellite Hybrid' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setMapStyle(s.id as MapStyleType);
                      setShowStyleMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 hover:bg-neutral-800 transition-colors ${
                      mapStyle === s.id ? 'text-emerald-400 font-bold' : 'text-neutral-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6. AREA VISIBILITY LAYER TOGGLES (Bottom Center Float) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 shadow-2xl text-[11px] text-white">
          <span className="text-neutral-400 font-mono font-bold uppercase text-[9px] mr-1 hidden sm:inline">
            Area Visibility:
          </span>

          <button
            onClick={() => setShowCoverageZones(!showCoverageZones)}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 ${
              showCoverageZones
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Coverage Rings</span>
          </button>

          <button
            onClick={() => setShowFleetUnits(!showFleetUnits)}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 ${
              showFleetUnits
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Patrol Bowsers ({activeFleet.length})</span>
          </button>

          <button
            onClick={() => setShowCertifiedBunks(!showCertifiedBunks)}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 ${
              showCertifiedBunks
                ? 'bg-blue-950/80 text-blue-300 border border-blue-500/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>OMC Pumps ({CERTIFIED_BUNKS.length})</span>
          </button>

          <button
            onClick={() => setShowRadarScanner(!showRadarScanner)}
            className={`px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 ${
              showRadarScanner
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Radar Sweep</span>
          </button>
        </div>
      </div>

      {/* 7. BOTTOM ACTION & DISPATCH BAR */}
      <div className="px-5 py-4 bg-gradient-to-r from-neutral-950 via-[#0d1017] to-neutral-950 border-t border-neutral-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs text-white">Selected Delivery Spot:</span>
            <span className="font-mono text-emerald-400 text-xs font-semibold">{resolvedAddress}</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Click anywhere on the map above to move pin • Certified PESO carriers dispatched in ~{nearestEtaMinutes} mins
          </p>
        </div>

        {/* Immediate Refueling Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleOrderFuelNow('Petrol')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Deliver Petrol Here (1–5L)</span>
          </button>

          <button
            onClick={() => handleOrderFuelNow('Diesel')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            <span>Deliver Diesel Here (1–10L)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
