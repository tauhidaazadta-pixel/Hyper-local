import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  MasterProduct,
  SellerStore,
  SellerInventory,
  DeliveryPartner,
  CartItem,
  CustomerOrder,
  POSTransaction,
  POSCartItem,
  GeminiShoppingAssistantResponse,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_SELLERS,
  INITIAL_MASTER_PRODUCTS,
  INITIAL_SELLER_INVENTORY,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_ORDERS,
  INITIAL_POS_TRANSACTIONS,
} from '../data/mockData';
import { calculateDistanceKm, DEFAULT_USER_COORDS, interpolateCoords } from '../utils/geo';

interface AppContextType {
  // Auth & Roles
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
  updateUserRole: (role: UserRole) => void;
  loginWithSocial: (provider: 'google' | 'facebook' | 'email', email?: string, name?: string) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Master Products & Inventory
  masterProducts: MasterProduct[];
  sellerInventories: SellerInventory[];
  sellers: SellerStore[];
  getSellersForProduct: (productId: string) => Array<{ inventory: SellerInventory; seller: SellerStore; distanceKm: number }>;
  addMasterProduct: (product: Omit<MasterProduct, 'id' | 'createdAt'>) => void;
  updateSellerInventoryItem: (inventoryId: string, updates: Partial<SellerInventory>) => void;
  addOrLinkSellerInventory: (sellerId: string, productId: string, price: number, stock: number) => void;

