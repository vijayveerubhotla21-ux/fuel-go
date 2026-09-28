import {
  FuelType,
  FuelConfig,
  Order,
  OrderStatus,
  OrderBreakdown,
  PaymentMethod,
  PaymentStatus,
  PetrolBunkProof,
  Driver,
  Vehicle,
  Invoice,
  User,
  UserRole,
  NotificationItem,
  AuditLog,
  DeliveryAddress,
  ProofStatus,
} from '../types';

// Default Fuel Configurations
const DEFAULT_FUEL_CONFIGS: Record<FuelType, FuelConfig> = {
  Petrol: {
    fuelType: 'Petrol',
    pricePerLitre: 104.25,
    minQuantity: 1,
    maxQuantity: 5,
    isAvailable: true,
    unit: 'Litres',
    updatedAt: new Date().toISOString(),
    description: 'High-octane unleaded BS-VI petrol sourced from certified bunks with quality tamper-proof seals.',
    color: '#059669', // Emerald
  },
  Diesel: {
    fuelType: 'Diesel',
    pricePerLitre: 91.8,
    minQuantity: 1,
    maxQuantity: 10,
    isAvailable: true,
    unit: 'Litres',
    updatedAt: new Date().toISOString(),
    description: 'Premium ultra-low sulfur BS-VI diesel for SUVs, commercial vehicles, and generators.',
    color: '#D97706', // Amber
  },
};

// Rider/delivery charge default
const DEFAULT_RIDER_CHARGE = 60; // ₹60 standard base delivery
const GST_TAX_RATE = 0.05; // 5% GST on fuel delivery service

// Pre-seeded drivers
const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Rajesh Sharma',
    phone: '+91 98765 43210',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.9,
    vehicleNumber: 'KA 03 EV 4821',
    vehicleType: 'E-Fuel Carrier (PESO Certified)',
    licenseNumber: 'KA-03-2018-00912',
    status: 'On Delivery',
    currentLocation: {
      lat: 12.9716,
      lng: 77.5946,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'drv-2',
    name: 'Vikram Singh',
    phone: '+91 98111 22334',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.8,
    vehicleNumber: 'KA 05 MN 1092',
    vehicleType: 'PESO Mobile Dispenser Van',
    licenseNumber: 'KA-05-2019-00445',
    status: 'Available',
    currentLocation: {
      lat: 12.9352,
      lng: 77.6245,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'drv-3',
    name: 'Amit Patel',
    phone: '+91 97234 56789',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    vehicleNumber: 'KA 01 TR 7741',
    vehicleType: 'Smart Fuel E-Van',
    licenseNumber: 'KA-01-2020-00889',
    status: 'Available',
    currentLocation: {
      lat: 12.9856,
      lng: 77.6057,
      updatedAt: new Date().toISOString(),
    },
  },
];

// Pre-seeded vehicles
const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    vehicleNumber: 'KA 03 EV 4821',
    vehicleType: 'E-Fuel Carrier (PESO Certified)',
    fuelCapacityLiters: 150,
    assignedDriverId: 'drv-1',
    status: 'Active',
    safetyInspectionDate: '2026-08-15',
  },
  {
    id: 'veh-2',
    vehicleNumber: 'KA 05 MN 1092',
    vehicleType: 'PESO Mobile Dispenser Van',
    fuelCapacityLiters: 250,
    assignedDriverId: 'drv-2',
    status: 'Active',
    safetyInspectionDate: '2026-09-01',
  },
  {
    id: 'veh-3',
    vehicleNumber: 'KA 01 TR 7741',
    vehicleType: 'Smart Fuel E-Van',
    fuelCapacityLiters: 200,
    assignedDriverId: 'drv-3',
    status: 'Active',
    safetyInspectionDate: '2026-09-10',
  },
];

// Pre-seeded Users
export const SYSTEM_USERS: User[] = [
  {
    id: 'usr-customer-1',
    name: 'Vijay Veerubhotla',
    email: 'vijayveerubhotla21@gmail.com',
    phone: '+91 98450 12345',
    role: 'Customer',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-driver-1',
    name: 'Rajesh Sharma',
    email: 'rajesh.driver@fuelgo.in',
    phone: '+91 98765 43210',
    role: 'Driver',
    driverId: 'drv-1',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-admin-1',
    name: 'EAGLE Operations Admin',
    email: 'admin@fuelgo.in',
    phone: '+91 99000 11223',
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-ops-1',
    name: 'Sneha Rao',
    email: 'sneha.ops@fuelgo.in',
    phone: '+91 99444 33221',
    role: 'Operations Manager',
  },
  {
    id: 'usr-finance-1',
    name: 'Karan Mehra',
    email: 'finance@fuelgo.in',
    phone: '+91 99888 77665',
    role: 'Finance/Admin',
  },
];

