
import React, { useState, useMemo, useRef } from 'react';
import { Product, Order, OrderStatus, SupportTicket, TicketStatus, PromoCode, ChatMessage, Category, User } from '../types';
import { TranslationKeys } from '../translations';

interface AdminProps {
  products: Product[];
  orders: Order[];
  tickets: SupportTicket[];
  promoCodes: PromoCode[];
  messages: ChatMessage[];
  users: User[];
  activityLogs?: any[];
  onUpdateUserBalance: (email: string, newBalance: number) => void;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onUpdateTicketStatus: (id: string, status: TicketStatus) => void;
  onDeleteTicket: (id: string) => void;
  onAddPromoCode: (promo: PromoCode) => void;
  onDeletePromoCode: (id: string) => void;
  onAdminReply: (userEmail: string, text: string) => void;
  t: (key: TranslationKeys) => string;
}

const Admin: React.FC<AdminProps> = ({ 
  products, orders, tickets, promoCodes, messages, users, activityLogs = [],
  onUpdateUserBalance, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateOrderStatus, 
  onUpdateTicketStatus, onDeleteTicket, onAddPromoCode, onDeletePromoCode,
  onAdminReply,
  t
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'catalog' | 'orders' | 'marketing' | 'chat' | 'users' | 'audit'>('stats');
  const tabsRef = useRef<HTMLDivElement>(null);
  
  // Search/Filter states
  const [userSearch, setUserSearch] = useState('');
  const [chatFilterEmail, setChatFilterEmail] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  // Balance edit state
  const [editingBalance, setEditingBalance] = useState<{email: string, value: string} | null>(null);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', price: 0, category: 'Games', stock: 10, description: '', features: [], image: ''
  });

  // User Details State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fouad12jad1///') setIsAuthenticated(true);
    else alert('Invalid Authorization Key');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm({ ...productForm, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = () => {
    if (!productForm.name || !productForm.price) return alert('Name and Price are mandatory.');
    
    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productForm } as Product);
    } else {
      onAddProduct({
        ...productForm,
        id: Math.random().toString(36).substr(2, 9),
        rating: 5.0,
      } as Product);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({ name: '', price: 0, category: 'Games', stock: 10, description: '', features: [], image: '' });
  };

  const handleCreateCoupon = () => {
    if (!couponCode || couponDiscount <= 0) return alert('Enter valid code and percentage');
    onAddPromoCode({
      id: Date.now().toString(),
      code: couponCode.toUpperCase(),
      discount: couponDiscount
    });
    setCouponCode('');
    setCouponDiscount(0);
  };

  const handleSendAdminReply = (email: string) => {
    const text = replyText[email];
    if (!text?.trim()) return;
    onAdminReply(email, text);
    setReplyText({ ...replyText, [email]: '' });
  };

  const handleSaveBalance = (email: string) => {
    if (editingBalance && editingBalance.email === email) {
      onUpdateUserBalance(email, parseFloat(editingBalance.value) || 0);
      setEditingBalance(null);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const amount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    if (!chatFilterEmail) return messages;
    return messages.filter(m => 
      m.senderEmail.toLowerCase().includes(chatFilterEmail.toLowerCase()) ||
      m.text.toLowerCase().includes(chatFilterEmail.toLowerCase())
    );
  }, [messages, chatFilterEmail]);

  // Group messages by user
  const messageThreads = useMemo(() => {
    const threads: { [key: string]: ChatMessage[] } = {};
    messages.forEach(m => {
      let email = m.senderEmail;
      if (m.isAdmin) {
        const match = m.text.match(/\[To: (.*?)\]/);
        if (match) email = match[1];
      }
      if (!threads[email]) threads[email] = [];
      threads[email].push(m);
    });
    return threads;
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-sm mx-auto px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="hud-scanline opacity-10" />
          <h1 className="text-xl font-gaming font-black text-white mb-8 uppercase tracking-widest relative z-10">ADMIN TERMINAL</h1>
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <input 
              type="password" 
              placeholder="SECRET KEY" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-3 text-white text-center focus:border-sky-500 outline-none text-lg font-gaming" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl tracking-widest font-black uppercase text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all">AUTHORIZE</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: 'ANALYTICS', icon: 'chart-pie' },
    { id: 'catalog', label: 'CATALOGUE', icon: 'layer-group' },
    { id: 'orders', label: 'ORDERS', icon: 'receipt' },
    { id: 'users', label: 'USERS', icon: 'users' },
    { id: 'chat', label: 'CHAT', icon: 'comments' },
    { id: 'marketing', label: 'COUPONS', icon: 'ticket-alt' },
    { id: 'audit', label: 'GLOBAL AUDIT', icon: 'shield-alt' },
  ];

  return (
    <div className="pt-24 sm:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-8 animate-fade-in">
      
      {/* Scrollable Tabs Wrapper */}
      <div className="relative group/tabs mb-8 overflow-hidden rounded-2xl bg-slate-950/30 border border-slate-800/50 p-2">
        {/* Mobile Left Arrow */}
        <button 
          onClick={() => scrollTabs('left')}
          className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-slate-900/90 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)] backdrop-blur-md active:scale-90 transition-all"
        >
          <i className="fas fa-chevron-left text-[12px]"></i>
        </button>

        {/* Mobile Right Arrow */}
        <button 
          onClick={() => scrollTabs('right')}
          className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-slate-900/90 border border-sky-500/30 rounded-full flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)] backdrop-blur-md active:scale-90 transition-all"
        >
          <i className="fas fa-chevron-right text-[12px]"></i>
        </button>

        {/* Tabs Container */}
        <div 
          ref={tabsRef}
          className="flex overflow-x-auto gap-2 no-scrollbar pb-1 flex-nowrap items-center w-full px-12 lg:px-0 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-8 py-4 rounded-xl font-gaming text-[11px] uppercase font-black transition-all border whitespace-nowrap snap-center ${
                activeTab === tab.id 
                  ? 'bg-sky-500 text-white border-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.4)] scale-[1.02]' 
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <i className={`fas fa-${tab.icon} mr-3 text-[14px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Visual Fade Indicators */}
        <div className="lg:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-20" />
        <div className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-20" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[600px] relative">
        <div className="hud-scanline opacity-5" />

        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-white font-gaming text-sm uppercase tracking-widest mb-6 flex items-center gap-4">
              <i className="fas fa-terminal text-sky-500"></i>
              Global Operations Monitor
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Timestamp</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Origin IP</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Operator</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Protocol Action</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono">
                  {activityLogs.map((log, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-950/50 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-4 text-sky-400">{log.ip}</td>
                      <td className="py-3 px-4 text-white font-bold">{log.userId || log.email || 'GUEST'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-[8px] font-gaming uppercase tracking-widest ${
                          log.action === 'PURCHASE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          log.action === 'LOGIN' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{log.details}</td>
                    </tr>
                  ))}
                  {activityLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-700 uppercase font-gaming">No telemetry data recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
               <p className="text-[10px] font-gaming text-slate-500 uppercase mb-2 tracking-widest">Gross Yield</p>
               <p className="text-3xl font-gaming text-green-400 neon-text-cyan">{orders.reduce((a,c)=>a+c.totalAmount,0).toFixed(0)} DH</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
               <p className="text-[10px] font-gaming text-slate-500 uppercase mb-2 tracking-widest">Shipments</p>
               <p className="text-3xl font-gaming text-sky-400">{orders.length}</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner">
               <p className="text-[10px] font-gaming text-slate-500 uppercase mb-2 tracking-widest">Population</p>
               <p className="text-3xl font-gaming text-indigo-400">{users.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-white font-gaming text-sm uppercase tracking-widest">Database Inhabitants</h3>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="SEARCH USERS..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-gaming text-white focus:border-sky-500 outline-none"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                <div key={u.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-sky-500/30 transition-all shadow-inner">
                  <div className="min-w-0 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-sky-400 border border-slate-800 flex-shrink-0">{u.name[0]}</div>
                    <div className="truncate">
                      <p className="text-white text-xs font-black uppercase tracking-tight truncate">{u.name}</p>
                      <p className="text-slate-500 text-[8px] font-mono truncate">{u.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-900 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right flex-1">
                      {editingBalance?.email === u.email ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-[11px] font-gaming outline-none focus:border-sky-500"
                            value={editingBalance.value}
                            onChange={(e) => setEditingBalance({...editingBalance, value: e.target.value})}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveBalance(u.email)}
                          />
                          <button onClick={() => handleSaveBalance(u.email)} className="text-green-500 hover:text-green-400"><i className="fas fa-check"></i></button>
                          <button onClick={() => setEditingBalance(null)} className="text-red-500 hover:text-red-400"><i className="fas fa-times"></i></button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-green-500 font-gaming text-[13px] font-black">{u.balance.toFixed(0)} DH</p>
                          <button 
                            onClick={() => setEditingBalance({email: u.email, value: u.balance.toString()})}
                            className="text-[8px] font-gaming text-sky-500 uppercase tracking-widest mt-1 hover:text-sky-400 transition-all underline decoration-sky-500/30 underline-offset-2"
                          >
                            Update Balance
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-sky-500 transition-all flex items-center justify-center shadow-lg"
                        title="View Details"
                      >
                        <i className="fas fa-id-card"></i>
                      </button>
                      <button 
                        onClick={() => {
                          setChatFilterEmail(u.email);
                          setActiveTab('chat');
                        }}
                        className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-sky-400 hover:border-sky-500 transition-all flex items-center justify-center shadow-lg"
                        title="Open Chat"
                      >
                        <i className="fas fa-comment-dots"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6 animate-fade-in flex flex-col h-full max-h-[700px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <h3 className="text-white font-gaming text-sm uppercase tracking-widest">Global Comms Hub</h3>
              <div className="relative w-full sm:w-80">
                <input 
                  type="text" 
                  placeholder="FILTER BY EMAIL OR CONTENT..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-10 py-3 text-[10px] font-gaming text-white focus:border-sky-500 outline-none"
                  value={chatFilterEmail}
                  onChange={e => setChatFilterEmail(e.target.value)}
                />
                <i className="fas fa-filter text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 text-[10px]" />
                {chatFilterEmail && (
                  <button 
                    onClick={() => setChatFilterEmail('')} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar">
              {Object.keys(messageThreads)
                .filter(email => !chatFilterEmail || email.toLowerCase().includes(chatFilterEmail.toLowerCase()))
                .sort((a, b) => {
                  const lastA = messageThreads[a][messageThreads[a].length - 1].timestamp;
                  const lastB = messageThreads[b][messageThreads[b].length - 1].timestamp;
                  return new Date(lastB).getTime() - new Date(lastA).getTime();
                })
                .map(email => (
                <div key={email} className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-900">
                    <div>
                      <h4 className="text-sky-400 font-gaming text-xs uppercase tracking-[0.2em] font-black">{email}</h4>
                      <p className="text-slate-600 text-[8px] font-mono mt-1">UPLINK CHANNEL ACTIVE</p>
                    </div>
                    <span className="text-slate-700 text-[8px] font-gaming uppercase tracking-widest">{messageThreads[email].length} Messages</span>
                  </div>

                  <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-4 no-scrollbar">
                    {messageThreads[email].map(msg => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-xl text-[10px] leading-relaxed shadow-lg ${
                          msg.isAdmin ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}>
                          <p className="font-bold">{msg.text.replace(/\[To: .*?\]/, '').trim()}</p>
                          <p className="text-[7px] opacity-40 mt-1.5 font-mono text-right">{new Date(msg.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-auto">
                    <input 
                      type="text" 
                      placeholder="TRANSMIT SECURE REPLY..." 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-[10px] text-white outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-700 shadow-inner"
                      value={replyText[email] || ''}
                      onChange={e => setReplyText({ ...replyText, [email]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleSendAdminReply(email)}
                    />
                    <button 
                      onClick={() => handleSendAdminReply(email)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-500 text-slate-950 rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-sky-400"
                    >
                      <i className="fas fa-paper-plane text-[10px]"></i>
                    </button>
                  </div>
                </div>
              ))}

              {Object.keys(messageThreads).length === 0 && (
                <div className="py-32 text-center opacity-20">
                  <i className="fas fa-comments text-5xl mb-6"></i>
                  <p className="font-gaming text-xs uppercase tracking-widest">No communications recorded</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
             <h3 className="text-white font-gaming text-sm uppercase tracking-widest mb-6">Recent Transmissions</h3>
             {orders.map(o => (
               <div key={o.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-sky-500/20 transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <p className="text-sky-400 font-mono text-[9px] uppercase tracking-widest">#{o.id}</p>
                      <p className="text-white text-[11px] font-black">{o.firstName} {o.lastName}</p>
                      <p className="text-slate-500 text-[8px] uppercase tracking-widest">{o.date}</p>
                    </div>
                    <div className="text-right">
                      <select 
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className="bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-gaming text-sky-400 uppercase p-1.5 focus:outline-none focus:border-sky-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Payment Verifying">Verifying</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <p className="text-white font-gaming text-xs mt-2">{o.totalAmount.toFixed(0)} DH</p>
                    </div>
                 </div>
                 <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                    <p className="text-slate-400 text-[9px] uppercase tracking-widest leading-relaxed">Assets: {o.productBought}</p>
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-gaming text-sm uppercase tracking-widest">Asset Repository</h3>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', price: 0, category: 'Games', stock: 10, description: '', features: [], image: '' });
                  setIsProductModalOpen(true);
                }}
                className="bg-sky-500 text-white font-gaming px-6 py-2 rounded-xl text-[10px] uppercase font-black hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
              >
                + New Asset
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4 group hover:border-sky-500/30 transition-all">
                  <img src={p.image} className="w-16 h-16 object-cover rounded-xl border border-slate-800" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-white text-[10px] font-black uppercase truncate">{p.name}</p>
                      <p className="text-sky-400 font-gaming text-[10px]">{p.price.toFixed(0)} DH</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm(p);
                          setIsProductModalOpen(true);
                        }}
                        className="text-[8px] font-gaming text-slate-500 hover:text-sky-400 uppercase underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { if(confirm('Delete Asset?')) onDeleteProduct(p.id); }}
                        className="text-[8px] font-gaming text-red-500/50 hover:text-red-500 uppercase underline"
                      >
                        Purge
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] shadow-inner">
               <h3 className="text-white font-gaming text-sm uppercase tracking-widest mb-6">Forge Coupon</h3>
               <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    placeholder="PROTOCOL CODE" 
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white font-gaming text-xs uppercase focus:border-sky-500 outline-none"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                  />
                  <input 
                    type="number"
                    placeholder="DISCOUNT %" 
                    className="w-full sm:w-32 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white font-gaming text-xs focus:border-sky-500 outline-none"
                    value={couponDiscount || ''}
                    onChange={e => setCouponDiscount(parseInt(e.target.value))}
                  />
                  <button 
                    onClick={handleCreateCoupon}
                    className="bg-indigo-500 text-white font-gaming px-8 py-3 rounded-xl text-xs uppercase font-black hover:bg-indigo-400 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Forge
                  </button>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-white font-gaming text-sm uppercase tracking-widest px-2">Active Protocols</h3>
               {promoCodes.map(promo => (
                 <div key={promo.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center group">
                    <div>
                      <span className="text-sky-400 font-gaming text-sm uppercase tracking-widest font-black">{promo.code}</span>
                      <span className="ml-4 text-green-500 font-gaming text-xs">-{promo.discount}%</span>
                    </div>
                    <button 
                      onClick={() => onDeletePromoCode(promo.id)}
                      className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center text-slate-700 group-hover:text-red-500 group-hover:border-red-500/30 transition-all"
                    >
                      <i className="far fa-trash-alt"></i>
                    </button>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedUser(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-lg w-full p-8 sm:p-12 relative animate-scale-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
            <h2 className="text-xl font-gaming font-black text-white uppercase mb-8">Personnel Dossier</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <p className="text-[9px] font-gaming text-slate-500 uppercase mb-2 tracking-widest">Pilot Credentials</p>
                <p className="text-white text-sm font-bold">{selectedUser.name}</p>
                <p className="text-sky-400 font-mono text-xs">{selectedUser.email}</p>
                <p className="text-slate-400 font-mono text-xs mt-3 flex items-center gap-2">
                  <i className="fas fa-lock text-[10px]"></i> {(selectedUser as any).password || 'N/A'}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <p className="text-[9px] font-gaming text-slate-500 uppercase mb-4 tracking-widest">Order Logs</p>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                  {orders.filter(o => o.email.toLowerCase() === selectedUser.email.toLowerCase()).map(o => (
                    <div key={o.id} className="flex justify-between items-center text-[10px] border-b border-slate-900 pb-2">
                      <span className="text-slate-400 uppercase font-gaming">#{o.id}</span>
                      <span className="text-white font-bold">{o.totalAmount} DH</span>
                    </div>
                  ))}
                  {orders.filter(o => o.email.toLowerCase() === selectedUser.email.toLowerCase()).length === 0 && (
                    <p className="text-slate-700 text-[10px] uppercase font-gaming text-center py-4">No commands recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setIsProductModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 sm:p-12 relative animate-scale-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsProductModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
            <h2 className="text-xl font-gaming font-black text-white uppercase mb-8">{editingProduct ? 'Update Asset' : 'Register New Asset'}</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-gaming text-slate-500 uppercase mb-2 ml-2 block">Name</label>
                  <input className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-gaming text-slate-500 uppercase mb-2 ml-2 block">Price (DH)</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" value={productForm.price || ''} onChange={e=>setProductForm({...productForm, price: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-gaming text-slate-500 uppercase mb-2 ml-2 block">Asset Visual (URL or Upload)</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-[10px] font-mono outline-none focus:border-sky-500" placeholder="https://image-uplink.net/..." value={productForm.image} onChange={e=>setProductForm({...productForm, image: e.target.value})} />
                  <label className="cursor-pointer bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white transition-all text-xs">
                    <i className="fas fa-upload mr-2"></i> File
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-gaming text-slate-500 uppercase mb-2 ml-2 block">Classification</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs font-bold outline-none focus:border-sky-500" value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value as Category})}>
                   <option value="Games">Games</option>
                   <option value="Accounts">Accounts</option>
                   <option value="Gift Cards">Gift Cards</option>
                   <option value="Subscriptions">Subscriptions</option>
                   <option value="Currency">Currency</option>
                   <option value="Items">Items</option>
                   <option value="Software">Software</option>
                   <option value="Keys">Keys</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-gaming text-slate-500 uppercase mb-2 ml-2 block">Dossier Description</label>
                <textarea rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-white text-xs font-bold outline-none focus:border-sky-500 resize-none" value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} />
              </div>

              <button 
                onClick={saveProduct}
                className="w-full bg-sky-500 text-white font-gaming py-5 rounded-2xl uppercase tracking-[0.3em] font-black shadow-lg shadow-sky-500/20 active:scale-95 transition-all mt-4"
              >
                {editingProduct ? 'Confirm Update' : 'Initialize Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
         <p className="text-[8px] font-gaming text-slate-700 uppercase tracking-widest flex items-center justify-center gap-3">
           <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
           MoonNight Admin Core v4.2.0 - Terminal Secure
         </p>
      </div>
    </div>
  );
};

export default Admin;
