import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  ShoppingBag,
  Bike,
  ShieldCheck,
  Sparkles,
  MapPin,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Code2,
  Receipt,
  User,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    activeTab,
    setActiveTab,
    cartTotalCount,
    setIsAuthModalOpen,
    setIsAIAssistantOpen,
    userAddress,
    logout,
    sellers,
    activePOSShopId,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const activeShop = sellers.find((s) => s.id === activePOSShopId);

  return (
    <header className="sticky top-0 z-40 bg-[#0f2b5c] text-white shadow-md border-b border-blue-900/50">
      {/* Top micro-bar: Location & Quick Role Persona */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs border-b border-blue-800/40 bg-[#0a1e3f]">
        <div className="flex items-center gap-1.5 truncate max-w-[60%] sm:max-w-[70%] text-blue-200">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 hidden sm:inline">Delivering to:</span>
          <span className="font-semibold text-white truncate">{userAddress}</span>
        </div>

        {/* Role Persona Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-100 border border-blue-700/50 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="capitalize font-semibold text-[11px]">{currentUser.role}:</span>
            <span className="font-medium truncate max-w-[90px] sm:max-w-[120px]">{currentUser.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-blue-300" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-slate-900 text-slate-100 rounded-lg shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Test User / Role
              </div>
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 text-xs hover:bg-blue-900/60 transition-colors ${
                    user.id === currentUser.id ? 'bg-blue-950 font-semibold text-amber-300' : 'text-slate-200'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center text-[10px] uppercase font-bold text-white shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{user.role} {user.sellerShopId ? `• Shop Owner` : ''}</div>
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-blue-300 hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" /> Social Login / Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                HyperLocal
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-500/30 text-blue-200 rounded border border-blue-400/30 uppercase">
                Multi-Seller
              </span>
            </div>
            <p className="text-[10px] text-blue-300 leading-none hidden sm:block">
              Single Master Product • Multiple Nearby Sellers • Standalone POS
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Master Catalog Feed */}
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-[#0f2b5c] shadow-sm'
                : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Master Catalog</span>
          </button>

          {/* Standalone POS Module */}
          <button
            onClick={() => setActiveTab('pos')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pos'
                ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/40'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>POS Mode</span>
            <span className="hidden md:inline text-[10px] px-1 py-0.2 bg-amber-400/30 rounded text-amber-100 font-normal">
              Billing
            </span>
          </button>

          {/* Rider Live Tracking / Dashboard */}
          <button
            onClick={() => setActiveTab('rider_dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rider_dashboard'
                ? 'bg-white text-[#0f2b5c] shadow-sm'
                : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="hidden sm:inline">Rider & Live Map</span>
            <span className="sm:hidden">Rider</span>
          </button>

          {/* Flutter Architecture / Source Code Tab */}
          <button
            onClick={() => setActiveTab('flutter_code')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'flutter_code'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
            }`}
            title="View Full Production Flutter Source Code"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">Flutter Code</span>
          </button>

          {/* Admin Portal (if admin or accessible for demo) */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-[#0f2b5c] shadow-sm'
                : 'text-blue-200 hover:bg-blue-800/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </nav>

        {/* Action Controls: AI Assistant, Cart, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Gemini AI Assistant Button */}
          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Customer Cart Button */}
          <button
            onClick={() => setActiveTab('orders')}
            className="relative flex items-center justify-center p-2 rounded-lg bg-blue-800/70 hover:bg-blue-700 text-white border border-blue-600/40 transition-colors"
            title="View Cart & Orders"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartTotalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
