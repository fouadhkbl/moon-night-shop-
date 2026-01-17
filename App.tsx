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
    const initApp = async () => {
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
  }, [cart, wishlist, allProducts, orders, tickets, promoCodes, messages, allUsers, currentUser, saveAllState]);

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
      if (prev.find(u => u.email === user.email)) return prev;
      return [...prev, user];
    });
    setActivePage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('home');
  };

  const handleCheckoutComplete = (data: any) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country: data.country,
      productBought: cart.map(i => `${i.name} x${i.quantity}`).join(', '),
      totalAmount: data.total,
      date: new Date().toLocaleDateString(),
      status: data.isInstant ? 'Completed' : 'Pending',
      paymentMethod: data.paymentMethod
    };

    if (data.isInstant && data.paymentMethod === 'solde' && currentUser) {
      const updatedBalance = currentUser.balance - data.total;
      setCurrentUser(prev => prev ? { ...prev, balance: updatedBalance } : null);
      setAllUsers(prev => prev.map(u => u.email === currentUser.email ? { ...u, balance: updatedBalance } : u));
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
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, balance } : u));
    if (currentUser?.email === email) setCurrentUser(prev => prev ? { ...prev, balance } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30">
      <Navbar cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} activePage={activePage} setActivePage={setActivePage} user={currentUser} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={handleRemoveFromCart} onUpdateQuantity={handleUpdateQuantity} onCheckout={() => { setIsCartOpen(false); setActivePage('checkout'); }} />
      <main>
        {activePage === 'home' && <Home onAddToCart={handleAddToCart} onViewDetails={(p) => setSelectedProduct(p)} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} setActivePage={setActivePage} />}
        {activePage === 'shop' && <Shop products={allProducts} onAddToCart={handleAddToCart} onViewDetails={(p) => setSelectedProduct(p)} onToggleWishlist={handleToggleWishlist} wishlist={wishlist} />}
        {activePage === 'contact' && <Contact onSendTicket={handleSendTicket} />}
        {activePage === 'auth' && <Auth onLogin={handleLogin} onBack={() => setActivePage('shop')} allUsers={allUsers} />}
        {activePage === 'checkout' && <Checkout cart={cart} promoCodes={promoCodes} currentUser={currentUser} onComplete={handleCheckoutComplete} onCancel={() => setActivePage('shop')} setActivePage={setActivePage} />}
        {activePage === 'account' && currentUser && <Account user={currentUser} orders={orders} messages={messages} onSendMessage={handleSendMessage} onLogout={handleLogout} onRefresh={() => {}} isRefreshing={false} />}
        {activePage === 'admin' && (
          <Admin 
            products={allProducts} orders={orders} tickets={tickets} promoCodes={promoCodes} messages={messages} users={allUsers}
            onUpdateUserBalance={handleUpdateUserBalance} onAddProduct={(p) => setAllProducts(prev => [p, ...prev])} onUpdateProduct={(p) => setAllProducts(prev => prev.map(i => i.id === p.id ? p : i))} onDeleteProduct={(id) => setAllProducts(prev => prev.filter(i => i.id !== id))} onUpdateOrderStatus={(id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))} onUpdateTicketStatus={(id, status) => setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))} onDeleteTicket={(id) => setTickets(prev => prev.filter(t => t.id !== id))} onAddPromoCode={(promo) => setPromoCodes(prev => [promo, ...prev])} onDeletePromoCode={(id) => setPromoCodes(prev => prev.filter(p => p.id !== id))} onAdminReply={handleAdminReply}
          />
        )}
      </main>
      <Footer onSecretEntrance={() => setActivePage('admin')} />
    </div>
  );
};

export default App;