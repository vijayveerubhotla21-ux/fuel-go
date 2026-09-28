export type FuelType = 'Petrol' | 'Diesel';

export interface FuelConfig {
  fuelType: FuelType;
  pricePerLitre: number;
  minQuantity: number;
  maxQuantity: number;
  isAvailable: boolean;
  unit: string;
  updatedAt: string;
  description: string;
  color: string;
}

export type OrderStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Driver Assigned'
  | 'On The Way'
  | 'Arriving Soon'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod =
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Wallet'
  | 'COD';

export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'COD';

export type ProofStatus =
  | 'Proof Required'
  | 'Uploading'
  | 'Submitted'
  | 'Verified'
  | 'Rejected'
  | 'Resubmit Required';

export interface PetrolBunkProof {
  proofId: string;
  orderId: string;
  riderId: string;
  bunkName: string;
  bunkLocation?: string;
  receiptNumber: string;
  fuelType: FuelType;
  quantity: number;
  amountPaid: number;
  receiptImageUrl: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  verificationStatus: ProofStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  photoUrl: string;
  rating: number;
  vehicleNumber: string;
  vehicleType: string;
  licenseNumber: string;
  status: 'Available' | 'On Delivery' | 'Offline';
  currentLocation: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  fuelCapacityLiters: number;
  assignedDriverId: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  safetyInspectionDate: string;
}

export interface OrderBreakdown {
  fuelType: FuelType;
  quantity: number;
  pricePerLitre: number;
  fuelSubtotal: number;
  riderCharge: number;
  taxAmount: number; // 5% GST
  taxRatePercent: number;
  finalTotal: number;
  currency: 'INR';
}

export interface DeliveryAddress {
  addressLine: string;
  landmark?: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLitre: number;
  fuelSubtotal: number;
  riderCharge: number;
  taxAmount: number;
  finalAmount: number;
  currency: 'INR';
  isScheduled: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  deliveryAddress: DeliveryAddress;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  transactionRef?: string;
  driverId?: string;
  driver?: Driver;
  proof?: PetrolBunkProof;
  proofRequired: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
}

export interface Invoice {
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  issueDate: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLitre: number;
  fuelSubtotal: number;
  riderCharge: number;
  taxAmount: number;
  finalTotal: number;
  currency: 'INR';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionRef: string;
  scheduledInfo?: string;
}

export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Operations Manager'
  | 'Finance/Admin'
  | 'Support Agent'
  | 'Driver'
  | 'Customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  driverId?: string; // If role is Driver
}

export interface NotificationItem {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'driver' | 'proof' | 'safety' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: 'Order' | 'Proof' | 'Price' | 'Driver' | 'Payment' | 'User';
  targetId: string;
  details: string;
  timestamp: string;
}
