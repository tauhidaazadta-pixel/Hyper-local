export type UserRole = 'customer' | 'seller' | 'rider' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  sellerShopId?: string;
  isApproved?: boolean;
  address?: string;
  coords?: {
    lat: number;
    lng: number;
  };
}

export interface MasterProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  barcode: string;
  unit: string;
  mrp: number;
  rating: number;
  totalRatingsCount: number;
  tags: string[];
  nutritionHighlights?: string[];
  isMasterApproved: boolean;
  createdAt: string;
}

export interface PickupLocation {
  shopName: string;
  address: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface SellerInventory {
  id: string; // inv_{sellerId}_{productId}
  sellerId: string;
  productId: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  isAvailable: boolean;
  pickupLocation: PickupLocation;
  sellerRating: number;
  sellerReviewCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrderValue?: number;
  updatedAt: string;
}

export interface SellerStore {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  isApproved: boolean;
  isOpen: boolean;
  rating: number;
  totalOrders: number;
  posEnabled: boolean;
  fssaiNumber?: string;
  deliveryRadiusKm: number;
  avatar: string;
  bannerImage: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'scooter' | 'ev' | 'cycle';
  vehicleNumber: string;
  drivingLicenseNo: string;
  isApproved: boolean;
  isOnline: boolean;
  currentLocation: {
    lat: number;
    lng: number;
  };
  headingDeg: number;
  rating: number;
  totalDeliveriesCompleted: number;
  activeOrderId?: string | null;
  joinedAt: string;
}

export interface CartItem {
  productId: string;
  sellerId: string;
  inventoryId: string;
  productName: string;
  productImage: string;
  unit: string;
  price: number;
  mrp: number;
  quantity: number;
  shopName: string;
  pickupLocation: PickupLocation;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed_by_seller'
  | 'packed'
  | 'rider_assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCoords: {
    lat: number;
    lng: number;
  };
  sellerId: string;
  shopName: string;
  pickupLocation: PickupLocation;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'stripe' | 'razorpay' | 'cod' | 'apple_pay';
  paymentStatus: 'paid' | 'pending';
  orderStatus: OrderStatus;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicleNo?: string;
  riderLocation?: {
    lat: number;
    lng: number;
  };
  orderType: 'delivery';
  timeline: OrderTimelineEvent[];
  etaMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// Standalone POS Line Item
export interface POSCartItem {
  id: string; // inventory or custom
  productId: string;
  productName: string;
  barcode: string;
  unit: string;
  price: number;
  mrp: number;
  quantity: number;
  maxStock: number;
  subtotal: number;
}

// Standalone POS Transaction (Stored separately as pos_transactions)
export interface POSTransaction {
  id: string;
  sellerId: string;
  shopName: string;
  cashierName: string;
  items: POSCartItem[];
  subtotal: number;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  discountAmount: number;
  taxAmount: number; // e.g. 5% GST/Sales tax
  grandTotal: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'split';
  cashTendered?: number;
  changeDue?: number;
  customerPhone?: string;
  customerName?: string;
  orderType: 'pos_billing'; // Explicitly NOT in delivery order queue!
  timestamp: string;
  receiptNumber: string;
}

export interface GeminiShoppingAssistantResponse {
  message: string;
  recommendedProductIds: string[];
  bestDealsSummary: string;
  suggestedPrompts: string[];
}