// Seed sample orders to test full customer journey, driver flow, and invoice linking right away
const SEED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'FG-2026-9481',
    customerId: 'usr-customer-1',
    customerName: 'Vijay Veerubhotla',
    customerPhone: '+91 98450 12345',
    fuelType: 'Petrol',
    quantity: 5,
    pricePerLitre: 104.25,
    fuelSubtotal: 521.25,
    riderCharge: 60,
    taxAmount: 29.06,
    finalAmount: 610.31,
    currency: 'INR',
    isScheduled: false,
    deliveryAddress: {
      addressLine: 'Flat 402, Green Glen Layout, Bellandur',
      landmark: 'Near Central Mall',
      city: 'Bengaluru',
      pincode: '560103',
      lat: 12.926,
      lng: 77.6762,
    },
    orderStatus: 'On The Way',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    paymentId: 'pay_9481_upi_ok',
    transactionRef: 'UPI-98450123-REF101',
    driverId: 'drv-1',
    driver: INITIAL_DRIVERS[0],
    proofRequired: true,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Confirmed', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), description: 'Order confirmed and payment verified via UPI (₹610.31)' },
      { status: 'Driver Assigned', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), description: 'Rajesh Sharma (KA 03 EV 4821) assigned' },
      { status: 'On The Way', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), description: 'Driver picked up fuel and is en route to destination' },
    ],
  },
  {
    id: 'ord-100',
    orderNumber: 'FG-2026-8820',
    customerId: 'usr-customer-1',
    customerName: 'Vijay Veerubhotla',
    customerPhone: '+91 98450 12345',
    fuelType: 'Diesel',
    quantity: 10,
    pricePerLitre: 91.8,
    fuelSubtotal: 918.0,
    riderCharge: 60,
    taxAmount: 48.9,
    finalAmount: 1026.9,
    currency: 'INR',
    isScheduled: false,
    deliveryAddress: {
      addressLine: 'Indiranagar 100ft Road, 12th Main',
      landmark: 'Opposite Metro Pillar 140',
      city: 'Bengaluru',
      pincode: '560038',
      lat: 12.9784,
      lng: 77.6408,
    },
    orderStatus: 'Delivered',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    paymentId: 'pay_8820_cc_ok',
    transactionRef: 'CC-HDFC-9921-REF100',
    driverId: 'drv-2',
    driver: INITIAL_DRIVERS[1],
    proofRequired: true,
    proof: {
      proofId: 'prf-8820',
      orderId: 'ord-100',
      riderId: 'drv-2',
      bunkName: 'Indian Oil Corporation — Indiranagar Auto Fuel',
      bunkLocation: '100ft Road, HAL 2nd Stage, Bengaluru',
      receiptNumber: 'IOCL-B77-98124',
      fuelType: 'Diesel',
      quantity: 10,
      amountPaid: 918.0,
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      fileType: 'image/jpeg',
      fileSizeBytes: 245000,
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      verificationStatus: 'Verified',
      verifiedBy: 'Super Admin',
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Confirmed', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Order confirmed' },
      { status: 'Driver Assigned', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), description: 'Vikram Singh assigned' },
      { status: 'On The Way', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), description: 'Driver en route' },
      { status: 'Arriving Soon', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), description: 'Driver arrived at location' },
      { status: 'Delivered', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), description: 'Fuel dispensed with verified IOCL bunk proof' },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'FG-2026-7731',
    customerId: 'usr-customer-1',
    customerName: 'Vijay Veerubhotla',
    customerPhone: '+91 98450 12345',
    fuelType: 'Petrol',
    quantity: 3,
    pricePerLitre: 104.25,
    fuelSubtotal: 312.75,
    riderCharge: 60,
    taxAmount: 18.64,
    finalAmount: 391.39,
    currency: 'INR',
    isScheduled: true,
    scheduledDate: '2026-10-02',
    scheduledTime: '10:30 AM',
    deliveryAddress: {
      addressLine: 'Tech Park Campus 3, Outer Ring Road, Marathahalli',
      landmark: 'Gate 2 Visitor Parking',
      city: 'Bengaluru',
      pincode: '560037',
      lat: 12.9569,
      lng: 77.7011,
    },
    orderStatus: 'Scheduled',
    paymentMethod: 'Net Banking',
    paymentStatus: 'Paid',
    paymentId: 'pay_7731_nb_ok',
    transactionRef: 'NB-SBI-88219-REF102',
    proofRequired: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Scheduled', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Order scheduled for 02 Oct 2026, 10:30 AM' },
    ],
  },
];

