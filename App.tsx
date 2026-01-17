
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
import { Product, CartItem, Order, OrderStatus, SupportTicket, TicketStatus, PromoCode, User, ChatMessage } from './types';
import { PRODUCTS } from './constants';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const stateRef = useRef({ cart, wishlist, activePage, allProducts, orders, lastOrderId, tickets, promoCodes, currentUser, messages, allUsers });

  useEffect(() => {
    stateRef.current = { cart, wishlist, activePage, allProducts, orders, lastOrderId, tickets, promoCodes, currentUser, messages, allUsers };
  }, [cart, wishlist, activePage, allProducts, orders, lastOrderId, tickets, promoCodes, currentUser, messages, allUsers]);

  useEffect(() => {
    // Initial Load from Storage
    const loadState = () => {
      try {
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
        if (storedAllUsers) setAllUsers(JSON.parse(storedAllUsers));
      } catch (e) {
        console.error("Critical: LocalStorage corruption detected. Resetting to defaults.", e);
        setAllProducts(PRODUCTS);
      }
      
      // Force home on fresh enter to avoid 404 path issues
      setActivePage('home');
      setTimeout(() => setLoading(false), 2000);
    };

    loadState();
  }, []);

  const saveAllState = useCallback(() => {
    const s = stateRef.current;
    localStorage.setItem('mn_cart', JSON.stringify(s.cart));
    localStorage.setItem('mn_wishlist', JSON.stringify(s.wishlist));
    localStorage.setItem('mn_products', JSON.stringify(s.allProducts));
    localStorage.setItem('mn_orders', JSON.stringify(s.orders));
    localStorage.setItem('mn_tickets', JSON.stringify(s.tickets));
    localStorage.setItem('mn_promos', JSON.stringify(s.promoCodes));
    localStorage.setItem('mn_messages', JSON.stringify(s.messages));
    localStorage.setItem('mn_all_users', JSON.stringify(s.allUsers));
    if (s.currentUser) localStorage.setItem('mn_user', JSON.stringify(s.currentUser));
    if (s.lastOrderId) localStorage.setItem('mn_last_id', s.lastOrderId);
  }, []);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(saveAllState, 10000);
    return () => clearInterval(interval);
  }, [loading, saveAllState]);

  const handleSendMessage = (text: string) => {
    if (!currentUser) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderEmail: currentUser.email,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
      isAdmin: false
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleAdminReply = (userEmail: string, text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderEmail: 'admin@moonnight.com',
      senderName: 'MoonNight Admin',
      text: `[To: ${userEmail}] ${text}`,
      timestamp: new Date().toISOString(),
      isAdmin: true
    };
    setMessages(prev => [...prev, msg]);
  };

  const handleAuthSuccess = (user: User) => {
    const authenticatedUser = { ...user, balance: user.balance || 0 };
    
    setAllUsers(prev => {
      const exists = prev.find(u => u.email === authenticatedUser.email);
      if (exists) return prev.map(u => u.email === exists.email ? authenticatedUser : u);
      return [...prev, authenticatedUser];
    });

    setCurrentUser(authenticatedUser);
    setActivePage(cart.length > 0 ? 'checkout' : 'account');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mn_user');
    setActivePage('home');
  };

  const handleUpdateUserBalance = (email: string, newBalance: number) => {
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, balance: newBalance } : u));
    if (currentUser?.email === email) {
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }
    // Force save immediately on balance update
    setTimeout(saveAllState, 100);
  };

  const handleCheckoutComplete = (data: any) => {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    
    if (data.paymentMethod === 'solde' && currentUser) {
      const newBalance = currentUser.balance - data.total;
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
      setAllUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, balance: newBalance } : u));
    }

    const newOrder: Order = {
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country: data.country,
      productBought: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
      totalAmount: data.total,
      date: new Date().toLocaleString(),
      status: data.isInstant ? 'Processing' : 'Pending',
      appliedPromo: data.appliedPromo,
      paymentMethod: data.paymentMethod
    };

    setOrders(prev => [newOrder, ...prev]);
    setLastOrderId(id);
    setCart([]);
    setActivePage('success');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <Home onAddToCart={(p)=>setCart(prev=>[...prev,{...p,quantity:1}])} onViewDetails={setSelectedProduct} onToggleWishlist={(id)=>setWishlist(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])} wishlist={wishlist} setActivePage={setActivePage} />;
      case 'shop': return <Shop onAddToCart={(p)=>setCart(prev=>[...prev,{...p,quantity:1}])} onViewDetails={setSelectedProduct} onToggleWishlist={(id)=>setWishlist(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])} wishlist={wishlist} products={allProducts} />;
      case 'contact': return <Contact onSendTicket={(t)=>setTickets(prev=>[{...t,id:Date.now().toString(),date:new Date().toLocaleString(),status:'New'},...prev])} />;
      case 'auth': return <Auth onLogin={handleAuthSuccess} onBack={() => setActivePage('home')} />;
      case 'account': return currentUser ? (
        <Account 
          user={currentUser} 
          orders={orders} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          onLogout={handleLogout}
          isRefreshing={isRefreshingStatus}
          onRefresh={() => { setIsRefreshingStatus(true); setTimeout(()=>setIsRefreshingStatus(false), 2000); }}
        />
      ) : <Auth onLogin={handleAuthSuccess} onBack={()=>setActivePage('home')} />;
      case 'admin': return (
        <Admin 
          products={allProducts} 
          orders={orders} 
          tickets={tickets}
          promoCodes={promoCodes}
          messages={messages}
          users={allUsers}
          onUpdateUserBalance={handleUpdateUserBalance}
          onAddProduct={(p)=>setAllProducts(prev=>[p,...prev])} 
          onUpdateProduct={(p)=>setAllProducts(prev=>prev.map(i=>i.id===p.id?p:i))} 
          onDeleteProduct={(id)=>setAllProducts(prev=>prev.filter(i=>i.id!==id))} 
          onUpdateOrderStatus={(id,s)=>setOrders(prev=>prev.map(o=>o.id===id?{...o,status:s}:o))} 
          onUpdateTicketStatus={(id,s)=>setTickets(prev=>prev.map(t=>t.id===id?{...t,status:s}:t))}
          onDeleteTicket={(id)=>setTickets(prev=>prev.filter(t=>t.id!==id))}
          onAddPromoCode={(p)=>setPromoCodes(prev=>[...prev,p])}
          onDeletePromoCode={(id)=>setPromoCodes(prev=>prev.filter(p=>p.id!==id))}
          onAdminReply={handleAdminReply}
        />
      );
      case 'checkout': return <Checkout cart={cart} promoCodes={promoCodes} currentUser={currentUser} onComplete={handleCheckoutComplete} onCancel={() => setActivePage('shop')} />;
      case 'success': {
        const o = orders.find(ord => ord.id === lastOrderId);
        return (
          <div className="pt-40 pb-24 max-w-2xl mx-auto px-4 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-3xl text-green-500"></i>
            </div>
            <h1 className="text-4xl font-gaming font-bold text-white mb-6 uppercase">Commande Reçue</h1>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-left mb-8">
              <p className="text-sky-400 font-mono text-xl font-bold mb-4">#{o?.id}</p>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {o?.status === 'Processing' 
                  ? 'Paiement par Solde vérifié avec succès ! Votre livraison digitale sera bientôt disponible dans votre compte.' 
                  : 'Vérification manuelle en cours (Méthode de paiement externe). Suivez l\'état de votre commande dans votre coffre.'}
              </p>
              <button onClick={()=>setActivePage('account')} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl uppercase shadow-lg shadow-sky-500/20">Mon Espace Client</button>
            </div>
            <button onClick={()=>setActivePage('home')} className="text-slate-500 font-gaming uppercase text-[10px] tracking-widest hover:text-white transition-colors">Retour à l'accueil</button>
          </div>
        );
      }
      default: return <Home onAddToCart={(p)=>setCart(prev=>[...prev,{...p,quantity:1}])} onViewDetails={setSelectedProduct} onToggleWishlist={(id)=>setWishlist(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])} wishlist={wishlist} setActivePage={setActivePage} />;
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[200]">
      <div className="relative w-24 h-24">
         <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-8 text-white font-gaming tracking-[0.5em] animate-pulse text-xs uppercase">MOONNIGHT LOADING</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-sky-500 selection:text-white">
      <Navbar cartCount={cart.reduce((s,i)=>s+i.quantity,0)} onOpenCart={()=>setIsCartOpen(true)} activePage={activePage} setActivePage={setActivePage} user={currentUser} />
      <main className="transition-all duration-500">{renderPage()}</main>
      <Footer onSecretEntrance={() => setActivePage('admin')} />
      <CartSidebar isOpen={isCartOpen} onClose={()=>setIsCartOpen(false)} items={cart} onRemove={(id)=>setCart(prev=>prev.filter(i=>i.id!==id))} onUpdateQuantity={(id,d)=>setCart(prev=>prev.map(i=>i.id===id?{...i,quantity:Math.max(1,i.quantity+d)}:i))} onCheckout={()=>{setIsCartOpen(false);setActivePage(currentUser?'checkout':'auth');}} />
    </div>
  );
};

export default App;