  // Customer Cart & Orders
  cart: CartItem[];
  addToCart: (inventory: SellerInventory, product: MasterProduct, quantity?: number) => void;
  removeFromCart: (inventoryId: string) => void;
  updateCartQuantity: (inventoryId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCount: number;
  placeOrder: (paymentMethod: 'stripe' | 'razorpay' | 'cod' | 'apple_pay', address: string) => Promise<CustomerOrder>;
  orders: CustomerOrder[];
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (orderId: string | null) => void;

  // Standalone POS Module
  activePOSShopId: string;
  setActivePOSShopId: (shopId: string) => void;
  posCart: POSCartItem[];
  addToPOSCart: (inventory: SellerInventory, product: MasterProduct) => void;
  addCustomItemToPOS: (name: string, price: number, qty: number) => void;
  updatePOSQuantity: (itemId: string, qty: number) => void;
  removePOSItem: (itemId: string) => void;
  clearPOSCart: () => void;
  posDiscountType: 'flat' | 'percentage';
  setPosDiscountType: (type: 'flat' | 'percentage') => void;
  posDiscountValue: number;
  setPosDiscountValue: (val: number) => void;
  posSubtotal: number;
  posDiscountAmount: number;
  posTaxAmount: number;
  posGrandTotal: number;
  completePOSTransaction: (paymentMode: 'cash' | 'card' | 'upi' | 'split', cashTendered?: number, customerPhone?: string) => POSTransaction;
  posTransactions: POSTransaction[];
  latestPOSReceipt: POSTransaction | null;
  setLatestPOSReceipt: (receipt: POSTransaction | null) => void;

  // Delivery Partner / Rider
  deliveryPartners: DeliveryPartner[];
  registerDeliveryPartner: (name: string, phone: string, vehicleNo: string, vehicleType: 'bike' | 'scooter' | 'ev') => void;
  toggleRiderOnline: (riderId: string) => void;
  updateRiderLocation: (riderId: string, lat: number, lng: number) => void;
  acceptOrderAsRider: (riderId: string, orderId: string) => void;
  advanceOrderStatus: (orderId: string) => void;

  // Admin Actions
  approveSeller: (sellerId: string) => void;
  approveDeliveryPartner: (partnerId: string) => void;

  // User Coordinates & Location
  userCoords: { lat: number; lng: number };
  setUserCoords: (coords: { lat: number; lng: number }) => void;
  userAddress: string;
  setUserAddress: (addr: string) => void;

  // Navigation
  activeTab: 'catalog' | 'pos' | 'orders' | 'rider_dashboard' | 'admin' | 'flutter_code';
  setActiveTab: (tab: 'catalog' | 'pos' | 'orders' | 'rider_dashboard' | 'admin' | 'flutter_code') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // AI Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  queryAIAssistant: (prompt: string) => Promise<GeminiShoppingAssistantResponse>;
  aiLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'hyperlocal_users',
  CURRENT_USER_ID: 'hyperlocal_current_user_id',
  SELLERS: 'hyperlocal_sellers',
  MASTER_PRODUCTS: 'hyperlocal_master_products',
  SELLER_INVENTORY: 'hyperlocal_seller_inventory',
  ORDERS: 'hyperlocal_orders',
  POS_TXNS: 'hyperlocal_pos_txns',
  DELIVERY_PARTNERS: 'hyperlocal_delivery_partners',
  ACTIVE_POS_SHOP: 'hyperlocal_active_pos_shop',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core Entities State
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_cust_1'));
  const [sellers, setSellers] = useState<SellerStore[]>(() => loadStorage(STORAGE_KEYS.SELLERS, INITIAL_SELLERS));
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>(() => loadStorage(STORAGE_KEYS.MASTER_PRODUCTS, INITIAL_MASTER_PRODUCTS));
  const [sellerInventories, setSellerInventories] = useState<SellerInventory[]>(() => loadStorage(STORAGE_KEYS.SELLER_INVENTORY, INITIAL_SELLER_INVENTORY));
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => loadStorage(STORAGE_KEYS.DELIVERY_PARTNERS, INITIAL_DELIVERY_PARTNERS));
  const [orders, setOrders] = useState<CustomerOrder[]>(() => loadStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS));
  const [posTransactions, setPosTransactions] = useState<POSTransaction[]>(() => loadStorage(STORAGE_KEYS.POS_TXNS, INITIAL_POS_TRANSACTIONS));

  // Location State
  const [userCoords, setUserCoords] = useState(DEFAULT_USER_COORDS);
  const [userAddress, setUserAddress] = useState('742 Evergreen Terrace, San Francisco, CA');

  // Customer Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>('ORD-88214');

  // POS State
  const [activePOSShopId, setActivePOSShopId] = useState<string>(() => loadStorage(STORAGE_KEYS.ACTIVE_POS_SHOP, 'seller_apex_mart'));
  const [posCart, setPosCart] = useState<POSCartItem[]>([]);
  const [posDiscountType, setPosDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [posDiscountValue, setPosDiscountValue] = useState<number>(0);
  const [latestPOSReceipt, setLatestPOSReceipt] = useState<POSTransaction | null>(null);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'catalog' | 'pos' | 'orders' | 'rider_dashboard' | 'admin' | 'flutter_code'>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => saveStorage(STORAGE_KEYS.USERS, allUsers), [allUsers]);
  useEffect(() => saveStorage(STORAGE_KEYS.CURRENT_USER_ID, currentUserId), [currentUserId]);
  useEffect(() => saveStorage(STORAGE_KEYS.SELLERS, sellers), [sellers]);
  useEffect(() => saveStorage(STORAGE_KEYS.MASTER_PRODUCTS, masterProducts), [masterProducts]);
  useEffect(() => saveStorage(STORAGE_KEYS.SELLER_INVENTORY, sellerInventories), [sellerInventories]);
  useEffect(() => saveStorage(STORAGE_KEYS.DELIVERY_PARTNERS, deliveryPartners), [deliveryPartners]);
  useEffect(() => saveStorage(STORAGE_KEYS.ORDERS, orders), [orders]);
  useEffect(() => saveStorage(STORAGE_KEYS.POS_TXNS, posTransactions), [posTransactions]);
  useEffect(() => saveStorage(STORAGE_KEYS.ACTIVE_POS_SHOP, activePOSShopId), [activePOSShopId]);

  // Derived current user
  const currentUser = allUsers.find((u) => u.id === currentUserId) || allUsers[0];

  // Auth Handlers
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      if (user.role === 'seller' && user.sellerShopId) {
        setActivePOSShopId(user.sellerShopId);
      }
      if (user.role === 'seller') setActiveTab('pos');
      else if (user.role === 'rider') setActiveTab('rider_dashboard');
      else if (user.role === 'admin') setActiveTab('admin');
      else setActiveTab('catalog');
    }
  };

  const updateUserRole = (role: UserRole) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, role, sellerShopId: role === 'seller' ? 'seller_apex_mart' : u.sellerShopId } : u))
    );
  };

  const loginWithSocial = (provider: 'google' | 'facebook' | 'email', email?: string, name?: string) => {
    const defaultEmail = email || (provider === 'google' ? 'google.user@gmail.com' : 'social.user@facebook.com');
    const defaultName = name || (provider === 'google' ? 'Google Account User' : 'Facebook User');
    
    let existing = allUsers.find((u) => u.email === defaultEmail);
    if (!existing) {
      existing = {
        id: `user_${Date.now()}`,
        name: defaultName,
        email: defaultEmail,
        phone: '+1 (555) 000-1122',
        role: 'customer',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultName}`,
      };
      setAllUsers((prev) => [existing!, ...prev]);
    }
    setCurrentUserId(existing.id);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    switchUser('user_cust_1');
  };

  // Helper to query sellers for a specific master product
  const getSellersForProduct = useCallback(
    (productId: string) => {
      const inventories = sellerInventories.filter((inv) => inv.productId === productId && inv.isAvailable);
      return inventories
        .map((inv) => {
          const seller = sellers.find((s) => s.id === inv.sellerId) || {
            id: inv.sellerId,
            shopName: inv.pickupLocation.shopName,
            ownerName: 'Store Owner',
            phone: inv.pickupLocation.phone,
            email: 'store@hyperlocal.app',
            address: inv.pickupLocation.address,
            lat: inv.pickupLocation.lat,
            lng: inv.pickupLocation.lng,
            isApproved: true,
            isOpen: true,
            rating: inv.sellerRating,
            totalOrders: 100,
            posEnabled: true,
            deliveryRadiusKm: 5,
            avatar: '',
            bannerImage: '',
          };
          const dist = calculateDistanceKm(userCoords, { lat: inv.pickupLocation.lat, lng: inv.pickupLocation.lng });
          return { inventory: inv, seller, distanceKm: dist };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    },
    [sellerInventories, sellers, userCoords]
  );

  // Master Catalog Mutations
  const addMasterProduct = (prodData: Omit<MasterProduct, 'id' | 'createdAt'>) => {
    const newProd: MasterProduct = {
      ...prodData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMasterProducts((prev) => [newProd, ...prev]);
  };

  const updateSellerInventoryItem = (inventoryId: string, updates: Partial<SellerInventory>) => {
    setSellerInventories((prev) =>
      prev.map((inv) => (inv.id === inventoryId ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv))
    );
  };

  const addOrLinkSellerInventory = (sellerId: string, productId: string, price: number, stock: number) => {
    const seller = sellers.find((s) => s.id === sellerId);
    const prod = masterProducts.find((p) => p.id === productId);
    if (!seller || !prod) return;

    const existingIndex = sellerInventories.findIndex((i) => i.sellerId === sellerId && i.productId === productId);
    if (existingIndex >= 0) {
      setSellerInventories((prev) => {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          price,
          stockQuantity: stock,
          isAvailable: stock > 0,
          updatedAt: new Date().toISOString(),
        };
        return copy;
      });
    } else {
      const newInv: SellerInventory = {
        id: `inv_${sellerId}_${productId}_${Date.now()}`,
        sellerId,
        productId,
        price,
        mrp: prod.mrp,
        stockQuantity: stock,
        isAvailable: stock > 0,
        pickupLocation: {
          shopName: seller.shopName,
          address: seller.address,
          city: 'San Francisco',
          pincode: '94105',
          lat: seller.lat,
          lng: seller.lng,
          phone: seller.phone,
        },
        sellerRating: seller.rating,
        sellerReviewCount: 120,
        deliveryTimeMin: 15,
        deliveryFee: 1.49,
        updatedAt: new Date().toISOString(),
      };
      setSellerInventories((prev) => [newInv, ...prev]);
    }
  };

  // Customer Cart Handlers
  const addToCart = (inventory: SellerInventory, product: MasterProduct, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.inventoryId === inventory.id);
      if (existing) {
        return prev.map((item) =>
          item.inventoryId === inventory.id ? { ...item, quantity: Math.min(item.quantity + quantity, inventory.stockQuantity) } : item
        );
      }
      const newItem: CartItem = {
        productId: product.id,
        sellerId: inventory.sellerId,
        inventoryId: inventory.id,
        productName: product.name,
        productImage: product.images[0] || '',
        unit: product.unit,
        price: inventory.price,
        mrp: inventory.mrp,
        quantity,
        shopName: inventory.pickupLocation.shopName,
        pickupLocation: inventory.pickupLocation,
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (inventoryId: string) => {
    setCart((prev) => prev.filter((item) => item.inventoryId !== inventoryId));
  };

  const updateCartQuantity = (inventoryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(inventoryId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.inventoryId === inventoryId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Place Home Delivery Order
  const placeOrder = async (paymentMethod: 'stripe' | 'razorpay' | 'cod' | 'apple_pay', address: string): Promise<CustomerOrder> => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const primaryItem = cart[0];
    const seller = sellers.find((s) => s.id === primaryItem.sellerId);
    const subtotal = cartSubtotal;
    const deliveryFee = 1.49;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const discount = subtotal > 15 ? 1.5 : 0;
    const totalAmount = Math.round((subtotal + deliveryFee + tax - discount) * 100) / 100;

    const newOrder: CustomerOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone || '+1 (555) 234-5678',
      deliveryAddress: address,
      deliveryCoords: userCoords,
      sellerId: primaryItem.sellerId,
      shopName: primaryItem.shopName,
      pickupLocation: primaryItem.pickupLocation,
      items: [...cart],
      itemCount: cartTotalCount,
      subtotal,
      deliveryFee,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'placed',
      riderId: 'rider_leo_1',
      riderName: 'Leo Rodriguez',
      riderPhone: '+1 (555) 456-7890',
      riderVehicleNo: 'SF-EV-4091',
      riderLocation: {
        lat: primaryItem.pickupLocation.lat,
        lng: primaryItem.pickupLocation.lng,
      },
      orderType: 'delivery',
      timeline: [
        {
          status: 'placed',
          title: 'Order Placed',
          description: `Paid via ${paymentMethod.toUpperCase()}`,
          timestamp: 'Just now',
        },
      ],
      etaMinutes: 18,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Decrement inventory stock
    setSellerInventories((prev) =>
      prev.map((inv) => {
        const inCart = cart.find((c) => c.inventoryId === inv.id);
        if (inCart) {
          const newStock = Math.max(0, inv.stockQuantity - inCart.quantity);
          return { ...inv, stockQuantity: newStock, isAvailable: newStock > 0 };
        }
        return inv;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTrackingOrderId(newOrder.id);
    clearCart();
    return newOrder;
  };

  // Standalone POS Module Handlers
  const addToPOSCart = (inventory: SellerInventory, product: MasterProduct) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.id === inventory.id);
      if (existing) {
        return prev.map((item) =>
          item.id === inventory.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      const newItem: POSCartItem = {
        id: inventory.id,
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        unit: product.unit,
        price: inventory.price,
        mrp: inventory.mrp,
        quantity: 1,
        maxStock: inventory.stockQuantity,
        subtotal: inventory.price,
      };
      return [...prev, newItem];
    });
  };

  const addCustomItemToPOS = (name: string, price: number, qty: number) => {
    const customItem: POSCartItem = {
      id: `custom_${Date.now()}`,
      productId: 'custom',
      productName: name,
      barcode: 'MANUAL',
      unit: 'Item',
      price,
      mrp: price,
      quantity: qty,
      maxStock: 999,
      subtotal: price * qty,
    };
    setPosCart((prev) => [...prev, customItem]);
  };

  const updatePOSQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removePOSItem(itemId);
      return;
    }
    setPosCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: qty, subtotal: qty * item.price } : item))
    );
  };

  const removePOSItem = (itemId: string) => {
    setPosCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearPOSCart = () => {
    setPosCart([]);
    setPosDiscountValue(0);
  };

  const posSubtotal = posCart.reduce((sum, item) => sum + item.subtotal, 0);
  const posDiscountAmount =
    posDiscountType === 'percentage'
      ? Math.round(posSubtotal * (posDiscountValue / 100) * 100) / 100
      : Math.min(posSubtotal, posDiscountValue);
  const posTaxableAmount = Math.max(0, posSubtotal - posDiscountAmount);
  const posTaxAmount = Math.round(posTaxableAmount * 0.05 * 100) / 100;
  const posGrandTotal = Math.round((posTaxableAmount + posTaxAmount) * 100) / 100;

  // Complete POS Transaction & Print Receipt
  const completePOSTransaction = (
    paymentMode: 'cash' | 'card' | 'upi' | 'split',
    cashTendered?: number,
    customerPhone?: string
  ): POSTransaction => {
    const activeShop = sellers.find((s) => s.id === activePOSShopId) || sellers[0];
    const changeDue = cashTendered ? Math.max(0, Math.round((cashTendered - posGrandTotal) * 100) / 100) : 0;

    const txn: POSTransaction = {
      id: `POS-TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      sellerId: activeShop.id,
      shopName: activeShop.shopName,
      cashierName: currentUser.name,
      items: [...posCart],
      subtotal: posSubtotal,
      discountType: posDiscountType,
      discountValue: posDiscountValue,
      discountAmount: posDiscountAmount,
      taxAmount: posTaxAmount,
      grandTotal: posGrandTotal,
      paymentMode,
      cashTendered,
      changeDue,
      customerPhone,
      customerName: 'Store Walk-In Counter',
      orderType: 'pos_billing', // EXPLICITLY NOT in delivery queue!
      timestamp: new Date().toISOString(),
      receiptNumber: `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    // Decrement seller inventory stock immediately
    setSellerInventories((prev) =>
      prev.map((inv) => {
        const item = posCart.find((p) => p.id === inv.id || (p.productId === inv.productId && inv.sellerId === activeShop.id));
        if (item) {
          const newStock = Math.max(0, inv.stockQuantity - item.quantity);
          return { ...inv, stockQuantity: newStock, isAvailable: newStock > 0 };
        }
        return inv;
      })
    );

    setPosTransactions((prev) => [txn, ...prev]);
    setLatestPOSReceipt(txn);
    clearPOSCart();
    return txn;
  };

  // Delivery Partner Handlers
  const registerDeliveryPartner = (name: string, phone: string, vehicleNo: string, vehicleType: 'bike' | 'scooter' | 'ev') => {
    const newRider: DeliveryPartner = {
      id: `rider_${Date.now()}`,
      name,
      phone,
      vehicleNumber: vehicleNo,
      vehicleType,
      drivingLicenseNo: `DL-${Math.floor(100000 + Math.random() * 900000)}`,
      isApproved: true,
      isOnline: true,
      currentLocation: { ...userCoords },
      headingDeg: 0,
      rating: 5.0,
      totalDeliveriesCompleted: 0,
      joinedAt: new Date().toISOString(),
    };
    setDeliveryPartners((prev) => [newRider, ...prev]);
    // Also create rider user profile
    const riderUser: UserProfile = {
      id: `user_${newRider.id}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@hyperlocal.app`,
      phone,
      role: 'rider',
      isApproved: true,
      coords: newRider.currentLocation,
    };
    setAllUsers((prev) => [riderUser, ...prev]);
    setCurrentUserId(riderUser.id);
    setActiveTab('rider_dashboard');
  };

  const toggleRiderOnline = (riderId: string) => {
    setDeliveryPartners((prev) => prev.map((r) => (r.id === riderId ? { ...r, isOnline: !r.isOnline } : r)));
  };

  const updateRiderLocation = (riderId: string, lat: number, lng: number) => {
    setDeliveryPartners((prev) => prev.map((r) => (r.id === riderId ? { ...r, currentLocation: { lat, lng } } : r)));
    // Also sync to active delivery orders
    setOrders((prev) =>
      prev.map((o) => (o.riderId === riderId ? { ...o, riderLocation: { lat, lng }, updatedAt: new Date().toISOString() } : o))
    );
  };

  const acceptOrderAsRider = (riderId: string, orderId: string) => {
    const rider = deliveryPartners.find((r) => r.id === riderId);
    if (!rider) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedTimeline = [
            ...o.timeline,
            { status: 'rider_assigned' as const, title: 'Rider Assigned', description: `${rider.name} accepted your delivery`, timestamp: 'Just now' },
          ];
          return {
            ...o,
            riderId: rider.id,
            riderName: rider.name,
            riderPhone: rider.phone,
            riderVehicleNo: rider.vehicleNumber,
            orderStatus: 'rider_assigned',
            timeline: updatedTimeline,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      })
    );
    setDeliveryPartners((prev) => prev.map((r) => (r.id === riderId ? { ...r, activeOrderId: orderId } : r)));
  };

  const advanceOrderStatus = (orderId: string) => {
    const statusFlow: CustomerOrder['orderStatus'][] = [
      'placed',
      'confirmed_by_seller',
      'packed',
      'rider_assigned',
      'picked_up',
      'out_for_delivery',
      'delivered',
    ];

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const currentIndex = statusFlow.indexOf(o.orderStatus);
          if (currentIndex < statusFlow.length - 1) {
            const nextStatus = statusFlow[currentIndex + 1];
            const titles: Record<string, string> = {
              confirmed_by_seller: 'Store Confirmed Order',
              packed: 'Order Packed & Sealed',
              rider_assigned: 'Delivery Partner Assigned',
              picked_up: 'Picked Up by Rider',
              out_for_delivery: 'Rider Out for Delivery',
              delivered: 'Order Delivered Successfully!',
            };
            const updatedTimeline = [
              ...o.timeline,
              {
                status: nextStatus,
                title: titles[nextStatus] || nextStatus,
                description: `Status updated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                timestamp: 'Just now',
              },
            ];
            return {
              ...o,
              orderStatus: nextStatus,
              timeline: updatedTimeline,
              etaMinutes: nextStatus === 'delivered' ? 0 : Math.max(2, o.etaMinutes - 4),
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return o;
      })
    );
  };

  // Admin Approvals
  const approveSeller = (sellerId: string) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, isApproved: true } : s)));
  };

  const approveDeliveryPartner = (partnerId: string) => {
    setDeliveryPartners((prev) => prev.map((p) => (p.id === partnerId ? { ...p, isApproved: true } : p)));
  };

  // Live GPS Simulation Interval: Gradually moves rider closer to customer
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.orderStatus === 'out_for_delivery' && order.riderLocation && order.deliveryCoords) {
            const currentRider = order.riderLocation;
            const dest = order.deliveryCoords;
            const dist = calculateDistanceKm(currentRider, dest);
            if (dist > 0.05) {
              const newPos = interpolateCoords(currentRider, dest, 0.08);
              return {
                ...order,
                riderLocation: newPos,
                etaMinutes: Math.max(1, Math.round(dist * 3.5)),
              };
            }
          }
          return order;
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Gemini AI Assistant Query
  const queryAIAssistant = async (prompt: string): Promise<GeminiShoppingAssistantResponse> => {
    setAiLoading(true);
    try {
      // Build lightweight context for Gemini
      const catalogSummary = masterProducts.map((p) => {
        const sellersForP = getSellersForProduct(p.id);
        return {
          productId: p.id,
          name: p.name,
          category: p.category,
          unit: p.unit,
          lowestPrice: sellersForP.length ? Math.min(...sellersForP.map((s) => s.inventory.price)) : p.mrp,
          nearbySellers: sellersForP.map((s) => ({
            shopName: s.seller.shopName,
            price: s.inventory.price,
            stock: s.inventory.stockQuantity,
            distanceKm: s.distanceKm,
            deliveryMin: s.inventory.deliveryTimeMin,
          })),
        };
      });

      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, catalogContext: catalogSummary }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      throw new Error('Invalid response structure');
    } catch (error) {
      console.error('AI assistant client query error:', error);
      // Return smart local heuristic fallback
      const matchingProds = masterProducts.filter((p) =>
        p.name.toLowerCase().includes(prompt.toLowerCase()) ||
        p.category.toLowerCase().includes(prompt.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(prompt.toLowerCase()))
      );

      return {
        message: `I searched our local master catalog for "${prompt}". Here are the top nearby seller matches with live pricing:`,
        recommendedProductIds: matchingProds.length ? matchingProds.map((p) => p.id) : ['prod_pepsi_500', 'prod_amul_milk_1l'],
        bestDealsSummary: 'Apex Express Mart and Metro Superstore currently have the freshest stock nearby.',
        suggestedPrompts: ['Compare Pepsi prices', 'Find milk with 15-min delivery', 'Show snacks nearby'],
      };
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        updateUserRole,
        loginWithSocial,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        masterProducts,
        sellerInventories,
        sellers,
        getSellersForProduct,
        addMasterProduct,
        updateSellerInventoryItem,
        addOrLinkSellerInventory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        placeOrder,
        orders,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        activePOSShopId,
        setActivePOSShopId,
        posCart,
        addToPOSCart,
        addCustomItemToPOS,
        updatePOSQuantity,
        removePOSItem,
        clearPOSCart,
        posDiscountType,
        setPosDiscountType,
        posDiscountValue,
        setPosDiscountValue,
        posSubtotal,
        posDiscountAmount,
        posTaxAmount,
        posGrandTotal,
        completePOSTransaction,
        posTransactions,
        latestPOSReceipt,
        setLatestPOSReceipt,
        deliveryPartners,
        registerDeliveryPartner,
        toggleRiderOnline,
        updateRiderLocation,
        acceptOrderAsRider,
        advanceOrderStatus,
        approveSeller,
        approveDeliveryPartner,
        userCoords,
        setUserCoords,
        userAddress,
        setUserAddress,
        activeTab,
        setActiveTab,
        selectedProductId,
        setSelectedProductId,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        queryAIAssistant,
        aiLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