// Helper to generate unique ID
export const generateId = (prefix: string = 'id') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

// Store Keys for LocalStorage
const STORAGE_KEYS = {
  ORDERS: 'fuelgo_orders_v2',
  FUEL_CONFIG: 'fuelgo_fuel_config_v2',
  RIDER_CHARGE: 'fuelgo_rider_charge_v2',
  CURRENT_USER: 'fuelgo_current_user_v2',
  DRIVERS: 'fuelgo_drivers_v2',
  VEHICLES: 'fuelgo_vehicles_v2',
  NOTIFICATIONS: 'fuelgo_notifications_v2',
  AUDIT_LOGS: 'fuelgo_audit_logs_v2',
};

// Store Singleton Class
class FuelGoStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.FUEL_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.FUEL_CONFIG, JSON.stringify(DEFAULT_FUEL_CONFIGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RIDER_CHARGE)) {
      localStorage.setItem(STORAGE_KEYS.RIDER_CHARGE, JSON.stringify(DEFAULT_RIDER_CHARGE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SYSTEM_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRIVERS)) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(INITIAL_DRIVERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotes: NotificationItem[] = [
        {
          id: 'note-1',
          userId: 'usr-customer-1',
          orderId: 'ord-101',
          title: 'Driver is on the way!',
          message: 'Rajesh Sharma is heading to Bellandur with 5L Petrol in vehicle KA 03 EV 4821.',
          type: 'driver',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: false,
        },
        {
          id: 'note-2',
          userId: 'usr-customer-1',
          orderId: 'ord-100',
          title: 'Petrol Bunk Proof Verified',
          message: 'Your fuel purchase proof from IOCL Indiranagar was verified for Order #FG-2026-8820.',
          type: 'proof',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotes));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      const initialLogs: AuditLog[] = [
        {
          id: 'log-1',
          userId: 'usr-admin-1',
          userName: 'EAGLE Operations Admin',
          userRole: 'Super Admin',
          action: 'STATUS_UPDATE',
          targetType: 'Order',
          targetId: 'ord-101',
          details: 'Assigned Driver Rajesh Sharma (KA 03 EV 4821)',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        },
        {
          id: 'log-2',
          userId: 'usr-admin-1',
          userName: 'EAGLE Operations Admin',
          userRole: 'Super Admin',
          action: 'PROOF_VERIFIED',
          targetType: 'Proof',
          targetId: 'prf-8820',
          details: 'Verified IOCL receipt for 10L Diesel Order #FG-2026-8820',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- CURRENT USER / RBAC ---
  public getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : SYSTEM_USERS[0];
  }

  public setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify();
  }

  public switchUserByRole(role: UserRole) {
    const match = SYSTEM_USERS.find((u) => u.role === role) || SYSTEM_USERS[0];
    this.setCurrentUser(match);
  }

  // --- FUEL CONFIGURATION & VALIDATION ---
  public getFuelConfigs(): Record<FuelType, FuelConfig> {
    const raw = localStorage.getItem(STORAGE_KEYS.FUEL_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_FUEL_CONFIGS;
  }

  public getFuelConfig(fuelType: FuelType): FuelConfig {
    const configs = this.getFuelConfigs();
    return configs[fuelType] || DEFAULT_FUEL_CONFIGS[fuelType];
  }

  public updateFuelConfig(fuelType: FuelType, updates: Partial<FuelConfig>, updaterUser: User): { success: boolean; error?: string } {
    if (!['Super Admin', 'Admin', 'Operations Manager'].includes(updaterUser.role)) {
      return { success: false, error: 'Unauthorized: Only authorized administrators can modify fuel configurations.' };
    }

    const configs = this.getFuelConfigs();
    if (!configs[fuelType]) {
      return { success: false, error: `Fuel type ${fuelType} not found.` };
    }

    configs[fuelType] = {
      ...configs[fuelType],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.FUEL_CONFIG, JSON.stringify(configs));

    this.logAudit({
      userId: updaterUser.id,
      userName: updaterUser.name,
      userRole: updaterUser.role,
      action: 'FUEL_PRICE_UPDATE',
      targetType: 'Price',
      targetId: fuelType,
      details: `Updated ${fuelType} price to ₹${updates.pricePerLitre || configs[fuelType].pricePerLitre}/L, min: ${updates.minQuantity || configs[fuelType].minQuantity}L, max: ${updates.maxQuantity || configs[fuelType].maxQuantity}L`,
    });

    this.notify();
    return { success: true };
  }

  // --- RIDER CHARGE CONFIGURATION ---
  public getRiderCharge(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.RIDER_CHARGE);
    return raw ? Number(JSON.parse(raw)) : DEFAULT_RIDER_CHARGE;
  }

  public updateRiderCharge(newCharge: number, updaterUser: User): { success: boolean; error?: string } {
    if (!['Super Admin', 'Admin', 'Operations Manager', 'Finance/Admin'].includes(updaterUser.role)) {
      return { success: false, error: 'Unauthorized: Only administrators can update rider charges.' };
    }
    if (newCharge < 0 || isNaN(newCharge)) {
      return { success: false, error: 'Rider charge must be a positive number.' };
    }
    localStorage.setItem(STORAGE_KEYS.RIDER_CHARGE, JSON.stringify(newCharge));

    this.logAudit({
      userId: updaterUser.id,
      userName: updaterUser.name,
      userRole: updaterUser.role,
      action: 'RIDER_CHARGE_UPDATE',
      targetType: 'Price',
      targetId: 'RiderCharge',
      details: `Updated standard rider delivery charge to ₹${newCharge}`,
    });

    this.notify();
    return { success: true };
  }

  // --- SERVER-SIDE QUANTITY & PRICE VALIDATION ---
  public validateOrderQuantity(fuelType: FuelType, quantity: number): { valid: boolean; error?: string } {
    const config = this.getFuelConfig(fuelType);
    if (!config || !config.isAvailable) {
      return { valid: false, error: `${fuelType} is currently unavailable for delivery.` };
    }

    if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
      return { valid: false, error: 'Please enter a valid fuel quantity.' };
    }

    if (fuelType === 'Petrol') {
      if (quantity > 5) {
        return { valid: false, error: 'Petrol orders are limited to a maximum of 5 litres per order.' };
      }
      if (quantity < 1) {
        return { valid: false, error: 'Minimum order quantity for Petrol is 1 litre.' };
      }
    } else if (fuelType === 'Diesel') {
      if (quantity > 10) {
        return { valid: false, error: 'Diesel orders are limited to a maximum of 10 litres per order.' };
      }
      if (quantity < 1) {
        return { valid: false, error: 'Minimum order quantity for Diesel is 1 litre.' };
      }
    }

    // Dynamic config checks
    if (quantity > config.maxQuantity) {
      return { valid: false, error: `${fuelType} orders are limited to a maximum of ${config.maxQuantity} litres per order.` };
    }
    if (quantity < config.minQuantity) {
      return { valid: false, error: `Minimum order quantity for ${fuelType} is ${config.minQuantity} litres.` };
    }

    return { valid: true };
  }

