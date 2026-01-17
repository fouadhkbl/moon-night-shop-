
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
  
  // Catalog State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Games',
    price: 0,
    image: '',
    description: '',
    features: ['Instant Delivery'],
    stock: 100,
    rating: 5.0
  });

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [editingBalance, setEditingBalance] = useState<{email: string, balance: number} | null>(null);

  // Promo State
  const [newPromo, setNewPromo] = useState({ code: '', discount: 10 });

  // Chat state
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [adminChatInput, setAdminChatInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use environment variable for admin password to keep it hidden from frontend source
    if (password === process.env.ADMIN_PASSWORD) {
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
        setCurrentProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct.id) {
      onUpdateProduct(currentProduct as Product);
    } else {
      onAddProduct({ ...currentProduct, id: Date.now().toString() } as Product);
    }
    setIsEditing(false);
    setCurrentProduct({ name: '', category: 'Games', price: 0, image: '', description: '', features: ['Instant Delivery'], stock: 100, rating: 5.0 });
  };

  const createPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code) return;
    onAddPromoCode({ id: Date.now().toString(), code: newPromo.code.toUpperCase(), discount: newPromo.discount });
    setNewPromo({ code: '', discount: 10 });
  };

  const handleAdminSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatInput.trim() || !selectedUserEmail) return;
    onAdminReply(selectedUserEmail, adminChatInput);
    setAdminChatInput('');
  };

  const chatUsers = useMemo(() => {
    const usersSet = new Set<string>();
    messages.forEach(m => {
      if (!m.isAdmin) usersSet.add(m.senderEmail);
    });
    return Array.from(usersSet);
  }, [messages]);

  const activeUserMessages = useMemo(() => {
    if (!selectedUserEmail) return [];
    return messages.filter(m => 
      m.senderEmail.toLowerCase() === selectedUserEmail.toLowerCase() || 
      (m.isAdmin && m.text.includes(`[To: ${selectedUserEmail}]`))
    );
  }, [messages, selectedUserEmail]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    return users.filter(u => 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.name.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center">
          <h1 className="text-2xl font-gaming font-bold text-white mb-6 uppercase">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Code d'accès" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white text-center" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-64 space-y-2">
          {[
            { id: 'stats', label: 'Tableau de bord', icon: 'chart-line' },
            { id: 'catalog', label: 'Catalogue', icon: 'boxes' },
            { id: 'orders', label: 'Commandes', icon: 'shopping-cart' },
            { id: 'marketing', label: 'Codes Promo', icon: 'tags' },
            { id: 'users', label: 'Utilisateurs', icon: 'users' },
            { id: 'support', label: 'Tickets', icon: 'ticket-alt' },
            { id: 'chat', label: 'Support Chat', icon: 'comments' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-gaming text-[10px] uppercase transition-all ${activeTab === tab.id ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900'}`}
            >
              <i className={`fas fa-${tab.icon} w-5`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Chiffre d'Affaires</p>
                <h3 className="text-3xl font-gaming font-bold text-sky-400">{orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)} DH</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Total Commandes</p>
                <h3 className="text-3xl font-gaming font-bold text-white">{orders.length}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Comptes Clients</p>
                <h3 className="text-3xl font-gaming font-bold text-white">{users.length}</h3>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Tickets Ouverts</p>
                <h3 className="text-3xl font-gaming font-bold text-yellow-500">{tickets.filter(t => t.status === 'New').length}</h3>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-gaming text-white uppercase">Gestion Utilisateurs</h2>
                  <p className="text-slate-500 text-[10px] font-gaming uppercase tracking-widest mt-1">{users.length} Emails Enregistrés</p>
                </div>
                <div className="relative w-full md:w-64">
                   <input 
                    type="text" 
                    placeholder="Rechercher par email..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-10 py-3 text-xs text-white focus:border-sky-500 focus:outline-none"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                   />
                   <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-500 text-[9px] font-gaming uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Utilisateur</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Solde Actuel</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredUsers.map(user => (
                        <tr key={user.email} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-white text-xs font-bold">{user.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-400 text-xs">{user.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            {editingBalance?.email === user.email ? (
                              <input 
                                type="number" 
                                className="bg-slate-950 border border-sky-500 rounded px-2 py-1 text-xs text-white w-24 font-gaming"
                                value={editingBalance.balance}
                                onChange={(e) => setEditingBalance({...editingBalance, balance: parseFloat(e.target.value) || 0})}
                              />
                            ) : (
                              <span className="text-green-400 text-xs font-gaming">{(user.balance || 0).toFixed(2)} DH</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {editingBalance?.email === user.email ? (
                              <div className="flex justify-end space-x-2">
                                <button 
                                  onClick={() => {
                                    onUpdateUserBalance(user.email, editingBalance.balance);
                                    setEditingBalance(null);
                                  }} 
                                  className="bg-green-500 text-white px-3 py-1 rounded text-[8px] font-gaming uppercase"
                                >
                                  SAVE
                                </button>
                                <button 
                                  onClick={() => setEditingBalance(null)} 
                                  className="bg-slate-700 text-slate-300 px-3 py-1 rounded text-[8px] font-gaming uppercase"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setEditingBalance({ email: user.email, balance: user.balance })} 
                                className="text-sky-400 hover:text-white transition-colors text-[9px] font-gaming uppercase border border-sky-500/20 px-3 py-1 rounded-lg"
                              >
                                Modifier Solde
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-slate-600 font-gaming text-xs uppercase opacity-40">
                            Aucun utilisateur trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-gaming text-white uppercase">Gestion du Catalogue</h2>
                <button 
                  onClick={() => { setIsEditing(true); setCurrentProduct({ name: '', category: 'Games', price: 0, image: '', description: '', stock: 100 }); }} 
                  className="bg-sky-500 text-white px-6 py-2 rounded-xl text-xs font-gaming"
                >
                  NOUVEAU PRODUIT
                </button>
              </div>

              {isEditing && (
                <form onSubmit={saveProduct} className="bg-slate-900 border border-sky-500/30 p-8 rounded-3xl space-y-4 animate-scale-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nom du produit" className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                    <select className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value as Category})}>
                      {['Games', 'Accounts', 'Gift Cards', 'Items', 'Subscriptions', 'Currency', 'Software', 'Keys'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input required type="number" placeholder="Prix (DH)" className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: parseFloat(e.target.value)})} />
                    <input required type="number" placeholder="Quantité / Stock" className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm" value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: parseInt(e.target.value)})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Image URL (Optionnel)" className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm" value={currentProduct.image} onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})} />
                    <div className="flex items-center space-x-4">
                      <label className="flex-1 bg-slate-800 text-slate-300 p-4 rounded-xl text-center cursor-pointer hover:bg-slate-700 transition-all text-xs font-gaming uppercase">
                        {currentProduct.image?.startsWith('data:') ? 'Image chargée' : 'Upload Photo'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                      {currentProduct.image && <img src={currentProduct.image} className="w-14 h-14 rounded-xl object-cover border border-slate-800" />}
                    </div>
                  </div>
                  <textarea placeholder="Description" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm h-32" value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} />
                  <div className="flex space-x-4">
                    <button type="submit" className="flex-1 bg-sky-500 text-white py-4 rounded-xl font-gaming text-xs">ENREGISTRER</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-8 bg-slate-800 text-slate-500 py-4 rounded-xl font-gaming text-xs">ANNULER</button>
                  </div>
                </form>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-slate-500 text-[10px] font-gaming uppercase tracking-widest">
                    <tr><th className="px-6 py-4">Produit</th><th className="px-6 py-4">Prix</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-4">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="text-white text-xs font-bold">{p.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sky-400 text-xs font-gaming">{p.price.toFixed(2)} DH</td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{p.stock} units</td>
                        <td className="px-6 py-4 text-right flex justify-end space-x-4">
                          <button onClick={() => { setCurrentProduct(p); setIsEditing(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-sky-400 hover:text-white transition-colors text-[10px] font-gaming">EDIT</button>
                          <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:text-red-400 transition-colors text-[10px] font-gaming">DELETE</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-gaming text-white uppercase tracking-widest">Gestion des Codes Promo</h2>
              </div>

              <form onSubmit={createPromo} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2">Code (ex: MOON50)</label>
                  <input required placeholder="CODE" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm font-gaming tracking-widest" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="w-32">
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2">Remise %</label>
                  <input required type="number" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white text-sm font-gaming" value={newPromo.discount} onChange={e => setNewPromo({...newPromo, discount: parseInt(e.target.value)})} />
                </div>
                <button className="bg-sky-500 text-white px-8 h-[54px] rounded-xl font-gaming text-xs">CRÉER LE CODE</button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promoCodes.map(promo => (
                  <div key={promo.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-gaming font-bold text-white tracking-widest">{promo.code}</h4>
                        <p className="text-sky-400 font-gaming text-[10px] uppercase">Remise: {promo.discount}%</p>
                      </div>
                      <button onClick={() => onDeletePromoCode(promo.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <i className="fas fa-tags text-5xl"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden h-[600px] flex">
              <div className="w-1/3 border-r border-slate-800 bg-slate-950/50 flex flex-col">
                <div className="p-6 border-b border-slate-800"><h3 className="text-white font-gaming text-xs uppercase">Clients Actifs</h3></div>
                <div className="flex-1 overflow-y-auto">
                  {chatUsers.map(email => (
                    <button key={email} onClick={() => setSelectedUserEmail(email)} className={`w-full text-left p-6 border-b border-slate-800/50 transition-all ${selectedUserEmail === email ? 'bg-sky-500/10 border-l-4 border-l-sky-500' : 'hover:bg-slate-900'}`}>
                      <p className="text-white text-xs font-bold truncate">{email}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-slate-900">
                {selectedUserEmail ? (
                  <>
                    <div className="p-6 border-b border-slate-800 bg-slate-950/20"><h3 className="text-white text-sm font-bold">{selectedUserEmail}</h3></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {activeUserMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl text-xs ${msg.isAdmin ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            <p>{msg.text.replace(`[To: ${selectedUserEmail}]`, '')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAdminSend} className="p-6 bg-slate-950/30 border-t border-slate-800 flex gap-4">
                      <input type="text" placeholder="Réponse..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-xs text-white" value={adminChatInput} onChange={(e) => setAdminChatInput(e.target.value)} />
                      <button className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center"><i className="fas fa-paper-plane"></i></button>
                    </form>
                  </>
                ) : <div className="flex-1 flex items-center justify-center opacity-20 font-gaming text-xs uppercase">Sélectionnez une conversation</div>}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
               <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                  <h3 className="text-white font-gaming text-xs uppercase tracking-widest">Journal des Ventes</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-950 text-slate-500 text-[8px] font-gaming uppercase tracking-widest">
                     <tr><th className="px-6 py-4">Client</th><th className="px-6 py-4">Produits</th><th className="px-6 py-4">Montant</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800">
                     {orders.map(o => (
                       <tr key={o.id} className="hover:bg-slate-800/10">
                         <td className="px-6 py-4">
                            <p className="text-white text-xs font-bold">{o.firstName} {o.lastName}</p>
                            <p className="text-slate-500 text-[8px]">{o.email}</p>
                         </td>
                         <td className="px-6 py-4 text-slate-400 text-[10px] max-w-[200px] truncate">{o.productBought}</td>
                         <td className="px-6 py-4 text-sky-400 text-xs font-gaming">{o.totalAmount.toFixed(2)} DH</td>
                         <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-gaming uppercase ${o.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{o.status}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <select 
                              className="bg-slate-950 border border-slate-800 text-[9px] font-gaming uppercase p-1 rounded"
                              value={o.status}
                              onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            >
                               {['Pending', 'Processing', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
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
    </div>
  );
};

export default Admin;
