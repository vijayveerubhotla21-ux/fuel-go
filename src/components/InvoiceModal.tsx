import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Invoice } from '../types';
import { Logo } from './Logo';

interface InvoiceModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0d0f17] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Action Header (Hidden during print) */}
        <div className="print:hidden px-6 py-4 bg-[#0a0c13] border-b border-neutral-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">FuelGo Official Tax Invoice</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GST Compliant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold transition-all border border-neutral-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Sheet */}
        <div ref={printRef} className="p-8 overflow-y-auto space-y-6 flex-1 text-neutral-200 bg-[#0d0f17]">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <Logo size="lg" showTagline={true} />
              <div className="mt-2 text-xs text-neutral-400 space-y-0.5">
                <p className="font-medium text-neutral-300">FuelGo India Technologies Pvt Ltd</p>
                <p>PESO Licensed Mobile Fuel Dispenser Partner</p>
                <p className="font-mono text-[11px]">GSTIN: 29AAFCE8821Q1Z4 • CIN: U50400KA2026PTC10982</p>
                <p>Bengaluru, Karnataka, India</p>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                Tax Invoice
              </div>
              <p className="font-mono text-sm font-bold text-white">{invoice.invoiceNumber}</p>
              <p className="text-xs text-neutral-400 mt-1">
                Order Ref: <span className="font-mono font-semibold text-emerald-400">#{invoice.orderNumber}</span>
              </p>
              <p className="text-xs text-neutral-400">
                Date: {new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800 text-xs">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1.5 text-emerald-400">
                Customer Details
              </h4>
              <p className="font-semibold text-white text-sm">{invoice.customerName}</p>
              <p className="text-neutral-400 mt-0.5 font-mono">{invoice.customerPhone}</p>
              <p className="text-neutral-500 font-mono text-[11px] mt-1">Cust ID: {invoice.customerId}</p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1.5 text-emerald-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Delivery Destination
              </h4>
              <p className="text-neutral-300 leading-relaxed">
                {invoice.deliveryAddress.addressLine}
                {invoice.deliveryAddress.landmark && `, ${invoice.deliveryAddress.landmark}`}
              </p>
              <p className="text-neutral-400 font-medium">
                {invoice.deliveryAddress.city} - {invoice.deliveryAddress.pincode}
              </p>
              {invoice.scheduledInfo && (
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 font-semibold text-[11px] font-mono">
                  <Calendar className="w-3 h-3" /> Scheduled: {invoice.scheduledInfo}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Fuel & Delivery Breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 text-left">Description</th>
                  <th className="py-2.5 text-center">HSN/SAC</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {/* Fuel Line Item */}
                <tr>
                  <td className="py-3 text-left">
                    <p className="font-bold text-white">
                      BS-VI Certified {invoice.fuelType} (High Quality Sourced)
                    </p>
                    <p className="text-neutral-400 text-[11px]">
                      Sourced from authorized OMC petrol bunk with tamper-proof seal
                    </p>
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-400">2710</td>
                  <td className="py-3 text-center font-mono font-bold text-white">{invoice.quantity} L</td>
                  <td className="py-3 text-right font-mono text-neutral-300">₹{invoice.pricePerLitre.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-white">₹{invoice.fuelSubtotal.toFixed(2)}</td>
                </tr>

                {/* Rider/Delivery Charge */}
                <tr>
                  <td className="py-3 text-left">
                    <p className="font-bold text-white">Rider / Delivery Service Charge</p>
                    <p className="text-neutral-400 text-[11px]">
                      PESO-compliant doorstep transit, certified antistatic handling & GPS tracking
                    </p>
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-400">9965</td>
                  <td className="py-3 text-center font-mono text-white">1 Trip</td>
                  <td className="py-3 text-right font-mono text-neutral-300">₹{invoice.riderCharge.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-white">₹{invoice.riderCharge.toFixed(2)}</td>
                </tr>

                {/* Tax (GST) */}
                <tr>
                  <td className="py-3 text-left">
                    <p className="font-bold text-white">Applicable GST (5%)</p>
                    <p className="text-neutral-400 text-[11px]">CGST (2.5%) + SGST (2.5%) on service handling</p>
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-400">9965</td>
                  <td className="py-3 text-center font-mono text-white">5%</td>
                  <td className="py-3 text-right font-mono text-neutral-400">-</td>
                  <td className="py-3 text-right font-mono font-bold text-white">₹{invoice.taxAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t border-neutral-800">
            {/* Payment Method Badge */}
            <div className="space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-400 block">
                Payment Information
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-700 font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                  {invoice.paymentMethod}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-xl font-bold uppercase text-[11px] flex items-center gap-1 ${
                    invoice.paymentStatus === 'Paid'
                      ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {invoice.paymentStatus}
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-400 mt-1">Txn Ref: {invoice.transactionRef}</p>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Fuel Cost:</span>
                <span className="font-mono font-semibold text-white">₹{invoice.fuelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Rider / Delivery Charge:</span>
                <span className="font-mono font-semibold text-white">₹{invoice.riderCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Applicable Tax (GST):</span>
                <span className="font-mono font-semibold text-white">₹{invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-800" />
              <div className="flex justify-between text-white font-bold text-base">
                <span>Total Payable:</span>
                <span className="font-mono text-emerald-400">₹{invoice.finalTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-neutral-400 text-right">Currency: Indian Rupees (INR)</p>
            </div>
          </div>

          {/* Legal Stamp & EAGLE Signature */}
          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-neutral-200">EAGLE — Building Smarter Fuel Logistics</p>
                <p className="text-[11px]">This is a computer-generated tax invoice. No signature required.</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block p-2 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-950/30 text-[10px] font-mono text-emerald-300">
                VERIFIED BY FUELGO AUTOMATION
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
