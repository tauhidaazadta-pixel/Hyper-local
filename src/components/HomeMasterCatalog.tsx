import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  SlidersHorizontal,
  Store,
  Sparkles,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Tag,
  Zap,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react';
import { formatDistance } from '../utils/geo';
import { MasterProduct } from '../types';

export const HomeMasterCatalog: React.FC = () => {
  const {
    masterProducts,
    getSellersForProduct,
    setSelectedProductId,
    setIsAIAssistantOpen,
    addToCart,
    cart,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'lowest_price' | 'nearest' | 'rating'>('recommended');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(masterProducts.map((p) => p.category)));
    return ['All', ...cats];
  }, [masterProducts]);

  // Filtered & Sorted Master Products
  const processedProducts = useMemo(() => {
    return masterProducts
      .map((product) => {
        const sellersList = getSellersForProduct(product.id);
        const nearbySellers = sellersList.filter((s) => s.distanceKm <= maxDistanceKm);
        const lowestPrice = sellersList.length > 0 ? Math.min(...sellersList.map((s) => s.inventory.price)) : product.mrp;
        const highestDiscount = sellersList.length > 0
          ? Math.max(...sellersList.map((s) => Math.round(((s.inventory.mrp - s.inventory.price) / s.inventory.mrp) * 100)))
          : 0;
        const closestSeller = sellersList.length > 0 ? sellersList[0] : null;
        const totalStockAcrossSellers = sellersList.reduce((sum, s) => sum + s.inventory.stockQuantity, 0);

        return {
          product,
          sellersList,
          nearbySellers,
          lowestPrice,
          highestDiscount,
          closestSeller,
          totalStockAcrossSellers,
        };
      })
      .filter(({ product, nearbySellers }) => {
        const matchesCat = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          product.barcode.includes(searchQuery);

        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'lowest_price') return a.lowestPrice - b.lowestPrice;
        if (sortBy === 'nearest') {
          const distA = a.closestSeller ? a.closestSeller.distanceKm : 999;
          const distB = b.closestSeller ? b.closestSeller.distanceKm : 999;
          return distA - distB;
        }
        if (sortBy === 'rating') return b.product.rating - a.product.rating;
        return b.sellersList.length - a.sellersList.length; // Recommended: most nearby sellers first
      });
  }, [masterProducts, getSellersForProduct, searchQuery, selectedCategory, sortBy, maxDistanceKm]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Hyperlocal Concept Banner */}
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#0f2b5c] via-blue-900 to-[#1e3a8a] text-white p-4 sm:p-5 shadow-lg border border-blue-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[11px] font-bold border border-blue-400/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Hyperlocal 15-Min Delivery
            </span>
            <span className="text-xs text-blue-300">Single Master Product • Compare Sellers</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Compare prices & delivery times across nearby neighbourhood shops
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Tap any master product card to inspect all stocking sellers, check real-time store inventory, and choose your preferred shopkeeper.
          </p>
        </div>

        <button
          onClick={() => setIsAIAssistantOpen(true)}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>Ask AI For Best Local Deals</span>
        </button>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search master catalog (e.g. 'Pepsi', 'Milk', 'Nutella', barcode '8901491101831')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-slate-50 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort & Distance Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-700 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-700" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value="recommended">Best Match</option>
                <option value="lowest_price">Lowest Price</option>
                <option value="nearest">Nearest Store</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-700 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span className="font-medium">Radius:</span>
              <select
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="bg-transparent font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value={3}>Within 3 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>All SF Bay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto mt-3 pt-2 border-t border-slate-100 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0f2b5c] text-white shadow-sm ring-1 ring-blue-800'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Results Count & Status */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-xs sm:text-sm font-semibold text-slate-700">
          Showing <span className="text-blue-700 font-bold">{processedProducts.length}</span> Master Products
          {selectedCategory !== 'All' && <span> in <span className="text-slate-900 font-bold">{selectedCategory}</span></span>}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Store className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-time local stock aggregated</span>
        </div>
      </div>

      {/* Master Products Grid */}
      {processedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No master products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No items matched your current search filters or category. Try clearing your search or expanding your delivery radius.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setMaxDistanceKm(20);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {processedProducts.map(({ product, sellersList, lowestPrice, highestDiscount, closestSeller, totalStockAcrossSellers }) => {
            const hasStock = totalStockAcrossSellers > 0;
            const isCartActiveForProduct = cart.some((c) => c.productId === product.id);

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden cursor-pointer relative"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Multi-Seller Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 bg-[#0f2b5c]/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1">
                      <Store className="w-2.5 h-2.5 text-amber-300" />
                      {sellersList.length} {sellersList.length === 1 ? 'Seller' : 'Sellers'}
                    </span>
                    {highestDiscount > 0 && (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-md shadow-xs">
                        Up to {highestDiscount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/95 rounded-md shadow-xs border border-slate-200 flex items-center gap-0.5 text-[10px] font-bold text-slate-800">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{product.rating}</span>
                  </div>

                  {/* Stock Indicator */}
                  {!hasStock && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-2.5 py-1 bg-red-600 text-white font-bold text-xs rounded-md">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Metadata & Seller Comparison Section */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-0.5">
                      {product.brand} • {product.unit}
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    {/* Price & Delivery Range */}
                    <div className="flex items-baseline justify-between gap-1">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">Starts from</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-black text-[#0f2b5c]">
                            ${lowestPrice.toFixed(2)}
                          </span>
                          {product.mrp > lowestPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ${product.mrp.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {closestSeller && (
                        <div className="text-right">
                          <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {closestSeller.inventory.deliveryTimeMin} min
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {formatDistance(closestSeller.distanceKm)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* View All Sellers Button */}
                    <div className="mt-2.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductId(product.id);
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-[#0f2b5c] hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all group-hover:bg-blue-700"
                      >
                        <span>View All Sellers</span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
