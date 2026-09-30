import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  Download,
  Building2,
  Calendar,
  IndianRupee,
  RefreshCw,
  Fuel,
  Info,
} from 'lucide-react';
import { Order, PetrolBunkProof, User, FuelType } from '../types';
import { store } from '../services/store';

interface PetrolBunkProofModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onProofUpdated?: () => void;
}

// Sample realistic petrol bunk receipt images for fast demo testing
const SAMPLE_BUNK_RECEIPTS = [
  {
    name: 'Indian Oil Corp (IOCL) — Indiranagar Bunk',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&auto=format&fit=crop&q=80',
    receiptNo: 'IOCL-B77-98124',
  },
  {
    name: 'Bharat Petroleum (BPCL) — Koramangala Hub',
    url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=700&auto=format&fit=crop&q=80',
    receiptNo: 'BPCL-KA01-44910',
  },
  {
    name: 'Hindustan Petroleum (HPCL) — Whitefield Fuel Station',
    url: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=700&auto=format&fit=crop&q=80',
    receiptNo: 'HPCL-BLR-11928',
  },
];

export const PetrolBunkProofModal: React.FC<PetrolBunkProofModalProps> = ({
  order,
  isOpen,
  onClose,
  currentUser,
  onProofUpdated,
}) => {
  if (!isOpen) return null;

  const existingProof = order.proof;
  const isDriverOrAdmin = ['Driver', 'Super Admin', 'Admin', 'Operations Manager'].includes(currentUser.role);
  const isAdmin = ['Super Admin', 'Admin', 'Operations Manager'].includes(currentUser.role);

  // Rider upload form state
  const [bunkName, setBunkName] = useState(
    existingProof?.bunkName || 'Indian Oil Corporation — Certified City Dispenser'
  );
  const [receiptNumber, setReceiptNumber] = useState(
    existingProof?.receiptNumber || `IOCL-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [receiptImageUrl, setReceiptImageUrl] = useState<string>(
    existingProof?.receiptImageUrl || SAMPLE_BUNK_RECEIPTS[0].url
  );
  const [amountPaid, setAmountPaid] = useState<number>(order.fuelSubtotal);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // File upload simulation (or camera photo capture)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Only image files (JPG, PNG, WEBP) are accepted.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'File size exceeds 5MB limit. Please upload a smaller photo.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptImageUrl(reader.result);
        setFeedback(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const res = store.uploadPetrolBunkProof({
      orderId: order.id,
      currentUser,
      bunkName,
      receiptNumber,
      fuelType: order.fuelType,
      quantity: order.quantity,
      amountPaid,
      receiptImageUrl,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to submit proof.' });
    } else {
      setFeedback({ type: 'success', message: 'Petrol bunk proof submitted successfully!' });
      if (onProofUpdated) onProofUpdated();
    }
  };

  const handleAdminVerify = (decision: 'Verified' | 'Rejected') => {
    setIsSubmitting(true);
    const res = store.verifyProof({
      orderId: order.id,
      adminUser: currentUser,
      decision,
      rejectionReason: decision === 'Rejected' ? rejectionReason || 'Receipt image is unclear. Please upload a clearer copy.' : undefined,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to verify proof.' });
    } else {
      setFeedback({
        type: 'success',
        message: decision === 'Verified' ? 'Proof verified successfully!' : 'Proof rejected. Rider notified to resubmit.',
      });
      if (onProofUpdated) onProofUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0d0f17] text-neutral-100 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0a0c13] border-b border-neutral-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Petrol Bunk Purchase Proof</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Mandatory PESO Safety
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Order #{order.orderNumber} • {order.quantity}L {order.fuelType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Alert Banner */}
          {existingProof ? (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                existingProof.verificationStatus === 'Verified'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : existingProof.verificationStatus === 'Rejected'
                  ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              {existingProof.verificationStatus === 'Verified' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : existingProof.verificationStatus === 'Rejected' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">
                  Status: {existingProof.verificationStatus}
                </p>
                <p className="text-neutral-300">
                  Uploaded on {new Date(existingProof.uploadedAt).toLocaleString('en-IN')} by Rider ID{' '}
                  <span className="font-mono text-emerald-300">{existingProof.riderId}</span>.
                </p>
                {existingProof.verifiedBy && (
                  <p className="font-medium text-emerald-300">
                    Verified by: {existingProof.verifiedBy} on{' '}
                    {new Date(existingProof.verifiedAt || '').toLocaleString('en-IN')}
                  </p>
                )}
                {existingProof.rejectionReason && (
                  <p className="font-semibold text-rose-300">
                    Rejection Reason: {existingProof.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm text-white">Proof of Purchase Required</p>
                <p className="text-neutral-300 mt-1 leading-relaxed">
                  Government safety regulations require fuel couriers to supply verifiable receipt proof from an authorized
                  petrol bunk (IOCL, HPCL, BPCL, Shell) before fuel delivery can be completed.
                </p>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* VIEW EXISTING PROOF SECTION */}
          {existingProof && (
            <div className="space-y-4 bg-neutral-900/80 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Petrol Bunk Invoice & Receipt</h4>
                <a
                  href={existingProof.receiptImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`FuelGo-Proof-${order.orderNumber}.jpg`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-700 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Proof</span>
                </a>
              </div>

              {/* Receipt Image Display */}
              <div className="relative rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 aspect-video flex items-center justify-center">
                <img
                  src={existingProof.receiptImageUrl}
                  alt="Petrol Bunk Receipt"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 text-white text-[10px] font-mono backdrop-blur-md border border-neutral-700">
                  Simulation Receipt
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Petrol Bunk
                  </span>
                  <p className="font-bold text-white mt-1">{existingProof.bunkName}</p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 flex items-center gap-1 font-medium">
                    <FileCheck2 className="w-3.5 h-3.5 text-amber-400" /> Receipt / Bill No.
                  </span>
                  <p className="font-bold font-mono text-neutral-200 mt-1">{existingProof.receiptNumber}</p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 flex items-center gap-1 font-medium">
                    <Fuel className="w-3.5 h-3.5 text-emerald-400" /> Fuel & Volume
                  </span>
                  <p className="font-bold text-white mt-1">
                    {existingProof.fuelType} • {existingProof.quantity} Litres
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400 flex items-center gap-1 font-medium">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Bunk Purchase Amount
                  </span>
                  <p className="font-bold text-emerald-400 font-mono mt-1">₹{existingProof.amountPaid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN VERIFICATION CONTROLS */}
          {isAdmin && existingProof && existingProof.verificationStatus !== 'Verified' && (
            <div className="p-4 rounded-2xl bg-[#121622] text-white border border-neutral-700 space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <FileCheck2 className="w-4 h-4" /> Admin Verification Actions
              </h4>
              <p className="text-xs text-neutral-400">
                Inspect that the bunk receipt matches fuel type ({order.fuelType}), quantity ({order.quantity}L), and timestamp.
              </p>
              <div>
                <label className="text-xs text-neutral-300 block mb-1">
                  Rejection Reason (Optional if rejecting):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Receipt image is unclear. Please upload a clearer copy."
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleAdminVerify('Verified')}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Bunk Proof</span>
                </button>
                <button
                  onClick={() => handleAdminVerify('Rejected')}
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reject & Request Resubmission</span>
                </button>
              </div>
            </div>
          )}

          {/* RIDER UPLOAD / RESUBMIT FORM */}
          {isDriverOrAdmin && (!existingProof || existingProof.verificationStatus === 'Rejected' || existingProof.verificationStatus === 'Resubmit Required') && (
            <form onSubmit={handleUploadProof} className="space-y-4 pt-2 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{existingProof ? 'Resubmit Petrol Bunk Proof' : 'Upload Petrol Bunk Purchase Proof'}</span>
                </h4>
                <span className="text-[11px] text-neutral-400 font-mono">Driver Action</span>
              </div>

              {/* Quick Preset Receipts for Demo Simulation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Select Certified Petrol Bunk or Upload Custom
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_BUNK_RECEIPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setBunkName(preset.name);
                        setReceiptNumber(preset.receiptNo);
                        setReceiptImageUrl(preset.url);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        receiptImageUrl === preset.url
                          ? 'border-emerald-500 bg-emerald-950/70 text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <p className="font-bold truncate text-white">{preset.name.split('—')[0]}</p>
                      <p className="text-[10px] text-neutral-400 truncate font-mono">{preset.receiptNo}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Photo / File Picker */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="flex-1 w-full cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-700 rounded-xl hover:border-emerald-500 bg-neutral-900 text-xs font-medium text-neutral-300 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Upload Receipt File (JPG, PNG)</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 p-3 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 text-xs font-medium shadow-sm transition-colors border border-neutral-700">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Input Fields with Dark Theme Field Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Petrol Bunk Name</label>
                  <input
                    type="text"
                    required
                    value={bunkName}
                    onChange={(e) => setBunkName(e.target.value)}
                    placeholder="e.g., Indian Oil Corporation — Indiranagar"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Receipt / Transaction Ref Number</label>
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="e.g., IOCL-99824-B1"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono placeholder-neutral-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Dispensed Fuel Volume</label>
                  <input
                    type="text"
                    disabled
                    value={`${order.quantity} Litres (${order.fuelType})`}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Amount Paid at Bunk (INR ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Proof Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-neutral-950 font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-neutral-950" />
                <span>{isSubmitting ? 'Uploading Proof...' : 'Submit Petrol Bunk Proof'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#0a0c13] border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>FuelGo Safety First • Team EAGLE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition-colors cursor-pointer border border-neutral-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
