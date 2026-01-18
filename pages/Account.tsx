
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

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-5xl mx-auto px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Profile Section */}
        <div className="lg:w-1/3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
              <span className="text-2xl text-sky-400 font-gaming">{user.name?.charAt(0)}</span>
            </div>
            <h3 className="text-white font-gaming text-sm sm:text-lg truncate">{user.name}</h3>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 my-6">
              <p className="text-[8px] font-gaming text-slate-500 uppercase tracking-widest mb-1">Solde</p>
              <p className="text-xl sm:text-2xl font-gaming text-green-400">{(user.balance || 0).toFixed(0)} DH</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={onRefresh} className="bg-slate-800 p-2.5 rounded-lg text-[8px] font-gaming uppercase text-slate-400 flex items-center justify-center gap-2">
                <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i> Sync
              </button>
              <button onClick={onLogout} className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-[8px] font-gaming uppercase text-red-500">Exit</button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:w-2/3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col h-[550px] sm:h-[650px]">
            <div className="flex bg-slate-950 p-1.5 m-4 sm:m-6 rounded-xl border border-slate-800">
              <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-lg text-[9px] font-gaming uppercase tracking-widest ${activeTab === 'orders' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Orders</button>
              <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 rounded-lg text-[9px] font-gaming uppercase tracking-widest ${activeTab === 'chat' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Support</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 no-scrollbar">
              {activeTab === 'orders' ? (
                <div className="space-y-3">
                  {userOrders.length === 0 ? (
                    <p className="text-center opacity-20 py-10 text-[10px] uppercase font-gaming">No orders</p>
                  ) : (
                    userOrders.map(o => (
                      <div key={o.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sky-400 font-mono text-[9px]">ID: {o.id}</span>
                          <span className="text-[8px] text-green-500 uppercase font-gaming">{o.status}</span>
                        </div>
                        <p className="text-white text-[10px] font-bold truncate mb-3">{o.productBought}</p>
                        <p className="text-slate-500 font-gaming text-[10px] text-right">{o.totalAmount.toFixed(0)} DH</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto no-scrollbar">
                    {threadMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-[10px] ${msg.isAdmin ? 'bg-slate-800 text-slate-300' : 'bg-sky-500 text-white'}`}>
                          <p>{msg.text.replace(`[To: ${user.email}]`, '')}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={(e)=>{e.preventDefault(); if(!chatInput.trim())return; onSendMessage(chatInput); setChatInput('');}} className="relative">
                    <input type="text" placeholder="Message..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-sky-500" value={chatInput} onChange={e=>setChatInput(e.target.value)} />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-sky-500 text-white rounded-lg flex items-center justify-center"><i className="fas fa-paper-plane text-[10px]"></i></button>
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
