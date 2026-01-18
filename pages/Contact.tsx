
import React, { useState } from 'react';
import { FAQS } from '../constants';
import { TranslationKeys } from '../translations';

interface ContactProps {
  onSendTicket: (ticket: { name: string, email: string, message: string }) => void;
  t: (key: TranslationKeys) => string;
}

const Contact: React.FC<ContactProps> = ({ onSendTicket, t }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendTicket(formState);
    setSubmitted(true);
    setFormState({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="pt-24 sm:pt-40 pb-20 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-8 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-24">
        {/* Left: Info Section */}
        <div className="animate-slide-up flex flex-col justify-center">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-sky-400 text-[8px] sm:text-[10px] font-gaming uppercase tracking-[0.3em] mb-6 w-fit">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
            <span>HQ CHANNEL</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-gaming font-black text-white mb-6 sm:mb-10 tracking-tighter uppercase leading-none">
            COMMAND <span className="text-sky-400 underline decoration-indigo-500/50 underline-offset-[8px] sm:underline-offset-[12px]">CENTER</span>
          </h1>
          
          <p className="text-slate-400 text-sm sm:text-lg lg:text-xl mb-10 sm:mb-16 leading-relaxed max-w-lg">
            Need assistance with a deployment or technical query? Our command personnel are active 24/7 to ensure your mission success.
          </p>

          <div className="space-y-6 sm:space-y-10 mb-12 sm:mb-20">
            <div className="flex items-start space-x-4 sm:space-x-8 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[2rem] bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-sky-500/50 transition-all">
                <i className="fas fa-envelope-open-text text-lg sm:text-2xl text-sky-400" />
              </div>
              <div>
                <h4 className="text-white font-gaming text-[9px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2">Technical Uplink</h4>
                <p className="text-slate-500 text-[8px] sm:text-xs mb-1 font-bold">Response priority: High (Within 12h)</p>
                <a href="mailto:support@moonnight.shop" className="text-sky-400 text-sm sm:text-xl font-black hover:underline transition-all">support@moonnight.shop</a>
              </div>
            </div>

            <div className="flex items-start space-x-4 sm:space-x-8 group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500/50 transition-all">
                <i className="fab fa-discord text-xl sm:text-3xl text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-gaming text-[9px] sm:text-xs font-black uppercase tracking-widest mb-1 sm:mb-2">Community Hub</h4>
                <p className="text-slate-500 text-[8px] sm:text-xs mb-1 font-bold">Real-time collaboration & alerts</p>
                <a href="https://discord.gg/eF9W6C6q" target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-sm sm:text-xl font-black hover:underline transition-all">Join 15,000+ Personnel</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Secure Form Section */}
        <div className="animate-slide-up">
          <div className="bg-slate-900/40 backdrop-blur-sm border-2 sm:border-4 border-slate-800 rounded-3xl sm:rounded-[4rem] p-6 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background HUD elements */}
            <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-sky-500/10 blur-[60px] sm:blur-[80px]" />
            <div className="hud-scanline opacity-10" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6 sm:mb-10">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                <h3 className="text-lg sm:text-3xl font-gaming font-black text-white uppercase tracking-widest">Secure Transmission</h3>
              </div>
              
              {submitted ? (
                <div className="py-12 sm:py-24 text-center animate-fade-in">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-green-500/30">
                    <i className="fas fa-check text-2xl sm:text-5xl text-green-500" />
                  </div>
                  <h4 className="text-xl sm:text-3xl font-gaming font-black text-white mb-3 sm:mb-4 uppercase">TRANSMITTED</h4>
                  <p className="text-slate-400 text-[10px] sm:text-lg font-bold uppercase tracking-widest">Encryption successful. Message sent.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
                  <div className="space-y-2">
                    <label className="block text-slate-500 text-[7px] sm:text-xs font-gaming uppercase tracking-[0.3em] mb-1 sm:mb-2 ml-4 sm:ml-6 font-black">Pilot Identification</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-950/80 border sm:border-2 border-slate-800 rounded-xl sm:rounded-3xl px-6 py-4 sm:py-6 text-white focus:outline-none focus:border-sky-500 transition-all text-xs sm:text-lg font-bold placeholder:text-slate-700"
                      placeholder="FULL NAME"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-500 text-[7px] sm:text-xs font-gaming uppercase tracking-[0.3em] mb-1 sm:mb-2 ml-4 sm:ml-6 font-black">Comm Channel (Email)</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-slate-950/80 border sm:border-2 border-slate-800 rounded-xl sm:rounded-3xl px-6 py-4 sm:py-6 text-white focus:outline-none focus:border-sky-500 transition-all text-xs sm:text-lg font-bold placeholder:text-slate-700"
                      placeholder="EMAIL@DATABASE.COM"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-slate-500 text-[7px] sm:text-xs font-gaming uppercase tracking-[0.3em] mb-1 sm:mb-2 ml-4 sm:ml-6 font-black">Transmission Content</label>
                    <textarea 
                      required
                      rows={window.innerWidth < 640 ? 4 : 6}
                      className="w-full bg-slate-950/80 border sm:border-2 border-slate-800 rounded-xl sm:rounded-[2.5rem] px-6 py-4 sm:py-6 text-white focus:outline-none focus:border-sky-500 transition-all text-xs sm:text-lg font-bold placeholder:text-slate-700 resize-none"
                      placeholder="MESSAGE PROTOCOL..."
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-sky-500 text-white font-gaming font-black py-4 sm:py-7 rounded-xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl shadow-sky-500/20 hover:bg-sky-400 transition-all flex items-center justify-center space-x-3 sm:space-x-4 uppercase tracking-[0.3em] text-[10px] sm:text-base active:scale-95"
                  >
                    <span>INITIATE UPLINK</span>
                    <i className="fas fa-paper-plane text-[10px] sm:text-lg" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mt-16 sm:mt-32 animate-slide-up">
        <div className="text-center mb-8 sm:mb-16">
          <p className="text-[9px] sm:text-xs font-gaming text-sky-500 uppercase tracking-[0.4em] font-bold mb-2">OPERATIONAL GUIDELINES</p>
          <h3 className="text-2xl sm:text-4xl font-gaming font-black text-white uppercase tracking-tight">KNOWLEDGE <span className="text-sky-400">BASE</span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 hover:border-sky-500/30 transition-all group">
              <h5 className="text-white text-xs sm:text-lg font-black mb-3 sm:mb-4 uppercase tracking-tight group-hover:text-sky-400 transition-colors">{faq.question}</h5>
              <p className="text-slate-500 text-[10px] sm:text-base font-bold leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
