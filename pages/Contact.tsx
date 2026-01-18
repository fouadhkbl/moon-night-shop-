
import React, { useState } from 'react';
import { FAQS } from '../constants';
/* Import TranslationKeys for prop typing */
import { TranslationKeys } from '../translations';

interface ContactProps {
  onSendTicket: (ticket: { name: string, email: string, message: string }) => void;
  /* Add t prop to resolve TS mismatch */
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
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        {/* Left: Contact Info */}
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-gaming font-black text-white mb-10 tracking-tighter uppercase">
            COMMAND <span className="text-sky-400 underline decoration-indigo-500 underline-offset-[12px]">CENTER</span>
          </h1>
          <p className="text-slate-400 text-xl mb-16 leading-relaxed">
            Need assistance with a deployment or technical query? Our command personnel are active 24/7 to ensure your mission success.
          </p>

          <div className="space-y-10 mb-20">
            <div className="flex items-start space-x-8 group">
              <div className="w-16 h-16 rounded-[2rem] bg-sky-500/10 border-2 border-sky-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-sky-500 transition-all">
                <i className="fas fa-envelope-open-text text-2xl text-sky-400" />
              </div>
              <div>
                <h4 className="text-white font-gaming text-sm font-black uppercase tracking-widest mb-2">Technical Uplink</h4>
                <p className="text-slate-500 text-sm mb-1 font-bold">Response priority: High (Within 12h)</p>
                <a href="mailto:support@moonnight.shop" className="text-sky-400 text-xl font-black hover:underline">support@moonnight.shop</a>
              </div>
            </div>

            <div className="flex items-start space-x-8 group">
              <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-indigo-500 transition-all">
                <i className="fab fa-discord text-3xl text-indigo-400" />
              </div>
              <div>
                <h4 className="text-white font-gaming text-sm font-black uppercase tracking-widest mb-2">Lunar Community Hub</h4>
                <p className="text-slate-500 text-sm mb-1 font-bold">Real-time collaboration & alerts</p>
                <a href="https://discord.gg/eF9W6C6q" target="_blank" rel="noopener noreferrer" className="text-indigo-400 text-xl font-black hover:underline">Join 15,000+ Personnel</a>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-gaming font-black text-white uppercase tracking-widest">Knowledge Base</h3>
            <div className="space-y-6">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-slate-900/50 border-2 border-slate-800 rounded-[2rem] p-8 hover:border-sky-500/30 transition-all">
                  <h5 className="text-white text-lg font-black mb-3 uppercase tracking-tight">{faq.question}</h5>
                  <p className="text-slate-500 text-base font-bold leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="animate-slide-up">
          <div className="bg-slate-900/40 border-4 border-slate-800 rounded-[4rem] p-12 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 blur-[80px]" />
            <div className="relative z-10">
              <h3 className="text-3xl font-gaming font-black text-white mb-10 uppercase tracking-widest">Secure Transmission</h3>
              
              {submitted ? (
                <div className="py-24 text-center animate-fade-in">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-green-500/30">
                    <i className="fas fa-check text-5xl text-green-500" />
                  </div>
                  <h4 className="text-3xl font-gaming font-black text-white mb-4 uppercase">TRANSMITTED</h4>
                  <p className="text-slate-400 text-lg font-bold">Your message has been encrypted and sent to HQ.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label className="block text-slate-500 text-xs font-gaming uppercase tracking-[0.3em] mb-4 ml-6 font-black">Pilot Identification</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2rem] px-8 py-6 text-white focus:outline-none focus:border-sky-500 transition-all text-lg font-bold"
                      placeholder="FULL NAME"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-gaming uppercase tracking-[0.3em] mb-4 ml-6 font-black">Comm Channel (Email)</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2rem] px-8 py-6 text-white focus:outline-none focus:border-sky-500 transition-all text-lg font-bold"
                      placeholder="EMAIL@DATABASE.COM"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-xs font-gaming uppercase tracking-[0.3em] mb-4 ml-6 font-black">Transmission Content</label>
                    <textarea 
                      required
                      rows={6}
                      className="w-full bg-slate-950 border-4 border-slate-800 rounded-[3rem] px-8 py-6 text-white focus:outline-none focus:border-sky-500 transition-all text-lg font-bold"
                      placeholder="MESSAGE PROTOCOL..."
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-sky-500 text-white font-gaming font-black py-7 rounded-[2rem] shadow-2xl shadow-sky-500/40 hover:bg-sky-600 transition-all flex items-center justify-center space-x-4 uppercase tracking-[0.3em] text-base"
                  >
                    <span>SEND TRANSMISSION</span>
                    <i className="fas fa-paper-plane text-lg" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;