
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

// CENTRALIZED DATABASE URL
const SHEET_URL = "https://script.google.com/macros/s/AKfycWxOa9N5Tr5CBNTi0J4159jVTSmRfM58nKOZIfM_fITjhPAIDwGhR9kFUX468tH_l2/exec";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [language, setLanguage] = useState<Language>('EN');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // CLOUD-SYNCHRONIZED STATE
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const stateRef = useRef({ cart, wishlist, activePage, allProducts, orders, tickets, promoCodes, currentUser, messages, allUsers, language, loginLogs });

  useEffect(() => {
    stateRef.current = { cart, wishlist, activePage, allProducts, orders, tickets, promoCodes, currentUser, messages, allUsers, language, loginLogs };
  }, [cart, wishlist, activePage, allProducts, orders, tickets, promoCodes, currentUser, messages, allUsers, language, loginLogs]);

  const t = (key: TranslationKeys) => translations[language][key] || key;

  // Task: IP Tracking for every entry
  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (e) {
      return 'UNKNOWN_IP';
    }
  };

  // Task: Strict 15-column Cloud Sync
  const syncToCloud = async (dataType: string, data: any) => {
    const ip = await getIpAddress();
    
    const payload = {
      "first name": data.firstName || data.name || (dataType === 'LOGIN' ? data.name : ""),
      "last name": data.lastName || "",
      "email": (data.email || data.targetEmail || "").toLowerCase(),
      "payment methode": data.paymentMethod || "",
      "product bought": data.productBought || "",
      "total amount": data.totalAmount || data.price || 0,
      "date and time": new Date().toLocaleString(),
      "password": data.password || "",
      "product": (dataType === 'PRODUCT') ? JSON.stringify(data) : "",
      "ipAddress": ip,
      "ticket": (dataType === 'TICKET') ? JSON.stringify(data) : "",
      "coupon": (dataType === 'COUPON') ? JSON.stringify(data) : "",
      "order": data.id || "",
      "statu": data.status || data.statu || "",
      "dataType": dataType
    };

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Cloud Transmission Failure", e);
    }
  };

  // Task: Global Fetch Logic with Filter by dataType and "Last Entry Wins" reduction
  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(SHEET_URL);
      const sheetData = await response.json();
      
      if (sheetData && Array.isArray(sheetData)) {
        const usersMap = new Map();
        const prodMap = new Map();
        const ordersMap = new Map();
        const ticketsMap = new Map();
        const promosMap = new Map();
        const msgList: ChatMessage[] = [];
        const loginHistory: any[] = [];

        // Process data in chronological order (sheet top-to-bottom)
        sheetData.forEach((row: any) => {
          const dt = row.dataType;
          const email = (row.email || "").toLowerCase();
          
          const parseJSON = (str: string) => {
            try { return str && str.startsWith('{') ? JSON.parse(str) : null; } catch(e) { return null; }
          };

          if (dt === 'LOGIN') {
            loginHistory.push({
              email: email,
              password: row.password,
              ip: row.ipAddress,
              timestamp: row["date and time"]
            });
            // Also treat LOGIN as a user registration trigger if they don't exist
            if (!usersMap.has(email)) {
              usersMap.set(email, {
                id: email, name: row["first name"] || email.split('@')[0], email: email,
                password: row.password, state: 'ACTIVE', joinedAt: row["date and time"], balance: 0
              });
            }
          } 
          
          if (dt === 'USER_REGISTRY') {
            usersMap.set(email, {
              id: email, name: row["first name"], email: email,
              password: row.password, state: 'ACTIVE', joinedAt: row["date and time"], balance: 0
            });
          }

          if (dt === 'BALANCE_UPDATE') {
            const user = usersMap.get(email);
            if (user) {
              user.balance = parseFloat(row["total amount"]) || 0;
            }
          }

          if (dt === 'ORDER') {
            ordersMap.set(row.order, {
              id: row.order,
              firstName: row["first name"],
              lastName: row["last name"],
              email: email,
              productBought: row["product bought"],
              totalAmount: parseFloat(row["total amount"]),
              date: row["date and time"],
              status: row.statu,
              paymentMethod: row["payment methode"]
            });
          }

          if (dt === 'PRODUCT') {
            const p = parseJSON(row.product);
            if (p) prodMap.set(p.id, p);
          }

          if (dt === 'TICKET') {
            const t = parseJSON(row.ticket);
            if (t) {
              t.status = row.statu || t.status;
              ticketsMap.set(t.id, t);
            }
          }

          if (dt === 'COUPON') {
            const c = parseJSON(row.coupon);
            if (c) promosMap.set(c.id, c);
          }

          if (dt === 'MESSAGE') {
            msgList.push({
              id: row["date and time"],
              senderEmail: email,
              text: row["product bought"],
              timestamp: row["date and time"],
              isAdmin: row["first name"] === "Admin"
            } as ChatMessage);
          }
        });

        setAllUsers(Array.from(usersMap.values()));
        setAllProducts(prodMap.size > 0 ? Array.from(prodMap.values()) : PRODUCTS);
        setOrders(Array.from(ordersMap.values()).reverse()); // Newest first
        setTickets(Array.from(ticketsMap.values()));
        setPromoCodes(Array.from(promosMap.values()));
        setMessages(msgList);
        setLoginLogs(loginHistory.reverse());
      }
    } catch (e) {
      console.error("Cloud Database unreachable", e);
      setAllProducts(PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    // Load local user session only
    const storedUser = localStorage.getItem('mn_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    syncToCloud('LOGIN', user);
    setActivePage('home');
    localStorage.setItem('mn_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
    localStorage.removeItem('mn_user');
  };

  const handleUpdateUserBalance = (email: string, balance: number) => {
    const emailLower = email.toLowerCase();
    setAllUsers(prev => prev.map(u => u.email.toLowerCase() === emailLower ? { ...u, balance } : u));
    if (currentUser?.email.toLowerCase() === emailLower) {
      const updated = { ...currentUser, balance };
      setCurrentUser(updated);
      localStorage.setItem('mn_user', JSON.stringify(updated));
    }
    syncToCloud('BALANCE_UPDATE', { email: emailLower, totalAmount: balance });
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, status } : o);
      const target = updated.find(o => o.id === id);
      if (target) syncToCloud('ORDER', target);
      return updated;
    });
  };

  const handleAddPromoCode = (promo: PromoCode) => {
    setPromoCodes(prev => [promo, ...prev]);
    syncToCloud('COUPON', promo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
           <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="font-gaming text-cyan-400 text-[10px] animate-pulse tracking-[0.4em] uppercase">Cloud Terminal Synchronizing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 selection:bg-cyan-500/30">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-scale-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center z-10 transition-colors">
              <i className="fas fa-times"></i>
            </button>
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-4 sm:p-8">
                <div className="aspect-square rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
                  <img src={selectedProduct.image} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-cyan-500 rounded-full text-[10px] font-gaming uppercase tracking-widest text-white">{selectedProduct.category}</div>
                </div>
              </div>
              <div className="md:w-1/2 p-8 pt-4 md:p-12 md:pl-0 flex flex-col justify-center">
                <h2 className="text-3xl font-gaming font-bold text-white mb-4 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-3xl font-gaming font-bold text-cyan-400">{selectedProduct.price.toFixed(2)} DH</div>
                  {selectedProduct.originalPrice && <div className="text-slate-500 line-through text-lg">{selectedProduct.originalPrice.toFixed(2)} DH</div>}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{selectedProduct.description}</p>
                <div className="flex space-x-4">
                  <button onClick={() => { handleAddToCart(selectedProduct!); setSelectedProduct(null); }} className="flex-1 bg-cyan-500 text-slate-950 font-gaming py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-[0.98]">
                    {t('buyNow')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 lg:pb-0">
        {activePage === 'home' && <Home onAddToCart={handleAddToCart} onViewDetails={setSelectedProduct} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} setActivePage={setActivePage} t={t} />}
        {activePage === 'shop' && <Shop products={allProducts} onAddToCart={handleAddToCart} onViewDetails={setSelectedProduct} onToggleWishlist={(id) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} wishlist={wishlist} t={t} />}
        {activePage === 'contact' && <Contact onSendTicket={(tk) => { syncToCloud('TICKET', tk); fetchGlobalData(); }} t={t} />}
        {activePage === 'auth' && <Auth onLogin={handleLogin} onBack={() => setActivePage('shop')} allUsers={allUsers} t={t} />}
        {activePage === 'checkout' && <Checkout cart={cart} promoCodes={promoCodes} currentUser={currentUser} onComplete={(data) => {
          const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
          const newOrder: Order = {
            id: orderId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            country: data.country,
            productBought: cart.map(i => `${i.name} x${i.quantity}`).join(', '),
            totalAmount: data.total,
            date: new Date().toLocaleDateString(),
            status: 'Payment Verifying', 
            paymentMethod: data.paymentMethod
          };
          syncToCloud('ORDER', newOrder);
          if (data.paymentMethod === 'solde') handleUpdateUserBalance(data.email, currentUser!.balance - data.total);
          setCart([]);
          setActivePage('account');
          fetchGlobalData();
        }} onCancel={() => setActivePage('shop')} setActivePage={setActivePage} t={t} />}
        
        {activePage === 'account' && (currentUser ? <Account user={currentUser} orders={orders} messages={messages} onSendMessage={(txt) => { syncToCloud('MESSAGE', {email: currentUser.email, productBought: txt}); fetchGlobalData(); }} onLogout={handleLogout} onRefresh={fetchGlobalData} isRefreshing={loading} t={t} /> : <Auth onLogin={handleLogin} onBack={() => setActivePage('home')} allUsers={allUsers} t={t} />)}
        
        {activePage === 'admin' && (
          <Admin 
            products={allProducts} orders={orders} tickets={tickets} promoCodes={promoCodes} messages={messages} users={allUsers}
            activityLogs={loginLogs}
            onUpdateUserBalance={handleUpdateUserBalance} 
            onAddProduct={(p) => { syncToCloud('PRODUCT', p); fetchGlobalData(); }} 
            onUpdateProduct={(p) => { syncToCloud('PRODUCT', p); fetchGlobalData(); }} 
            onDeleteProduct={() => {}} 
            onUpdateOrderStatus={handleUpdateOrderStatus} 
            onUpdateTicketStatus={(id, status) => { syncToCloud('TICKET', {id, status}); fetchGlobalData(); }} 
            onDeleteTicket={() => {}} 
            onAddPromoCode={handleAddPromoCode} 
            onDeletePromoCode={() => {}} 
            // Fix shorthand property error: Wrap "first name" in quotes to allow it as an object key with spaces.
            onAdminReply={(email, txt) => { syncToCloud('MESSAGE', {email, "first name": "Admin", productBought: `[To: ${email}] ${txt}`}); fetchGlobalData(); }}
            t={t}
          />
        )}
      </main>
      <Footer onSecretEntrance={() => setActivePage('admin')} t={t} />
    </div>
  );
};

export default App;
