import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  Navigation,
  FileCheck2,
  Calendar,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Order, User, FuelType, OrderStatus } from '../types';
import { store } from '../services/store';
import { InvoiceModal } from './InvoiceModal';
import { PetrolBunkProofModal } from './PetrolBunkProofModal';

interface OrderHistoryViewProps {
  currentUser: User;
  onTrackOrder: (order: Order) => void;
  onNewOrder: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  currentUser,
  onTrackOrder,
  onNewOrder,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterFuel, setFilterFuel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  const allUserOrders = store.getOrdersForUser(currentUser);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return allUserOrders.filter((order) => {
      // Status filter
      if (filterStatus !== 'All') {
        if (filterStatus === 'Active') {
          if (!['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(order.orderStatus)) {
            return false;
          }
        } else if (filterStatus === 'Scheduled') {
          if (!order.isScheduled) return false;
        } else if (filterStatus === 'Completed') {
          if (order.orderStatus !== 'Delivered') return false;
        } else if (filterStatus === 'Cancelled') {
          if (order.orderStatus !== 'Cancelled') return false;
        }
      }

      // Fuel filter
      if (filterFuel !== 'All' && order.fuelType !== filterFuel) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(query);
        const matchesAddress = order.deliveryAddress.addressLine.toLowerCase().includes(query);
        const matchesDriver = order.driver?.name.toLowerCase().includes(query);
        const matchesBunk = order.proof?.bunkName.toLowerCase().includes(query);
        return matchesNumber || matchesAddress || matchesDriver || matchesBunk;
      }

      return true;
    });
  }, [allUserOrders, filterStatus, filterFuel, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      case 'On The Way':
      case 'Arriving Soon':
      case 'Driver Assigned':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/40 animate-pulse';
      case 'Confirmed':
      case 'Scheduled':
        return 'bg-blue-950/70 text-blue-300 border-blue-500/40';
      case 'Cancelled':
        return 'bg-rose-950/70 text-rose-300 border-rose-800';
      default:
        return 'bg-neutral-900 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 text-neutral-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Order History & Verification Vault</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track past deliveries, inspect certified petrol bunk receipts, and download instant GST tax invoices.
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-neutral-950 font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neutral-950" />
          <span>Order Fuel Now</span>
        </button>
      </div>

      {/* Filters & Search Toolbar with Dark Theme Field Color */}
      <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-4 shadow-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'Active', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/50 shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800/80 border border-neutral-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Field with Dark Theme Coloring */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search order #, fuel, address..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {paginatedOrders.length > 0 ? (
        <div className="space-y-4">
          {paginatedOrders.map((order) => {
            const isCompleted = order.orderStatus === 'Delivered';
            const isActive = ['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(order.orderStatus);

            return (
              <div
                key={order.id}
                className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-5 shadow-xl hover:border-neutral-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Order Information Left */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-white">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                    {order.isScheduled && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-800 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-400">
                    <span className="font-bold text-white">
                      {order.quantity} L {order.fuelType}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{order.finalAmount.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {order.scheduledDate && (
                      <>
                        <span>•</span>
                        <span className="text-purple-300 font-medium">
                          Delivery on {order.scheduledDate} ({order.scheduledTime})
                        </span>
                      </>
                    )}
                  </div>

                  {/* Delivery Location & Driver */}
                  <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                    <span className="truncate max-w-md font-mono text-[11px]">
                      📍 {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
                    </span>
                    {order.driver && (
                      <span className="flex items-center gap-1 text-neutral-300 font-medium font-mono text-[11px]">
                        <Car className="w-3.5 h-3.5 text-amber-400" />
                        {order.driver.name} ({order.driver.vehicleNumber})
                      </span>
                    )}
                  </div>
                </div>

                {/* Proof & Action Buttons Right */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
                  {/* Bunk Proof Indicator / Button */}
                  {order.proof ? (
                    <button
                      onClick={() => setSelectedProofOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
                      title="View verified petrol bunk receipt"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bunk Proof ({order.proof.verificationStatus})</span>
                    </button>
                  ) : order.proofRequired ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 text-neutral-400 text-[11px] font-medium border border-neutral-800">
                      <FileCheck2 className="w-3 h-3 text-neutral-500" />
                      <span>Proof Pending</span>
                    </span>
                  ) : null}

                  {/* View Invoice Button */}
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold transition-colors border border-neutral-700 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Invoice</span>
                  </button>

                  {/* Track Order Button */}
                  {isActive && (
                    <button
                      onClick={() => onTrackOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 text-xs font-black shadow-lg transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track Live</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs">
              <span className="text-neutral-400 font-mono">
                Page {currentPage} of {totalPages} ({filteredOrders.length} total orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0e111a] rounded-3xl border border-neutral-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-800">
            <Filter className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">No orders found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try clearing search filters.`
              : 'You have not placed any fuel delivery orders in this status category.'}
          </p>
          <button
            onClick={onNewOrder}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-black text-xs shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Order Fuel</span>
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          invoice={store.getInvoiceForOrder(selectedInvoiceOrder.id)}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {selectedProofOrder && (
        <PetrolBunkProofModal
          order={selectedProofOrder}
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          currentUser={currentUser}
          onProofUpdated={() => {}}
        />
      )}
    </div>
  );
};
