import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Plus,
  Store,
  Bike,
  Package,
  CheckCircle2,
  AlertCircle,
  Tag,
  Barcode,
  DollarSign,
  TrendingUp,
  Layers,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    masterProducts,
    sellers,
    deliveryPartners,
    orders,
    posTransactions,
    addMasterProduct,
    addOrLinkSellerInventory,
    approveSeller,
    approveDeliveryPartner,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'link_inventory' | 'partners'>('catalog');

  // New Master Product Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Beverages');
  const [mrp, setMrp] = useState('2.50');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('500ml');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Link Inventory Form State
  const [selectedSellerId, setSelectedSellerId] = useState(sellers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(masterProducts[0]?.id || '');
  const [linkPrice, setLinkPrice] = useState('2.20');
  const [linkStock, setLinkStock] = useState('50');

  const handleCreateMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brand || !mrp) return;

    addMasterProduct({
      name,
      brand,
      category,
      description: description || `Original ${name} from ${brand}. Guaranteed local fresh stock.`,
      images: [imageUrl || 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80'],
      barcode: barcode || `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      unit: unit || '1 Unit',
      mrp: Number(mrp) || 2.5,
      rating: 4.8,
      totalRatingsCount: 1,
      tags: [category.toLowerCase(), brand.toLowerCase()],
      nutritionHighlights: ['Fresh Stock', 'Quality Assured'],
    });

    setName('');
    setBrand('');
    setBarcode('');
    setDescription('');
    setImageUrl('');
    alert('Master product added to global catalog!');
  };

  const handleLinkInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerId || !selectedProductId) return;

    addOrLinkSellerInventory(
      selectedSellerId,
      selectedProductId,
      Number(linkPrice) || 2.0,
      Number(linkStock) || 20
    );

    alert('Seller inventory updated successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="bg-[#0a1e3f] text-white rounded-2xl p-4 sm:p-5 mb-5 border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black">Platform Admin & Master SKU Console</h1>
            <p className="text-xs text-blue-200">
              Manage single master products, link multi-seller inventory, and review platform partners.
            </p>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="flex items-center gap-3 text-xs bg-blue-950/90 px-3 py-2 rounded-xl border border-blue-700">
          <div>
            <span className="text-slate-400 block text-[10px]">Master SKUs</span>
            <span className="font-black text-amber-300 text-sm">{masterProducts.length}</span>
          </div>
          <div className="w-px h-6 bg-blue-800"></div>
          <div>
            <span className="text-slate-400 block text-[10px]">Sellers</span>
            <span className="font-black text-white text-sm">{sellers.length}</span>
          </div>
          <div className="w-px h-6 bg-blue-800"></div>
          <div>
            <span className="text-slate-400 block text-[10px]">Riders</span>
            <span className="font-black text-emerald-400 text-sm">{deliveryPartners.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 mb-5">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'catalog' ? 'bg-[#0f2b5c] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Add Global Master Product</span>
        </button>
        <button
          onClick={() => setActiveTab('link_inventory')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'link_inventory' ? 'bg-[#0f2b5c] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Link Seller Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            activeTab === 'partners' ? 'bg-[#0f2b5c] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Sellers & Riders ({sellers.length + deliveryPartners.length})</span>
        </button>
      </div>

      {/* Tab 1: Create Global Master Product */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-700" />
              Create Master Product (Stored ONCE Globally)
            </h2>
            <form onSubmit={handleCreateMaster} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Red Bull Energy Drink 250ml"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Red Bull"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="Beverages">Beverages</option>
                    <option value="Dairy & Bakery">Dairy & Bakery</option>
                    <option value="Snacks & Munchies">Snacks & Munchies</option>
                    <option value="Breakfast & Spreads">Breakfast & Spreads</option>
                    <option value="Groceries & Staples">Groceries & Staples</option>
                    <option value="Household">Household</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Master MRP ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit / Pack</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="250ml / 1kg"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="9002490100070"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Official master description..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                + Publish Master Product to Catalog
              </button>
            </form>
          </div>

          <div className="md:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 mb-3">Existing Master Products ({masterProducts.length})</h2>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {masterProducts.map((prod) => (
                <div key={prod.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={prod.images[0]} alt={prod.name} className="w-9 h-9 object-contain rounded bg-white p-1 border border-slate-100" />
                    <div>
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {prod.brand} • MRP: ${prod.mrp.toFixed(2)} • {prod.barcode}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                    {prod.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Link Seller Inventory */}
      {activeTab === 'link_inventory' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-sm font-black text-slate-900 mb-1">Link Master SKU to Seller Inventory</h2>
          <p className="text-xs text-slate-500 mb-4">
            Allows a specific shopkeeper to set their customized selling price and in-store stock quantity for a master SKU.
          </p>

          <form onSubmit={handleLinkInventory} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Seller Store</label>
              <select
                value={selectedSellerId}
                onChange={(e) => setSelectedSellerId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold"
              >
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shopName} ({s.address.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Master Product SKU</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-bold"
              >
                {masterProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (MRP: ${p.mrp.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Seller's Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={linkPrice}
                  onChange={(e) => setLinkPrice(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stock Quantity Available</label>
                <input
                  type="number"
                  required
                  value={linkStock}
                  onChange={(e) => setLinkStock(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs rounded-lg"
            >
              Save Seller Inventory Mapping
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Sellers & Delivery Partners Review */}
      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sellers */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-blue-700" />
              Verified Local Sellers ({sellers.length})
            </h3>
            <div className="space-y-2.5">
              {sellers.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{s.shopName}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{s.address}</div>
                  <div className="text-[11px] text-slate-500">Contact: {s.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Riders */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <h3 className="font-black text-sm text-slate-900 mb-3 flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-emerald-600" />
              Delivery Partners ({deliveryPartners.length})
            </h3>
            <div className="space-y-2.5">
              {deliveryPartners.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{r.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.isOnline ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {r.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Vehicle: {r.vehicleNumber} ({r.vehicleType.toUpperCase()})
                  </div>
                  <div className="text-[11px] text-slate-500">Phone: {r.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
