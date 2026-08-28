/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeMasterCatalog } from './components/HomeMasterCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { POSBillingScreen } from './components/POSBillingScreen';
import { CartCheckoutModal } from './components/CartCheckoutModal';
import { RiderDashboardAndMap } from './components/RiderDashboardAndMap';
import { AdminPortal } from './components/AdminPortal';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AuthModal } from './components/AuthModal';
import {
  Store,
  Receipt,
  Bike,
  Code2,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedProductId,
    isAIAssistantOpen,
    isAuthModalOpen,
    cartTotalCount,
    setIsAIAssistantOpen,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-16 sm:pb-6">
      {/* Top Main Navigation Header */}
      <Navbar />

      {/* Main Content Area Based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'catalog' && <HomeMasterCatalog />}
        {activeTab === 'pos' && <POSBillingScreen />}
        {activeTab === 'orders' && <CartCheckoutModal />}
        {activeTab === 'rider_dashboard' && <RiderDashboardAndMap />}
        {activeTab === 'admin' && <AdminPortal />}
        {activeTab === 'flutter_code' && <FlutterCodeViewer />}
      </main>

      {/* Product Detail Modal with "All Sellers" list */}
      {selectedProductId && <ProductDetailModal />}

      {/* Gemini AI Shopping Assistant Modal */}
      {isAIAssistantOpen && <AIAssistantModal />}

      {/* Social / Email Login & Persona Modal */}
      {isAuthModalOpen && <AuthModal />}

      {/* Mobile Bottom Navigation Bar (Deep Blue Theme) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f2b5c] text-white border-t border-blue-900/60 shadow-2xl px-2 py-1 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'catalog' ? 'text-amber-400 font-black' : 'text-blue-200'
          }`}
        >
          <Store className="w-4 h-4 mb-0.5" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'pos' ? 'text-amber-400 font-black' : 'text-amber-300'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span>POS Bill</span>
        </button>

        <button
          onClick={() => setIsAIAssistantOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full w-11 h-11 shadow-lg border-2 border-white"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-[8px] font-black leading-none mt-0.5">AI</span>
        </button>

        <button
          onClick={() => setActiveTab('rider_dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'rider_dashboard' ? 'text-amber-400 font-black' : 'text-blue-200'
          }`}
        >
          <Bike className="w-4 h-4 mb-0.5" />
          <span>Rider</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'orders' ? 'text-amber-400 font-black' : 'text-blue-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          <span>Cart</span>
          {cartTotalCount > 0 && (
            <span className="absolute top-0 right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {cartTotalCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('flutter_code')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'flutter_code' ? 'text-amber-400 font-black' : 'text-blue-200'
          }`}
        >
          <Code2 className="w-4 h-4 mb-0.5" />
          <span>Code</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
