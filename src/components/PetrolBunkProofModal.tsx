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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Petrol Bunk Purchase Proof</h3>
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
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Alert Banner */}
          {existingProof ? (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                existingProof.verificationStatus === 'Verified'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : existingProof.verificationStatus === 'Rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {existingProof.verificationStatus === 'Verified' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : existingProof.verificationStatus === 'Rejected' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">
                  Status: {existingProof.verificationStatus}
                </p>
                <p>
                  Uploaded on {new Date(existingProof.uploadedAt).toLocaleString('en-IN')} by Rider ID{' '}
                  <span className="font-mono">{existingProof.riderId}</span>.
                </p>
                {existingProof.verifiedBy && (
                  <p className="font-medium text-emerald-800">
                    Verified by: {existingProof.verifiedBy} on{' '}
                    {new Date(existingProof.verifiedAt || '').toLocaleString('en-IN')}
                  </p>
                )}
                {existingProof.rejectionReason && (
                  <p className="font-semibold text-rose-800">
                    Rejection Reason: {existingProof.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm">Proof of Purchase Required</p>
                <p>
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
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* VIEW EXISTING PROOF SECTION (Visible to Customer, Rider & Admin) */}
          {existingProof && (
            <div className="space-y-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-800">Petrol Bunk Invoice & Receipt</h4>
                <a
                  href={existingProof.receiptImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`FuelGo-Proof-${order.orderNumber}.jpg`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Proof</span>
                </a>
              </div>

              {/* Receipt Image Display */}
              <div className="relative rounded-xl overflow-hidden border border-neutral-300 bg-neutral-900 aspect-video flex items-center justify-center">
                <img
                  src={existingProof.receiptImageUrl}
                  alt="Petrol Bunk Receipt"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/80 text-white text-[10px] font-mono backdrop-blur-md">
                  Simulation Receipt
                </div>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <span className="text-neutral-500 flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" /> Petrol Bunk
                  </span>
                  <p className="font-bold text-neutral-800 mt-1">{existingProof.bunkName}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <span className="text-neutral-500 flex items-center gap-1 font-medium">
                    <FileCheck2 className="w-3.5 h-3.5 text-neutral-400" /> Receipt / Bill No.
                  </span>
                  <p className="font-bold font-mono text-neutral-800 mt-1">{existingProof.receiptNumber}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <span className="text-neutral-500 flex items-center gap-1 font-medium">
                    <Fuel className="w-3.5 h-3.5 text-neutral-400" /> Fuel & Volume
                  </span>
                  <p className="font-bold text-neutral-800 mt-1">
                    {existingProof.fuelType} • {existingProof.quantity} Litres
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <span className="text-neutral-500 flex items-center gap-1 font-medium">
                    <IndianRupee className="w-3.5 h-3.5 text-neutral-400" /> Bunk Purchase Amount
                  </span>
                  <p className="font-bold text-emerald-700 mt-1">₹{existingProof.amountPaid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN VERIFICATION CONTROLS */}
          {isAdmin && existingProof && existingProof.verificationStatus !== 'Verified' && (
            <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <FileCheck2 className="w-4 h-4" /> Admin Verification Actions
              </h4>
              <p className="text-xs text-neutral-300">
                Inspect that the bunk receipt matches fuel type ({order.fuelType}), quantity ({order.quantity}L), and timestamp.
              </p>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">
                  Rejection Reason (Optional if rejecting):
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Receipt image is unclear. Please upload a clearer copy."
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => handleAdminVerify('Verified')}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Bunk Proof</span>
                </button>
                <button
                  onClick={() => handleAdminVerify('Rejected')}
                  disabled={isSubmitting}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Reject & Request Resubmission</span>
                </button>
              </div>
            </div>
          )}

          {/* RIDER UPLOAD / RESUBMIT FORM (Shown to Drivers or Admins if proof not yet verified) */}
          {isDriverOrAdmin && (!existingProof || existingProof.verificationStatus === 'Rejected' || existingProof.verificationStatus === 'Resubmit Required') && (
            <form onSubmit={handleUploadProof} className="space-y-4 pt-2 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{existingProof ? 'Resubmit Petrol Bunk Proof' : 'Upload Petrol Bunk Purchase Proof'}</span>
                </h4>
                <span className="text-[11px] text-neutral-500 font-medium">Driver Action</span>
              </div>

              {/* Quick Preset Receipts for Demo Simulation */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
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
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        receiptImageUrl === preset.url
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <p className="font-bold truncate">{preset.name.split('—')[0]}</p>
                      <p className="text-[10px] text-neutral-500 truncate font-mono">{preset.receiptNo}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Photo / File Picker */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="flex-1 w-full cursor-pointer flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 rounded-xl hover:border-emerald-500 bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload Receipt File (JPG, PNG)</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 p-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 text-xs font-medium shadow-sm transition-colors">
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

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Petrol Bunk Name</label>
                  <input
                    type="text"
                    required
                    value={bunkName}
                    onChange={(e) => setBunkName(e.target.value)}
                    placeholder="e.g., Indian Oil Corporation — Indiranagar"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Receipt / Transaction Ref Number</label>
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="e.g., IOCL-99824-B1"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Dispensed Fuel Volume</label>
                  <input
                    type="text"
                    disabled
                    value={`${order.quantity} Litres (${order.fuelType})`}
                    className="w-full px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Amount Paid at Bunk (INR ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Submit Proof Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Uploading Proof...' : 'Submit Petrol Bunk Proof'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>FuelGo Safety First • Team EAGLE</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
