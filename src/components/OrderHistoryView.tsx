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
import { Order, User, OrderStatus } from '../types';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  // Retrieve authorized orders from store
  const allOrders = store.getOrdersForUser(currentUser);

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Status filter
      if (filterStatus === 'Scheduled' && !order.isScheduled) return false;
      if (filterStatus === 'Active' && !['Confirmed', 'Driver Assigned', 'On The Way', 'Arriving Soon'].includes(order.orderStatus)) return false;
      if (filterStatus === 'Completed' && order.orderStatus !== 'Delivered') return false;
      if (filterStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = order.orderNumber.toLowerCase().includes(q);
        const matchesFuel = order.fuelType.toLowerCase().includes(q);
        const matchesAddress = order.deliveryAddress.addressLine.toLowerCase().includes(q);
        const matchesDriver = order.driver?.name.toLowerCase().includes(q) || false;
        if (!matchesNumber && !matchesFuel && !matchesAddress && !matchesDriver) return false;
      }

      return true;
    });
  }, [allOrders, filterStatus, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'On The Way':
      case 'Arriving Soon':
        return 'bg-blue-100 text-blue-800 border-blue-300 animate-pulse';
      case 'Driver Assigned':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Order History</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track past fuel deliveries, inspect petrol bunk receipts, and download tax invoices.
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Order Fuel Now</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'Active', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Field */}
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
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
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
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Order Information Left */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-black text-neutral-900">
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Scheduled
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-neutral-600">
                    <span className="font-bold text-neutral-900">
                      {order.quantity} L {order.fuelType}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-emerald-700">
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
                        <span className="text-purple-700 font-medium">
                          Delivery on {order.scheduledDate} ({order.scheduledTime})
                        </span>
                      </>
                    )}
                  </div>

                  {/* Delivery Location & Driver */}
                  <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                    <span className="truncate max-w-md">
                      📍 {order.deliveryAddress.addressLine}, {order.deliveryAddress.city}
                    </span>
                    {order.driver && (
                      <span className="flex items-center gap-1 text-neutral-700 font-medium">
                        <Car className="w-3.5 h-3.5 text-neutral-400" />
                        {order.driver.name} ({order.driver.vehicleNumber})
                      </span>
                    )}
                  </div>
                </div>

                {/* Proof & Action Buttons Right */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  {/* Bunk Proof Indicator / Button */}
                  {order.proof ? (
                    <button
                      onClick={() => setSelectedProofOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
                      title="View verified petrol bunk receipt"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bunk Proof ({order.proof.verificationStatus})</span>
                    </button>
                  ) : order.proofRequired ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-500 text-[11px] font-medium border border-neutral-200">
                      <FileCheck2 className="w-3 h-3 text-neutral-400" />
                      <span>Proof Pending</span>
                    </span>
                  ) : null}

                  {/* View Invoice Button */}
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors border border-neutral-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Invoice</span>
                  </button>

                  {/* Track Order Button */}
                  {isActive && (
                    <button
                      onClick={() => onTrackOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold shadow transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Track Live</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 text-xs">
              <span className="text-neutral-500">
                Page {currentPage} of {totalPages} ({filteredOrders.length} total orders)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">No orders found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try clearing search filters.`
              : 'You have not placed any fuel delivery orders in this status category.'}
          </p>
          <button
            onClick={onNewOrder}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
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
          onProofUpdated={() => {
            // refresh state
          }}
        />
      )}
    </div>
  );
};
