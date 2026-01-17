
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
    if (password === process.env.ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Code d\'accès invalide');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center shadow-2xl">
          <h1 className="text-2xl font-gaming font-bold text-white mb-6 uppercase tracking-widest">Admin Portal</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Code d'accès" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white text-center" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl tracking-widest">LOGIN</button>
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
            { id: 'users', label: 'Utilisateurs', icon: 'users' },
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

        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-8">
           <h2 className="text-white font-gaming uppercase mb-8">System Access Granted</h2>
           <p className="text-slate-500 text-xs">Utilisez le menu latéral pour gérer la plateforme.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
