import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Store,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Truck,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ShieldCheck,
  ArrowUpDown,
  Phone,
  Info,
  ChevronRight,
} from 'lucide-react';
import { formatDistance } from '../utils/geo';
import { SellerInventory } from '../types';

export const ProductDetailModal: React.FC = () => {
  const {
    masterProducts,
    selectedProductId,
    setSelectedProductId,
    getSellersForProduct,
    addToCart,
    cart,
    updateCartQuantity,
    setActiveTab,
  } = useApp();

  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'deliveryTime' | 'rating'>('price');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [justAddedSellerId, setJustAddedSellerId] = useState<string | null>(null);

  const product = useMemo(() => {
    return masterProducts.find((p) => p.id === selectedProductId) || null;
  }, [masterProducts, selectedProductId]);

  const sellersList = useMemo(() => {
    if (!product) return [];
    const list = getSellersForProduct(product.id);
    return [...list].sort((a, b) => {
      if (sortBy === 'price') return a.inventory.price - b.inventory.price;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'deliveryTime') return a.inventory.deliveryTimeMin - b.inventory.deliveryTimeMin;
      if (sortBy === 'rating') return b.inventory.sellerRating - a.inventory.sellerRating;
      return 0;
    });
  }, [product, getSellersForProduct, sortBy]);

  if (!product) return null;

  const lowestPrice = sellersList.length > 0 ? Math.min(...sellersList.map((s) => s.inventory.price)) : product.mrp;
  const closestSeller = sellersList.length > 0 ? sellersList[0] : null;

  const handleAdd = (inv: SellerInventory) => {
    addToCart(inv, product, 1);
    setJustAddedSellerId(inv.sellerId);
    setTimeout(() => setJustAddedSellerId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#0f2b5c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-800 text-blue-200">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Master Product Detail</span>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate max-w-xs sm:max-w-md">
                {product.name}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedProductId(null)}
            className="p-1.5 rounded-full hover:bg-blue-800 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Top Section: Images & Master Catalog Details */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left: Product Images */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-square bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center relative overflow-hidden">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-900/90 text-white text-[10px] font-bold rounded">
                  Barcode: {product.barcode}
                </span>
              </div>

              {/* Thumbnails if multiple images */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 mt-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg border-2 p-1 overflow-hidden transition-all ${
                        selectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-70'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Master Metadata & Overview */}
            <div className="sm:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-blue-700 uppercase">{product.brand}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">{product.unit}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">{product.category}</span>
                </div>

                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-400 font-normal">({product.totalRatingsCount})</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Stocked at <strong className="text-[#0f2b5c]">{sellersList.length} nearby shops</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Nutrition Highlights */}
                {product.nutritionHighlights && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.nutritionHighlights.map((nh, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded">
                        ✓ {nh}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Master Best Price Badge */}
              <div className="mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">Lowest Nearby Price</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-[#0f2b5c]">${lowestPrice.toFixed(2)}</span>
                    {product.mrp > lowestPrice && (
                      <span className="text-xs text-slate-400 line-through">${product.mrp.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-md">
                    Save up to ${(product.mrp - lowestPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            {/* View All Sellers Section Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-blue-700" />
                  Available at Nearby Sellers ({sellersList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Select your preferred shopkeeper based on lowest price, fast delivery, or proximity.
                </p>
              </div>

              {/* Sort selector for sellers */}
              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-700" />
                <span className="font-semibold text-[11px]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="price">Lowest Price</option>
                  <option value="distance">Nearest Distance</option>
                  <option value="deliveryTime">Fastest Delivery</option>
                  <option value="rating">Seller Rating</option>
                </select>
              </div>
            </div>

            {/* Sellers List Accordion / Cards */}
            {sellersList.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl text-center border border-dashed border-slate-300 text-xs text-slate-500">
                No nearby sellers currently have this item in stock.
              </div>
            ) : (
              <div className="space-y-3">
                {sellersList.map(({ inventory, seller, distanceKm }) => {
                  const cartItem = cart.find((c) => c.inventoryId === inventory.id);
                  const isLowestPrice = inventory.price === lowestPrice;
                  const isNearest = closestSeller?.inventory.id === inventory.id;
                  const discountPercent = Math.round(((inventory.mrp - inventory.price) / inventory.mrp) * 100);

                  return (
                    <div
                      key={inventory.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        cartItem
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500'
                          : isLowestPrice
                          ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-500'
                          : 'border-slate-200 bg-white hover:border-blue-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {/* Seller Metadata */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              {seller.shopName}
                            </h4>
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {inventory.sellerRating}
                            </span>
                            {isLowestPrice && (
                              <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded">
                                Lowest Price
                              </span>
                            )}
                            {isNearest && (
                              <span className="px-1.5 py-0.5 bg-blue-700 text-white text-[10px] font-bold rounded">
                                Nearest Store
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {formatDistance(distanceKm)} away
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {inventory.deliveryTimeMin} mins delivery
                            </span>
                            <span>•</span>
                            <span className="text-[11px] text-slate-500">
                              Fee: ${inventory.deliveryFee.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-1 truncate max-w-sm sm:max-w-md">
                            Pickup: {inventory.pickupLocation.address}
                          </div>

                          <div className="mt-1.5">
                            {inventory.stockQuantity < 5 ? (
                              <span className="text-[11px] font-bold text-red-600">
                                ⚠ Only {inventory.stockQuantity} items left in stock!
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-700">
                                ✓ In Stock ({inventory.stockQuantity} available)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Action Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-3">
                          <div className="text-left sm:text-right">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg sm:text-xl font-black text-[#0f2b5c]">
                                ${inventory.price.toFixed(2)}
                              </span>
                              {inventory.mrp > inventory.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  ${inventory.mrp.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {discountPercent > 0 && (
                              <div className="text-[10px] font-bold text-emerald-600">
                                {discountPercent}% Instant Store Discount
                              </div>
                            )}
                          </div>

                          {/* Cart Button or Counter */}
                          {cartItem ? (
                            <div className="flex items-center gap-2 bg-[#0f2b5c] text-white rounded-lg p-1">
                              <button
                                onClick={() => updateCartQuantity(inventory.id, cartItem.quantity - 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-blue-800"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold px-2">{cartItem.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(inventory.id, cartItem.quantity + 1)}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-blue-800"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAdd(inventory)}
                              disabled={inventory.stockQuantity <= 0}
                              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                                justAddedSellerId === inventory.sellerId
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0f2b5c] hover:bg-blue-900 text-white'
                              }`}
                            >
                              {justAddedSellerId === inventory.sellerId ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" /> Add from Shop
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Sticky Footer with Cart Summary if Items exist */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            <strong>Hyperlocal Guarantee:</strong> Verified local stock & direct store dispatch.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProductId(null)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Back to Catalog
            </button>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  setSelectedProductId(null);
                  setActiveTab('orders');
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <span>View Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