  // Pure server-side pricing breakdown calculation
  public calculateBreakdown(fuelType: FuelType, quantity: number): OrderBreakdown {
    const config = this.getFuelConfig(fuelType);
    const riderCharge = this.getRiderCharge();

    const pricePerLitre = config.pricePerLitre;
    const fuelSubtotal = Math.round(quantity * pricePerLitre * 100) / 100;
    // 5% GST on delivery service and handling
    const taxAmount = Math.round((fuelSubtotal + riderCharge) * GST_TAX_RATE * 100) / 100;
    const finalTotal = Math.round((fuelSubtotal + riderCharge + taxAmount) * 100) / 100;

    return {
      fuelType,
      quantity,
      pricePerLitre,
      fuelSubtotal,
      riderCharge,
      taxAmount,
      taxRatePercent: 5,
      finalTotal,
      currency: 'INR',
    };
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.getOrders().find((o) => o.id === orderId);
  }

  public getOrdersForUser(user: User): Order[] {
    const all = this.getOrders();
    if (['Super Admin', 'Admin', 'Operations Manager', 'Finance/Admin', 'Support Agent'].includes(user.role)) {
      return all;
    }
    if (user.role === 'Driver') {
      return all.filter((o) => o.driverId === user.driverId || o.driver?.id === user.driverId);
    }
    // Customer: strict ownership check
    return all.filter((o) => o.customerId === user.id);
  }

