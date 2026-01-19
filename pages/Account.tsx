
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
      case 'Completed': return 'text-green-600 bg-green-50 border-green-100';
      case 'Processing': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Cancelled': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-6xl mx-auto px-4 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white border border-slate-100 p-8 sm:p-12 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 blur-[60px] rounded-full -mr-16 -mt-16" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 sm:w-28 sm:h-28 bg-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 transform -rotate-3 hover:rotate-0 transition-transform">
                <span className="text-4xl text-white font-gaming font-black">{user.name?.charAt(0)}</span>
              </div>
              <h3 className="text-slate-900 font-gaming text-sm sm:text-2xl truncate mb-1 uppercase tracking-tight font-black">{user.name}</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs font-mono mb-10 font-bold tracking-widest">{user.email}</p>
              
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 shadow-inner">
                <p className="text-[10px] font-gaming text-slate-400 uppercase tracking-[0.4em] mb-3 font-black">COMMAND SOLDE</p>
                <p className="text-4xl sm:text-5xl font-gaming text-blue-700 font-black tracking-tighter">{(user.balance || 0).toFixed(0)} <span className="text-sm">DH</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={onRefresh} className="bg-white border border-slate-200 p-5 rounded-2xl text-[9px] font-gaming uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-700 transition-all font-black shadow-sm">
                  <i className={`fas fa-sync-alt ${isRefreshing ? 'animate-spin' : ''}`}></i> SYNC
                </button>
                <button onClick={onLogout} className="bg-slate-900 border border-slate-900 p-5 rounded-2xl text-[9px] font-gaming uppercase tracking-widest text-white hover:bg-red-600 hover:border-red-600 transition-all font-black shadow-lg">EXIT</button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:w-2/3">
          <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden flex flex-col h-[700px] shadow-2xl relative">
            {/* Header Tabs */}
            <div className="flex bg-slate-50 p-2.5 m-6 sm:m-10 rounded-2xl border border-slate-200 shadow-inner">
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`flex-1 py-4 rounded-xl text-[10px] font-gaming uppercase tracking-[0.2em] font-black transition-all ${activeTab === 'orders' ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                DEPLOYMENTS
              </button>
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`flex-1 py-4 rounded-xl text-[10px] font-gaming uppercase tracking-[0.2em] font-black transition-all ${activeTab === 'chat' ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                UPLINK CHAT
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 pt-0 no-scrollbar">
              {activeTab === 'orders' ? (
                <div className="space-y-6">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-32 opacity-10">
                      <i className="fas fa-satellite-dish text-7xl mb-6 text-slate-400"></i>
                      <p className="text-[12px] uppercase font-gaming tracking-[0.5em] text-slate-500 font-black">NO ACTIVE OPERATIONS</p>
                    </div>
                  ) : (
                    userOrders.map(o => (
                      <div key={o.id} className="bg-white border border-slate-100 p-8 rounded-[2rem] hover:border-blue-300 transition-all shadow-sm hover:shadow-xl group">
                        <div className="flex justify-between items-start mb-8">
                          <div className="space-y-2">
                            <span className="text-blue-700 font-mono text-[9px] uppercase tracking-widest block font-black opacity-50">#ID_{o.id}</span>
                            <h4 className="text-slate-900 text-[16px] sm:text-[18px] font-black leading-tight uppercase tracking-tight group-hover:text-blue-700 transition-colors">{o.productBought}</h4>
                          </div>
                          <span className={`text-[8px] font-gaming uppercase px-4 py-2 rounded-xl border-2 font-black tracking-widest ${getStatusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end pt-6 border-t border-slate-50">
                          <div className="flex items-center space-x-3">
                            <i className="far fa-calendar-alt text-slate-300 text-xs" />
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">{o.date}</p>
                          </div>
                          <p className="text-blue-700 font-gaming text-2xl font-black tracking-tighter">{o.totalAmount.toFixed(0)} <span className="text-xs">DH</span></p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-6 mb-6 overflow-y-auto no-scrollbar pr-2">
                    {threadMessages.length === 0 ? (
                      <div className="text-center py-32 opacity-20">
                         <i className="far fa-comments text-6xl mb-6 text-slate-300" />
                         <p className="text-[10px] font-gaming uppercase tracking-widest font-black">Secure channel ready. Initiate contact.</p>
                      </div>
                    ) : (
                      threadMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-[12px] font-bold leading-relaxed shadow-sm ${msg.isAdmin ? 'bg-slate-100 text-slate-700 border border-slate-200 rounded-tl-none' : 'bg-blue-700 text-white rounded-tr-none shadow-blue-100'}`}>
                            <p>{msg.text.replace(`[To: ${user.email}]`, '')}</p>
                            <p className="text-[8px] opacity-40 mt-3 font-mono font-black tracking-tighter">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Chat Input */}
                  <form onSubmit={handleSend} className="mt-auto relative">
                    <input 
                      type="text" 
                      placeholder="TRANSMIT MESSAGE TO HQ..." 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-8 py-5 text-[11px] font-bold outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder:text-slate-300" 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)} 
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center hover:bg-blue-800 transition-all shadow-lg active:scale-90">
                      <i className="fas fa-paper-plane text-sm" />
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
