
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, ChatMessage } from '../types';
import { TranslationKeys } from '../translations';

interface AccountProps {
  user: User;
  orders: Order[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  t: (key: TranslationKeys) => string;
}

const Account: React.FC<AccountProps> = ({ 
  user, orders = [], messages = [], onSendMessage, onLogout, onRefresh, isRefreshing, t
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'chat'>('orders');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const userEmail = user.email?.toLowerCase() || '';
  const userOrders = orders.filter(o => o.email?.toLowerCase() === userEmail);
  const threadMessages = messages.filter(m => 
    m.senderEmail?.toLowerCase() === userEmail || 
    (m.isAdmin && m.text?.includes(`[To: ${user.email}]`))
  );

  useEffect(() => {
    if (activeTab === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-400/10 border-green-500/20';
      case 'Processing': return 'text-sky-400 bg-sky-400/10 border-sky-500/20';
      case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
      case 'Cancelled': return 'text-red-400 bg-red-400/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-500/20';
    }
  };

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-5xl mx-auto px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Profile Section */}
        <div className="lg:w-1/3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] text-center shadow-xl">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-sky-500/20 shadow-inner">
              <span className="text-3xl text-sky-400 font-gaming font-black">{user.name?.charAt(0)}</span>
            </div>
            <h3 className="text-white font-gaming text-sm sm:text-xl truncate mb-1 uppercase tracking-tight">{user.name}</h3>
            <p className="text-slate-600 text-[9px] font-mono mb-8">{user.email}</p>
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 my-8 shadow-inner">
              <p className="text-[10px] font-gaming text-slate-500 uppercase tracking-[0.3em] mb-2 font-black">Available Balance</p>
              <p className="text-2xl sm:text-4xl font-gaming text-green-400 neon-text-cyan">{(user.balance || 0).toFixed(0)} <span className="text-xs">DH</span></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onRefresh} className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-[9px] font-gaming uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2 hover:text-white transition-all">
                <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i> SYNC
              </button>
              <button onClick={onLogout} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-[9px] font-gaming uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all">EXIT</button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:w-2/3">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex flex-col h-[550px] sm:h-[650px] shadow-2xl">
            <div className="flex bg-slate-950 p-2 m-4 sm:m-8 rounded-2xl border border-slate-800 shadow-inner">
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-gaming uppercase tracking-[0.2em] font-black transition-all ${activeTab === 'orders' ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ORDERS
              </button>
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-gaming uppercase tracking-[0.2em] font-black transition-all ${activeTab === 'chat' ? 'bg-sky-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                CHAT
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-10 pt-0 no-scrollbar">
              {activeTab === 'orders' ? (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-24 opacity-20">
                      <i className="fas fa-ghost text-5xl mb-6"></i>
                      <p className="text-[10px] uppercase font-gaming tracking-[0.4em]">No deployments found</p>
                    </div>
                  ) : (
                    userOrders.map(o => (
                      <div key={o.id} className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl group hover:border-sky-500/30 transition-all shadow-inner">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <span className="text-sky-500 font-mono text-[9px] uppercase tracking-widest block opacity-70">UPLINK ID: {o.id}</span>
                            <h4 className="text-white text-[13px] font-black leading-tight uppercase group-hover:text-sky-400 transition-colors">{o.productBought}</h4>
                          </div>
                          <span className={`text-[8px] font-gaming uppercase px-3 py-1.5 rounded-lg border font-black tracking-widest ${getStatusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-slate-900">
                          <p className="text-slate-600 text-[9px] uppercase tracking-widest font-bold">{o.date}</p>
                          <p className="text-white font-gaming text-sm font-black tracking-tighter">{o.totalAmount.toFixed(0)} DH</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto no-scrollbar pr-2">
                    {threadMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-lg ${msg.isAdmin ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-sky-500 text-slate-950'}`}>
                          <p>{msg.text.replace(`[To: ${user.email}]`, '')}</p>
                          <p className="text-[7px] opacity-40 mt-2 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={(e)=>{e.preventDefault(); if(!chatInput.trim())return; onSendMessage(chatInput); setChatInput('');}} className="relative mt-auto pt-4">
                    <input type="text" placeholder="TRANSMIT MESSAGE..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-800 shadow-inner" value={chatInput} onChange={e=>setChatInput(e.target.value)} />
                    <button type="submit" className="absolute right-3 top-[calc(50%+8px)] -translate-y-1/2 w-10 h-10 bg-sky-500 text-slate-950 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-sky-400"><i className="fas fa-paper-plane text-[10px]"></i></button>
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
