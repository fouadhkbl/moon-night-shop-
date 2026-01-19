
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

// FINAL CLOUD BACKEND URL - NO LOCALSTORAGE ALLOWED
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

  // Cloud Database States
  const [cloudRecords, setCloudRecords] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const t = (key: TranslationKeys) => translations[language][key] || key;

  // Real-time Cloud Fetch (GET) - Synchronizes data across all IPs
  const fetchGlobalData = async () => {
    try {
      const response = await fetch(SHEET_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCloudRecords(data);
      }
    } catch (e) {
      console.error("Critical: Cloud Retrieval Failure", e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Cloud Upload (POST) - Register new identities
  const syncToCloud = async (gmail: string, password: string, statut: string = 'Pending') => {
    const payload = {
      "gmail": gmail.toLowerCase().trim(),
      "password": password,
      "statut": statut
    };
    try {
      // mode: 'no-cors' is used to handle Google Apps Script redirects silently
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Immediately refresh the global records so the new user exists for the login flow
      await fetchGlobalData();
    } catch (e) { 
      console.error("Critical: Cloud Upload Failure", e); 
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // Strict compliance: No localStorage or cookie initialization here.
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
           <p className="font-gaming text-blue-700 text-[10px] animate-pulse tracking-[0.4em] uppercase font-black">Syncing Cloud Database...</p>
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

      <main className="pb-20 lg:pb-0 min-h-screen">
        {activePage === 'home' && <Home onAddToCart={handleAddToCart} onViewDetails={setSelectedProduct} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} setActivePage={setActivePage} t={t} />}
        {activePage === 'shop' && <Shop products={PRODUCTS} onAddToCart={handleAddToCart} onViewDetails={setSelectedProduct} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} t={t} />}
        {activePage === 'contact' && <Contact onSendTicket={(tk) => {}} t={t} />}
        {activePage === 'auth' && (
          <Auth 
            onLogin={handleLogin} 
            onBack={() => setActivePage('home')} 
            cloudRecords={cloudRecords} 
            onSync={syncToCloud} 
            t={t} 
          />
        )}
        {activePage === 'account' && (
          currentUser ? 
          <Account user={currentUser} orders={[]} messages={[]} onSendMessage={()=>{}} onLogout={handleLogout} onRefresh={fetchGlobalData} isRefreshing={loading} t={t} /> 
          : <Auth onLogin={handleLogin} onBack={() => setActivePage('home')} cloudRecords={cloudRecords} onSync={syncToCloud} t={t} />
        )}
        {activePage === 'admin' && (
          <Admin 
            cloudRecords={cloudRecords} 
            onRefresh={fetchGlobalData}
            cloudUrl={SHEET_URL}
            t={t}
          />
        )}
        {activePage === 'checkout' && (
          <Checkout 
            cart={cart} 
            promoCodes={[]} 
            currentUser={currentUser} 
            onComplete={() => {setActivePage('account'); setCart([]);}} 
            onCancel={() => setActivePage('home')}
            setActivePage={setActivePage}
            t={t}
          />
        )}
      </main>
      
      <Footer onSecretEntrance={() => setActivePage('admin')} t={t} />
    </div>
  );
};

export default App;
