
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, ChatMessage } from '../types';

interface AccountProps {
  user: User;
  orders: Order[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const Account: React.FC<AccountProps> = ({ 
  user, 
  orders, 
  messages, 
  onSendMessage, 
  onLogout, 
  onRefresh,
  isRefreshing 
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'chat'>('vault');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userOrders = orders.filter(o => o.email.toLowerCase() === user.email.toLowerCase());
  
  const threadMessages = messages.filter(m => 
    m.senderEmail.toLowerCase() === user.email.toLowerCase() || 
    (m.isAdmin && m.text.includes(`[To: ${user.email}]`))
  );

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') scrollToBottom();
  }, [threadMessages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <i className="fas fa-wallet text-7xl"></i>
            </div>
            <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20 shadow-lg shadow-sky-500/5">
              <span className="text-2xl text-sky-400 font-gaming uppercase font-bold">{user.name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-gaming font-bold text-white uppercase tracking-widest">{user.name}</h2>
            <p className="text-slate-500 text-xs mb-6 truncate">{user.email}</p>
            
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-center">
              <p className="text-[8px] font-gaming text-slate-500 uppercase tracking-widest mb-1">Votre Solde (DH)</p>
              <p className="text-2xl font-gaming font-bold text-green-400">{(user.balance || 0).toFixed(2)} <span className="text-xs">DH</span></p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-300 py-3 rounded-xl font-gaming text-[9px] uppercase tracking-widest hover:bg-sky-500 hover:text-white hover:border-sky-400 transition-all flex items-center justify-center space-x-2"
              >
                <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i>
                <span>{isRefreshing ? 'Actualiser' : 'Actualiser'}</span>
              </button>
              <button 
                onClick={onLogout}
                className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl font-gaming text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] space-y-4">
            <h4 className="text-white font-gaming text-[10px] uppercase tracking-widest border-b border-slate-800 pb-3">Statistiques Compte</h4>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] uppercase">Commandes</span>
              <span className="text-sky-400 font-gaming text-sm">{userOrders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[10px] uppercase">Inscription</span>
              <span className="text-white text-[10px]">{user.joinedAt.split(',')[0]}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-slate-950 p-2 m-4 rounded-2xl border border-slate-800">
              <button 
                onClick={() => setActiveTab('vault')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-gaming uppercase tracking-widest transition-all ${activeTab === 'vault' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-receipt mr-2"></i> Historique
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-gaming uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-comment-dots mr-2"></i> Contact Vendeur
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'vault' ? (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-30 py-20">
                      <i className="fas fa-shopping-bag text-6xl mb-4"></i>
                      <p className="font-gaming text-xs uppercase tracking-widest">Aucune commande trouvée</p>
                    </div>
                  ) : (
                    userOrders.map(order => (
                      <div key={order.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-sky-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-sky-400 font-mono text-sm font-bold">#{order.id}</span>
                            <p className="text-slate-500 text-[9px] font-gaming uppercase mt-1">{order.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[8px] font-gaming uppercase tracking-widest border ${
                            order.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            order.status === 'Processing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-white text-xs font-bold truncate">{order.productBought}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                            <span className="text-[10px] text-slate-500 uppercase">Montant Payé</span>
                            <span className="text-sky-400 font-gaming text-sm">{order.totalAmount.toFixed(2)} DH</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4">
                    {threadMessages.length === 0 && (
                      <div className="text-center py-10 opacity-20">
                        <i className="fas fa-comments text-4xl mb-4"></i>
                        <p className="text-[10px] font-gaming uppercase tracking-widest">Contactez nous pour toute question.</p>
                      </div>
                    )}
                    {threadMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-xs relative ${
                          msg.isAdmin 
                            ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' 
                            : 'bg-sky-500 text-white rounded-tr-none shadow-lg shadow-sky-500/10'
                        }`}>
                          {msg.isAdmin && <p className="text-[8px] font-gaming uppercase text-sky-400 mb-1">Support MoonNight</p>}
                          <p className="leading-relaxed">{msg.text.replace(`[To: ${user.email}]`, '')}</p>
                          <span className={`text-[8px] mt-2 block opacity-40 ${msg.isAdmin ? 'text-left' : 'text-right'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleSend} className="relative mt-auto">
                    <input 
                      type="text" 
                      placeholder="Tapez votre message..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 pr-16 text-xs text-white focus:outline-none focus:border-sky-500 transition-all shadow-inner"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center hover:bg-sky-600 transition-all active:scale-95"
                    >
                      <i className="fas fa-paper-plane text-xs"></i>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
