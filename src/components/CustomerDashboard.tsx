import React from 'react';
import {
  Sparkles,
  Fuel,
  Navigation,
  FileText,
  FileCheck2,
  Calendar,
  Clock,
  ShieldAlert,
  Bot,
  Car,
  ChevronRight,
  Plus,
  IndianRupee,
} from 'lucide-react';
import { User, Order } from '../types';
import { store } from '../services/store';

interface CustomerDashboardProps {
  currentUser: User;
  onOpenOrderModal: (fuelType?: 'Petrol' | 'Diesel') => void;
  onTrackOrder: (order: Order) => void;
  onViewInvoice: (order: Order) => void;
  onViewProof: (order: Order) => void;
  onOpenAiAssistant: () => void;
  onOpenSafetyCenter: () => void;
  onViewHistory: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  currentUser,
  onOpenOrderModal,
  onTrackOrder,
  onViewInvoice,
  onViewProof,
  onOpenAiAssistant,
  onOpenSafetyCenter,
  onViewHistory,
}) => {
  const userOrders = store.getOrdersForUser(currentUser);

  // Active in-transit order
  const activeOrder = userOrders.find((o) =>
    ['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(o.orderStatus)
  );

  // Scheduled orders
  const scheduledOrders = userOrders.filter((o) => o.isScheduled && o.orderStatus === 'Scheduled');

  // Recent 3 orders
  const recentOrders = userOrders.slice(0, 4);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Doorstep Fuel • PESO Certified • Live MapTiler GPS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Welcome back, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Need an emergency top-up or scheduled fuel delivery for your car, generator, or fleet?
            Order Petrol (1–5L) or Diesel (1–10L) with guaranteed certified petrol bunk receipts.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenOrderModal('Petrol')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Fuel className="w-4 h-4" />
              <span>Order Petrol (1–5L)</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('Diesel')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <Fuel className="w-4 h-4" />
              <span>Order Diesel (1–10L)</span>
            </button>
            <button
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-xs transition-all"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Fuel Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ACTIVE ORDER LIVE WIDGET */}
      {activeOrder && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/50 p-5 shadow-lg space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-black text-neutral-900">Active Delivery in Transit</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                #{activeOrder.orderNumber}
              </span>
            </div>

            <button
              onClick={() => onTrackOrder(activeOrder)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Track Live on MapTiler</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-500">Fuel & Quantity:</span>
              <p className="font-bold text-neutral-900 text-sm mt-0.5">
                {activeOrder.quantity}L {activeOrder.fuelType}
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Current Status:</span>
              <p className="font-bold text-emerald-700 mt-0.5">{activeOrder.orderStatus}</p>
            </div>
            <div>
              <span className="text-neutral-500">Assigned Driver:</span>
              <p className="font-bold text-neutral-800 mt-0.5">
                {activeOrder.driver?.name || 'Assigning...'}
              </p>
            </div>
            <div>
              <span className="text-neutral-500">Petrol Bunk Proof:</span>
              <p className="mt-0.5">
                {activeOrder.proof ? (
                  <button
                    onClick={() => onViewProof(activeOrder)}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>View Proof ({activeOrder.proof.verificationStatus})</span>
                  </button>
                ) : (
                  <span className="text-amber-600 font-semibold">Awaiting Courier Upload</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Scheduled Deliveries & Safety / AI Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scheduled & Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled Orders Widget */}
          {scheduledOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Scheduled Deliveries ({scheduledOrders.length})</span>
                </h3>
              </div>
              <div className="divide-y divide-neutral-100 text-xs">
                {scheduledOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-neutral-900">
                        {ord.quantity}L {ord.fuelType} • Order #{ord.orderNumber}
                      </p>
                      <p className="text-purple-700 font-semibold mt-0.5">
                        🗓️ {ord.scheduledDate} at {ord.scheduledTime}
                      </p>
                      <p className="text-neutral-500 text-[11px] truncate max-w-sm">
                        📍 {ord.deliveryAddress.addressLine}
                      </p>
                    </div>
                    <button
                      onClick={() => onViewInvoice(ord)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 font-bold text-neutral-700 text-xs"
                    >
                      Invoice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders List */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900">Recent Deliveries</h3>
              <button
                onClick={onViewHistory}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOrders.length > 0 ? (
              <div className="divide-y divide-neutral-100 text-xs">
                {recentOrders.map((ord) => (
                  <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">#{ord.orderNumber}</span>
                        <span className="font-bold text-neutral-800">
                          {ord.quantity}L {ord.fuelType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-[11px]">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        • Total: <span className="font-mono font-bold text-emerald-700">₹{ord.finalAmount.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {ord.proof && (
                        <button
                          onClick={() => onViewProof(ord)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                        >
                          Proof
                        </button>
                      )}
                      <button
                        onClick={() => onViewInvoice(ord)}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-800 text-xs font-bold"
                      >
                        Invoice
                      </button>
                      {['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(ord.orderStatus) && (
                        <button
                          onClick={() => onTrackOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold"
                        >
                          Track
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 text-center py-6">No recent fuel orders.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: AI Tutorial & Safety Center Shortcuts */}
        <div className="space-y-6">
          {/* AI Fuel Assistant Teaser Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-900 rounded-2xl p-5 text-white border border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Bot className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white">AI Fuel Assistant</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Have questions about Petrol vs Diesel, fuel spill safety, or vehicle tank vapor locks?
              Our AI Assistant is grounded in PESO guidelines.
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Fuel Assistant</span>
            </button>
          </div>

          {/* Safety Center Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-bold text-sm text-neutral-900">Safety & Emergency Center</h4>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Review emergency fuel protocols, anti-static safety discipline, and 24/7 national emergency hotlines.
            </p>
            <button
              onClick={onOpenSafetyCenter}
              className="w-full py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs border border-neutral-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Safety Guidelines</span>
            </button>
          </div>

          {/* Guaranteed Petrol Bunk Proof Guarantee */}
          <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
              <FileCheck2 className="w-4 h-4 text-amber-700" />
              <span>100% Genuine OMC Sourced</span>
            </div>
            <p className="text-neutral-700 leading-relaxed">
              Every fuel drop is backed by our strict rule: no order is marked Delivered without a photo of the
              licensed petrol bunk receipt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
