import React, { useState } from 'react';
import {
  Car,
  Navigation,
  Phone,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Fuel,
  RefreshCw,
} from 'lucide-react';
import { Order, User, OrderStatus } from '../types';
import { store } from '../services/store';
import { PetrolBunkProofModal } from './PetrolBunkProofModal';
import { MapTilerMap, calculateHaversineKm } from './MapTilerMap';

interface DriverDashboardProps {
  currentUser: User;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ currentUser }) => {
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  // Strictly assigned deliveries for this driver
  const assignedOrders = store.getOrdersForUser(currentUser);
  const activeOrders = assignedOrders.filter(
    (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
  );
  const completedOrders = assignedOrders.filter((o) => o.orderStatus === 'Delivered');

  const driverProfile = store.getDrivers().find((d) => d.id === currentUser.driverId);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setStatusError(null);
    setStatusSuccess(null);

    const res = store.updateOrderStatus({
      orderId,
      newStatus,
      currentUser,
    });

    if (!res.success) {
      setStatusError(res.error || 'Failed to update order status.');
    } else {
      setStatusSuccess(`Order status updated to "${newStatus}"!`);
      setTimeout(() => setStatusSuccess(null), 4000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12 text-neutral-100">
      {/* Driver Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 rounded-3xl p-6 text-white border border-neutral-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{currentUser.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PESO Certified Rider
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-mono">
              Vehicle: {driverProfile?.vehicleNumber || 'KA 03 EV 4821'} • {driverProfile?.vehicleType || 'Smart Fuel E-Van'}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              License: {driverProfile?.licenseNumber || 'KA-03-2018-00912'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block">Active Tasks</span>
            <span className="text-lg font-black text-amber-400 font-mono">{activeOrders.length}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
            <span className="text-[10px] uppercase text-neutral-400 font-bold block">Delivered Today</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{completedOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Security Feedback Alerts */}
      {statusError && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3 animate-shake">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm">Action Blocked: Safety Rule Violation</p>
            <p>{statusError}</p>
          </div>
        </div>
      )}

      {statusSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{statusSuccess}</span>
        </div>
      )}

      {/* Active Deliveries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <span>Assigned Deliveries ({activeOrders.length})</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">Live Rider Mission Queue</span>
        </div>

        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {activeOrders.map((order) => {
              const hasValidProof = order.proof && ['Submitted', 'Verified'].includes(order.proof.verificationStatus);
              const distToCustomerKm = calculateHaversineKm(
                driverProfile?.currentLocation.lat || 12.9716,
                driverProfile?.currentLocation.lng || 77.5946,
                order.deliveryAddress.lat,
                order.deliveryAddress.lng
              );
              const etaMins = Math.max(2, Math.round((distToCustomerKm / 25) * 60));

              return (
                <div
                  key={order.id}
                  className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-6 shadow-2xl space-y-5"
                >
                  {/* Top line: Order # & Status & Distance */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black font-mono text-white">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                        {order.orderStatus}
                      </span>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                        <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>Distance: {distToCustomerKm} km (~{etaMins}m away)</span>
                      </div>
                      {order.isScheduled && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                          Scheduled: {order.scheduledDate} ({order.scheduledTime})
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-neutral-500 block">Fuel Cargo</span>
                      <span className="text-sm font-black text-emerald-400">
                        {order.quantity} L {order.fuelType}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-1.5">
                      <p className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">
                        Customer Details
                      </p>
                      <p className="text-sm font-bold text-white">{order.customerName}</p>
                      <p className="text-neutral-400 font-mono">{order.customerPhone}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs mt-2 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                    </div>

                    <div className="p-4 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-1.5">
                      <p className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Destination
                      </p>
                      <p className="text-neutral-200 font-medium leading-relaxed">
                        {order.deliveryAddress.addressLine}
                        {order.deliveryAddress.landmark && `, ${order.deliveryAddress.landmark}`}
                      </p>
                      <p className="text-neutral-400">
                        {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                      </p>
                      <button
                        onClick={() => setActiveTrackingOrder(activeTrackingOrder?.id === order.id ? null : order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs mt-2 transition-colors cursor-pointer border border-neutral-700"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{activeTrackingOrder?.id === order.id ? 'Hide GPS Map' : 'Open Navigation GPS'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Embedded Navigation GPS if opened */}
                  {activeTrackingOrder?.id === order.id && (
                    <div className="h-72 rounded-2xl overflow-hidden border border-neutral-800">
                      <MapTilerMap
                        customerLocation={{
                          lat: order.deliveryAddress.lat,
                          lng: order.deliveryAddress.lng,
                          address: order.deliveryAddress.addressLine,
                        }}
                        driverLocation={
                          driverProfile
                            ? {
                                lat: driverProfile.currentLocation.lat,
                                lng: driverProfile.currentLocation.lng,
                                name: driverProfile.name,
                                vehicle: driverProfile.vehicleNumber,
                              }
                            : undefined
                        }
                        orderStatus={order.orderStatus}
                      />
                    </div>
                  )}

                  {/* MANDATORY PETROL BUNK PROOF STATUS & UPLOAD */}
                  <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-5 h-5 text-amber-400" />
                        <span className="font-bold text-sm text-white">
                          Mandatory Petrol Bunk Purchase Proof
                        </span>
                      </div>
                      <p className="text-neutral-400 mt-1">
                        {hasValidProof
                          ? `Proof submitted from ${order.proof?.bunkName} (Status: ${order.proof?.verificationStatus}).`
                          : 'You must upload photo proof of OMC petrol bunk purchase before completing this delivery.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedProofOrder(order)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                        hasValidProof
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black'
                          : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black animate-pulse'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>{hasValidProof ? 'View / Resubmit Proof' : 'Upload Bunk Receipt'}</span>
                    </button>
                  </div>

                  {/* Order Status Action Buttons */}
                  <div className="pt-2 border-t border-neutral-800 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Update Delivery Status
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'On The Way')}
                        disabled={order.orderStatus === 'On The Way'}
                        className="py-2.5 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer text-white"
                      >
                        1. Fuel Picked Up & On The Way
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Arriving Soon')}
                        disabled={order.orderStatus === 'Arriving Soon'}
                        className="py-2.5 px-3 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer text-white"
                      >
                        2. Arriving at Spot
                      </button>

                      {/* GATED DELIVERED BUTTON */}
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        disabled={!hasValidProof}
                        title={
                          !hasValidProof
                            ? 'Mandatory: Upload Petrol Bunk Proof before marking Delivered'
                            : 'Mark fuel dispensed and order delivered'
                        }
                        className={`py-2.5 px-3 rounded-xl text-neutral-950 shadow transition-all flex items-center justify-center gap-1.5 font-black ${
                          hasValidProof
                            ? 'bg-emerald-500 hover:bg-emerald-400 cursor-pointer'
                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>3. Complete & Delivered</span>
                      </button>
                    </div>

                    {!hasValidProof && (
                      <p className="text-[11px] text-amber-400 font-medium text-center">
                        ⚠️ Completion is locked until Petrol Bunk Proof is uploaded.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-12 text-center text-xs text-neutral-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No pending deliveries!</p>
            <p className="mt-1">All assigned orders for today have been completed.</p>
          </div>
        )}
      </div>

      {/* Completed Deliveries History */}
      {completedOrders.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-base font-bold text-white">Delivered Orders History</h2>
          <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 divide-y divide-neutral-800 overflow-hidden text-xs">
            {completedOrders.map((ord) => (
              <div key={ord.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-white">#{ord.orderNumber}</span>
                  <span className="text-neutral-400 ml-2">
                    {ord.quantity}L {ord.fuelType} • {ord.customerName}
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{ord.deliveryAddress.addressLine}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                    Delivered
                  </span>
                  {ord.proof && (
                    <button
                      onClick={() => setSelectedProofOrder(ord)}
                      className="px-2.5 py-1 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 font-semibold cursor-pointer"
                    >
                      Bunk Proof
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {selectedProofOrder && (
        <PetrolBunkProofModal
          order={selectedProofOrder}
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          currentUser={currentUser}
          onProofUpdated={() => {
            // refresh
          }}
        />
      )}
    </div>
  );
};
