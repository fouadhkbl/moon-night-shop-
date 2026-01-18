
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
  
  const [userSearch, setUserSearch] = useState('');
  const [chatFilterEmail, setChatFilterEmail] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [editingBalance, setEditingBalance] = useState<{email: string, value: string} | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', price: 0, category: 'Games', stock: 10, description: '', features: [], image: ''
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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
    if (editingProduct) onUpdateProduct({ ...editingProduct, ...productForm } as Product);
    else onAddProduct({ ...productForm, id: Math.random().toString(36).substr(2, 9), rating: 5.0 } as Product);
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleCreateCoupon = () => {
    if (!couponCode || couponDiscount <= 0) return alert('Enter valid code and percentage');
    onAddPromoCode({ id: Date.now().toString(), code: couponCode.toUpperCase(), discount: couponDiscount });
    setCouponCode('');
    setCouponDiscount(0);
  };

  const handleSaveBalance = (email: string) => {
    if (editingBalance && editingBalance.email === email) {
      onUpdateUserBalance(email, parseFloat(editingBalance.value) || 0);
      setEditingBalance(null);
    }
  };

  const messageThreads = useMemo(() => {
    const threads: { [key: string]: ChatMessage[] } = {};
    messages.forEach(m => {
      let email = m.senderEmail;
      if (m.isAdmin) {
        const match = m.text.match(/\[To: (.*?)\]/);
        if (match) email = match[1];
      }
      if (email) {
        if (!threads[email]) threads[email] = [];
        threads[email].push(m);
      }
    });
    return threads;
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-sm mx-auto px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2rem] shadow-2xl">
          <h1 className="text-xl font-gaming font-black text-white mb-8 uppercase tracking-widest">ADMIN TERMINAL</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="SECRET KEY" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-3 text-white text-center focus:border-sky-500 outline-none text-lg font-gaming" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl tracking-widest font-black uppercase text-xs shadow-lg">AUTHORIZE</button>
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
    { id: 'audit', label: 'GMAIL LOGS', icon: 'shield-alt' },
  ];

  return (
    <div className="pt-24 sm:pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-8 animate-fade-in">
      <div className="flex overflow-x-auto gap-2 no-scrollbar mb-8 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 px-8 py-4 rounded-xl font-gaming text-[11px] uppercase font-black transition-all border whitespace-nowrap ${
              activeTab === tab.id ? 'bg-sky-500 text-white border-sky-400 shadow-lg' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <i className={`fas fa-${tab.icon} mr-3`}></i>{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[500px]">
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h3 className="text-white font-gaming text-sm uppercase tracking-widest mb-6">Cloud Telemetry: Login History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Operator Email</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Password Key</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Origin IP</th>
                    <th className="py-4 px-4 text-[9px] font-gaming text-slate-500 uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono">
                  {activityLogs.map((log, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-950/50">
                      <td className="py-3 px-4 text-sky-400 font-bold">{log.email}</td>
                      <td className="py-3 px-4 text-slate-500">{log.password}</td>
                      <td className="py-3 px-4 text-white">{log.ip}</td>
                      <td className="py-3 px-4 text-slate-600">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
               <p className="text-[10px] font-gaming text-slate-500 uppercase mb-2">Total Volume</p>
               <p className="text-3xl font-gaming text-green-400">{orders.reduce((a,c)=>a+c.totalAmount,0).toFixed(0)} DH</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
               <p className="text-[10px] font-gaming text-slate-500 uppercase mb-2">Asset Deployments</p>
               <p className="text-3xl font-gaming text-sky-400">{orders.length}</p>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
               <p className="text-[10px] font-gaming text-slate-500 uppercase mb-2">Registered Personnel</p>
               <p className="text-3xl font-gaming text-indigo-400">{users.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <input type="text" placeholder="SEARCH DATABASE..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-gaming text-white mb-6" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            {users.filter(u => u.email.includes(userSearch)).map(u => (
              <div key={u.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-white text-xs font-black uppercase">{u.name}</p>
                  <p className="text-slate-500 text-[8px] font-mono">{u.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {editingBalance?.email === u.email ? (
                      <input type="number" className="w-20 bg-slate-900 border border-sky-500 rounded px-2 py-1 text-white text-[11px]" value={editingBalance.value} onChange={e=>setEditingBalance({...editingBalance, value:e.target.value})} onBlur={()=>handleSaveBalance(u.email)} autoFocus />
                    ) : (
                      <p className="text-green-500 font-gaming text-sm cursor-pointer" onClick={()=>setEditingBalance({email:u.email, value:u.balance.toString()})}>{u.balance.toFixed(0)} DH</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
             {orders.map(o => (
               <div key={o.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sky-400 font-mono text-[9px]">#{o.id}</p>
                      <p className="text-white text-[11px] font-black">{o.firstName} {o.lastName}</p>
                    </div>
                    <select value={o.status} onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)} className="bg-slate-900 border border-slate-800 rounded p-1 text-[9px] text-sky-400">
                      <option value="Pending">Pending</option>
                      <option value="Payment Verifying">Verifying</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                 </div>
                 <p className="text-slate-500 text-[9px] mt-2 uppercase">{o.productBought}</p>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <button onClick={() => setIsProductModalOpen(true)} className="bg-sky-500 text-white font-gaming px-6 py-2 rounded-xl text-[10px] uppercase font-black">+ Add Asset</button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex gap-4">
                  <img src={p.image} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-white text-[10px] font-black uppercase truncate">{p.name}</p>
                    <p className="text-sky-400 font-gaming text-[9px]">{p.price.toFixed(0)} DH</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-8">
            {Object.keys(messageThreads).map(email => (
              <div key={email} className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-sky-400 font-gaming text-xs uppercase mb-4">{email}</h4>
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2">
                  {messageThreads[email].map((m, i) => (
                    <p key={i} className={`text-[10px] p-2 rounded-lg ${m.isAdmin ? 'bg-indigo-500/10 text-indigo-400 text-right' : 'bg-slate-900 text-slate-300'}`}>{m.text}</p>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="REPLY..." className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 text-[10px] text-white outline-none" value={replyText[email] || ''} onChange={e => setReplyText({...replyText, [email]: e.target.value})} />
                  <button onClick={() => { onAdminReply(email, replyText[email]); setReplyText({...replyText, [email]: ''}); }} className="bg-sky-500 px-4 py-2 rounded-lg"><i className="fas fa-paper-plane text-slate-950"></i></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-8">
             <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <input placeholder="PROTOCOL CODE" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-gaming text-xs mr-4" value={couponCode} onChange={e=>setCouponCode(e.target.value)} />
                <input type="number" placeholder="DISCOUNT %" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-gaming text-xs mr-4" value={couponDiscount || ''} onChange={e=>setCouponDiscount(parseInt(e.target.value))} />
                <button onClick={handleCreateCoupon} className="bg-sky-500 px-6 py-2 rounded-xl text-xs font-gaming font-black text-slate-950">FORGE</button>
             </div>
             {promoCodes.map(promo => (
               <div key={promo.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between">
                  <span className="text-sky-400 font-gaming font-black">{promo.code}</span>
                  <span className="text-green-500">-{promo.discount}%</span>
               </div>
             ))}
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] max-w-lg w-full p-8 relative">
            <button onClick={() => setIsProductModalOpen(false)} className="absolute top-6 right-6 text-slate-500"><i className="fas fa-times"></i></button>
            <h2 className="text-xl font-gaming font-black text-white uppercase mb-8">Asset Forge</h2>
            <div className="space-y-4">
              <input placeholder="NAME" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs outline-none" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} />
              <input type="number" placeholder="PRICE (DH)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs outline-none" value={productForm.price || ''} onChange={e=>setProductForm({...productForm, price: parseFloat(e.target.value)})} />
              <input placeholder="IMAGE URL" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs outline-none" value={productForm.image} onChange={e=>setProductForm({...productForm, image: e.target.value})} />
              <button onClick={saveProduct} className="w-full bg-sky-500 text-slate-950 font-gaming py-4 rounded-xl uppercase font-black">INITIALIZE ASSET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
