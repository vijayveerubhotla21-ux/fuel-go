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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-8 max-h-[92vh]">
        {/* Action Header (Hidden during print) */}
        <div className="print:hidden px-6 py-3.5 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">FuelGo Official Tax Invoice</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              GST Compliant
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={printRef} className="p-8 overflow-y-auto space-y-6 flex-1 text-neutral-800 bg-white">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <Logo size="lg" showTagline={true} />
              <div className="mt-2 text-xs text-neutral-500 space-y-0.5">
                <p className="font-medium text-neutral-700">FuelGo India Technologies Pvt Ltd</p>
                <p>PESO Licensed Mobile Fuel Dispenser Partner</p>
                <p>GSTIN: 29AAFCE8821Q1Z4 • CIN: U50400KA2026PTC10982</p>
                <p>Bengaluru, Karnataka, India</p>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-2">
                Tax Invoice
              </div>
              <p className="font-mono text-sm font-bold text-neutral-900">{invoice.invoiceNumber}</p>
              <p className="text-xs text-neutral-500 mt-1">
                Order Ref: <span className="font-mono font-semibold text-neutral-800">#{invoice.orderNumber}</span>
              </p>
              <p className="text-xs text-neutral-500">
                Date: {new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs">
            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-1.5 text-emerald-800">
                Customer Details
              </h4>
              <p className="font-semibold text-neutral-800 text-sm">{invoice.customerName}</p>
              <p className="text-neutral-600 mt-0.5">{invoice.customerPhone}</p>
              <p className="text-neutral-500 font-mono text-[11px] mt-1">Cust ID: {invoice.customerId}</p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-1.5 text-emerald-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Delivery Destination
              </h4>
              <p className="text-neutral-700 leading-relaxed">
                {invoice.deliveryAddress.addressLine}
                {invoice.deliveryAddress.landmark && `, ${invoice.deliveryAddress.landmark}`}
              </p>
              <p className="text-neutral-700 font-medium">
                {invoice.deliveryAddress.city} - {invoice.deliveryAddress.pincode}
              </p>
              {invoice.scheduledInfo && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                  <Calendar className="w-3 h-3" /> Scheduled: {invoice.scheduledInfo}
                </div>
              )}
            </div>
          </div>

          {/* Itemized Fuel & Delivery Breakdown */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-neutral-800 text-neutral-900 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 text-left">Description</th>
                  <th className="py-2.5 text-center">HSN/SAC</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {/* Fuel Line Item */}
                <tr>
                  <td className="py-3 text-left">
                    <p className="font-bold text-neutral-900">
                      BS-VI Certified {invoice.fuelType} (High Quality Sourced)
                    </p>
                    <p className="text-neutral-500 text-[11px]">
                      Sourced from authorized OMC petrol bunk with tamper-proof seal
                    </p>
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-600">2710</td>
                  <td className="py-3 text-center font-mono font-bold text-neutral-800">{invoice.quantity} L</td>
                  <td className="py-3 text-right font-mono text-neutral-700">₹{invoice.pricePerLitre.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-900">₹{invoice.fuelSubtotal.toFixed(2)}</td>
                </tr>

                {/* Rider/Delivery Charge Itemized Separately (Mandatory Prompt Rule) */}
                <tr>
                  <td className="py-3 text-left">
                    <p className="font-bold text-neutral-900">Rider / Delivery Service Charge</p>
                    <p className="text-neutral-500 text-[11px]">
                      PESO-compliant doorstep transit, certified antistatic handling & GPS tracking
                    </p>
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-600">9965</td>
                  <td className="py-3 text-center font-mono text-neutral-800">1 Trip</td>
                  <td className="py-3 text-right font-mono text-neutral-700">₹{invoice.riderCharge.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-900">₹{invoice.riderCharge.toFixed(2)}</td>
                </tr>

                {/* Tax (GST) */}
                <tr>
                  <td className="py-3 text-left">
                    <p className="font-bold text-neutral-900">Applicable GST (5%)</p>
                    <p className="text-neutral-500 text-[11px]">CGST (2.5%) + SGST (2.5%) on service handling</p>
                  </td>
                  <td className="py-3 text-center font-mono text-neutral-600">9965</td>
                  <td className="py-3 text-center font-mono text-neutral-800">5%</td>
                  <td className="py-3 text-right font-mono text-neutral-700">-</td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-900">₹{invoice.taxAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-4 border-t-2 border-neutral-800">
            {/* Payment Method Badge */}
            <div className="space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-500 block">
                Payment Information
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-neutral-100 border border-neutral-300 font-bold text-neutral-800 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-600" />
                  {invoice.paymentMethod}
                </span>
                <span
                  className={`px-2.5 py-1 rounded font-bold uppercase text-[11px] flex items-center gap-1 ${
                    invoice.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {invoice.paymentStatus}
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-500 mt-1">Txn Ref: {invoice.transactionRef}</p>
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Fuel Cost:</span>
                <span className="font-mono font-semibold">₹{invoice.fuelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Rider / Delivery Charge:</span>
                <span className="font-mono font-semibold">₹{invoice.riderCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Applicable Tax (GST):</span>
                <span className="font-mono font-semibold">₹{invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-neutral-300" />
              <div className="flex justify-between text-neutral-900 font-bold text-base">
                <span>Total Payable:</span>
                <span className="font-mono text-emerald-700">₹{invoice.finalTotal.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-neutral-400 text-right">Currency: Indian Rupees (INR)</p>
            </div>
          </div>

          {/* Legal Stamp & EAGLE Signature */}
          <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-neutral-700">EAGLE — Building Smarter Fuel Delivery</p>
                <p className="text-[11px]">This is a computer-generated tax invoice. No signature required.</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block p-2 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-50/50 text-[10px] font-mono text-emerald-900">
                VERIFIED BY FUELGO AUTOMATION
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
