import React, { useState } from 'react';
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
} from 'lucide-react';
import { Order, User } from '../types';
import { MapTilerMap } from './MapTilerMap';
import { PetrolBunkProofModal } from './PetrolBunkProofModal';
import { InvoiceModal } from './InvoiceModal';
import { store } from '../services/store';

interface TrackingViewProps {
  order: Order;
  currentUser: User;
  onBack: () => void;
  onOrderUpdated?: () => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  order: initialOrder,
  currentUser,
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
      text: `Hello! I have loaded your ${initialOrder.quantity}L ${initialOrder.fuelType} and am on the way.`,
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

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
    { key: 'On The Way', label: 'On The Way', icon: Car },
    { key: 'Arriving Soon', label: 'Arriving Soon', icon: MapPin },
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
          text: 'Understood! I will call when I reach your vehicle.',
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  const driverPhone = order.driver?.phone || '+91 98765 43210';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Tracking to Invoice Link (Critical prompt fix) */}
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>View Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Live Map & Driver Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live MapTiler Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-base font-bold text-neutral-900">MapTiler Live GPS Tracking</h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300 font-bold">
                Order #{order.orderNumber}
              </span>
            </div>

            {/* Map Component */}
            <div className="h-[420px] rounded-xl overflow-hidden">
              <MapTilerMap
                customerLocation={{
                  lat: order.deliveryAddress.lat,
                  lng: order.deliveryAddress.lng,
                  address: order.deliveryAddress.addressLine,
                }}
                driverLocation={
                  order.driver
                    ? {
                        lat: order.driver.currentLocation.lat,
                        lng: order.driver.currentLocation.lng,
                        name: order.driver.name,
                        vehicle: order.driver.vehicleNumber,
                      }
                    : undefined
                }
                orderStatus={order.orderStatus}
                showUberDeepLink={true}
              />
            </div>
          </div>

          {/* Delivery Timeline Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Delivery Progress Timeline
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
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110 ring-4 ring-emerald-100'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] leading-tight font-medium ${
                        isCurrent
                          ? 'font-bold text-emerald-800'
                          : isPassed
                          ? 'text-neutral-800'
                          : 'text-neutral-400'
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
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Assigned Fuel Courier
            </h3>

            {order.driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={order.driver.photoUrl}
                    alt={order.driver.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-neutral-900 text-base">{order.driver.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{order.driver.vehicleNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        ★ {order.driver.rating}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">PESO Certified</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1 text-xs">
                  <p className="text-neutral-500">Vehicle Type:</p>
                  <p className="font-semibold text-neutral-800">{order.driver.vehicleType}</p>
                  <p className="text-neutral-500 pt-1">Driver License:</p>
                  <p className="font-mono text-neutral-800">{order.driver.licenseNumber}</p>
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
                    className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 text-xs">
                <Car className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                <p className="font-semibold">Assigning Nearest Certified Driver...</p>
                <p className="text-[11px] text-neutral-400 mt-1">Our depot is matching a PESO courier.</p>
              </div>
            )}
          </div>

          {/* PETROL BUNK PROOF CARD (Crucial Requirement) */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Petrol Bunk Purchase Proof</span>
              </h3>
              {order.proof ? (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
                    order.proof.verificationStatus === 'Verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.proof.verificationStatus === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.proof.verificationStatus}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase font-mono">
                  Pending Upload
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              FuelGo riders are required to provide verifiable receipt proof from a government-licensed petrol bunk before
              completing fuel dispensing.
            </p>

            {order.proof ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <img
                    src={order.proof.receiptImageUrl}
                    alt="Bunk Receipt"
                    className="w-12 h-12 rounded-lg object-cover border border-neutral-300 shadow-sm"
                  />
                  <div className="truncate flex-1">
                    <p className="font-bold text-neutral-900 truncate">{order.proof.bunkName}</p>
                    <p className="font-mono text-[11px] text-neutral-500">Bill #{order.proof.receiptNumber}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProofModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-neutral-300"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>View Petrol Bunk Proof</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-bold">Awaiting Rider Upload</p>
                <p className="text-[11px]">
                  Rider will upload the receipt once fuel is pumped at the certified station.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Details */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-neutral-500 text-[11px]">
              Order Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Fuel & Quantity:</span>
                <span className="font-bold text-neutral-900">
                  {order.quantity} L {order.fuelType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fuel Cost:</span>
                <span className="font-mono font-semibold">₹{order.fuelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Rider Charge:</span>
                <span className="font-mono font-semibold">₹{order.riderCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">GST (5%):</span>
                <span className="font-mono font-semibold">₹{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-200" />
              <div className="flex justify-between font-bold text-sm">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-700">₹{order.finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-500 pt-1">
                <span>Payment:</span>
                <span className="font-medium text-neutral-800">
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Driver Chat Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden flex flex-col h-96">
          <div className="p-3 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold">Chat with {order.driver?.name || 'Driver'}</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 flex-1 overflow-y-auto space-y-2 text-xs bg-neutral-50">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-2.5 rounded-2xl max-w-[80%] ${
                    msg.sender === 'customer'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 px-1">{msg.time}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-2 border-t border-neutral-200 flex gap-1.5 bg-white">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to driver..."
              className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
