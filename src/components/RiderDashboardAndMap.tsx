import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bike,
  Navigation,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Package,
  Store,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { CustomerOrder } from '../types';

export const RiderDashboardAndMap: React.FC = () => {
  const {
    deliveryPartners,
    orders,
    activeTrackingOrderId,
    setActiveTrackingOrderId,
    advanceOrderStatus,
    acceptOrderAsRider,
    currentUser,
    userCoords,
    registerDeliveryPartner,
    toggleRiderOnline,
  } = useApp();

  const [selectedRiderId, setSelectedRiderId] = useState<string>('rider_leo_1');
  const [showRiderRegisterModal, setShowRiderRegisterModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicleNo, setNewVehicleNo] = useState('');
  const [newVehicleType, setNewVehicleType] = useState<'bike' | 'scooter' | 'ev'>('ev');

  // Active tracked order
  const activeOrder = useMemo(() => {
    if (activeTrackingOrderId) {
      const found = orders.find((o) => o.id === activeTrackingOrderId);
      if (found) return found;
    }
    return orders[0] || null;
  }, [orders, activeTrackingOrderId]);

  // Current active rider
  const currentRider = useMemo(() => {
    return deliveryPartners.find((r) => r.id === selectedRiderId) || deliveryPartners[0];
  }, [deliveryPartners, selectedRiderId]);

  // Orders available for riders to pick up
  const unassignedOrders = useMemo(() => {
    return orders.filter((o) => o.orderStatus === 'placed' || o.orderStatus === 'confirmed_by_seller');
  }, [orders]);

  const riderAssignedOrders = useMemo(() => {
    return orders.filter((o) => o.riderId === currentRider.id);
  }, [orders, currentRider]);

  // Compute map coordinates & bounds
  const mapData = useMemo(() => {
    if (!activeOrder) return null;
    const store = activeOrder.pickupLocation;
    const customer = activeOrder.deliveryCoords;
    const rider = activeOrder.riderLocation || store;

    const remainingDistance = calculateDistanceKm(rider, customer);

    return {
      store,
      customer,
      rider,
      remainingDistance,
    };
  }, [activeOrder]);

  const handleRegisterRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newVehicleNo) return;
    registerDeliveryPartner(newName, newPhone, newVehicleNo, newVehicleType);
    setShowRiderRegisterModal(false);
    setNewName('');
    setNewPhone('');
    setNewVehicleNo('');
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
      {/* Top Rider Mode / Realtime Tracking Header */}
      <div className="bg-[#0f2b5c] text-white rounded-2xl p-4 mb-4 shadow-md border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Live GPS Delivery Logistics
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white">
              Hyperlocal Rider Dashboard & Live Map
            </h1>
          </div>
        </div>

        {/* Rider Persona & Onboarding Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          <select
            value={selectedRiderId}
            onChange={(e) => setSelectedRiderId(e.target.value)}
            className="bg-blue-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-600 focus:outline-none"
          >
            {deliveryPartners.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.vehicleType.toUpperCase()} - {r.isOnline ? 'Online' : 'Offline'})
              </option>
            ))}
          </select>

          <button
            onClick={() => toggleRiderOnline(currentRider.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentRider.isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {currentRider.isOnline ? '● Online (Receiving Orders)' : '○ Offline'}
          </button>

          <button
            onClick={() => setShowRiderRegisterModal(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition-all"
          >
            + Register New Rider
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Interactive Map & Delivery Status Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Interactive Simulated GPS Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            {/* Map Top Bar with Active Order Badge */}
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold">Live Tracking:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {activeOrder ? activeOrder.id : 'No active order'}
                </span>
              </div>
              {activeOrder && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">ETA:</span>
                  <span className="font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                    {activeOrder.etaMinutes} mins
                  </span>
                </div>
              )}
            </div>

            {/* Custom High-Precision SVG GPS Canvas Map */}
            <div className="relative w-full h-[360px] sm:h-[420px] bg-[#eef3f7] overflow-hidden flex items-center justify-center select-none">
              {/* Map Ground & Road Grid Vector Graphics */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Background Pattern */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Simulated Road Arteries */}
                <path d="M 0 100 Q 150 120 400 90 T 800 130" stroke="#cbd5e1" strokeWidth="18" fill="none" />
                <path d="M 0 100 Q 150 120 400 90 T 800 130" stroke="#ffffff" strokeWidth="12" fill="none" />

                <path d="M 120 0 L 150 450" stroke="#cbd5e1" strokeWidth="14" fill="none" />
                <path d="M 120 0 L 150 450" stroke="#ffffff" strokeWidth="8" fill="none" />

                <path d="M 0 280 C 200 290 350 250 800 320" stroke="#cbd5e1" strokeWidth="18" fill="none" />
                <path d="M 0 280 C 200 290 350 250 800 320" stroke="#ffffff" strokeWidth="12" fill="none" />

                <path d="M 480 0 C 460 180 520 300 500 450" stroke="#cbd5e1" strokeWidth="14" fill="none" />
                <path d="M 480 0 C 460 180 520 300 500 450" stroke="#ffffff" strokeWidth="8" fill="none" />

                {/* Delivery Active Route Path Polyline */}
                {activeOrder && (
                  <path
                    d="M 140 110 C 220 180 340 200 480 290"
                    stroke="url(#routeGrad)"
                    strokeWidth="5"
                    strokeDasharray="6 4"
                    fill="none"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Point 1: Store Pickup Marker */}
              {activeOrder && (
                <div
                  className="absolute left-[140px] top-[110px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10"
                  title="Pickup Store"
                >
                  <div className="px-2 py-0.5 bg-[#0f2b5c] text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
                    <Store className="w-2.5 h-2.5 text-amber-300" />
                    {activeOrder.shopName}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0f2b5c] border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Point 2: Animated Rider Marker */}
              {activeOrder && (
                <div
                  className="absolute left-[310px] top-[200px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-1000"
                >
                  <div className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full shadow-md whitespace-nowrap mb-1 flex items-center gap-1 animate-bounce">
                    <Bike className="w-3 h-3" />
                    {activeOrder.riderName} ({activeOrder.etaMinutes}m ETA)
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-emerald-400/40 animate-pulse">
                      <Bike className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Point 3: Customer Delivery Destination Marker */}
              {activeOrder && (
                <div
                  className="absolute left-[480px] top-[290px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                >
                  <div className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap mb-1 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    Customer Home
                  </div>
                  <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Map Floating HUD Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{activeOrder?.riderName || 'Leo Rodriguez'}</div>
                    <div className="text-[11px] text-slate-500">
                      Vehicle: {activeOrder?.riderVehicleNo || 'SF-EV-4091'} (Electric Scooter)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeOrder?.riderPhone || '+15554567890'}`}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Rider
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Orders Carousel for Tracking Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="text-xs font-bold text-slate-700 mb-2">Select Active Delivery to Track on Map:</div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setActiveTrackingOrderId(o.id)}
                  className={`px-3 py-2 rounded-xl border text-left shrink-0 transition-all ${
                    activeOrder?.id === o.id
                      ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-blue-900">{o.id}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{o.shopName}</div>
                  <div className="text-[10px] font-bold text-emerald-700 capitalize mt-0.5">
                    ● {o.orderStatus.replace(/_/g, ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Status Progression & Rider Action Center (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {activeOrder ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-4">
              {/* Order Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Order Lifecycle Control
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1">
                    {activeOrder.id} • ${activeOrder.totalAmount.toFixed(2)}
                  </h2>
                  <div className="text-xs text-slate-500">
                    From <strong>{activeOrder.shopName}</strong> to <strong>{activeOrder.customerName}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-900">
                    {activeOrder.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Interactive Status Advancer Button for Testing */}
              {activeOrder.orderStatus !== 'delivered' && (
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                  <div className="text-xs font-bold text-blue-950 mb-1 flex items-center justify-between">
                    <span>Simulate Next Delivery Step:</span>
                    <span className="text-[10px] text-blue-600 font-normal">Step-by-step state machine</span>
                  </div>
                  <button
                    onClick={() => advanceOrderStatus(activeOrder.id)}
                    className="w-full py-2.5 px-3 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Advance Status to Next Stage</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Order Timeline Visualizer */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900">Status Timeline:</div>
                <div className="space-y-2.5 pl-2 border-l-2 border-blue-200">
                  {[
                    { id: 'placed', title: 'Order Placed & Paid', desc: 'Customer placed order online' },
                    { id: 'confirmed_by_seller', title: 'Confirmed by Seller', desc: 'Store acknowledged stock' },
                    { id: 'packed', title: 'Packed & Sealed', desc: 'Ready for rider pickup at store' },
                    { id: 'rider_assigned', title: 'Rider Assigned', desc: 'Leo Rodriguez assigned' },
                    { id: 'picked_up', title: 'Picked Up by Rider', desc: 'Rider received parcel' },
                    { id: 'out_for_delivery', title: 'Out For Delivery', desc: 'Live GPS heading to home' },
                    { id: 'delivered', title: 'Delivered', desc: 'Handed over to customer' },
                  ].map((step, idx) => {
                    const statusFlow = [
                      'placed',
                      'confirmed_by_seller',
                      'packed',
                      'rider_assigned',
                      'picked_up',
                      'out_for_delivery',
                      'delivered',
                    ];
                    const currentIdx = statusFlow.indexOf(activeOrder.orderStatus);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={step.id} className="relative flex items-start gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 rounded-full -ml-[17px] flex items-center justify-center shrink-0 border-2 ${
                            isDone
                              ? 'bg-blue-700 border-blue-700 text-white'
                              : isCurrent
                              ? 'bg-amber-400 border-white ring-2 ring-amber-400'
                              : 'bg-white border-slate-300 text-transparent'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className={`font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                            {step.title}
                          </div>
                          <div className="text-[11px] text-slate-500">{step.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items in this delivery */}
              <div className="border-t border-slate-200 pt-3">
                <div className="text-xs font-bold text-slate-700 mb-2">Package Contents ({activeOrder.items.length} SKUs):</div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <img src={item.productImage} alt={item.productName} className="w-7 h-7 object-contain rounded" />
                        <div>
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-[10px] text-slate-500">Qty: {item.quantity} • {item.unit}</div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-800">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200 text-xs">
              No active orders to track. Place an order from the Master Catalog!
            </div>
          )}

          {/* Unassigned Orders Queue for Riders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Unassigned Nearby Delivery Pool ({unassignedOrders.length})
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold">Auto-Dispatch</span>
            </div>

            {unassignedOrders.length === 0 ? (
              <div className="text-xs text-slate-400 py-3 text-center">
                All current customer orders have active riders assigned.
              </div>
            ) : (
              <div className="space-y-2">
                {unassignedOrders.map((ord) => (
                  <div key={ord.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{ord.id} • ${ord.totalAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">Pickup: {ord.shopName}</div>
                    </div>
                    <button
                      onClick={() => acceptOrderAsRider(currentRider.id, ord.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                    >
                      Accept Job
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rider Onboarding Modal */}
      {showRiderRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">Onboard Delivery Partner</h3>
            <p className="text-xs text-slate-500 mb-4">
              Register as an authorized hyperlocal delivery rider with live GPS tracking.
            </p>

            <form onSubmit={handleRegisterRider} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Carlos Mendoza"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 789-0123"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Plate / ID</label>
                  <input
                    type="text"
                    required
                    value={newVehicleNo}
                    onChange={(e) => setNewVehicleNo(e.target.value)}
                    placeholder="SF-EV-8820"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
                  <select
                    value={newVehicleType}
                    onChange={(e) => setNewVehicleType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="ev">Electric Scooter (EV)</option>
                    <option value="bike">Motorcycle / Bike</option>
                    <option value="scooter">Moped</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRiderRegisterModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg"
                >
                  Confirm & Go Online
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
