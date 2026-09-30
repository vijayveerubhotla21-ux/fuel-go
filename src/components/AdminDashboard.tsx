import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Fuel,
  Users,
  Car,
  FileCheck2,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  Plus,
  Save,
  Lock,
} from 'lucide-react';
import { Order, User, FuelType, FuelConfig, Driver, Vehicle } from '../types';
import { store } from '../services/store';
import { PetrolBunkProofModal } from './PetrolBunkProofModal';
import { InvoiceModal } from './InvoiceModal';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'proofs' | 'fuel-pricing' | 'drivers' | 'invoices' | 'audit'
  >('overview');

  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Fuel Config Edit state
  const fuelConfigs = store.getFuelConfigs();
  const [petrolPrice, setPetrolPrice] = useState<number>(fuelConfigs.Petrol.pricePerLitre);
  const [dieselPrice, setDieselPrice] = useState<number>(fuelConfigs.Diesel.pricePerLitre);
  const [riderCharge, setRiderCharge] = useState<number>(store.getRiderCharge());
  const [priceUpdateSuccess, setPriceUpdateSuccess] = useState<string | null>(null);

  // Orders & Drivers
  const allOrders = store.getOrders();
  const drivers = store.getDrivers();
  const vehicles = store.getVehicles();
  const auditLogs = store.getAuditLogs();

  // Metrics Calculation
  const stats = useMemo(() => {
    const totalOrders = allOrders.length;
    const activeOrders = allOrders.filter((o) =>
      ['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(o.orderStatus)
    ).length;
    const scheduledOrders = allOrders.filter((o) => o.isScheduled).length;
    const completedOrders = allOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelledOrders = allOrders.filter((o) => o.orderStatus === 'Cancelled').length;

    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === 'Paid')
      .reduce((acc, o) => acc + o.finalAmount, 0);

    const petrolVolume = allOrders
      .filter((o) => o.fuelType === 'Petrol' && o.paymentStatus === 'Paid')
      .reduce((acc, o) => acc + o.quantity, 0);

    const dieselVolume = allOrders
      .filter((o) => o.fuelType === 'Diesel' && o.paymentStatus === 'Paid')
      .reduce((acc, o) => acc + o.quantity, 0);

    const activeDrivers = drivers.filter((d) => d.status !== 'Offline').length;

    const pendingProofs = allOrders.filter(
      (o) => o.proofRequired && (!o.proof || o.proof.verificationStatus === 'Submitted')
    ).length;

    const pendingPayments = allOrders.filter((o) => o.paymentStatus === 'Pending').length;

    return {
      totalOrders,
      activeOrders,
      scheduledOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      petrolVolume,
      dieselVolume,
      activeDrivers,
      pendingProofs,
      pendingPayments,
    };
  }, [allOrders, drivers]);

  // Handle Save Pricing
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateFuelConfig('Petrol', { pricePerLitre: petrolPrice }, currentUser);
    store.updateFuelConfig('Diesel', { pricePerLitre: dieselPrice }, currentUser);
    store.updateRiderCharge(riderCharge, currentUser);
    setPriceUpdateSuccess('Fuel prices and rider delivery charge updated successfully!');
    setTimeout(() => setPriceUpdateSuccess(null), 3000);
  };

  // Proof Queue Items
  const proofQueue = allOrders.filter((o) => o.proof);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 text-neutral-100">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#0d1017] to-neutral-900 rounded-3xl p-6 text-white border border-neutral-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-white">Operations & Governance Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            FuelGo Admin Portal • Team EAGLE • Real-time INR Transactions & PESO Safety Compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono bg-neutral-950/80 px-3 py-1.5 rounded-xl border border-neutral-800">
            System Clock: {new Date().toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
        {[
          { key: 'overview', label: 'Dashboard & Analytics', icon: BarChart3 },
          { key: 'orders', label: 'All Orders', icon: Clock },
          { key: 'proofs', label: `Petrol Bunk Proofs (${stats.pendingProofs})`, icon: FileCheck2 },
          { key: 'fuel-pricing', label: 'Fuel & Rider Pricing', icon: Fuel },
          { key: 'drivers', label: 'Drivers & Fleet', icon: Car },
          { key: 'invoices', label: 'Tax Invoices', icon: FileText },
          { key: 'audit', label: 'Audit Logs', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40 shadow-lg'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metrics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#0e111a] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Revenue</span>
              <p className="text-xl font-black text-emerald-400 font-mono">
                ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-emerald-500 font-semibold">INR Standard</span>
            </div>

            <div className="bg-[#0e111a] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Orders</span>
              <p className="text-xl font-black text-white font-mono">{stats.totalOrders}</p>
              <span className="text-[10px] text-neutral-400">{stats.activeOrders} in transit</span>
            </div>

            <div className="bg-[#0e111a] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Petrol Volume</span>
              <p className="text-xl font-black text-emerald-400 font-mono">{stats.petrolVolume} L</p>
              <span className="text-[10px] text-neutral-400">1–5L per order cap</span>
            </div>

            <div className="bg-[#0e111a] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Diesel Volume</span>
              <p className="text-xl font-black text-amber-400 font-mono">{stats.dieselVolume} L</p>
              <span className="text-[10px] text-neutral-400">1–10L per order cap</span>
            </div>

            <div className="bg-[#0e111a] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Active Fleet</span>
              <p className="text-xl font-black text-blue-400 font-mono">{stats.activeDrivers}</p>
              <span className="text-[10px] text-neutral-400">PESO Carriers</span>
            </div>

            <div className="bg-[#0e111a] p-4 rounded-2xl border border-neutral-800 shadow-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Bunk Proofs</span>
              <p className="text-xl font-black text-purple-400 font-mono">{stats.pendingProofs}</p>
              <span className="text-[10px] text-purple-400 font-semibold">Queue Pending</span>
            </div>
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Petrol vs Diesel Distribution */}
            <div className="bg-[#0e111a] p-5 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Fuel Volume Breakdown (Litres)</h3>
                <span className="text-xs font-mono text-neutral-400">
                  Total: {stats.petrolVolume + stats.dieselVolume} L
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-400">Petrol (1–5L cap):</span>
                    <span className="font-mono text-white">{stats.petrolVolume} L</span>
                  </div>
                  <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden border border-neutral-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      style={{
                        width: `${
                          stats.petrolVolume + stats.dieselVolume > 0
                            ? (stats.petrolVolume / (stats.petrolVolume + stats.dieselVolume)) * 100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-400">Diesel (1–10L cap):</span>
                    <span className="font-mono text-white">{stats.dieselVolume} L</span>
                  </div>
                  <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden border border-neutral-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      style={{
                        width: `${
                          stats.petrolVolume + stats.dieselVolume > 0
                            ? (stats.dieselVolume / (stats.petrolVolume + stats.dieselVolume)) * 100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Order Status Distribution */}
            <div className="bg-[#0e111a] p-5 rounded-2xl border border-neutral-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white">Live Pipeline & Fulfillment Health</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Delivered Orders</span>
                  <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{stats.completedOrders}</p>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Active In Transit</span>
                  <p className="text-lg font-black text-amber-400 font-mono mt-0.5">{stats.activeOrders}</p>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Scheduled Orders</span>
                  <p className="text-lg font-black text-purple-400 font-mono mt-0.5">{stats.scheduledOrders}</p>
                </div>
                <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Cancelled / Voided</span>
                  <p className="text-lg font-black text-rose-400 font-mono mt-0.5">{stats.cancelledOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">All Customer Fuel Orders</h3>
            <span className="text-xs text-neutral-400 font-mono">{allOrders.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-950 text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Fuel & Qty</th>
                  <th className="p-3.5">Amount (INR)</th>
                  <th className="p-3.5">Driver</th>
                  <th className="p-3.5">Bunk Proof</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {allOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">#{ord.orderNumber}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-neutral-200">{ord.customerName}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{ord.customerPhone}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white">
                        {ord.quantity}L {ord.fuelType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      ₹{ord.finalAmount.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      {ord.driver ? (
                        <div>
                          <p className="font-semibold text-neutral-200">{ord.driver.name}</p>
                          <p className="text-[10px] font-mono text-neutral-400">{ord.driver.vehicleNumber}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {ord.proof ? (
                        <button
                          onClick={() => setSelectedProofOrder(ord)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 transition-colors cursor-pointer"
                        >
                          {ord.proof.verificationStatus}
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-500">Required</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-700">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-[11px] border border-neutral-700 cursor-pointer"
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PETROL BUNK PROOFS QUEUE */}
      {activeTab === 'proofs' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Petrol Bunk Verification Queue</h3>
            <p className="text-xs text-neutral-400">
              Inspect receipts uploaded by riders to guarantee fuel came from certified OMC fuel pumps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofQueue.map((ord) => {
              const prf = ord.proof!;
              return (
                <div
                  key={prf.proofId}
                  className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-4 shadow-xl space-y-3"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative">
                    <img
                      src={prf.receiptImageUrl}
                      alt="Bunk Receipt"
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono shadow-md ${
                        prf.verificationStatus === 'Verified'
                          ? 'bg-emerald-600 text-white'
                          : prf.verificationStatus === 'Rejected'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-neutral-950 font-black'
                      }`}
                    >
                      {prf.verificationStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-white">Order #{ord.orderNumber}</span>
                      <span className="font-mono text-emerald-400 font-bold">₹{prf.amountPaid.toFixed(2)}</span>
                    </div>
                    <p className="text-neutral-300 font-semibold">{prf.bunkName}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">Bill Ref: {prf.receiptNumber}</p>
                    <p className="text-[11px] text-neutral-400">
                      Volume: {prf.quantity}L {prf.fuelType}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedProofOrder(ord)}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5 border border-neutral-700 cursor-pointer"
                  >
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    <span>Review & Audit Proof</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: FUEL & RIDER PRICING MANAGEMENT */}
      {activeTab === 'fuel-pricing' && (
        <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-6 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white">Dynamic Fuel & Rider Pricing</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Configure base prices per litre and delivery service charges. Historical orders will preserve their original booked prices.
            </p>
          </div>

          {priceUpdateSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{priceUpdateSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} className="space-y-5 text-xs">
            {/* Petrol Configuration */}
            <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-300">Petrol (BS-VI) Configuration</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Statutory Cap: 1–5 L
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Price per Litre (INR ₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={petrolPrice}
                    onChange={(e) => setPetrolPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-bold font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Maximum Order Limit</label>
                  <input
                    type="text"
                    disabled
                    value="5 Litres (Enforced)"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Diesel Configuration */}
            <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-300">Diesel (BS-VI) Configuration</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Statutory Cap: 1–10 L
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Price per Litre (INR ₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={dieselPrice}
                    onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-bold font-mono text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Maximum Order Limit</label>
                  <input
                    type="text"
                    disabled
                    value="10 Litres (Enforced)"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Separate Rider / Delivery Charge */}
            <div className="p-4 bg-neutral-900/70 rounded-2xl border border-neutral-800 space-y-2">
              <span className="font-bold text-sm text-white">Standard Rider Delivery Charge (INR ₹)</span>
              <p className="text-[11px] text-neutral-400">
                Itemized separately on invoices and checkout. Covers PESO antistatic courier transit and hazardous handling.
              </p>
              <input
                type="number"
                step="1"
                value={riderCharge}
                onChange={(e) => setRiderCharge(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-sm font-bold font-mono text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Pricing & Broadcast to Network</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: DRIVERS & FLEET */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {drivers.map((drv) => (
            <div key={drv.id} className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={drv.photoUrl}
                  alt={drv.name}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">{drv.name}</h4>
                  <p className="text-xs text-neutral-400 font-mono">{drv.vehicleNumber}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      drv.status === 'On Delivery'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : drv.status === 'Available'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    {drv.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl text-xs space-y-1 text-neutral-300 border border-neutral-800">
                <p>Vehicle: {drv.vehicleType}</p>
                <p>License: {drv.licenseNumber}</p>
                <p>Rating: ★ {drv.rating} / 5.0</p>
                <p className="font-mono text-[10px] text-neutral-500">
                  Last Ping: {new Date(drv.currentLocation.updatedAt).toLocaleTimeString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: INVOICES LIST */}
      {activeTab === 'invoices' && (
        <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-bold text-sm text-white">Generated GST Invoices</h3>
          </div>
          <div className="divide-y divide-neutral-800 text-xs">
            {allOrders.map((ord) => {
              const inv = store.getInvoiceForOrder(ord.id);
              if (!inv) return null;
              return (
                <div key={inv.invoiceNumber} className="p-4 flex items-center justify-between hover:bg-neutral-900/50 transition-colors">
                  <div>
                    <span className="font-mono font-bold text-white">{inv.invoiceNumber}</span>
                    <span className="text-neutral-400 ml-2">
                      Order #{inv.orderNumber} • {inv.customerName}
                    </span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {inv.quantity}L {inv.fuelType} • Svc Charge ₹{inv.riderCharge.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹{inv.finalTotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 cursor-pointer"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-bold text-sm text-white">Security & Operational Audit Logs</h3>
          </div>
          <div className="divide-y divide-neutral-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-300 text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700">
                      {log.action}
                    </span>
                    <span className="font-bold text-white">{log.userName}</span>
                    <span className="text-neutral-400">({log.userRole})</span>
                  </div>
                  <p className="text-neutral-300">{log.details}</p>
                </div>
                <span className="text-[11px] font-mono text-neutral-500 shrink-0">
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProofOrder && (
        <PetrolBunkProofModal
          order={selectedProofOrder}
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          currentUser={currentUser}
          onProofUpdated={() => {}}
        />
      )}

      {selectedInvoiceOrder && (
        <InvoiceModal
          invoice={store.getInvoiceForOrder(selectedInvoiceOrder.id)}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
