
import React, { useState } from 'react';
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
  
  // Management State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPromo, setNewPromo] = useState({ code: '', discount: 10 });
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
    name: '', price: 0, originalPrice: 0, category: 'Games', stock: 10, description: '', features: [], image: ''
  });

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

  const resetForm = () => {
    setProductForm({ name: '', price: 0, originalPrice: 0, category: 'Games', stock: 10, description: '', features: [], image: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      ...productForm as Product,
      id: isEditing ? editingId! : Math.random().toString(36).substr(2, 9),
      rating: 5.0,
      features: typeof productForm.features === 'string' 
        ? (productForm.features as string).split(',').map(s => s.trim()) 
        : productForm.features || []
    };

    if (isEditing) {
      onUpdateProduct(product);
      alert('Produit mis à jour !');
    } else {
      onAddProduct(product);
      alert('Produit ajouté !');
    }
    resetForm();
  };

  const startEdit = (p: Product) => {
    setProductForm({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      category: p.category,
      stock: p.stock,
      description: p.description,
      features: p.features.join(', ') as any,
      image: p.image
    });
    setEditingId(p.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPromoCode({ id: Date.now().toString(), ...newPromo });
    setNewPromo({ code: '', discount: 10 });
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[60px] -mr-16 -mt-16 rounded-full"></div>
          <h1 className="text-3xl font-gaming font-bold text-white mb-8 uppercase tracking-widest relative z-10">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <input 
              type="password" 
              placeholder="Code d'accès" 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-center focus:border-sky-500 outline-none text-xl" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-sky-500 text-white font-gaming py-5 rounded-2xl tracking-[0.2em] shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all uppercase text-sm">Authorize System</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'stats':
        return (
          <div className="animate-fade-in space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <p className="text-slate-500 text-xs font-gaming uppercase mb-3 tracking-widest">Total Revenue</p>
                <p className="text-4xl font-gaming font-bold text-green-400">{orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)} DH</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <p className="text-slate-500 text-xs font-gaming uppercase mb-3 tracking-widest">Total Orders</p>
                <p className="text-4xl font-gaming font-bold text-sky-400">{orders.length}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
                <p className="text-slate-500 text-xs font-gaming uppercase mb-3 tracking-widest">Open Tickets</p>
                <p className="text-4xl font-gaming font-bold text-yellow-500">{tickets.filter(t => t.status === 'New').length}</p>
              </div>
            </div>
          </div>
        );

      case 'catalog':
        return (
          <div className="animate-fade-in space-y-12">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
              <h3 className="text-white font-gaming text-xl uppercase mb-8 border-b border-slate-800 pb-4">
                {isEditing ? 'Edit Asset' : 'Add New Asset'}
              </h3>
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Product Name</label>
                    <input placeholder="Asset Name" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Price (DH)</label>
                      <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} required />
                    </div>
                    <div>
                      <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Old Price</label>
                      <input type="number" step="0.01" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as Category})}>
                      <option value="Games">Games</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Gift Cards">Gift Cards</option>
                      <option value="Subscriptions">Subscriptions</option>
                      <option value="Currency">Currency</option>
                      <option value="Items">Items</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
                    <textarea rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Features (comma separated)</label>
                    <input placeholder="Global Key, Instant, Steam" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.features as any} onChange={e => setProductForm({...productForm, features: e.target.value as any})} />
                  </div>
                  <div>
                    <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Image Source</label>
                    <div className="space-y-3">
                      <input placeholder="Image URL" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} />
                      <div className="flex items-center space-x-4">
                        <span className="text-[10px] text-slate-500">OR UPLOAD:</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-gaming file:bg-sky-500/10 file:text-sky-500 hover:file:bg-sky-500/20" />
                      </div>
                    </div>
                  </div>
                  {productForm.image && (
                    <div className="mt-2 h-32 w-48 rounded-xl overflow-hidden border border-slate-800">
                      <img src={productForm.image} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={resetForm} className="flex-1 border border-slate-800 text-slate-400 py-3 rounded-xl font-gaming text-xs uppercase hover:bg-slate-800">Cancel</button>
                    <button type="submit" className="flex-[2] bg-sky-500 text-white py-3 rounded-xl font-gaming text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20">
                      {isEditing ? 'Save Changes' : 'Add Asset'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-sky-500/30 transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-800">
                      <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-white text-lg font-bold">{p.name}</h4>
                      <div className="flex items-center space-x-4">
                        <span className="text-sky-400 font-gaming text-xs">{p.price.toFixed(2)} DH</span>
                        <span className="text-slate-500 text-[10px] uppercase font-gaming">{p.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => startEdit(p)} 
                      className="w-12 h-12 rounded-xl border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-400/50 flex items-center justify-center transition-all"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => { if(confirm('Supprimer cet asset ?')) onDeleteProduct(p.id); }} 
                      className="w-12 h-12 rounded-xl border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/50 flex items-center justify-center transition-all"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="animate-fade-in space-y-6">
            {orders.map(o => (
              <div key={o.id} className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] space-y-6 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-900 pb-5">
                  <div>
                    <span className="text-sky-400 font-gaming text-lg font-bold">#{o.id}</span>
                    <p className="text-slate-500 text-[10px] font-gaming uppercase mt-1 tracking-widest">{o.date}</p>
                  </div>
                  <select 
                    value={o.status} 
                    onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                    className={`bg-slate-900 border border-slate-800 rounded-xl px-5 py-2 text-xs font-gaming uppercase ${o.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-1">Customer Details</p>
                    <p className="text-white text-base font-bold">{o.firstName} {o.lastName}</p>
                    <p className="text-slate-400 text-sm">{o.email}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-1">Financial Summary</p>
                    <p className="text-green-400 font-gaming text-2xl font-bold">{o.totalAmount.toFixed(2)} DH</p>
                  </div>
                  <div className="col-span-2 p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-2">Assets Deployed</p>
                    <p className="text-white text-sm leading-relaxed">{o.productBought}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'marketing':
        return (
          <div className="animate-fade-in space-y-10">
             <form onSubmit={handleAddPromo} className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row gap-6 shadow-xl">
                <div className="flex-1">
                  <label className="text-[10px] font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Voucher Code</label>
                  <input placeholder="MOON25" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white font-gaming uppercase" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} required />
                </div>
                <div className="w-full md:w-32">
                  <label className="text-[10px] font-gaming text-slate-500 uppercase tracking-widest mb-2 block">Discount %</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 text-white" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: parseInt(e.target.value)})} required />
                </div>
                <button className="bg-sky-500 text-white font-gaming text-xs uppercase px-10 rounded-xl mt-auto py-4 tracking-widest">Generate</button>
             </form>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {promoCodes.map(p => (
                 <div key={p.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex justify-between items-center shadow-lg">
                   <div className="flex items-center space-x-6">
                     <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400">
                        <i className="fas fa-tag"></i>
                     </div>
                     <div>
                       <span className="text-white font-gaming text-lg font-bold">{p.code}</span>
                       <p className="text-slate-500 text-[10px] uppercase font-gaming">-{p.discount}% OFF</p>
                     </div>
                   </div>
                   <button onClick={() => onDeletePromoCode(p.id)} className="text-red-500 w-10 h-10 hover:bg-red-500/10 rounded-lg transition-all"><i className="fas fa-trash-alt"></i></button>
                 </div>
               ))}
             </div>
          </div>
        );

      case 'users':
        return (
          <div className="animate-fade-in space-y-6">
            {users.map(u => (
              <div key={u.id} className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-sky-400 text-2xl font-bold font-gaming">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white text-xl font-bold">{u.name}</h4>
                    <p className="text-slate-500 text-xs font-gaming uppercase tracking-widest">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Available Credits</p>
                    <p className="text-green-400 font-gaming text-2xl font-bold">{u.balance.toFixed(2)} DH</p>
                  </div>
                  <button 
                    onClick={() => {
                      const amount = prompt(`Nouveau solde pour ${u.name}:`, u.balance.toString());
                      if(amount) onUpdateUserBalance(u.email, parseFloat(amount));
                    }}
                    className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-lg"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'support':
        return (
          <div className="animate-fade-in space-y-6">
            {tickets.length === 0 ? <p className="text-slate-500 text-center py-40 font-gaming uppercase">No transmissions found.</p> : 
              tickets.map(t => (
                <div key={t.id} className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] space-y-5 shadow-xl relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-2 h-full ${t.status === 'New' ? 'bg-sky-500' : 'bg-slate-800'}`}></div>
                  <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                    <span className="text-white text-lg font-bold">{t.name}</span>
                    <span className={`text-[10px] font-gaming uppercase tracking-widest px-3 py-1 rounded-full border ${t.status === 'New' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'text-slate-500 border-slate-800'}`}>{t.status}</span>
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed bg-slate-900/50 p-6 rounded-2xl border border-slate-800">"{t.message}"</p>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-slate-600 font-gaming uppercase tracking-widest">{t.date}</span>
                       <span className="text-[10px] text-sky-400 underline">{t.email}</span>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => onUpdateTicketStatus(t.id, 'Read')} className="w-12 h-12 rounded-xl bg-slate-900 text-sky-500 hover:bg-sky-500 hover:text-white transition-all"><i className="fas fa-check-double"></i></button>
                      <button onClick={() => onDeleteTicket(t.id)} className="w-12 h-12 rounded-xl bg-slate-900 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        );

      case 'chat':
        return (
          <div className="animate-fade-in bg-slate-950 border border-slate-800 p-20 rounded-[3rem] text-center space-y-8 shadow-2xl">
            <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto border border-sky-500/20">
               <i className="fas fa-comments text-5xl text-sky-500"></i>
            </div>
            <h3 className="text-white font-gaming text-2xl uppercase tracking-widest">Global Support Interface</h3>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Access specific client chat sessions through the **Clients** tab to resolve pending queries.</p>
            <button onClick={() => setActiveTab('users')} className="bg-sky-500 text-white px-10 py-4 rounded-2xl font-gaming text-xs uppercase tracking-widest hover:bg-sky-600 transition-all">Go to Clients</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:w-72 space-y-4 flex-shrink-0">
          {[
            { id: 'stats', label: 'Dashboard', icon: 'chart-line' },
            { id: 'catalog', label: 'Catalogue', icon: 'boxes' },
            { id: 'orders', label: 'Commandes', icon: 'shopping-cart' },
            { id: 'marketing', label: 'Promos', icon: 'tags' },
            { id: 'users', label: 'Clients', icon: 'users' },
            { id: 'support', label: 'Tickets', icon: 'ticket-alt' },
            { id: 'chat', label: 'Direct Support', icon: 'comments' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-4 px-8 py-5 rounded-[2rem] font-gaming text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 ${activeTab === tab.id ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20 translate-x-2' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}`}
            >
              <i className={`fas fa-${tab.icon} text-lg`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[700px]">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[150px] -mr-64 -mt-64 rounded-full"></div>
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-6">
                <h2 className="text-3xl font-gaming font-bold text-white uppercase tracking-widest">{activeTab} Interface</h2>
                <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping"></div>
                   <span className="text-sky-500 text-[10px] font-gaming uppercase tracking-widest">System Online</span>
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
