
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Account from './pages/Account';
import { Product, CartItem, Order, User, ChatMessage, Language } from './types';
import { PRODUCTS } from './constants';
import { translations, TranslationKeys } from './translations';

// NEW UPDATED CLOUD BACKEND URL (FINAL SOURCE OF TRUTH)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbx-dMW3yr5QO3iuwfFr18h2DDdVehtM4dpyLbxolTu6gaZSVFq-KN037rFFZBT77phpPw/exec";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [language, setLanguage] = useState<Language>('EN');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  // Cloud Data States
  const [cloudRecords, setCloudRecords] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const t = (key: TranslationKeys) => translations[language][key] || key;

  // Upload Function: POST to Cloud URL
  const syncToCloud = async (gmail: string, password: string, statut: string = 'Pending') => {
    const payload = {
      "gmail": gmail.toLowerCase().trim(),
      "password": password,
      "statut": statut
    };
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', // Essential for Google Apps Script redirects
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Force refresh to pull the new data for the current user and others
      await fetchGlobalData();
    } catch (e) { 
      console.error("Cloud Upload Protocol Failed", e); 
    }
  };

  // Download Function: GET from Cloud URL
  const fetchGlobalData = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCloudRecords(data);
      }
    } catch (e) {
      console.error("Cloud Retrieval Error - Synchronicity Compromised", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // ALERT: localStorage usage has been completely removed to comply with multi-IP sync requirements.
  }, []);

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      return [...prev, { ...product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="font-gaming text-blue-700 text-[10px] animate-pulse tracking-[0.4em] uppercase font-black">Connecting to Cloud HQ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 selection:bg-blue-200">
      <Navbar 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)} 
        activePage={activePage} 
        setActivePage={setActivePage} 
        user={currentUser} 
        language={language}
        setLanguage={setLanguage}
        t={t}
      />
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={(id) => setCart(prev => prev.filter(item => item.id !== id))} 
        onUpdateQuantity={(id, delta) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))} 
        onCheckout={() => { setIsCartOpen(false); setActivePage('checkout'); }} 
        t={t}
      />
      
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] bg-white overflow-y-auto animate-fade-in flex flex-col">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between z-20">
            <button onClick={() => { setSelectedProduct(null); setDetailQuantity(1); }} className="p-2 text-slate-500 hover:text-blue-700">
              <i className="fas fa-chevron-left text-lg"></i>
            </button>
            <div className="flex-1 px-4 truncate">
              <p className="text-[10px] text-slate-400 font-medium">Home / {selectedProduct.category}</p>
            </div>
          </div>
          <div className="flex-1 pb-32">
             <div className="max-w-3xl mx-auto p-4 space-y-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-48 aspect-square bg-slate-50 rounded-lg overflow-hidden border">
                    <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4">{selectedProduct.name}</h2>
                    <p className="text-slate-500 text-sm mb-6">{selectedProduct.description}</p>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-[10px] text-blue-700 font-bold uppercase mb-2">Specifications</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="text-slate-500">Stock: {selectedProduct.stock}</div>
                        <div className="text-slate-500">Status: Instant Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
          <div className="sticky bottom-0 bg-white border-t p-6">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Total Price</p>
                <p className="text-2xl font-black text-blue-700">{(selectedProduct.price * 0.1 * detailQuantity).toFixed(2)} DH</p>
              </div>
              <button 
                onClick={() => { handleAddToCart(selectedProduct, detailQuantity); setSelectedProduct(null); }}
                className="bg-blue-700 text-white px-10 py-4 rounded-xl font-bold"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 lg:pb-0 min-h-screen">
        {activePage === 'home' && <Home onAddToCart={handleAddToCart} onViewDetails={setSelectedProduct} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} setActivePage={setActivePage} t={t} />}
        {activePage === 'shop' && <Shop products={PRODUCTS} onAddToCart={handleAddToCart} onViewDetails={setSelectedProduct} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} t={t} />}
        {activePage === 'contact' && <Contact onSendTicket={(tk) => { /* Contact logic */ }} t={t} />}
        {activePage === 'auth' && <Auth onLogin={handleLogin} onBack={() => setActivePage('home')} cloudRecords={cloudRecords} onSync={syncToCloud} t={t} />}
        {activePage === 'account' && (currentUser ? <Account user={currentUser} orders={[]} messages={[]} onSendMessage={()=>{}} onLogout={handleLogout} onRefresh={fetchGlobalData} isRefreshing={loading} t={t} /> : <Auth onLogin={handleLogin} onBack={() => setActivePage('home')} cloudRecords={cloudRecords} onSync={syncToCloud} t={t} />)}
        {activePage === 'admin' && (
          <Admin 
            cloudRecords={cloudRecords} 
            onRefresh={fetchGlobalData}
            cloudUrl={SHEET_URL}
            t={t}
          />
        )}
      </main>
      <Footer onSecretEntrance={() => setActivePage('admin')} t={t} />
    </div>
  );
};

export default App;
