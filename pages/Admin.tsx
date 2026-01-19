
import React, { useState, useMemo } from 'react';
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
  
  const [userSearch, setUserSearch] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [editingBalance, setEditingBalance] = useState<{email: string, value: string} | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', price: 0, category: 'Games', stock: 10, description: '', features: [], image: '', 
    brand: '', usp: '', fullAccess: '', itemsAmount: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fouad12jad1///') setIsAuthenticated(true);
    else alert('Invalid Authorization Key');
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm(product);
    } else {
      setEditingProduct(null);
      setProductForm({ 
        name: '', price: 0, category: 'Games', stock: 10, description: '', features: [], image: '', 
        brand: '', usp: '', fullAccess: 'YES', itemsAmount: '' 
      });
    }
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = { ...productForm, id: editingProduct ? editingProduct.id : Date.now().toString() } as Product;
    if (editingProduct) onUpdateProduct(p);
    else onAddProduct(p);
    setIsProductModalOpen(false);
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
        <div className="bg-white border border-slate-200 p-12 rounded-[3rem] shadow-2xl">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-lg">
            <span className="text-white font-gaming font-black text-2xl">M</span>
          </div>
          <h1 className="text-xl font-gaming font-black text-slate-900 mb-10 uppercase tracking-widest">ADMIN PORTAL</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="SECRET KEY" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-5 text-slate-900 text-center focus:border-blue-700 outline-none text-lg font-gaming shadow-sm" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-blue-700 text-white font-gaming py-5 rounded-2xl tracking-widest font-black uppercase text-xs shadow-xl shadow-blue-200">AUTHORIZE ACCESS</button>
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
    { id: 'chat', label: 'SUPPORT', icon: 'comments' },
    { id: 'marketing', label: 'COUPONS', icon: 'ticket-alt' },
    { id: 'audit', label: 'TELEMETRY', icon: 'shield-alt' },
  ];

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-8 animate-fade-in">
      <div className="flex overflow-x-auto gap-3 no-scrollbar mb-10 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 px-8 py-4 rounded-2xl font-gaming text-[11px] uppercase font-black transition-all border whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-700 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'
            }`}
          >
            <i className={`fas fa-${tab.icon} mr-3`}></i>{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 sm:p-14 shadow-2xl min-h-[600px]">
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-gaming font-black text-slate-900 uppercase">Product Library</h2>
              <button onClick={() => openProductModal()} className="bg-blue-700 text-white px-6 py-3 rounded-xl text-[10px] font-gaming font-black uppercase shadow-lg shadow-blue-100">Add Entry</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">Product</th>
                    <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">Specs</th>
                    <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">Price</th>
                    <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-slate-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="font-bold">{p.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[9px] text-slate-400 font-mono uppercase">
                          {p.brand || 'No Brand'} | {p.itemsAmount || 'N/A'} Amt
                        </div>
                      </td>
                      <td className="py-4 px-6 font-black">{p.price} DH</td>
                      <td className="py-4 px-6">
                        <button onClick={() => openProductModal(p)} className="text-blue-600 font-bold mr-4">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal for Adding/Editing Product with Spec Fields */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] max-w-2xl w-full p-8 sm:p-12 relative animate-slide-up my-auto">
              <h2 className="text-2xl font-gaming font-black text-slate-900 mb-8 uppercase">Product Registry</h2>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                  <input className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Base Price (DH)</label>
                  <input type="number" className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.price} onChange={e=>setProductForm({...productForm, price: parseFloat(e.target.value)})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Brand</label>
                  <input className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.brand} onChange={e=>setProductForm({...productForm, brand: e.target.value})} placeholder="e.g. Fortnite" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">USP</label>
                  <input className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.usp} onChange={e=>setProductForm({...productForm, usp: e.target.value})} placeholder="High Quantity" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Access Status</label>
                  <input className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.fullAccess} onChange={e=>setProductForm({...productForm, fullAccess: e.target.value})} placeholder="YES" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Items/Currency Amount</label>
                  <input className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.itemsAmount} onChange={e=>setProductForm({...productForm, itemsAmount: e.target.value})} placeholder="e.g. 5000" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Count</label>
                  <input type="number" className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: parseInt(e.target.value)})} required />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL</label>
                  <input className="w-full border p-3 rounded-xl bg-slate-50" value={productForm.image} onChange={e=>setProductForm({...productForm, image: e.target.value})} required />
                </div>
                <div className="sm:col-span-2 flex space-x-4 pt-4">
                  <button type="button" onClick={()=>setIsProductModalOpen(false)} className="flex-1 border p-4 rounded-xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 bg-blue-700 text-white p-4 rounded-xl font-black uppercase">Save Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-gaming text-slate-400 uppercase mb-4 tracking-widest font-black">Gross Revenue</p>
               <p className="text-4xl font-gaming text-blue-700 font-black">{orders.reduce((a,c)=>a+c.totalAmount,0).toFixed(0)} <span className="text-xs">DH</span></p>
            </div>
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-gaming text-slate-400 uppercase mb-4 tracking-widest font-black">Deliveries</p>
               <p className="text-4xl font-gaming text-blue-600 font-black">{orders.length}</p>
            </div>
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-gaming text-slate-400 uppercase mb-4 tracking-widest font-black">Users</p>
               <p className="text-4xl font-gaming text-indigo-700 font-black">{users.length}</p>
            </div>
          </div>
        )}

        {/* User Search & Balance Logic */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="relative">
              <input type="text" placeholder="QUERY DATABASE BY EMAIL..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-10 py-5 text-[12px] font-gaming text-slate-900 shadow-sm focus:border-blue-700 outline-none" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                     <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">User Info</th>
                     <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">Balance (DH)</th>
                     <th className="py-4 px-6 text-[10px] font-gaming text-slate-400 uppercase">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {users.filter(u => u.email.includes(userSearch)).map(u => (
                     <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                       <td className="py-4 px-6">
                         <div className="font-bold text-slate-900">{u.name}</div>
                         <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                       </td>
                       <td className="py-4 px-6">
                         {editingBalance?.email === u.email ? (
                           <input type="number" className="w-24 bg-white border border-blue-600 rounded-lg px-2 py-1 text-slate-900 text-sm font-black" value={editingBalance.value} onChange={e=>setEditingBalance({...editingBalance, value:e.target.value})} onBlur={()=>handleSaveBalance(u.email)} autoFocus />
                         ) : (
                           <span className="text-blue-700 font-black cursor-pointer hover:underline" onClick={()=>setEditingBalance({email:u.email, value:u.balance.toString()})}>{u.balance.toFixed(0)} DH</span>
                         )}
                       </td>
                       <td className="py-4 px-6">
                         <button className="text-[10px] font-gaming text-blue-600 font-black hover:underline uppercase">LOGS</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
