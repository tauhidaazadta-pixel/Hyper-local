import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Store,
  MapPin,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  CheckCircle2,
  DollarSign,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Clock,
  ChevronRight,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { formatDistance } from '../utils/geo';
import { CartItem } from '../types';

export const CartCheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartTotalCount,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    placeOrder,
    userAddress,
    setUserAddress,
    orders,
    setActiveTrackingOrderId,
    setActiveTab,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'cod' | 'apple_pay'>('stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'cart' | 'past_orders'>('cart');

  // Group cart items by seller store
  const itemsBySeller = useMemo(() => {
    const map = new Map<string, { shopName: string; address: string; items: CartItem[] }>();
    cart.forEach((item) => {
      if (!map.has(item.sellerId)) {
        map.set(item.sellerId, {
          shopName: item.shopName,
          address: item.pickupLocation.address,
          items: [],
        });
      }
      map.get(item.sellerId)!.items.push(item);
    });
    return Array.from(map.entries()).map(([sellerId, data]) => ({ sellerId, ...data }));
  }, [cart]);

  const deliveryFee = cart.length > 0 ? 1.49 : 0;
  const tax = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const discount = cartSubtotal > 15 ? 1.5 : 0;
  const grandTotal = Math.round((cartSubtotal + deliveryFee + tax - discount) * 100) / 100;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      // Simulate payment processing delay
      await new Promise((r) => setTimeout(r, 900));
      const newOrder = await placeOrder(paymentMethod, userAddress);
      setActiveTab('rider_dashboard');
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Sub-view Switcher: Active Cart & Checkout vs Customer Past Orders */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('cart')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeSubView === 'cart'
                ? 'bg-[#0f2b5c] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Delivery Cart ({cartTotalCount})</span>
          </button>
          <button
            onClick={() => setActiveSubView('past_orders')}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              activeSubView === 'past_orders'
                ? 'bg-[#0f2b5c] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Order History & Live Deliveries ({orders.length})</span>
          </button>
        </div>

        {cart.length > 0 && activeSubView === 'cart' && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {activeSubView === 'past_orders' ? (
        /* Order History View */
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-xs text-slate-500">
              No orders placed yet. Add items from the Master Catalog to place an order!
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-[#0f2b5c]">{ord.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900">
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    Store: <strong className="text-slate-900">{ord.shopName}</strong> • {ord.items.length} items
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-lg">
                    Items: {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2">
                  <div className="text-lg font-black text-slate-900">${ord.totalAmount.toFixed(2)}</div>
                  <button
                    onClick={() => {
                      setActiveTrackingOrderId(ord.id);
                      setActiveTab('rider_dashboard');
                    }}
                    className="px-4 py-2 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track Live GPS</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Cart & Checkout Two-Column Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cart Items Grouped by Store (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Browse our hyperlocal master catalog to compare nearby sellers and add grocery items.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="mt-4 px-4 py-2 bg-[#0f2b5c] text-white font-bold text-xs rounded-lg hover:bg-blue-900"
                >
                  Explore Master Catalog
                </button>
              </div>
            ) : (
              <>
                {/* Store Groups */}
                {itemsBySeller.map(({ sellerId, shopName, address, items }) => (
                  <div key={sellerId} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Store Header */}
                    <div className="px-4 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-blue-700" />
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">{shopName}</h4>
                          <span className="text-[10px] text-slate-500">{address}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded-full">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="p-4 space-y-3 divide-y divide-slate-100">
                      {items.map((item) => (
                        <div key={item.inventoryId} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-12 object-contain rounded-lg border border-slate-100 p-1 bg-slate-50 shrink-0"
                            />
                            <div>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-900">{item.productName}</h5>
                              <div className="text-[11px] text-slate-500 font-medium">
                                ${item.price.toFixed(2)} / {item.unit}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                              <button
                                onClick={() => updateCartQuantity(item.inventoryId, item.quantity - 1)}
                                className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center shadow-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.inventoryId, item.quantity + 1)}
                                className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right font-black text-slate-900 w-16 text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>

                            <button
                              onClick={() => removeFromCart(item.inventoryId)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right Column: Delivery Address & Payment Gateway (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Delivery Address Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  Delivery Destination
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">15-20 Min ETA</span>
              </div>
              <textarea
                value={userAddress}
                onChange={(e) => setUserAddress(e.target.value)}
                rows={2}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Select Payment Gateway:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'stripe', label: 'Credit Card / Stripe', icon: CreditCard },
                  { id: 'apple_pay', label: 'Apple Pay / GPay', icon: DollarSign },
                  { id: 'razorpay', label: 'UPI / QR Pay', icon: QrCode },
                  { id: 'cod', label: 'Cash on Delivery', icon: CheckCircle2 },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      paymentMethod === id
                        ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Interactive Stripe Card inputs if selected */}
              {paymentMethod === 'stripe' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-600">Simulated Stripe Card Elements:</div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="MM/YY"
                      className="p-2 bg-white border border-slate-300 rounded text-xs font-mono"
                    />
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      className="p-2 bg-white border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-sm pb-2 border-b border-slate-200">Bill Breakdown</h4>
              <div className="flex justify-between text-slate-600">
                <span>Item Subtotal ({cartTotalCount} items)</span>
                <span className="font-bold text-slate-800">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Partner Fee</span>
                <span className="font-bold text-slate-800">${deliveryFee.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Cart Promotion Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Taxes (5% Estimated)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 font-black text-slate-900 text-base">
                <span>To Pay:</span>
                <span className="text-xl text-[#0f2b5c]">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#0f2b5c] hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                {isProcessing ? (
                  <span>Securing Order & Assigning Rider...</span>
                ) : (
                  <>
                    <span>CONFIRM & PLACE ORDER (${grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
