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
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOrderCreated,
  initialFuelType = 'Petrol',
}) => {
  const [fuelType, setFuelType] = useState<FuelType>(initialFuelType);
  const [quantity, setQuantity] = useState<number>(initialFuelType === 'Petrol' ? 3 : 5);
  const [customQuantity, setCustomQuantity] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [addressLine, setAddressLine] = useState<string>('Flat 402, Green Glen Layout, Bellandur');
  const [landmark, setLandmark] = useState<string>('Near Central Mall');
  const [city, setCity] = useState<string>('Bengaluru');
  const [pincode, setPincode] = useState<string>('560103');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.926, lng: 77.6762 });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync initial fuel type
  useEffect(() => {
    setFuelType(initialFuelType);
    setQuantity(initialFuelType === 'Petrol' ? 3 : 5);
    setCustomQuantity('');
    setErrorMessage(null);
  }, [initialFuelType, isOpen]);

  // Set min schedule date to tomorrow or today
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
      // Real-time validation message
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

  // Switch Fuel Type
  const handleFuelTypeChange = (type: FuelType) => {
    setFuelType(type);
    const defaultQty = type === 'Petrol' ? 3 : 5;
    setQuantity(defaultQty);
    setCustomQuantity('');
    setErrorMessage(null);
  };

  // Current Geolocation trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAddressLine(`GPS Pinned Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setErrorMessage(null);
      },
      () => {
        setIsLocating(false);
        setErrorMessage('Could not acquire GPS location. Using default city address.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate server-side quantity rule
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Order Emergency Fuel</h3>
              <p className="text-xs text-neutral-400">Doorstep Delivery • PESO Certified • MapTiler GPS Tracked</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 font-medium animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Fuel Type */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              1. Select Fuel Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Petrol Card */}
              <button
                type="button"
                onClick={() => handleFuelTypeChange('Petrol')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  fuelType === 'Petrol'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-emerald-950'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-base">Petrol (BS-VI)</span>
                  <span className="text-xs font-bold font-mono text-emerald-700">₹104.25 / L</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">High-octane spark ignition fuel</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/10 text-emerald-700 text-[11px] font-bold">
                  <span>Limit: 1–5 Litres max</span>
                </div>
              </button>

              {/* Diesel Card */}
              <button
                type="button"
                onClick={() => handleFuelTypeChange('Diesel')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  fuelType === 'Diesel'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20 text-amber-950'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-base">Diesel (BS-VI)</span>
                  <span className="text-xs font-bold font-mono text-amber-700">₹91.80 / L</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Ultra-low sulfur commercial fuel</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-600/10 text-amber-700 text-[11px] font-bold">
                  <span>Limit: 1–10 Litres max</span>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 2: Select Quantity with Presets & Custom Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                2. Select Quantity ({fuelType})
              </label>
              <span className="text-xs text-neutral-500 font-medium">
                Allowed: {fuelType === 'Petrol' ? '1 L to 5 L' : '1 L to 10 L'}
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
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                  }`}
                >
                  {preset} L
                </button>
              ))}
            </div>

            {/* Custom Quantity Field */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-600 whitespace-nowrap">Or custom quantity:</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max={fuelType === 'Petrol' ? 5 : 10}
                  value={customQuantity}
                  onChange={(e) => handleCustomQuantityChange(e.target.value)}
                  placeholder={`Enter ${fuelType === 'Petrol' ? '1 to 5' : '1 to 10'} Litres`}
                  className="w-full px-3 py-1.5 text-xs font-bold border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1.5 text-xs text-neutral-400 font-semibold">Litres</span>
              </div>
            </div>
          </div>

          {/* STEP 3: Delivery Scheduling */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              3. Delivery Timing
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsScheduled(false)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !isScheduled
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
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
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Schedule for Later</span>
              </button>
            </div>

            {/* Scheduled Date/Time Inputs */}
            {isScheduled && (
              <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Delivery Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required={isScheduled}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Delivery Time Slot</label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white"
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

          {/* STEP 4: Delivery Location & Precision Map Tailor Pinpoint */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>4. Precision Delivery Pinpoint (Map Tailor)</span>
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">
                Tap map, drag pin, or use 10m micro-nudges
              </span>
            </div>

            {/* Embedded Map Tailor Precision Pinpoint Map */}
            <div className="h-64 sm:h-72 rounded-2xl overflow-hidden border border-neutral-300 shadow-sm relative">
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
                onLocationSelect={(lat, lng, addr) => {
                  setCoords({ lat, lng });
                  if (addr) {
                    setAddressLine(addr);
                    // Extract city or pincode if available
                    if (addr.includes('Bengaluru') || addr.includes('Bangalore')) {
                      setCity('Bengaluru');
                    }
                  }
                }}
              />
            </div>

            {/* Address Input Fields with GPS Sync */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Synchronized Delivery Address:</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                </span>
              </div>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Street address / Vehicle parking bay spot"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Landmark (Optional)"
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg"
                />
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: Payment Method */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
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
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {/* Simulation label requirement */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-100 p-2 rounded-lg">
              <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span>
                <strong>Simulation Mode:</strong> Online payments are safely processed in test mode. No actual money will be charged.
              </span>
            </div>
          </div>

          {/* STEP 6: Price Breakdown (Mandatory Itemized Breakdown with Separate Rider Charge) */}
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
              Order Price Breakdown (INR)
            </h4>
            <div className="flex justify-between text-neutral-700">
              <span>
                Fuel Cost ({breakdown.quantity} L × ₹{breakdown.pricePerLitre.toFixed(2)}):
              </span>
              <span className="font-mono font-semibold">₹{breakdown.fuelSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span className="flex items-center gap-1">
                <span>Rider / Delivery Charge:</span>
                <span className="text-[10px] text-neutral-500">(Itemized separately)</span>
              </span>
              <span className="font-mono font-semibold">₹{breakdown.riderCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>Applicable Tax (5% GST):</span>
              <span className="font-mono font-semibold">₹{breakdown.taxAmount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-neutral-300" />
            <div className="flex justify-between text-neutral-900 font-bold text-sm">
              <span>Total Payable Amount:</span>
              <span className="font-mono text-emerald-700">₹{breakdown.finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
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
