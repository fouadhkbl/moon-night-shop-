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
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Setting admin password as requested
    if (password === 'fouad12jad1///') {
      setIsAuthenticated(true);
    } else {
      alert('Code d\'accès invalide');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[60px] -mr-16 -mt-16 rounded-full"></div>
          <h1 className="text-2xl font-gaming font-bold text-white mb-8 uppercase tracking-widest relative z-10">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="relative">
              <input 
                type="password" 
                placeholder="Entrez le code" 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-white text-center focus:border-sky-500 transition-all outline-none" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <button className="w-full bg-sky-500 text-white font-gaming py-5 rounded-2xl tracking-[0.2em] shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 uppercase text-xs">Authorize</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 space-y-2">
          {[
            { id: 'stats', label: 'Dashboard', icon: 'chart-line' },
            { id: 'catalog', label: 'Catalogue', icon: 'boxes' },
            { id: 'orders', label: 'Commandes', icon: 'shopping-cart' },
            { id: 'marketing', label: 'Promos', icon: 'tags' },
            { id: 'users', label: 'Clients', icon: 'users' },
            { id: 'support', label: 'Tickets', icon: 'ticket-alt' },
            { id: 'chat', label: 'Support', icon: 'comments' },
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

        <div className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
           <div className="relative z-10">
             <h2 className="text-xl font-gaming font-bold text-white uppercase mb-8 tracking-widest">System Access Granted</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                  <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Total Orders</p>
                  <p className="text-3xl font-gaming font-bold text-sky-400">{orders.length}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                  <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Total Revenue</p>
                  <p className="text-3xl font-gaming font-bold text-green-400">{orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)} DH</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                  <p className="text-slate-500 text-[10px] font-gaming uppercase mb-2">Registered Users</p>
                  <p className="text-3xl font-gaming font-bold text-purple-400">{users.length}</p>
                </div>
             </div>
             <p className="mt-8 text-slate-500 text-xs font-gaming uppercase opacity-50">Sélectionnez une catégorie dans le menu pour gérer le système.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;