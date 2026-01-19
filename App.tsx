
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
import { Product, CartItem, User, Language } from './types';
import { PRODUCTS } from './constants';
import { translations, TranslationKeys } from './translations';

// YOUR NEW DEPLOYED CLOUD URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycbx0xzib7CLVxGIpCOlmJLKb_ZkaCgPBydYrytRCKvmps3VujbTqB-Xj1D0mUB0G6NlXbg/exec";

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home');
  const [language, setLanguage] = useState<Language>('EN');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Cloud Database State
  const [cloudRecords, setCloudRecords] = useState<any[]>([]);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const t = (key: TranslationKeys) => translations[language][key] || key;

  // EXPORT PROTOCOL: Fetches all users for verification
  const fetchCloudUsers = async () => {
    setIsCloudSyncing(true);
    try {
      const response = await fetch(SHEET_URL);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCloudRecords(data);
        return data;
      }
      return [];
    } catch (e) {
      console.error("Cloud Fetch Error:", e);
      return [];
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // UPLOAD PROTOCOL: Saves a new user to the cloud
  const registerCloudUser = async (email: string, pass: string) => {
    const payload = {
      gmail: email.toLowerCase().trim(),
      password: pass,
      statut: "active"
    };
    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Refresh local cache
      await fetchCloudUsers();
    } catch (e) {
      console.error("Cloud Register Error:", e);
    }
  };

  useEffect(() => {
    fetchCloudUsers();
  }, []);

  const handleAddToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      return [...prev, { ...product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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

      <main className="flex-grow pt-20">
        {activePage === 'home' && <Home onAddToCart={handleAddToCart} onViewDetails={()=>{}} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} setActivePage={setActivePage} t={t} />}
        {activePage === 'shop' && <Shop products={PRODUCTS} onAddToCart={handleAddToCart} onViewDetails={()=>{}} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} t={t} />}
        {activePage === 'contact' && <Contact onSendTicket={()=>{}} t={t} />}
        
        {activePage === 'auth' && (
          <Auth 
            onLogin={(user) => { setCurrentUser(user); setActivePage('home'); }} 
            onBack={() => setActivePage('home')} 
            onFetchLatest={fetchCloudUsers}
            onRegisterCloud={registerCloudUser}
            t={t} 
          />
        )}

        {activePage === 'account' && currentUser && (
          <Account 
            user={currentUser} 
            orders={[]} 
            messages={[]} 
            onSendMessage={()=>{}} 
            onLogout={() => { setCurrentUser(null); setActivePage('home'); }} 
            onRefresh={fetchCloudUsers} 
            isRefreshing={isCloudSyncing} 
            t={t} 
          />
        )}

        {activePage === 'admin' && (
          <Admin cloudRecords={cloudRecords} onRefresh={fetchCloudUsers} cloudUrl={SHEET_URL} t={t} />
        )}

        {activePage === 'checkout' && (
          <Checkout 
            cart={cart} 
            promoCodes={[]} 
            currentUser={currentUser} 
            onComplete={() => { setActivePage('account'); setCart([]); }} 
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
