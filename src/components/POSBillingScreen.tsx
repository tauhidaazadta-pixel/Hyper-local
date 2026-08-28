import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  DollarSign,
  CreditCard,
  QrCode,
  Printer,
  RotateCcw,
  CheckCircle2,
  Percent,
  AlertCircle,
  Clock,
  User,
  Zap,
  ShoppingBag,
  Sparkles,
  Layers,
} from 'lucide-react';
import { POSTransaction, MasterProduct, SellerInventory } from '../types';

export const POSBillingScreen: React.FC = () => {
  const {
    sellers,
    activePOSShopId,
    setActivePOSShopId,
    masterProducts,
    sellerInventories,
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
    currentUser,
    latestPOSReceipt,
    setLatestPOSReceipt,
  } = useApp();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi' | 'split'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('5.00');
  const [customQty, setCustomQty] = useState('1');
  const [activeTabSubView, setActiveTabSubView] = useState<'billing' | 'history'>('billing');

  // Active Store
  const currentShop = sellers.find((s) => s.id === activePOSShopId) || sellers[0];

  // Active Store's available inventory items
  const storeInventoryItems = useMemo(() => {
    const shopInvs = sellerInventories.filter((inv) => inv.sellerId === currentShop.id);
    return shopInvs.map((inv) => {
      const prod = masterProducts.find((p) => p.id === inv.productId) || {
        id: inv.productId,
        name: 'Product',
        brand: 'Brand',
        category: 'General',
        description: '',
        images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'],
        barcode: '000000000',
        unit: 'Unit',
        mrp: inv.mrp,
        rating: 4.5,
        totalRatingsCount: 10,
        tags: [],
        createdAt: '',
      };
      return { inventory: inv, product: prod };
    });
  }, [sellerInventories, masterProducts, currentShop]);

  // Filtered store catalog for quick selection
  const filteredCatalog = useMemo(() => {
    return storeInventoryItems.filter(({ product, inventory }) => {
      const matchCat = selectedCategory === 'All' || product.category === selectedCategory;
      const matchSearch =
        searchFilter.trim() === '' ||
        product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.barcode.includes(searchFilter) ||
        product.brand.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [storeInventoryItems, selectedCategory, searchFilter]);

  // Barcode quick scan submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Find item matching barcode in store inventory or master
    const match = storeInventoryItems.find(
      (item) => item.product.barcode === query || item.product.name.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      addToPOSCart(match.inventory, match.product);
      setBarcodeInput('');
    } else {
      alert(`Barcode "${query}" not found in current shop inventory. You can add it as custom item or link from Master catalog.`);
    }
  };

  // Change Due Calculation
  const changeDue = cashTendered > 0 ? Math.max(0, Math.round((cashTendered - posGrandTotal) * 100) / 100) : 0;

  // Handle Checkout Bill
  const handlePrintAndBill = () => {
    if (posCart.length === 0) return;
    completePOSTransaction(paymentMode, cashTendered > 0 ? cashTendered : posGrandTotal, customerPhone);
    setCashTendered(0);
    setCustomerPhone('');
  };

  // Quick cash buttons
  const cashPresets = [
    posGrandTotal,
    Math.ceil(posGrandTotal / 5) * 5,
    Math.ceil(posGrandTotal / 10) * 10,
    20,
    50,
    100,
  ].filter((v, i, arr) => v >= posGrandTotal && arr.indexOf(v) === i);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
      {/* Top Banner: Standalone POS Architecture Notice & Store Switcher */}
      <div className="bg-[#0a1e3f] text-white rounded-2xl p-3 sm:p-4 mb-4 border border-blue-800/80 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Shop Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Offline / Walk-in POS Module
                </span>
                <span className="text-[11px] text-blue-300 hidden sm:inline">
                  (Isolated from delivery queue • Atomic local stock update)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-300">Active Register:</span>
                <select
                  value={activePOSShopId}
                  onChange={(e) => {
                    setActivePOSShopId(e.target.value);
                    clearPOSCart();
                  }}
                  className="bg-blue-950 text-white font-bold text-xs sm:text-sm px-2.5 py-1 rounded border border-blue-600 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shopName} ({s.address.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sub-view switcher: Live Counter vs Transaction History */}
          <div className="flex items-center gap-1 bg-blue-950/80 p-1 rounded-xl border border-blue-800 self-end md:self-auto">
            <button
              onClick={() => setActiveTabSubView('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabSubView === 'billing' ? 'bg-amber-400 text-slate-950 shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              Billing Counter
            </button>
            <button
              onClick={() => setActiveTabSubView('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabSubView === 'history' ? 'bg-amber-400 text-slate-950 shadow' : 'text-blue-200 hover:text-white'
              }`}
            >
              Today's POS Audit ({posTransactions.filter((t) => t.sellerId === currentShop.id).length})
            </button>
          </div>
        </div>
      </div>

      {activeTabSubView === 'history' ? (
        /* Standalone POS Transaction Audit Log */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                In-Store POS Audit Log — {currentShop.shopName}
              </h2>
              <p className="text-xs text-slate-500">
                All transactions recorded in <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">pos_transactions</code>. These are physical walk-in sales.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Total POS Sales</div>
              <div className="text-xl font-black text-[#0f2b5c]">
                $
                {posTransactions
                  .filter((t) => t.sellerId === currentShop.id)
                  .reduce((acc, t) => acc + t.grandTotal, 0)
                  .toFixed(2)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Receipt #</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Cashier</th>
                  <th className="py-2.5 px-3">Items Count</th>
                  <th className="py-2.5 px-3">Payment Mode</th>
                  <th className="py-2.5 px-3">Subtotal</th>
                  <th className="py-2.5 px-3">Discount</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posTransactions
                  .filter((t) => t.sellerId === currentShop.id)
                  .map((txn) => (
                    <tr key={txn.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-800">{txn.receiptNumber}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{txn.cashierName}</td>
                      <td className="py-2.5 px-3 font-medium">{txn.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {txn.paymentMode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">${txn.subtotal.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-emerald-600 font-semibold">-${txn.discountAmount.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                        ${txn.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => setLatestPOSReceipt(txn)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-bold text-[11px]"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Main POS High-Speed Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* Left Column: Barcode Scanner & Touch Item Grid (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Barcode Quick Entry Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan / Type Barcode or Product Name & press ENTER..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-blue-600 focus:bg-white rounded-lg text-sm font-mono focus:outline-none transition-all"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomItemModal(true)}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 shrink-0"
                  title="Add custom / non-catalog loose item"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Loose Item</span>
                </button>
              </form>

              {/* Preset quick barcode test chips */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500 pb-1">
                <span className="font-semibold text-slate-700 shrink-0">Quick Scan Barcode:</span>
                {storeInventoryItems.slice(0, 4).map(({ product }) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setBarcodeInput(product.barcode);
                      const match = storeInventoryItems.find((i) => i.product.id === product.id);
                      if (match) addToPOSCart(match.inventory, match.product);
                    }}
                    className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded font-mono font-bold whitespace-nowrap"
                  >
                    {product.name.split(' ')[0]} ({product.barcode.slice(-4)})
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Touch Item Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
              {/* Category Pills & Search */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
                  {['All', 'Beverages', 'Dairy & Bakery', 'Snacks & Munchies', 'Groceries & Staples'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[#0f2b5c] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="w-36 shrink-0 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search SKU..."
                    className="w-full pl-7 pr-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Touch Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                {filteredCatalog.map(({ inventory, product }) => {
                  const inCart = posCart.find((c) => c.id === inventory.id);
                  return (
                    <button
                      key={inventory.id}
                      onClick={() => addToPOSCart(inventory, product)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                        inCart
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg p-1 shrink-0 border border-slate-100">
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                        </div>
                        {inCart && (
                          <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[11px] font-black flex items-center justify-center">
                            {inCart.quantity}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 w-full">
                        <div className="text-[10px] text-slate-500 font-bold uppercase truncate">{product.brand}</div>
                        <div className="text-xs font-bold text-slate-900 truncate">{product.name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-black text-[#0f2b5c]">${inventory.price.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{inventory.stockQuantity} in stock</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: POS Cart, Discounts, Tender & Billing Actions (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-md border border-slate-300 p-3 sm:p-4 flex flex-col justify-between min-h-[580px]">
            {/* Header: Register status & Clear button */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-blue-700" />
                    Current Walk-In Bill
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    Cashier: <strong className="text-slate-800">{currentUser.name}</strong>
                  </div>
                </div>
                {posCart.length > 0 && (
                  <button
                    onClick={clearPOSCart}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Bill
                  </button>
                )}
              </div>

              {/* POS Cart Items Table */}
              <div className="mt-2 max-h-[220px] overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {posCart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Cart is empty. Scan barcodes or tap items to build bill.
                  </div>
                ) : (
                  posCart.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                      <div className="flex-1 truncate">
                        <div className="font-bold text-slate-900 truncate">{item.productName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ${item.price.toFixed(2)} / {item.unit}
                        </div>
                      </div>

                      {/* Touch Increment / Decrement Stepper */}
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => updatePOSQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center shadow-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updatePOSQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right font-black text-slate-900 w-16">
                        ${item.subtotal.toFixed(2)}
                      </div>

                      <button
                        onClick={() => removePOSItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Calculations & Payment Pad */}
            <div className="mt-3 pt-3 border-t-2 border-slate-200 space-y-3">
              {/* Discount / Coupon Bar */}
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-blue-700" /> Apply Discount:
                </span>
                <div className="flex items-center gap-1">
                  <select
                    value={posDiscountType}
                    onChange={(e) => setPosDiscountType(e.target.value as any)}
                    className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-semibold focus:outline-none"
                  >
                    <option value="percentage">% Percent</option>
                    <option value="flat">$ Flat</option>
                  </select>
                  <input
                    type="number"
                    value={posDiscountValue || ''}
                    onChange={(e) => setPosDiscountValue(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-right focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtotal & Tax Breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({posCart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-bold text-slate-800">${posSubtotal.toFixed(2)}</span>
                </div>
                {posDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Store Discount</span>
                    <span>-${posDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Sales Tax (5% GST)</span>
                  <span>${posTaxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                  <span className="text-sm font-black text-slate-900">GRAND TOTAL</span>
                  <span className="text-2xl font-black text-[#0f2b5c]">${posGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1">Select Tender Mode:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'cash', label: 'Cash', icon: DollarSign },
                    { id: 'card', label: 'Card/POS', icon: CreditCard },
                    { id: 'upi', label: 'UPI / QR', icon: QrCode },
                    { id: 'split', label: 'Split', icon: Layers },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMode(id as any)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                        paymentMode === id
                          ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Tender Presets & Change Calculator */}
              {paymentMode === 'cash' && (
                <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-950">Cash Received ($):</span>
                    <input
                      type="number"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      placeholder={posGrandTotal.toFixed(2)}
                      className="w-24 bg-white border border-amber-300 rounded px-2 py-1 text-sm font-black text-right focus:outline-none"
                    />
                  </div>

                  {/* Preset quick cash chips */}
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {cashPresets.map((val, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCashTendered(val)}
                        className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] shrink-0"
                      >
                        ${val.toFixed(2)}
                      </button>
                    ))}
                  </div>

                  {cashTendered >= posGrandTotal && (
                    <div className="flex items-center justify-between font-black text-xs text-emerald-800 pt-1 border-t border-amber-200">
                      <span>Change Due to Customer:</span>
                      <span className="text-sm font-black text-emerald-700">${changeDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* High-Speed Bill & Print Button */}
              <button
                onClick={handlePrintAndBill}
                disabled={posCart.length === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
              >
                <Printer className="w-5 h-5" />
                <span>COMPLETE SALE & PRINT THERMAL RECEIPT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loose / Custom Item Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="font-black text-base text-slate-900 mb-3">Add Custom / Loose Item</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Description / Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Fresh Bananas 1 Dozen, Loose Rice"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowCustomItemModal(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!customName) return;
                  addCustomItemToPOS(customName, Number(customPrice) || 1, Number(customQty) || 1);
                  setShowCustomItemModal(false);
                  setCustomName('');
                }}
                className="flex-1 py-2 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg"
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Receipt Modal View (Thermal Print Style) */}
      {latestPOSReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Sale Completed!</span>
              </div>
              <button
                onClick={() => setLatestPOSReceipt(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close (ESC)
              </button>
            </div>

            {/* Thermal Slip Styled Container */}
            <div className="p-6 bg-[#fffdfa] font-mono text-xs text-slate-800 space-y-3 border-b-4 border-dashed border-slate-300">
              <div className="text-center space-y-0.5">
                <div className="font-black text-sm uppercase">{latestPOSReceipt.shopName}</div>
                <div className="text-[10px] text-slate-500">{currentShop.address}</div>
                <div className="text-[10px] text-slate-500">Tel: {currentShop.phone}</div>
                <div className="border-b border-dashed border-slate-400 my-2"></div>
                <div className="font-bold">{latestPOSReceipt.receiptNumber}</div>
                <div className="text-[10px] text-slate-500">
                  {new Date(latestPOSReceipt.timestamp).toLocaleString()} • Cashier: {latestPOSReceipt.cashierName}
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 my-2"></div>

              {/* Items */}
              <div className="space-y-1">
                {latestPOSReceipt.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>
                      {item.productName} (x{item.quantity})
                    </span>
                    <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-400 my-2"></div>

              {/* Math */}
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${latestPOSReceipt.subtotal.toFixed(2)}</span>
                </div>
                {latestPOSReceipt.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-${latestPOSReceipt.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span>${latestPOSReceipt.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-800">
                  <span>GRAND TOTAL:</span>
                  <span>${latestPOSReceipt.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                  <span>Paid via: {latestPOSReceipt.paymentMode.toUpperCase()}</span>
                  {latestPOSReceipt.changeDue !== undefined && (
                    <span>Change: ${latestPOSReceipt.changeDue.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-3">
                ★ Thank you for shopping local! ★<br />
                Retain this receipt for returns within 7 days.
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="p-3 bg-slate-100 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print Thermal Slip
              </button>
              <button
                onClick={() => setLatestPOSReceipt(null)}
                className="px-4 py-2.5 bg-white border border-slate-300 font-bold text-xs rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
