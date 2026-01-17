
import React, { useState, useMemo } from 'react';
import { Product, Order, OrderStatus, SupportTicket, TicketStatus, PromoCode, ChatMessage, Category, User } from '../types';

interface AdminProps {
  products: Product[];
  orders: Order[];
  tickets: SupportTicket[];
  promoCodes: PromoCode[];
  messages: ChatMessage[];
  users: User[];
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
}

const Admin: React.FC<AdminProps> = ({ 
  products, orders, tickets, promoCodes, messages, users,
  onUpdateUserBalance, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateOrderStatus, 
  onUpdateTicketStatus, onDeleteTicket, onAddPromoCode, onDeletePromoCode,
  onAdminReply
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'catalog' | 'orders' | 'marketing' | 'support' | 'chat' | 'users'>('stats');
  
  // Catalogue Management States
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', price: 0, originalPrice: 0, category: 'Games', stock: 10, description: '', features: [], image: ''
  });

  const [newPromo, setNewPromo] = useState({ code: '', discount: 10 });
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  // Notification logic: Check for unread messages (simulated as messages where isAdmin is false)
  const usersWithNewMessages = useMemo(() => {
    const userEmails = users.map(u => u.email.toLowerCase());
    return userEmails.filter(email => {
      const thread = messages.filter(m => m.senderEmail.toLowerCase() === email || m.text.includes(`[To: ${email}]`));
      if (thread.length === 0) return false;
      return !thread[thread.length - 1].isAdmin; // Last message in thread is from user
    });
  }, [messages, users]);

  const hasAnyUnreadMessages = usersWithNewMessages.length > 0;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fouad12jad1///') {
      setIsAuthenticated(true);
    } else {
      alert('Code d\'accès invalide');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetProductForm = () => {
    setProductForm({ name: '', price: 0, originalPrice: 0, category: 'Games', stock: 10, description: '', features: [], image: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      ...productForm as Product,
      id: isEditing ? editingId! : Math.random().toString(36).substr(2, 9).toUpperCase(),
      rating: 5.0,
      features: typeof productForm.features === 'string' 
        ? (productForm.features as string).split(',').map(s => s.trim()) 
        : productForm.features || []
    };

    if (isEditing) onUpdateProduct(product);
    else onAddProduct(product);
    
    resetProductForm();
    alert(isEditing ? 'Asset Updated!' : 'Asset Deployed!');
  };

  const startEdit = (p: Product) => {
    setProductForm({ ...p, features: p.features.join(', ') as any });
    setEditingId(p.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-48 pb-24 max-w-lg mx-auto px-6">
        <div className="bg-slate-900 border-4 border-slate-800 p-16 rounded-[4rem] text-center shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          <h1 className="text-4xl font-gaming font-black text-white mb-12 uppercase tracking-[0.3em] leading-tight">ADMIN<br/>TERMINAL</h1>
          <form onSubmit={handleLogin} className="space-y-8">
            <input 
              type="password" 
              placeholder="ENCRYPTION KEY" 
              className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2rem] px-8 py-6 text-white text-center focus:border-sky-500 outline-none text-2xl font-gaming" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-sky-500 text-white font-gaming py-7 rounded-[2rem] tracking-[0.4em] font-black uppercase text-base hover:bg-sky-600 transition-all shadow-2xl shadow-sky-500/30">INITIALIZE ACCESS</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'stats':
        return (
          <div className="animate-fade-in space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-slate-950 border-4 border-slate-800 p-12 rounded-[3rem] shadow-2xl">
                <p className="text-slate-500 text-base font-gaming uppercase mb-6 tracking-widest font-black">Total Revenue</p>
                <p className="text-6xl font-gaming font-black text-green-400">{orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(0)} <span className="text-2xl opacity-50">DH</span></p>
              </div>
              <div className="bg-slate-950 border-4 border-slate-800 p-12 rounded-[3rem] shadow-2xl">
                <p className="text-slate-500 text-base font-gaming uppercase mb-6 tracking-widest font-black">Successful Orders</p>
                <p className="text-6xl font-gaming font-black text-sky-400">{orders.length}</p>
              </div>
              <div className="bg-slate-950 border-4 border-slate-800 p-12 rounded-[3rem] shadow-2xl">
                <p className="text-slate-500 text-base font-gaming uppercase mb-6 tracking-widest font-black">Active Pilots</p>
                <p className="text-6xl font-gaming font-black text-indigo-400">{users.length}</p>
              </div>
            </div>
          </div>
        );

      case 'catalog':
        return (
          <div className="animate-fade-in space-y-16">
            {/* Expanded Add/Edit Product Interface */}
            <div className="bg-slate-950 border-4 border-slate-800 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-purple-500 to-sky-500"></div>
              <h3 className="text-white font-gaming text-3xl uppercase mb-10 border-b-4 border-slate-800 pb-6 font-black tracking-widest">
                {isEditing ? 'REPROGRAM ASSET' : 'DEPLOY NEW ASSET'}
              </h3>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="text-sm font-gaming text-slate-500 uppercase tracking-widest mb-4 block font-black">Product Name</label>
                    <input placeholder="Asset Identifier" className="w-full bg-slate-900 border-4 border-slate-800 rounded-[2rem] px-8 py-5 text-white text-xl focus:border-sky-500 outline-none transition-all font-bold" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-sm font-gaming text-slate-500 uppercase tracking-widest mb-4 block font-black">Price (DH)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-900 border-4 border-slate-800 rounded-[2rem] px-8 py-5 text-white text-xl focus:border-sky-500 outline-none font-bold" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} required />
                    </div>
                    <div>
                      <label className="text-sm font-gaming text-slate-500 uppercase tracking-widest mb-4 block font-black">Old Price</label>
                      <input type="number" step="0.01" className="w-full bg-slate-900 border-4 border-slate-800 rounded-[2rem] px-8 py-5 text-white text-xl focus:border-sky-500 outline-none font-bold" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-gaming text-slate-500 uppercase tracking-widest mb-4 block font-black">Asset Category</label>
                    <select className="w-full bg-slate-900 border-4 border-slate-800 rounded-[2rem] px-8 py-5 text-white text-xl font-gaming uppercase focus:border-sky-500 outline-none cursor-pointer" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as Category})}>
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
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="text-sm font-gaming text-slate-500 uppercase tracking-widest mb-4 block font-black">Visual Identification</label>
                    <div className="flex flex-col space-y-6">
                      <input placeholder="ASSET URL" className="w-full bg-slate-900 border-4 border-slate-800 rounded-[2rem] px-8 py-5 text-white text-base focus:border-sky-500 outline-none" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                      <div className="flex items-center space-x-6 bg-slate-900 border-4 border-dashed border-slate-800 p-8 rounded-[2rem]">
                        <span className="text-xs font-gaming text-slate-500 uppercase font-black">PHOTO UPLOAD:</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-400 file:mr-6 file:py-3 file:px-8 file:rounded-full file:border-0 file:text-xs file:font-gaming file:font-black file:bg-sky-500 file:text-white hover:file:bg-sky-600 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  {productForm.image && (
                    <div className="h-56 w-full rounded-[2.5rem] overflow-hidden border-4 border-slate-800 shadow-xl group relative">
                      <img src={productForm.image} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-sky-500/20 mix-blend-overlay"></div>
                    </div>
                  )}
                  <div className="flex gap-6 pt-6">
                    <button type="button" onClick={resetProductForm} className="flex-1 bg-slate-800 text-slate-400 py-6 rounded-[2rem] font-gaming text-sm uppercase font-black hover:bg-slate-700 transition-all">ABORT</button>
                    <button type="submit" className="flex-[2] bg-sky-500 text-white py-6 rounded-[2rem] font-gaming text-sm uppercase tracking-[0.3em] font-black shadow-2xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all">
                      {isEditing ? 'UPDATE MASTER' : 'DEPLOY ASSET'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="grid grid-cols-1 gap-10">
              {products.map(p => (
                <div key={p.id} className="bg-slate-950 border-4 border-slate-800 p-10 rounded-[4rem] flex flex-col md:flex-row items-center justify-between group hover:border-sky-500/50 transition-all shadow-xl">
                  <div className="flex items-center space-x-10 w-full">
                    <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-900 flex-shrink-0 relative">
                      <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                    </div>
                    <div>
                      <h4 className="text-white text-3xl font-black mb-3">{p.name}</h4>
                      <div className="flex items-center space-x-10">
                        <span className="text-sky-400 font-gaming text-2xl font-black">{p.price.toFixed(2)} DH</span>
                        <span className="text-slate-600 font-gaming uppercase tracking-[0.2em] font-bold text-sm">{p.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-6 mt-8 md:mt-0">
                    <button onClick={() => startEdit(p)} className="w-20 h-20 bg-slate-900 border-4 border-slate-800 text-sky-400 rounded-3xl hover:bg-sky-500 hover:text-white transition-all text-2xl shadow-lg"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDeleteProduct(p.id)} className="w-20 h-20 bg-slate-900 border-4 border-slate-800 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all text-2xl shadow-lg"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="animate-fade-in space-y-10">
            {users.map(u => {
              const hasNewMsg = usersWithNewMessages.includes(u.email.toLowerCase());
              return (
                <div key={u.id} className="bg-slate-950 border-4 border-slate-800 p-12 rounded-[4rem] flex flex-col xl:flex-row xl:items-center justify-between gap-12 shadow-2xl group hover:border-sky-500/30 transition-all relative overflow-hidden">
                  {hasNewMsg && <div className="absolute top-0 left-0 w-3 h-full bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.8)]"></div>}
                  
                  <div className="flex items-center space-x-10 relative">
                    <div className="w-32 h-32 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center text-sky-400 text-5xl font-gaming font-black shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
                      {u.name?.charAt(0) || 'U'}
                    </div>
                    {hasNewMsg && (
                      <span className="absolute -top-4 -left-4 w-12 h-12 bg-sky-500 rounded-full border-4 border-slate-950 notification-dot flex items-center justify-center">
                        <i className="fas fa-comment text-white text-lg"></i>
                      </span>
                    )}
                    <div>
                      <h4 className="text-white text-3xl font-black mb-3">{u.name}</h4>
                      <p className="text-slate-500 text-base font-gaming uppercase tracking-[0.2em] font-bold">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-12 xl:gap-20">
                    <div className="text-center sm:text-right">
                      <p className="text-slate-500 text-xs font-gaming uppercase tracking-widest mb-4 font-black">SOLDE BALANCE</p>
                      <p className="text-5xl font-gaming font-black text-green-400">{u.balance.toFixed(2)} <span className="text-xl">DH</span></p>
                    </div>
                    <div className="flex flex-col space-y-4 w-full sm:w-auto">
                      <button 
                        onClick={() => {
                          setSelectedUserEmail(u.email);
                          setActiveTab('chat');
                        }}
                        className="flex items-center justify-center space-x-4 bg-sky-500/10 border-4 border-sky-500/30 text-sky-400 px-10 py-5 rounded-[2rem] font-gaming text-xs uppercase font-black hover:bg-sky-500 hover:text-white transition-all shadow-xl"
                      >
                        <i className="fas fa-paper-plane text-xl"></i>
                        <span>CONTACT PILOT</span>
                      </button>
                      <button 
                        onClick={() => {
                          const amount = prompt(`Assign new credits for ${u.name}:`, u.balance.toString());
                          if(amount !== null) onUpdateUserBalance(u.email, parseFloat(amount));
                        }}
                        className="bg-slate-900 border-4 border-slate-800 p-5 rounded-[2rem] text-slate-400 font-gaming text-[10px] uppercase font-black hover:text-white hover:bg-slate-800 transition-all"
                      >
                        <i className="fas fa-wallet mr-3"></i> RE-CHARGE SOLDE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'chat':
        return (
          <div className="animate-fade-in flex flex-col h-[850px] bg-slate-950 border-4 border-slate-800 rounded-[4rem] overflow-hidden shadow-2xl">
            <div className="p-12 border-b-4 border-slate-900 flex justify-between items-center bg-slate-900/40">
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border-2 border-sky-500/20">
                    <i className="fas fa-satellite text-3xl text-sky-500"></i>
                 </div>
                 <div>
                    <h3 className="text-white font-gaming text-2xl uppercase font-black tracking-[0.2em]">COMMS COMMAND</h3>
                    <p className="text-slate-500 text-xs font-gaming uppercase mt-2 font-bold">{selectedUserEmail ? `LINKED TO: ${selectedUserEmail}` : 'MONITORING ALL CHANNELS'}</p>
                 </div>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
                 <span className="text-green-500 font-gaming text-base font-black uppercase tracking-widest">TRANSMITTING</span>
              </div>
            </div>
            
            <div className="flex-1 p-12 overflow-y-auto space-y-10 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-40 opacity-10">
                   <i className="fas fa-comments text-9xl mb-12"></i>
                   <p className="font-gaming text-4xl uppercase tracking-[0.5em] font-black">NO SIGNAL</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isForSelected = !selectedUserEmail || msg.senderEmail.toLowerCase() === selectedUserEmail.toLowerCase() || msg.text.includes(`[To: ${selectedUserEmail}]`);
                  if (!isForSelected) return null;
                  
                  return (
                    <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-8 rounded-[2.5rem] relative ${
                        msg.isAdmin 
                          ? 'bg-sky-500 text-white rounded-tr-none shadow-2xl shadow-sky-500/30' 
                          : 'bg-slate-900 text-slate-300 rounded-tl-none border-4 border-slate-800'
                      }`}>
                        {!msg.isAdmin && <p className="text-xs font-gaming uppercase text-sky-400 mb-4 font-black">{msg.senderName} — EXTERNAL PILOT</p>}
                        <p className="text-xl leading-relaxed font-bold">{msg.text.replace(`[To: ${msg.senderEmail}]`, '')}</p>
                        <span className={`text-[12px] font-gaming mt-6 block opacity-50 uppercase tracking-widest ${msg.isAdmin ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem('reply') as HTMLInputElement;
                const text = input.value;
                const email = selectedUserEmail || prompt("Target Pilot Email Address:");
                if (email && text) {
                  onAdminReply(email, text);
                  input.value = '';
                }
              }} 
              className="p-12 bg-slate-900/30 border-t-4 border-slate-900 flex gap-8"
            >
              <input 
                name="reply"
                type="text" 
                placeholder="ENCRYPT MESSAGE FOR TRANSMISSION..." 
                className="flex-1 bg-slate-950 border-4 border-slate-800 rounded-[2rem] px-10 py-6 text-white text-xl focus:border-sky-500 outline-none font-bold"
              />
              <button className="bg-sky-500 text-white px-12 rounded-[2rem] font-gaming font-black uppercase tracking-[0.4em] text-base shadow-2xl shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all">SEND</button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-48 pb-24 max-w-[1700px] mx-auto px-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-20">
        {/* Navigation Sidebar */}
        <div className="lg:w-96 space-y-8 flex-shrink-0">
          {[
            { id: 'stats', label: 'DASHBOARD', icon: 'chart-pie' },
            { id: 'catalog', label: 'CATALOGUE', icon: 'folder-open' },
            { id: 'orders', label: 'COMMANDES', icon: 'truck-fast' },
            { id: 'marketing', label: 'PROMOS', icon: 'bolt' },
            { id: 'users', label: 'CLIENTS', icon: 'users-gear' },
            { id: 'support', label: 'TICKETS', icon: 'headset' },
            { id: 'chat', label: 'LIVE COMMS', icon: 'message' },
          ].map(tab => {
            const hasTabUnread = (tab.id === 'chat' || tab.id === 'users') && hasAnyUnreadMessages;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id !== 'chat') setSelectedUserEmail(null);
                }}
                className={`w-full flex items-center justify-between px-10 py-8 rounded-[3rem] font-gaming text-base uppercase tracking-[0.3em] font-black transition-all transform active:scale-95 group ${
                  activeTab === tab.id 
                    ? 'bg-sky-500 text-white shadow-[0_25px_60px_rgba(14,165,233,0.4)] translate-x-6' 
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-6">
                  <i className={`fas fa-${tab.icon} text-3xl ${activeTab === tab.id ? 'text-white' : 'text-slate-700 group-hover:text-sky-500'} transition-colors`}></i>
                  <span>{tab.label}</span>
                </div>
                {hasTabUnread && (
                  <span className="w-5 h-5 bg-sky-400 rounded-full border-4 border-slate-950 notification-dot shadow-[0_0_10px_rgba(56,189,248,0.8)]"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 min-w-0 bg-slate-900 border-4 border-slate-800 rounded-[5rem] p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col min-h-[900px]">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sky-500/5 blur-[200px] -mr-96 -mt-96 rounded-full"></div>
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-20 border-b-4 border-slate-800 pb-12">
                <h2 className="text-5xl font-gaming font-black text-white uppercase tracking-[0.3em]">{activeTab} TERMINAL</h2>
                <div className="flex items-center space-x-6">
                   <div className="w-5 h-5 bg-sky-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(14,165,233,1)]"></div>
                   <span className="text-sky-400 text-sm font-gaming font-black uppercase tracking-[0.4em]">ENCRYPTED UPLINK ACTIVE</span>
                </div>
             </div>
             
             {renderContent()}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