  // SERVER-SIDE ORDER CREATION
  public createOrder(params: {
    user: User;
    fuelType: FuelType;
    quantity: number;
    deliveryAddress: DeliveryAddress;
    paymentMethod: PaymentMethod;
    isScheduled?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    notes?: string;
  }): { success: boolean; order?: Order; error?: string } {
    // 1. Validate Quantity
    const qtyCheck = this.validateOrderQuantity(params.fuelType, params.quantity);
    if (!qtyCheck.valid) {
      return { success: false, error: qtyCheck.error };
    }

    // 2. Validate Address
    if (!params.deliveryAddress || !params.deliveryAddress.addressLine || params.deliveryAddress.addressLine.trim().length < 5) {
      return { success: false, error: 'Please provide a valid delivery address with street and landmark.' };
    }

    // 3. Validate Schedule if scheduled
    if (params.isScheduled) {
      if (!params.scheduledDate || !params.scheduledTime) {
        return { success: false, error: 'Please choose both date and time for scheduled delivery.' };
      }
      const scheduledDateTime = new Date(`${params.scheduledDate}T${params.scheduledTime}:00`);
      // Prevent past schedule
      if (scheduledDateTime.getTime() < Date.now() - 5 * 60 * 1000) {
        return { success: false, error: 'Scheduled delivery date and time must be in the future.' };
      }
    }

    // 4. Calculate server-side breakdown (NEVER trust frontend prices)
    const breakdown = this.calculateBreakdown(params.fuelType, params.quantity);

    // 5. Payment Simulation ID / Transaction Ref
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const txRef = `${params.paymentMethod.replace(/\s+/g, '').toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderId = generateId('ord');
    const orderNumber = `FG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const initialStatus: OrderStatus = params.isScheduled ? 'Scheduled' : 'Confirmed';

    // Auto-assign available driver if instant order
    let assignedDriver: Driver | undefined = undefined;
    if (!params.isScheduled) {
      const drivers = this.getDrivers();
      assignedDriver = drivers.find((d) => d.status === 'Available') || drivers[0];
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: params.user.id,
      customerName: params.user.name,
      customerPhone: params.user.phone || '+91 98450 12345',
      fuelType: params.fuelType,
      quantity: breakdown.quantity,
      pricePerLitre: breakdown.pricePerLitre,
      fuelSubtotal: breakdown.fuelSubtotal,
      riderCharge: breakdown.riderCharge,
      taxAmount: breakdown.taxAmount,
      finalAmount: breakdown.finalTotal,
      currency: 'INR',
      isScheduled: !!params.isScheduled,
      scheduledDate: params.scheduledDate,
      scheduledTime: params.scheduledTime,
      deliveryAddress: params.deliveryAddress,
      orderStatus: assignedDriver ? 'Driver Assigned' : initialStatus,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'COD' ? 'COD' : 'Paid',
      paymentId,
      transactionRef: txRef,
      driverId: assignedDriver?.id,
      driver: assignedDriver,
      proofRequired: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      notes: params.notes,
      timeline: [
        {
          status: initialStatus,
          timestamp: nowIso,
          description: params.isScheduled
            ? `Delivery scheduled for ${params.scheduledDate} at ${params.scheduledTime}`
            : `Order confirmed with payment of ₹${breakdown.finalTotal} (${params.paymentMethod})`,
        },
      ],
    };

    if (assignedDriver && !params.isScheduled) {
      newOrder.timeline.push({
        status: 'Driver Assigned',
        timestamp: new Date().toISOString(),
        description: `Driver ${assignedDriver.name} (${assignedDriver.vehicleNumber}) assigned for delivery`,
      });
    }

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Audit log
    this.logAudit({
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      action: 'ORDER_CREATED',
      targetType: 'Order',
      targetId: newOrder.id,
      details: `Created ${newOrder.fuelType} order (${newOrder.quantity}L) total ₹${newOrder.finalAmount}`,
    });

    // In-app Notification for customer
    this.addNotification({
      userId: params.user.id,
      orderId: newOrder.id,
      title: 'Order Placed Successfully!',
      message: `Your order #${newOrder.orderNumber} for ${newOrder.quantity}L ${newOrder.fuelType} is confirmed.`,
      type: 'order',
    });

    if (assignedDriver) {
      this.addNotification({
        userId: params.user.id,
        orderId: newOrder.id,
        title: 'Driver Assigned!',
        message: `${assignedDriver.name} (${assignedDriver.vehicleNumber}) has been assigned to your order.`,
        type: 'driver',
      });
    }

    this.notify();
    return { success: true, order: newOrder };
  }

