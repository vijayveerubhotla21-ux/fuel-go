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
  Edit2,
  Save,
  Trash2,
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Admin Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 text-white border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">Operations & Governance Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            FuelGo Admin Portal • Team EAGLE • Real-time INR Transactions & PESO Safety Compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-mono">
            System Time: {new Date().toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3">
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
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
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
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Revenue</span>
              <p className="text-xl font-black text-emerald-700 font-mono">
                ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">INR Standard</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Total Orders</span>
              <p className="text-xl font-black text-neutral-900 font-mono">{stats.totalOrders}</p>
              <span className="text-[10px] text-neutral-500">{stats.activeOrders} in transit</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Petrol Volume</span>
              <p className="text-xl font-black text-emerald-600 font-mono">{stats.petrolVolume} L</p>
              <span className="text-[10px] text-neutral-500">1–5L per order cap</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Diesel Volume</span>
              <p className="text-xl font-black text-amber-600 font-mono">{stats.dieselVolume} L</p>
              <span className="text-[10px] text-neutral-500">1–10L per order cap</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Active Fleet</span>
              <p className="text-xl font-black text-blue-600 font-mono">{stats.activeDrivers}</p>
              <span className="text-[10px] text-neutral-500">PESO Carriers</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Bunk Proofs</span>
              <p className="text-xl font-black text-purple-600 font-mono">{stats.pendingProofs}</p>
              <span className="text-[10px] text-purple-600 font-semibold">Queue Pending</span>
            </div>
          </div>

          {/* Visual Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Petrol vs Diesel Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Fuel Volume Breakdown (Litres)</h3>
                <span className="text-xs font-mono text-neutral-500">
                  Total: {stats.petrolVolume + stats.dieselVolume} L
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-700">Petrol (1–5L cap):</span>
                    <span className="font-mono">{stats.petrolVolume} L</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
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
                    <span className="text-amber-700">Diesel (1–10L cap):</span>
                    <span className="font-mono">{stats.dieselVolume} L</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
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

              <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-600 flex items-center justify-between">
                <span>Petrol Avg Order: ~3.8 Litres</span>
                <span>Diesel Avg Order: ~8.2 Litres</span>
              </div>
            </div>

            {/* Chart 2: Orders by Status */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Delivery Status Performance</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">Delivered Orders</span>
                  <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                    {stats.completedOrders}
                  </span>
                  <span className="text-[10px] text-emerald-600">With verified proof</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-blue-700 font-bold block">In Transit</span>
                  <span className="text-2xl font-black text-blue-900 font-mono mt-1 block">
                    {stats.activeOrders}
                  </span>
                  <span className="text-[10px] text-blue-600">Live MapTiler GPS</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-purple-700 font-bold block">Scheduled Deliveries</span>
                  <span className="text-2xl font-black text-purple-900 font-mono mt-1 block">
                    {stats.scheduledOrders}
                  </span>
                  <span className="text-[10px] text-purple-600">Future date/time</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-amber-700 font-bold block">Bunk Proof Audits</span>
                  <span className="text-2xl font-black text-amber-900 font-mono mt-1 block">
                    {proofQueue.length}
                  </span>
                  <span className="text-[10px] text-amber-600">Verified & submitted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900">All Customer Fuel Orders</h3>
            <span className="text-xs text-neutral-500 font-mono">{allOrders.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-600 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-200">
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
              <tbody className="divide-y divide-neutral-200">
                {allOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50">
                    <td className="p-3.5 font-mono font-bold text-neutral-900">#{ord.orderNumber}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-neutral-800">{ord.customerName}</p>
                      <p className="text-[10px] text-neutral-500">{ord.customerPhone}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold">
                        {ord.quantity}L {ord.fuelType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">
                      ₹{ord.finalAmount.toFixed(2)}
                    </td>
                    <td className="p-3.5">
                      {ord.driver ? (
                        <div>
                          <p className="font-semibold">{ord.driver.name}</p>
                          <p className="text-[10px] font-mono text-neutral-500">{ord.driver.vehicleNumber}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {ord.proof ? (
                        <button
                          onClick={() => setSelectedProofOrder(ord)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        >
                          {ord.proof.verificationStatus}
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Required</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-[11px]"
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900">Petrol Bunk Verification Queue</h3>
              <p className="text-xs text-neutral-500">
                Inspect receipts uploaded by riders to guarantee fuel came from certified OMC fuel pumps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proofQueue.map((ord) => {
              const prf = ord.proof!;
              return (
                <div
                  key={prf.proofId}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-3"
                >
                  <div className="aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 relative">
                    <img
                      src={prf.receiptImageUrl}
                      alt="Bunk Receipt"
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        prf.verificationStatus === 'Verified'
                          ? 'bg-emerald-600 text-white'
                          : prf.verificationStatus === 'Rejected'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {prf.verificationStatus}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-900">Order #{ord.orderNumber}</span>
                      <span className="font-mono text-emerald-700 font-bold">₹{prf.amountPaid.toFixed(2)}</span>
                    </div>
                    <p className="text-neutral-700 font-semibold">{prf.bunkName}</p>
                    <p className="text-[11px] text-neutral-500 font-mono">Bill Ref: {prf.receiptNumber}</p>
                    <p className="text-[11px] text-neutral-500">
                      Volume: {prf.quantity}L {prf.fuelType}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedProofOrder(ord)}
                    className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
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
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold text-lg text-neutral-900">Dynamic Fuel & Rider Pricing</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Configure base prices per litre and delivery service charges. Historical orders will preserve their original
              booked prices.
            </p>
          </div>

          {priceUpdateSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{priceUpdateSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} className="space-y-5 text-xs">
            {/* Petrol Configuration */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-950">Petrol (BS-VI) Configuration</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                  Statutory Cap: 1–5 L
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Price per Litre (INR ₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={petrolPrice}
                    onChange={(e) => setPetrolPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Maximum Order Limit</label>
                  <input
                    type="text"
                    disabled
                    value="5 Litres (Enforced)"
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Diesel Configuration */}
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-950">Diesel (BS-VI) Configuration</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                  Statutory Cap: 1–10 L
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Price per Litre (INR ₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={dieselPrice}
                    onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Maximum Order Limit</label>
                  <input
                    type="text"
                    disabled
                    value="10 Litres (Enforced)"
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Separate Rider / Delivery Charge (Mandatory prompt rule) */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <span className="font-bold text-sm text-neutral-900">Standard Rider Delivery Charge (INR ₹)</span>
              <p className="text-[11px] text-neutral-500">
                Itemized separately on invoices and checkout. Covers PESO antistatic courier transit and hazardous handling.
              </p>
              <input
                type="number"
                step="1"
                value={riderCharge}
                onChange={(e) => setRiderCharge(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-neutral-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
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
            <div key={drv.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={drv.photoUrl}
                  alt={drv.name}
                  className="w-12 h-12 rounded-xl object-cover border border-neutral-300"
                />
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">{drv.name}</h4>
                  <p className="text-xs text-neutral-500 font-mono">{drv.vehicleNumber}</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      drv.status === 'On Delivery'
                        ? 'bg-blue-100 text-blue-800'
                        : drv.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {drv.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl text-xs space-y-1 text-neutral-600">
                <p>Vehicle: {drv.vehicleType}</p>
                <p>License: {drv.licenseNumber}</p>
                <p>Rating: ★ {drv.rating} / 5.0</p>
                <p className="font-mono text-[10px] text-neutral-400">
                  Last Ping: {new Date(drv.currentLocation.updatedAt).toLocaleTimeString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: INVOICES LIST */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-bold text-sm text-neutral-900">Generated GST Invoices</h3>
          </div>
          <div className="divide-y divide-neutral-200 text-xs">
            {allOrders.map((ord) => {
              const inv = store.getInvoiceForOrder(ord.id);
              if (!inv) return null;
              return (
                <div key={inv.invoiceNumber} className="p-4 flex items-center justify-between hover:bg-neutral-50">
                  <div>
                    <span className="font-mono font-bold text-neutral-900">{inv.invoiceNumber}</span>
                    <span className="text-neutral-500 ml-2">
                      Order #{inv.orderNumber} • {inv.customerName}
                    </span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {inv.quantity}L {inv.fuelType} • Svc Charge ₹{inv.riderCharge.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      ₹{inv.finalTotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => setSelectedInvoiceOrder(ord)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs"
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
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="font-bold text-sm text-neutral-900">Security & Operational Audit Logs</h3>
          </div>
          <div className="divide-y divide-neutral-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-800 text-[11px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                      {log.action}
                    </span>
                    <span className="font-bold text-neutral-900">{log.userName}</span>
                    <span className="text-neutral-400">({log.userRole})</span>
                  </div>
                  <p className="text-neutral-600">{log.details}</p>
                </div>
                <span className="text-[11px] font-mono text-neutral-400 shrink-0">
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
          onProofUpdated={() => {
            // refresh
          }}
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
