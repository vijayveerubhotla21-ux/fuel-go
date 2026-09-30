import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageSquare,
  FileText,
  FileCheck2,
  CheckCircle2,
  Clock,
  Car,
  Fuel,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  X,
  Send,
  Navigation,
  Compass,
  Radio,
  RotateCcw,
} from 'lucide-react';
import { Order, User } from '../types';
import { MapTilerMap } from './MapTilerMap';
import { PetrolBunkProofModal } from './PetrolBunkProofModal';
import { InvoiceModal } from './InvoiceModal';
import { store } from '../services/store';

/**
 * Haversine formula function to calculate real-time distance in kilometers
 * between customer's coordinates and the rider's position.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Number(distance.toFixed(2));
}

interface TrackingViewProps {
  order: Order;
  currentUser: User;
  customerLiveCoords?: { lat: number; lng: number; address?: string };
  onBack: () => void;
  onOrderUpdated?: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  order: initialOrder,
  currentUser,
  customerLiveCoords,
  onBack,
  onOrderUpdated,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isProofModalOpen, setIsProofModalOpen] = useState<boolean>(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'driver',
      text: `Hello! I have loaded your ${initialOrder.quantity}L ${initialOrder.fuelType} and am heading towards your location.`,
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Live customer coordinates state (auto-tracked from device)
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; address?: string }>({
    lat: customerLiveCoords?.lat || initialOrder.deliveryAddress.lat || 12.926,
    lng: customerLiveCoords?.lng || initialOrder.deliveryAddress.lng || 77.6762,
    address: customerLiveCoords?.address || initialOrder.deliveryAddress.addressLine,
  });

  // Watch customer live position continuously
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveCoords((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Update when customerLiveCoords prop changes
  useEffect(() => {
    if (customerLiveCoords && customerLiveCoords.lat && customerLiveCoords.lng) {
      setLiveCoords({
        lat: customerLiveCoords.lat,
        lng: customerLiveCoords.lng,
        address: customerLiveCoords.address || order.deliveryAddress.addressLine,
      });
    }
  }, [customerLiveCoords, order.deliveryAddress.addressLine]);

  // Refresh latest order from store
  const refreshOrder = () => {
    const fresh = store.getOrderById(order.id);
    if (fresh) {
      setOrder(fresh);
      if (onOrderUpdated) onOrderUpdated();
    }
  };

  const invoice = store.getInvoiceForOrder(order.id);

  // Status timeline steps
  const steps = [
    { key: 'Confirmed', label: 'Order Placed & Paid', icon: Clock },
    { key: 'Driver Assigned', label: 'Driver Assigned', icon: Car },
    { key: 'On The Way', label: 'Fuel Picked Up & On The Way', icon: Navigation },
    { key: 'Arriving Soon', label: 'Arriving at Spot', icon: MapPin },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed':
        return 0;
      case 'Driver Assigned':
        return 1;
      case 'On The Way':
        return 2;
      case 'Arriving Soon':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  // Initial Rider position from driver or depot
  const initialRiderLat = order.driver?.currentLocation.lat || 12.9716;
  const initialRiderLng = order.driver?.currentLocation.lng || 77.5946;

  // Rider's real-time animated position
  const [riderPosition, setRiderPosition] = useState<{ lat: number; lng: number }>({
    lat: initialRiderLat,
    lng: initialRiderLng,
  });
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(true);

  // Customer's coordinates (from props: customerLiveCoords, with fallback to liveCoords or order.deliveryAddress)
  const customerTargetLat = customerLiveCoords?.lat ?? liveCoords.lat ?? order.deliveryAddress.lat ?? 12.926;
  const customerTargetLng = customerLiveCoords?.lng ?? liveCoords.lng ?? order.deliveryAddress.lng ?? 77.6762;

  // Simulate rider's continuous movement towards the customer's location using a timer
  useEffect(() => {
    if (!isSimulatingMovement) return;
    if (order.orderStatus === 'Delivered') return;

    const timer = setInterval(() => {
      setRiderPosition((prev) => {
        const remainingKm = calculateHaversineDistance(
          customerTargetLat,
          customerTargetLng,
          prev.lat,
          prev.lng
        );

        // Arrived at spot (< 30 meters)
        if (remainingKm <= 0.03) {
          return {
            lat: customerTargetLat,
            lng: customerTargetLng,
          };
        }

        // Advance 2.5% closer per tick to provide smooth, visible real-time progression
        const stepRate = 0.025;
        const nextLat = prev.lat + (customerTargetLat - prev.lat) * stepRate;
        const nextLng = prev.lng + (customerTargetLng - prev.lng) * stepRate;

        return {
          lat: Number(nextLat.toFixed(6)),
          lng: Number(nextLng.toFixed(6)),
        };
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [customerTargetLat, customerTargetLng, order.orderStatus, isSimulatingMovement]);

  // Real-time distance in kilometers between customer coordinates and rider's current position using Haversine formula
  const distanceToDelivery = calculateHaversineDistance(
    customerTargetLat,
    customerTargetLng,
    riderPosition.lat,
    riderPosition.lng
  );
  const estimatedArrivalMins = Math.max(1, Math.round((distanceToDelivery / 25) * 60));

  const handleResetSimulation = () => {
    setRiderPosition({
      lat: initialRiderLat,
      lng: initialRiderLng,
    });
    setIsSimulatingMovement(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'customer', text: chatInput, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: 'Got your message! I will give you a call as soon as I arrive at your vehicle.',
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  const driverPhone = order.driver?.phone || '+91 98765 43210';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 text-neutral-100">
      {/* Top Navigation & Distance Highlight Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs font-semibold shadow-md transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Order History</span>
        </button>

        {/* Live Distance to Delivery Ribbon */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-neutral-400">Distance to Delivery:</span>
            <span className="font-black text-emerald-300 text-sm">{distanceToDelivery.toFixed(2)} km</span>
            <span className="text-neutral-600">|</span>
            <span className="text-amber-400 font-bold">~{estimatedArrivalMins} mins</span>
          </div>

          <button
            onClick={handleResetSimulation}
            title="Restart Simulated Courier Route"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-emerald-500/50 text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Reset Route Sim</span>
          </button>

          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Map & Driver Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live MapTiler Map with Customer Live Position */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Live GPS Map • Customer & Rider Radar
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Moving Live
                </span>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-neutral-900 text-emerald-400 border border-emerald-500/30 font-bold">
                Order #{order.orderNumber}
              </span>
            </div>

            {/* Map Component Receiving Real Live Customer Coordinates & Live Animated Rider Position */}
            <div className="h-[440px] rounded-xl overflow-hidden border border-neutral-800">
              <MapTilerMap
                customerLocation={{
                  lat: customerTargetLat,
                  lng: customerTargetLng,
                  address: liveCoords.address || order.deliveryAddress.addressLine,
                }}
                driverLocation={{
                  lat: riderPosition.lat,
                  lng: riderPosition.lng,
                  name: order.driver?.name || 'Assigned Courier (Rajesh Sharma)',
                  vehicle: order.driver?.vehicleNumber || 'KA 03 EV 4821',
                }}
                orderStatus={order.orderStatus}
                showUberDeepLink={true}
                autoDetectLocation={true}
                autoFitBounds={true}
                deliveryEtaMinutes={estimatedArrivalMins}
              />
            </div>

            {/* Live GPS Coordinates Confirmation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customer Live GPS:</span>
                <span className="text-emerald-300 font-bold">
                  {customerTargetLat.toFixed(5)}°N, {customerTargetLng.toFixed(5)}°E
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Distance to Delivery:</span>
                <span className="text-emerald-300 font-bold font-mono">
                  {distanceToDelivery.toFixed(2)} km
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>Rider Spot:</span>
                <span className="text-amber-300 font-bold font-mono">
                  {riderPosition.lat.toFixed(5)}°N, {riderPosition.lng.toFixed(5)}°E
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Timeline Card */}
          <div className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Delivery Progress & Dispatch Timeline
            </h3>

            <div className="grid grid-cols-5 gap-2 relative">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const IconComponent = st.icon;

                return (
                  <div key={st.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.8)] scale-110 font-bold ring-2 ring-emerald-400'
                          : isPassed
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-900 text-neutral-600 border border-neutral-800'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] leading-tight font-medium ${
                        isCurrent
                          ? 'font-bold text-emerald-400'
                          : isPassed
                          ? 'text-neutral-300'
                          : 'text-neutral-600'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Driver Details & Bunk Proof Alert */}
        <div className="space-y-6">
          {/* Driver Card */}
          <div className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Assigned Fuel Courier</span>
            </h3>

            {order.driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={order.driver.photoUrl}
                    alt={order.driver.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  />
                  <div>
                    <h4 className="font-bold text-white text-base">{order.driver.name}</h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">{order.driver.vehicleNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        ★ {order.driver.rating}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                        PESO Certified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Vehicle Type:</span>
                    <span className="font-semibold text-neutral-200">{order.driver.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">License:</span>
                    <span className="font-mono text-neutral-300">{order.driver.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-800 text-emerald-400 font-bold">
                    <span>Distance to Delivery:</span>
                    <span>{distanceToDelivery.toFixed(2)} km away</span>
                  </div>
                </div>

                {/* Driver Communication Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${driverPhone}`}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 border border-neutral-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 text-xs">
                <Car className="w-8 h-8 mx-auto text-neutral-600 mb-2 animate-bounce" />
                <p className="font-semibold text-neutral-300">Matching Nearest Certified Driver...</p>
                <p className="text-[11px] text-neutral-500 mt-1">Our depot is dispatching a mobile bowser.</p>
              </div>
            )}
          </div>

          {/* PETROL BUNK PROOF CARD */}
          <div className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Petrol Bunk Purchase Proof</span>
              </h3>
              {order.proof ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                    order.proof.verificationStatus === 'Verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : order.proof.verificationStatus === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {order.proof.verificationStatus}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase font-mono">
                  Pending Upload
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              FuelGo riders are bound by our safety rule: mandatory verifiable proof from a licensed OMC fuel station
              before dispensing.
            </p>

            {order.proof ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
                  <img
                    src={order.proof.receiptImageUrl}
                    alt="Bunk Receipt"
                    className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shadow-sm"
                  />
                  <div className="truncate flex-1">
                    <p className="font-bold text-white truncate">{order.proof.bunkName}</p>
                    <p className="font-mono text-[11px] text-neutral-400">Bill #{order.proof.receiptNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProofModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-neutral-700"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Inspect Bunk Receipt</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-900/50 text-amber-300 text-xs space-y-1">
                <p className="font-bold">Awaiting Courier Upload</p>
                <p className="text-[11px] text-amber-200/70">
                  Rider uploads receipt upon pumping fuel at certified station.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Details */}
          <div className="bg-[#0f1118] rounded-2xl border border-neutral-800 p-5 shadow-xl space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-neutral-400 text-[11px]">
              Order & Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Fuel & Quantity:</span>
                <span className="font-bold text-white">
                  {order.quantity} L {order.fuelType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fuel Cost:</span>
                <span className="font-mono font-semibold text-neutral-300">₹{order.fuelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Rider Charge:</span>
                <span className="font-mono font-semibold text-neutral-300">₹{order.riderCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GST (5%):</span>
                <span className="font-mono font-semibold text-neutral-300">₹{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex justify-between font-bold text-sm">
                <span className="text-white">Total Amount (INR):</span>
                <span className="font-mono text-emerald-400 text-base">₹{order.finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400 pt-1">
                <span>Payment:</span>
                <span className="font-medium text-emerald-300">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Driver Chat Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 overflow-hidden flex flex-col h-96">
          <div className="p-3 bg-neutral-950 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold font-mono">Chat with {order.driver?.name || 'Driver'}</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-2 text-xs bg-[#0b0c10]">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-2xl max-w-[85%] ${
                    msg.sender === 'customer'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-2 border-t border-neutral-800 flex gap-1.5 bg-neutral-950">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to driver..."
              className="flex-1 px-3 py-1.5 text-xs bg-neutral-900 text-white border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Modals */}
      <PetrolBunkProofModal
        order={order}
        isOpen={isProofModalOpen}
        onClose={() => setIsProofModalOpen(false)}
        currentUser={currentUser}
        onProofUpdated={refreshOrder}
      />

      <InvoiceModal
        invoice={invoice}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
};