  // --- MANDATORY PETROL BUNK PROOF ENFORCEMENT & WORKFLOW ---
  public uploadPetrolBunkProof(params: {
    orderId: string;
    currentUser: User;
    bunkName: string;
    receiptNumber: string;
    fuelType: FuelType;
    quantity: number;
    amountPaid: number;
    receiptImageUrl: string;
    fileSizeBytes?: number;
    fileType?: string;
  }): { success: boolean; proof?: PetrolBunkProof; error?: string } {
    const order = this.getOrderById(params.orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Role check: Only assigned driver or admins can upload proof
    if (params.currentUser.role === 'Driver') {
      if (order.driverId !== params.currentUser.driverId) {
        return { success: false, error: 'Security Violation: Riders may only upload petrol bunk proof for their own assigned deliveries.' };
      }
    } else if (!['Super Admin', 'Admin', 'Operations Manager'].includes(params.currentUser.role)) {
      return { success: false, error: 'Security Violation: You do not have permission to upload bunk proof for this order.' };
    }

    // Validation
    if (!params.bunkName || params.bunkName.trim().length < 3) {
      return { success: false, error: 'Please enter the Petrol Bunk name (e.g., IOCL, HPCL, BPCL, Shell).' };
    }
    if (!params.receiptNumber || params.receiptNumber.trim().length < 3) {
      return { success: false, error: 'Please enter the receipt or reference invoice number.' };
    }
    if (!params.receiptImageUrl) {
      return { success: false, error: 'Please provide or upload a clear photo of the petrol bunk receipt.' };
    }

    const proofId = generateId('prf');
    const nowIso = new Date().toISOString();

    const proof: PetrolBunkProof = {
      proofId,
      orderId: order.id,
      riderId: params.currentUser.driverId || params.currentUser.id,
      bunkName: params.bunkName,
      receiptNumber: params.receiptNumber,
      fuelType: params.fuelType,
      quantity: params.quantity,
      amountPaid: params.amountPaid,
      receiptImageUrl: params.receiptImageUrl,
      fileType: params.fileType || 'image/jpeg',
      fileSizeBytes: params.fileSizeBytes || 184500,
      uploadedAt: nowIso,
      verificationStatus: 'Submitted', // Initially submitted, immediately available to customer and verified by default or pending admin
    };

    // Update order with proof
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx !== -1) {
      orders[idx].proof = proof;
      orders[idx].updatedAt = nowIso;
      // Add timeline event
      orders[idx].timeline.push({
        status: orders[idx].orderStatus,
        timestamp: nowIso,
        description: `Rider uploaded Petrol Bunk Proof from ${params.bunkName} (Receipt: ${params.receiptNumber})`,
      });
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }

    // Audit log
    this.logAudit({
      userId: params.currentUser.id,
      userName: params.currentUser.name,
      userRole: params.currentUser.role,
      action: 'BUNK_PROOF_UPLOADED',
      targetType: 'Proof',
      targetId: proofId,
      details: `Uploaded purchase proof from ${params.bunkName} for Order #${order.orderNumber}`,
    });

    // Mandatory Notification requirement: «Your fuel purchase proof has been uploaded for Order #XXXX.»
    this.addNotification({
      userId: order.customerId,
      orderId: order.id,
      title: 'Fuel Purchase Proof Uploaded',
      message: `Your fuel purchase proof has been uploaded for Order #${order.orderNumber}.`,
      type: 'proof',
    });

    this.notify();
    return { success: true, proof };
  }

  // Admin Verification of Petrol Bunk Proof
  public verifyProof(params: {
    orderId: string;
    adminUser: User;
    decision: 'Verified' | 'Rejected';
    rejectionReason?: string;
  }): { success: boolean; error?: string } {
    if (!['Super Admin', 'Admin', 'Operations Manager'].includes(params.adminUser.role)) {
      return { success: false, error: 'Unauthorized: Only administrators can verify or reject proof.' };
    }

    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === params.orderId);
    if (idx === -1 || !orders[idx].proof) {
      return { success: false, error: 'Order or proof record not found.' };
    }

