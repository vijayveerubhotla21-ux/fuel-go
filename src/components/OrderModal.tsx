import React, { useState, useEffect } from 'react';
import {
  X,
  Fuel,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Crosshair,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Navigation,
} from 'lucide-react';
import { FuelType, PaymentMethod, User, Order, DeliveryAddress } from '../types';
import { store } from '../services/store';
import { MapTilerMap } from './MapTilerMap';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onOrderCreated: (order: Order) => void;
  initialFuelType?: FuelType;
  defaultCoords?: { lat: number; lng: number; address?: string };
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOrderCreated,
  initialFuelType = 'Petrol',
  defaultCoords,
}) => {
  const [fuelType, setFuelType] = useState<FuelType>(initialFuelType);
  const [quantity, setQuantity] = useState<number>(initialFuelType === 'Petrol' ? 3 : 5);
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [addressLine, setAddressLine] = useState<string>(
    defaultCoords?.address || 'Acquiring GPS location...'
  );
  const [landmark, setLandmark] = useState<string>('Near Vehicle Spot');
  const [city, setCity] = useState<string>('Bengaluru');
  const [pincode, setPincode] = useState<string>('560103');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultCoords?.lat || 12.926,
    lng: defaultCoords?.lng || 77.6762,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync initial fuel type and defaultCoords
  useEffect(() => {
    setFuelType(initialFuelType);
    setQuantity(initialFuelType === 'Petrol' ? 3 : 5);
    setCustomQuantity('');
    setErrorMessage(null);

    if (defaultCoords && defaultCoords.lat && defaultCoords.lng) {
      setCoords({ lat: defaultCoords.lat, lng: defaultCoords.lng });
      if (defaultCoords.address) {
        setAddressLine(defaultCoords.address);
      }
    }
  }, [initialFuelType, defaultCoords, isOpen]);

  // AUTOMATICALLY ACQUIRE CUSTOMER'S LIVE GPS COORDINATES ON OPEN
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setIsLocating(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'FuelGo-Delivery/1.0' } }
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                const parts = data.display_name.split(',');
                setAddressLine(parts.slice(0, 3).join(',').trim());
                if (data.display_name.includes('Bengaluru') || data.display_name.includes('Bangalore')) {
                  setCity('Bengaluru');
                }
                return;
              }
            }
          } catch {
            // fallback
          }

          setAddressLine(`Spot ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`);
        },
        () => {
          setIsLocating(false);
          // Fallback gracefully to default coordinates
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [isOpen]);

  const todayStr = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const petrolPresets = [1, 2, 3, 4, 5];
  const dieselPresets = [1, 2, 5, 7, 10];
  const currentPresets = fuelType === 'Petrol' ? petrolPresets : dieselPresets;

  // Real-time server breakdown
  const breakdown = store.calculateBreakdown(fuelType, quantity);

  // Handle Preset Click
  const handlePresetSelect = (litres: number) => {
    setQuantity(litres);
    setCustomQuantity('');
    setErrorMessage(null);
  };

  // Handle Custom Input
  const handleCustomQuantityChange = (valStr: string) => {
    setCustomQuantity(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setQuantity(parsed);
      if (fuelType === 'Petrol' && parsed > 5) {
        setErrorMessage('Petrol orders are limited to a maximum of 5 litres per order.');
      } else if (fuelType === 'Diesel' && parsed > 10) {
        setErrorMessage('Diesel orders are limited to a maximum of 10 litres per order.');
      } else if (parsed < 1) {
        setErrorMessage(`Minimum order quantity for ${fuelType} is 1 litre.`);
      } else {
        setErrorMessage(null);
      }
    }
  };

  const handleFuelTypeChange = (type: FuelType) => {
    setFuelType(type);
    const defaultQty = type === 'Petrol' ? 3 : 5;
    setQuantity(defaultQty);
    setCustomQuantity('');
    setErrorMessage(null);
  };

  // Manual Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'FuelGo-Delivery/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setAddressLine(data.display_name.split(',').slice(0, 3).join(',').trim());
              setErrorMessage(null);
              return;
            }
          }
        } catch {
          // fallback
        }

        setAddressLine(`Live GPS (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E)`);
        setErrorMessage(null);
      },
      () => {
        setIsLocating(false);
        setErrorMessage('Could not acquire GPS position. Please check location permissions.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qtyCheck = store.validateOrderQuantity(fuelType, quantity);
    if (!qtyCheck.valid) {
      setErrorMessage(qtyCheck.error || 'Invalid fuel quantity.');
      return;
    }

    if (isScheduled && !scheduledDate) {
      setErrorMessage('Please select a scheduled delivery date.');
      return;
    }

    setIsSubmitting(true);

    const deliveryAddress: DeliveryAddress = {
      addressLine,
      landmark,
      city,
      pincode,
      lat: coords.lat,
      lng: coords.lng,
    };

    const res = store.createOrder({
      user: currentUser,
      fuelType,
      quantity,
      deliveryAddress,
      paymentMethod,
      isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledTime: isScheduled ? scheduledTime : undefined,
      notes,
    });

    setIsSubmitting(false);

    if (!res.success || !res.order) {
      setErrorMessage(res.error || 'Failed to place order.');
    } else {
      onOrderCreated(res.order);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0d0f17] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a0c13] border-b border-neutral-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Order Emergency Fuel</h3>
              <p className="text-xs text-neutral-400">Doorstep Delivery • PESO Certified • Live GPS Pinpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with dark theme field styling */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2.5 font-medium animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Fuel Type */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              1. Select Fuel Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Petrol Card */}
              <button
                type="button"
                onClick={() => handleFuelTypeChange('Petrol')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  fuelType === 'Petrol'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">Petrol (BS-VI)</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">₹104.25 / L</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">High-octane spark ignition fuel</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  <span>Limit: 1–5 Litres max</span>
                </div>
              </button>

              {/* Diesel Card */}
              <button
                type="button"
                onClick={() => handleFuelTypeChange('Diesel')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  fuelType === 'Diesel'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-2 ring-amber-500/30'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-white">Diesel (BS-VI)</span>
                  <span className="text-xs font-bold font-mono text-amber-400">₹91.80 / L</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Ultra-low sulfur commercial fuel</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  <span>Limit: 1–10 Litres max</span>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Select Quantity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                2. Select Quantity ({fuelType})
              </label>
              <span className="text-[11px] text-neutral-400 font-mono">
                Statutory Limit: {fuelType === 'Petrol' ? '1 L to 5 L' : '1 L to 10 L'}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 gap-2">
              {currentPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                    quantity === preset && !customQuantity
                      ? fuelType === 'Petrol'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                        : 'bg-amber-600 text-white border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  }`}
                >
                  {preset} L
                </button>
              ))}
            </div>

            {/* Custom Quantity */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-400 whitespace-nowrap">Or custom quantity:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max={fuelType === 'Petrol' ? 5 : 10}
                  value={customQuantity}
                  onChange={(e) => handleCustomQuantityChange(e.target.value)}
                  placeholder={`Enter ${fuelType === 'Petrol' ? '1 to 5' : '1 to 10'} Litres`}
                  className="w-full px-3 py-2 text-xs font-bold bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-neutral-500 font-semibold">Litres</span>
              </div>
            </div>
          </div>

          {/* STEP 3: Delivery Timing */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              3. Delivery Timing
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsScheduled(false)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isScheduled
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deliver Now (15–30 Mins)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsScheduled(true);
                  if (!scheduledDate) setScheduledDate(todayStr);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isScheduled
                    ? 'bg-amber-950/70 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Schedule for Later</span>
              </button>
            </div>

            {isScheduled && (
              <div className="mt-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required={isScheduled}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Time Slot</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="11:30 AM">11:30 AM - 12:30 PM</option>
                    <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="04:30 PM">04:30 PM - 05:30 PM</option>
                    <option value="07:00 PM">07:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: Delivery Location & Live Map Pinpoint */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>4. Precision Delivery Pinpoint (Map Tailor)</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800 transition-colors"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locking GPS...' : 'Acquire My GPS'}</span>
              </button>
            </div>

            {/* Embedded Live Map Tailor */}
            <div className="h-64 sm:h-72 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl relative">
              <MapTilerMap
                customerLocation={{
                  lat: coords.lat,
                  lng: coords.lng,
                  address: addressLine,
                }}
                interactive={true}
                enablePinpoint={true}
                showMicroNudge={true}
                showUberDeepLink={false}
                autoDetectLocation={true}
                onLocationSelect={(lat, lng, addr) => {
                  setCoords({ lat, lng });
                  if (addr) {
                    setAddressLine(addr);
                    if (addr.includes('Bengaluru') || addr.includes('Bangalore')) {
                      setCity('Bengaluru');
                    }
                  }
                }}
              />
            </div>

            {/* Address Input Fields with Dark Theme Colors */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span>Synchronized Delivery Coordinates:</span>
                <span className="text-emerald-400 font-bold">
                  {coords.lat.toFixed(5)}°N, {coords.lng.toFixed(5)}°E
                </span>
              </div>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Street address / Vehicle parking bay spot"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Landmark (Optional)"
                  className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: Payment Method */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
              5. Payment Method (INR ₹)
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              {(['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'COD'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === m
                      ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                      : 'border-neutral-800 bg-neutral-900 hover:bg-neutral-800/80 text-neutral-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400 bg-neutral-900 p-2 rounded-xl border border-neutral-800">
              <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>
                <strong>Simulation Mode:</strong> Online payments are safely verified in test mode. No actual money will be charged.
              </span>
            </div>
          </div>

          {/* STEP 6: Price Breakdown */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs space-y-2">
            <h4 className="font-bold text-neutral-300 uppercase tracking-wider text-[11px]">
              Order Price Breakdown (INR)
            </h4>
            <div className="flex justify-between text-neutral-400">
              <span>
                Fuel Cost ({breakdown.quantity} L × ₹{breakdown.pricePerLitre.toFixed(2)}):
              </span>
              <span className="font-mono font-semibold text-neutral-200">₹{breakdown.fuelSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Rider / Delivery Logistics Fee (Itemized separately):</span>
              <span className="font-mono font-semibold text-neutral-200">₹{breakdown.riderCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Applicable Tax (5% GST):</span>
              <span className="font-mono font-semibold text-neutral-200">₹{breakdown.taxAmount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-neutral-800" />
            <div className="flex justify-between font-bold text-sm">
              <span className="text-white">Total Payable Amount:</span>
              <span className="font-mono text-emerald-400 text-base">₹{breakdown.finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-neutral-950" />
            <span>
              {isSubmitting
                ? 'Processing Fuel Order...'
                : `Confirm Order & Pay ₹${breakdown.finalTotal.toFixed(2)}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
