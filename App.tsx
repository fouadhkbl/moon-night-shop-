
import React, { useState, useEffect, useRef } from 'react';
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
import { GoogleGenAI } from "@google/genai";

const SHEET_URL = "https://script.google.com/macros/s/AKfycWxOa9N5Tr5CBNTi0J4159jVTSmRfM58nKOZIfM_fITjhPAIDwGhR9kFUX468tH_l2/exec";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [language, setLanguage] = useState<Language>('EN');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const t = (key: TranslationKeys) => translations[language][key] || key;

  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (e) { return 'UNKNOWN_IP'; }
  };

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
    } catch (e) { console.error("Cloud Transmission Failure", e); }
  };

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

        sheetData.forEach((row: any) => {
          const dt = row.dataType;
          const email = (row.email || "").toLowerCase();
          const parseJSON = (str: string) => { try { return str && str.startsWith('{') ? JSON.parse(str) : null; } catch(e) { return null; } };

          if (dt === 'LOGIN') {
            loginHistory.push({ email, password: row.password, ip: row.ipAddress, timestamp: row["date and time"] });
            if (!usersMap.has(email)) usersMap.set(email, { id: email, name: row["first name"] || email.split('@')[0], email, password: row.password, state: 'ACTIVE', joinedAt: row["date and time"], balance: 0 });
          } 
          if (dt === 'USER_REGISTRY') usersMap.set(email, { id: email, name: row["first name"], email, password: row.password, state: 'ACTIVE', joinedAt: row["date and time"], balance: 0 });
          if (dt === 'BALANCE_UPDATE') { const u = usersMap.get(email); if (u) u.balance = parseFloat(row["total amount"]) || 0; }
          if (dt === 'ORDER') ordersMap.set(row.order, { id: row.order, firstName: row["first name"], lastName: row["last name"], email, productBought: row["product bought"], totalAmount: parseFloat(row["total amount"]), date: row["date and time"], status: row.statu, paymentMethod: row["payment methode"] });
          if (dt === 'PRODUCT') { const p = parseJSON(row.product); if (p) prodMap.set(p.id, p); }
          if (dt === 'TICKET') { const t = parseJSON(row.ticket); if (t) { t.status = row.statu || t.status; ticketsMap.set(t.id, t); } }
          if (dt === 'COUPON') { const c = parseJSON(row.coupon); if (c) promosMap.set(c.id, c); }
          if (dt === 'MESSAGE') msgList.push({ id: row["date and time"], senderEmail: email, text: row["product bought"], timestamp: row["date and time"], isAdmin: row["first name"] === "Admin" } as ChatMessage);
        });

        setAllUsers(Array.from(usersMap.values()));
        setAllProducts(prodMap.size > 0 ? Array.from(prodMap.values()) : PRODUCTS);
        setOrders(Array.from(ordersMap.values()).reverse());
        setTickets(Array.from(ticketsMap.values()));
        setPromoCodes(Array.from(promosMap.values()));
        setMessages(msgList);
        setLoginLogs(loginHistory.reverse());
      }
    } catch (e) { console.error("Cloud Database unreachable", e); setAllProducts(PRODUCTS); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchGlobalData();
    const storedUser = localStorage.getItem('mn_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           <p className="font-gaming text-blue-700 text-[10px] animate-pulse tracking-[0.4em] uppercase font-black">Establishing Secure Uplink...</p>
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
      
      {/* PRODUCT DETAIL VIEW */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[150] bg-white overflow-y-auto animate-fade-in flex flex-col">
          {/* Header Bar */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between z-20">
            <button onClick={() => { setSelectedProduct(null); setDetailQuantity(1); }} className="p-2 text-slate-500 hover:text-blue-700">
              <i className="fas fa-chevron-left text-lg"></i>
            </button>
            <div className="flex-1 px-4 truncate">
              <p className="text-[10px] text-slate-400 font-medium">Home / {selectedProduct.category} Accounts</p>
            </div>
            <button className="p-2 text-slate-500 hover:text-blue-700">
              <i className="fas fa-share-alt"></i>
            </button>
          </div>

          <div className="flex-1 pb-32">
            <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8">
              {/* Product Top Header */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-48 flex-shrink-0">
                  <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                    <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                  </div>
                </div>
                <div className="flex-1 relative pr-8">
                  <h2 className="text-xl font-bold text-slate-900 leading-tight mb-4">{selectedProduct.name}</h2>
                  <div className="absolute top-0 right-0">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-bl-xl rounded-tr-sm text-slate-400 hover:text-red-500 transition-colors">
                      <i className="far fa-heart text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Specification Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-5 bg-red-600 rounded-full" />
                  <h3 className="text-lg font-bold text-slate-900">Product Specification</h3>
                </div>
                <div className="grid grid-cols-1 border border-slate-100 rounded-xl overflow-hidden text-sm">
                  <div className="flex border-b border-slate-100">
                    <div className="w-1/2 p-4 bg-slate-50 text-slate-500 font-medium truncate">Brand : {selectedProduct.brand || 'MoonNight'}</div>
                    <div className="w-1/2 p-4 border-l border-slate-100 truncate">USP : {selectedProduct.usp || 'High Quality'}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/2 p-4 bg-slate-50 text-slate-500 font-medium truncate">Full Access : {selectedProduct.fullAccess || 'YES'}</div>
                    <div className="w-1/2 p-4 border-l border-slate-100 truncate">Items Amount : {selectedProduct.itemsAmount || (selectedProduct.stock * 10).toString()}</div>
                  </div>
                </div>
              </div>

              {/* Seller / Quantity Selector */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                      <img src="https://ui-avatars.com/api/?name=MoonNight&background=1d4ed8&color=fff" className="w-10 h-10 rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-slate-900">MoonNight Official</span>
                        <i className="fas fa-check-circle text-green-500 text-xs"></i>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-500 text-[10px]">
                        <i className="fas fa-gem"></i><i className="fas fa-gem"></i><i className="fas fa-gem"></i>
                        <i className="fas fa-thumbs-up text-green-500 ml-1"></i>
                        <span className="text-green-500 font-bold">100%</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setActivePage('account'); setSelectedProduct(null); }} className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[12px] font-bold flex items-center space-x-2 border border-emerald-100">
                    <i className="fas fa-comment-dots"></i>
                    <span>Chat</span>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[12px] text-slate-400 font-medium mb-3">Stock: Adequate stock</p>
                  <div className="inline-flex items-center bg-slate-50 border border-slate-100 rounded-full p-1 shadow-inner">
                    <button 
                      onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-700 shadow-sm"
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input 
                      type="number" 
                      value={detailQuantity} 
                      onChange={(e) => setDetailQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 bg-transparent text-center font-bold text-slate-900 outline-none"
                    />
                    <button 
                      onClick={() => setDetailQuantity(detailQuantity + 1)}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-700 shadow-sm"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3">1 = USD {(selectedProduct.price * 0.1).toFixed(4)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Detail Footer - Price changes with quantity */}
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 sm:p-6 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 line-through text-xs">${(selectedProduct.price * 0.15 * detailQuantity).toFixed(2)}</span>
                  <span className="text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded text-[10px] font-bold">-43.76%</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-slate-900">${(selectedProduct.price * 0.1 * detailQuantity).toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Price updates with quantity <i className="fas fa-info-circle"></i></span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => { handleAddToCart(selectedProduct, detailQuantity); setSelectedProduct(null); setDetailQuantity(1); }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-10 rounded-lg text-sm transition-all shadow-md shadow-red-100 active:scale-95"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pb-20 lg:pb-0 min-h-screen">
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
            onDeleteProduct={(id) => {}} 
            onUpdateOrderStatus={handleUpdateOrderStatus} 
            onUpdateTicketStatus={(id, status) => { syncToCloud('TICKET', {id, status}); fetchGlobalData(); }} 
            onDeleteTicket={(id) => {}} 
            onAddPromoCode={(p) => { syncToCloud('COUPON', p); fetchGlobalData(); }} 
            onDeletePromoCode={(id) => {}} 
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