    const nowIso = new Date().toISOString();
    orders[idx].proof!.verificationStatus = params.decision;
    orders[idx].proof!.verifiedBy = params.adminUser.name;
    orders[idx].proof!.verifiedAt = nowIso;

    if (params.decision === 'Rejected') {
      orders[idx].proof!.rejectionReason = params.rejectionReason || 'Receipt image is unclear. Please upload a clearer copy.';
    }

    orders[idx].updatedAt = nowIso;
    orders[idx].timeline.push({
      status: orders[idx].orderStatus,
      timestamp: nowIso,
      description: `Bunk Proof ${params.decision} by ${params.adminUser.name}${params.decision === 'Rejected' ? `: ${params.rejectionReason}` : ''}`,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Audit
    this.logAudit({
      userId: params.adminUser.id,
      userName: params.adminUser.name,
      userRole: params.adminUser.role,
      action: params.decision === 'Verified' ? 'PROOF_VERIFIED' : 'PROOF_REJECTED',
      targetType: 'Proof',
      targetId: orders[idx].proof!.proofId,
      details: `${params.decision} proof for Order #${orders[idx].orderNumber}: ${params.rejectionReason || 'Receipt matches bunk standards'}`,
    });

    // Notify customer & driver
    this.addNotification({
      userId: orders[idx].customerId,
      orderId: orders[idx].id,
      title: params.decision === 'Verified' ? 'Bunk Proof Verified' : 'Proof Rejected',
      message: params.decision === 'Verified'
        ? `Petrol Bunk receipt for Order #${orders[idx].orderNumber} was verified.`
        : `Proof was rejected for Order #${orders[idx].orderNumber}: ${params.rejectionReason}`,
      type: 'proof',
    });

    this.notify();
    return { success: true };
  }

  // --- ORDER STATUS TRANSITION WITH CRITICAL BACKEND SECURITY CHECKS ---
  public updateOrderStatus(params: {
    orderId: string;
    newStatus: OrderStatus;
    currentUser: User;
    driverId?: string;
  }): { success: boolean; error?: string } {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === params.orderId);
    if (idx === -1) {
      return { success: false, error: 'Order not found.' };
    }

    const order = orders[idx];

    // CRITICAL SECURITY RULE: Customers CANNOT change order status
    if (params.currentUser.role === 'Customer') {
      return { success: false, error: 'Security Violation: Customers are not authorized to update order delivery status.' };
    }

    // CRITICAL SECURITY RULE: Drivers may only update their own assigned orders
    if (params.currentUser.role === 'Driver') {
      if (order.driverId !== params.currentUser.driverId) {
        return { success: false, error: 'Security Violation: Drivers can only update status for their assigned deliveries.' };
      }
      // Drivers can only update to: On The Way, Arriving Soon, Delivered
      const allowedDriverStatuses: OrderStatus[] = ['On The Way', 'Arriving Soon', 'Delivered'];
      if (!allowedDriverStatuses.includes(params.newStatus)) {
        return { success: false, error: `Drivers cannot transition order to status: ${params.newStatus}` };
      }
    }

    // MANDATORY REQUIREMENT: No valid proof = no Delivered status!
    if (params.newStatus === 'Delivered') {
      if (order.proofRequired) {
        if (!order.proof || !['Submitted', 'Verified'].includes(order.proof.verificationStatus)) {
          return {
            success: false,
            error: 'Mandatory FuelGo Safety Rule: Delivery cannot be marked "Delivered" until the petrol bunk purchase proof has been uploaded by the rider.',
          };
        }
      }
    }

    const nowIso = new Date().toISOString();
    order.orderStatus = params.newStatus;
    order.updatedAt = nowIso;

    if (params.driverId) {
      order.driverId = params.driverId;
      order.driver = this.getDrivers().find((d) => d.id === params.driverId);
    }

    let statusDesc = `Order status updated to ${params.newStatus}`;
    if (params.newStatus === 'Delivered') {
      statusDesc = `Fuel delivered successfully with verified petrol bunk receipt.`;
      if (order.driver) {
        order.driver.status = 'Available';
      }
    } else if (params.newStatus === 'On The Way') {
      statusDesc = `Driver is on the way to the delivery address.`;
    } else if (params.newStatus === 'Arriving Soon') {
      statusDesc = `Driver has arrived near your location.`;
    }

    order.timeline.push({
      status: params.newStatus,
      timestamp: nowIso,
      description: statusDesc,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Audit
    this.logAudit({
      userId: params.currentUser.id,
      userName: params.currentUser.name,
      userRole: params.currentUser.role,
      action: 'STATUS_UPDATE',
      targetType: 'Order',
      targetId: order.id,
      details: `${params.currentUser.role} updated Order #${order.orderNumber} to "${params.newStatus}"`,
    });

    // Notify customer
    this.addNotification({
      userId: order.customerId,
      orderId: order.id,
      title: `Order Update: ${params.newStatus}`,
      message: `Your fuel order #${order.orderNumber} is now ${params.newStatus}.`,
      type: 'order',
    });

    this.notify();
    return { success: true };
  }

  // --- DRIVERS & VEHICLES ---
  public getDrivers(): Driver[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    return raw ? JSON.parse(raw) : INITIAL_DRIVERS;
  }

  public getVehicles(): Vehicle[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return raw ? JSON.parse(raw) : INITIAL_VEHICLES;
  }

  public assignDriverToOrder(orderId: string, driverId: string, adminUser: User): { success: boolean; error?: string } {
    if (!['Super Admin', 'Admin', 'Operations Manager'].includes(adminUser.role)) {
      return { success: false, error: 'Unauthorized: Only operations staff can assign drivers.' };
    }

    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return { success: false, error: 'Order not found.' };

    const driver = this.getDrivers().find((d) => d.id === driverId);
    if (!driver) return { success: false, error: 'Driver not found.' };

    const nowIso = new Date().toISOString();
    orders[idx].driverId = driver.id;
    orders[idx].driver = driver;
    orders[idx].orderStatus = 'Driver Assigned';
    orders[idx].updatedAt = nowIso;
    orders[idx].timeline.push({
      status: 'Driver Assigned',
      timestamp: nowIso,
      description: `Driver ${driver.name} (${driver.vehicleNumber}) assigned by ${adminUser.name}`,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    this.logAudit({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'DRIVER_ASSIGNED',
      targetType: 'Order',
      targetId: orderId,
      details: `Assigned driver ${driver.name} to order #${orders[idx].orderNumber}`,
    });

    this.addNotification({
      userId: orders[idx].customerId,
      orderId: orders[idx].id,
      title: 'Driver Assigned!',
      message: `${driver.name} (${driver.vehicleNumber}) is assigned to your delivery.`,
      type: 'driver',
    });

    this.notify();
    return { success: true };
  }

  public updateDriverLocation(driverId: string, lat: number, lng: number) {
    const drivers = this.getDrivers();
    const idx = drivers.findIndex((d) => d.id === driverId);
    if (idx !== -1) {
      drivers[idx].currentLocation = {
        lat,
        lng,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
      this.notify();
    }
  }

  // --- INVOICE GENERATOR ---
  public getInvoiceForOrder(orderId: string): Invoice | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const invoiceNumber = `FG-INV-2026-${order.orderNumber.replace(/[^0-9]/g, '')}`;

    return {
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      issueDate: order.createdAt,
      fuelType: order.fuelType,
      quantity: order.quantity,
      pricePerLitre: order.pricePerLitre,
      fuelSubtotal: order.fuelSubtotal,
      riderCharge: order.riderCharge,
      taxAmount: order.taxAmount,
      finalTotal: order.finalAmount,
      currency: 'INR',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      transactionRef: order.transactionRef || 'TXN-CONFIRMED',
      scheduledInfo: order.isScheduled ? `${order.scheduledDate} at ${order.scheduledTime}` : undefined,
    };
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId?: string): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: NotificationItem[] = raw ? JSON.parse(raw) : [];
    if (!userId) return all;
    return all.filter((n) => n.userId === userId);
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const notifications = this.getNotifications();
    const newNote: NotificationItem = {
      ...item,
      id: generateId('note'),
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications.slice(0, 50)));
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const notifications = this.getNotifications();
    const match = notifications.find((n) => n.id === id);
    if (match) {
      match.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    const notifications = this.getNotifications();
    notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    this.notify();
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  private logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...entry,
      id: generateId('log'),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100)));
  }
}

export const store = new FuelGoStore();
