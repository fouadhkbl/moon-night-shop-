
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Product, CartItem, Order, OrderStatus, SupportTicket, TicketStatus, PromoCode, User, ChatMessage, Language } from './types';
import { PRODUCTS } from './constants';
import { translations, TranslationKeys } from './translations';

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyrNB9GTXgYcMT6KA97xOmTZahp1Ou1yH5wjnXHNoG2UvvreAAWCw7sd19Ipa-HBGBT/exec";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [language, setLanguage] = useState<Language>('EN');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const stateRef = useRef({ cart, wishlist, activePage, allProducts, orders, lastOrderId, tickets, promoCodes, currentUser, messages, allUsers, language });

  useEffect(() => {
    stateRef.current = { cart, wishlist, activePage, allProducts, orders, lastOrderId, tickets, promoCodes, currentUser, messages, allUsers, language };
  }, [cart, wishlist, activePage, allProducts, orders, lastOrderId, tickets, promoCodes, currentUser, messages, allUsers, language]);

  const t = (key: TranslationKeys) => translations[language][key] || key;

  useEffect(() => {
    const initApp = async () => {
      try {
        const sheetUsersPromise = fetch(SHEET_URL).then(r => r.json()).catch(() => []);
        
        const storedProducts = localStorage.getItem('mn_products');
        const storedOrders = localStorage.getItem('mn_orders');
        const storedCart = localStorage.getItem('mn_cart');
        const storedWishlist = localStorage.getItem('mn_wishlist');
        const storedLastOrderId = localStorage.getItem('mn_last_id');
        const storedTickets = localStorage.getItem('mn_tickets');
        const storedPromos = localStorage.getItem('mn_promos');
        const storedUser = localStorage.getItem('mn_user');
        const storedMessages = localStorage.getItem('mn_messages');
        const storedAllUsers = localStorage.getItem('mn_all_users');
        const storedLang = localStorage.getItem('mn_lang') as Language;

        const sheetUsers = await sheetUsersPromise;
        if (sheetUsers && Array.isArray(sheetUsers) && sheetUsers.length > 0) {
          const mapped = sheetUsers.map((u: any, idx: number) => ({
            id: u['email'] || u['gmail'] || `u-${idx}`,
            name: u['first name'] || u['name'] || 'User',
            email: u['email'] || u['gmail'] || '',
            password: u['password'] || '',
            state: 'ACTIVE',
            joinedAt: u['date and time'] || u['time_date'] || new Date().toISOString(),
            balance: 0
          }));
          setAllUsers(mapped);
        } else if (storedAllUsers) {
          setAllUsers(JSON.parse(storedAllUsers));
        }

        if (storedProducts) setAllProducts(JSON.parse(storedProducts));
        else setAllProducts(PRODUCTS);

        if (storedOrders) setOrders(JSON.parse(storedOrders));
        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
        if (storedLastOrderId) setLastOrderId(storedLastOrderId);
        if (storedTickets) setTickets(JSON.parse(storedTickets));
        if (storedPromos) setPromoCodes(JSON.parse(storedPromos));
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
        if (storedMessages) setMessages(JSON.parse(storedMessages));
        if (storedLang) setLanguage(storedLang);
      } catch (e) {
        console.error("Initialization Error:", e);
        setAllProducts(PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const saveAllState = useCallback(() => {
    try {
      const s = stateRef.current;
      localStorage.setItem('mn_cart', JSON.stringify(s.cart));
      localStorage.setItem('mn_wishlist', JSON.stringify(s.wishlist));
      localStorage.setItem('mn_products', JSON.stringify(s.allProducts));
      localStorage.setItem('mn_orders', JSON.stringify(s.orders));
      localStorage.setItem('mn_tickets', JSON.stringify(s.tickets));
      localStorage.setItem('mn_promos', JSON.stringify(s.promoCodes));
      localStorage.setItem('mn_messages', JSON.stringify(s.messages));
      localStorage.setItem('mn_all_users', JSON.stringify(s.allUsers));
      localStorage.setItem('mn_lang', s.language);
      if (s.currentUser) {
        localStorage.setItem('mn_user', JSON.stringify(s.currentUser));
      } else {
        localStorage.removeItem('mn_user');
      }
    } catch (e) {
      console.error("Save Error", e);
    }
  }, []);

  useEffect(() => {
    saveAllState();
  }, [cart, wishlist, allProducts, orders, tickets, promoCodes, messages, allUsers, currentUser, language, saveAllState]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const handleUpdateQuantity = (id: string, delta: number) => setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const handleToggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAllUsers(prev => {
      const existing = prev.find(u => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (existing) return prev;
      return [...prev, user];
    });
    setActivePage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
    localStorage.removeItem('mn_user');
  };

  const handleCheckoutComplete = (data: any) => {
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      firstName: data.firstName || 'Client',
      lastName: data.lastName || 'MoonNight',
      email: data.email || (currentUser?.email || ''),
      country: data.country || 'Maroc',
      productBought: cart.map(i => `${i.name} x${i.quantity}`).join(', '),
      totalAmount: data.total,
      date: new Date().toLocaleDateString(),
      status: 'Payment Verifying', // Always start with Payment Verifying as requested
      paymentMethod: data.paymentMethod
    };

    if (data.paymentMethod === 'solde' && currentUser) {
      const updatedBalance = Math.max(0, currentUser.balance - data.total);
      const updatedUser = { ...currentUser, balance: updatedBalance };
      setCurrentUser(updatedUser);
      setAllUsers(prev => prev.map(u => u.email?.toLowerCase() === currentUser.email?.toLowerCase() ? updatedUser : u));
    }

    // Add System notification message to user chat
    if (currentUser) {
      const systemMsg: ChatMessage = {
        id: Date.now().toString() + '-sys',
        senderEmail: 'system@moonnight.shop',
        senderName: 'SYSTEM',
        text: `[To: ${currentUser.email}] Order #${orderId} is under verification. Please wait for processing.`,
        timestamp: new Date().toISOString(),
        isAdmin: true
      };
      setMessages(prev => [...prev, systemMsg]);
    }

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setLastOrderId(newOrder.id);
    setActivePage('account');
  };

  const handleSendTicket = (ticket: { name: string, email: string, message: string }) => {
    const newTicket: SupportTicket = { ...ticket, id: Date.now().toString(), date: new Date().toLocaleDateString(), status: 'New' };
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleSendMessage = (text: string) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = { id: Date.now().toString(), senderEmail: currentUser.email, senderName: currentUser.name, text, timestamp: new Date().toISOString(), isAdmin: false };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAdminReply = (userEmail: string, text: string) => {
    const newMessage: ChatMessage = { id: Date.now().toString(), senderEmail: 'admin@moonnight.shop', senderName: 'Admin', text: `[To: ${userEmail}] ${text}`, timestamp: new Date().toISOString(), isAdmin: true };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUpdateUserBalance = (email: string, balance: number) => {
    const emailLower = email.toLowerCase();
    setAllUsers(prev => prev.map(u => u.email?.toLowerCase() === emailLower ? { ...u, balance } : u));
    if (currentUser?.email?.toLowerCase() === emailLower) setCurrentUser(prev => prev ? { ...prev, balance } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
           <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="font-gaming text-sky-400 text-xs animate-pulse tracking-widest uppercase">MoonNight Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30">
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
        onRemove={handleRemoveFromCart} 
        onUpdateQuantity={handleUpdateQuantity} 
        onCheckout={() => { setIsCartOpen(false); setActivePage('checkout'); }} 
        t={t}
      />
      
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-scale-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center z-10 transition-colors">
              <i className="fas fa-times"></i>
            </button>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-4 sm:p-8">
                <div className="aspect-square rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-sky-500 rounded-full text-[10px] font-gaming uppercase tracking-widest text-white">{selectedProduct.category}</div>
                </div>
              </div>
              <div className="md:w-1/2 p-8 pt-4 md:p-12 md:pl-0 flex flex-col justify-center">
                <h2 className="text-3xl font-gaming font-bold text-white mb-4 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-3xl font-gaming font-bold text-sky-400">{selectedProduct.price.toFixed(2)} DH</div>
                  {selectedProduct.originalPrice && (
                    <div className="text-slate-500 line-through text-lg">{selectedProduct.originalPrice.toFixed(2)} DH</div>
                  )}
                </div>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{selectedProduct.description}</p>
                
                <div className="space-y-3 mb-10">
                  <p className="text-xs font-gaming uppercase tracking-widest text-slate-500 mb-2">Technical Features:</p>
                  {selectedProduct.features?.map((f, i) => (
                    <div key={i} className="flex items-center space-x-3 text-sm text-slate-300">
                      <i className="fas fa-check-circle text-sky-500 text-xs"></i>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => { handleAddToCart(selectedProduct!); setSelectedProduct(null); }}
                    className="flex-1 bg-sky-500 text-white font-gaming py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-[0.98]"
                  >
                    {t('buyNow')}
                  </button>
                  <button 
                    onClick={() => handleToggleWishlist(selectedProduct!.id)}
                    className={`w-16 rounded-2xl border flex items-center justify-center transition-all ${wishlist.includes(selectedProduct.id) ? 'border-red-500/40 text-red-500 bg-red-500/5' : 'border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}
                  >
                    <i className="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 lg:pb-0">
        {activePage === 'home' && <Home onAddToCart={handleAddToCart} onViewDetails={(p) => setSelectedProduct(p)} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} setActivePage={setActivePage} t={t} />}
        {activePage === 'shop' && <Shop products={allProducts} onAddToCart={handleAddToCart} onViewDetails={(p) => setSelectedProduct(p)} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} t={t} />}
        {activePage === 'contact' && <Contact onSendTicket={handleSendTicket} t={t} />}
        {activePage === 'auth' && <Auth onLogin={handleLogin} onBack={() => setActivePage('shop')} allUsers={allUsers} t={t} />}
        {activePage === 'checkout' && <Checkout cart={cart} promoCodes={promoCodes} currentUser={currentUser} onComplete={handleCheckoutComplete} onCancel={() => setActivePage('shop')} setActivePage={setActivePage} t={t} />}
        {activePage === 'account' && (
          currentUser 
            ? <Account user={currentUser} orders={orders} messages={messages} onSendMessage={handleSendMessage} onLogout={handleLogout} onRefresh={() => {}} isRefreshing={false} t={t} />
            : <Auth onLogin={handleLogin} onBack={() => setActivePage('home')} allUsers={allUsers} t={t} />
        )}
        {activePage === 'admin' && (
          <Admin 
            products={allProducts} orders={orders} tickets={tickets} promoCodes={promoCodes} messages={messages} users={allUsers}
            onUpdateUserBalance={handleUpdateUserBalance} onAddProduct={(p) => setAllProducts(prev => [p, ...prev])} onUpdateProduct={(p) => setAllProducts(prev => prev.map(i => i.id === p.id ? p : i))} onDeleteProduct={(id) => setAllProducts(prev => prev.filter(i => i.id !== id))} onUpdateOrderStatus={(id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))} onUpdateTicketStatus={(id, status) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))} onDeleteTicket={(id) => setTickets(prev => prev.filter(t => t.id !== id))} onAddPromoCode={(promo) => setPromoCodes(prev => [promo, ...prev])} onDeletePromoCode={(id) => setPromoCodes(prev => prev.filter(p => p.id !== id))} onAdminReply={handleAdminReply}
            t={t}
          />
        )}
        
        {!['home', 'shop', 'contact', 'auth', 'checkout', 'account', 'admin'].includes(activePage) && (
          <div className="pt-40 pb-40 text-center animate-fade-in">
             <h2 className="text-3xl font-gaming font-bold text-white uppercase tracking-widest mb-4">404 - Page Not Found</h2>
             <button onClick={() => setActivePage('home')} className="px-8 py-3 bg-sky-500 text-white rounded-xl font-gaming text-xs uppercase tracking-widest shadow-lg">Return to Home</button>
          </div>
        )}
      </main>
      <Footer onSecretEntrance={() => setActivePage('admin')} t={t} />
    </div>
  );
};

export default App;
