
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
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full text-blue-700 text-[8px] sm:text-[10px] font-gaming uppercase tracking-[0.3em] mb-8 w-fit shadow-sm">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <span>COMMAND UPLINK</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-gaming font-black text-slate-900 mb-6 sm:mb-10 tracking-tighter uppercase leading-none">
            SUPPORT <span className="text-blue-700 underline decoration-blue-200 underline-offset-[12px]">CENTER</span>
          </h1>
          
          <p className="text-slate-500 text-sm sm:text-lg lg:text-xl mb-12 sm:mb-20 leading-relaxed max-w-lg">
            Experienced assistence is just a signal away. Our command personnel operate around the clock to secure your digital assets.
          </p>

          <div className="space-y-8 sm:space-y-12">
            <div className="flex items-start space-x-6 group">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-blue-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200 group-hover:-translate-y-1 transition-all">
                <i className="fas fa-envelope-open-text text-xl sm:text-3xl text-white" />
              </div>
              <div>
                <h4 className="text-slate-400 font-gaming text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Direct Terminal</h4>
                <a href="mailto:grosafzemb@gmail.com" className="text-slate-900 text-lg sm:text-2xl font-black hover:text-blue-700 transition-all font-gaming">grosafzemb@gmail.com</a>
                <p className="text-blue-600 text-[8px] sm:text-[10px] mt-1 font-black uppercase tracking-widest">Active Status: Instant</p>
              </div>
            </div>

            <div className="flex items-start space-x-6 group">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 group-hover:-translate-y-1 transition-all">
                <i className="fab fa-discord text-2xl sm:text-4xl text-white" />
              </div>
              <div>
                <h4 className="text-slate-400 font-gaming text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Discord Operations</h4>
                <a href="https://discord.gg/eF9W6C6q" target="_blank" rel="noopener noreferrer" className="text-slate-900 text-lg sm:text-2xl font-black hover:text-indigo-600 transition-all font-gaming">MoonNight HQ</a>
                <p className="text-indigo-600 text-[8px] sm:text-[10px] mt-1 font-black uppercase tracking-widest">15,000+ Personnel Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Secure Form Section */}
        <div className="animate-slide-up">
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-14 md:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 blur-[100px]" />
            <div className="hud-scanline opacity-5" />
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-10 sm:mb-14">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-md shadow-blue-400" />
                <h3 className="text-xl sm:text-3xl font-gaming font-black text-slate-900 uppercase tracking-widest">TRANSMIT SIGNAL</h3>
              </div>
              
              {submitted ? (
                <div className="py-24 text-center animate-fade-in">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-100">
                    <i className="fas fa-check text-5xl text-green-600" />
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-gaming font-black text-slate-900 mb-4 uppercase">SIGNAL RECEIVED</h4>
                  <p className="text-slate-500 text-xs sm:text-lg font-bold uppercase tracking-widest">Verification protocol established. Monitoring response.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
                  <div className="space-y-3">
                    <label className="block text-slate-400 text-[9px] sm:text-[11px] font-gaming uppercase tracking-[0.4em] mb-2 ml-4 font-black">Pilot ID</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl sm:rounded-3xl px-8 py-5 sm:py-7 text-slate-900 focus:outline-none focus:border-blue-600 transition-all text-sm sm:text-lg font-bold placeholder:text-slate-300 shadow-sm"
                      placeholder="ENTER FULL NAME"
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-slate-400 text-[9px] sm:text-[11px] font-gaming uppercase tracking-[0.4em] mb-2 ml-4 font-black">Comm Channel</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl sm:rounded-3xl px-8 py-5 sm:py-7 text-slate-900 focus:outline-none focus:border-blue-600 transition-all text-sm sm:text-lg font-bold placeholder:text-slate-300 shadow-sm"
                      placeholder="EMAIL@HQ.COM"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-slate-400 text-[9px] sm:text-[11px] font-gaming uppercase tracking-[0.4em] mb-2 ml-4 font-black">Signal Content</label>
                    <textarea 
                      required
                      rows={5}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl sm:rounded-[3rem] px-8 py-6 sm:py-8 text-slate-900 focus:outline-none focus:border-blue-600 transition-all text-sm sm:text-lg font-bold placeholder:text-slate-300 resize-none shadow-sm"
                      placeholder="MESSAGE DETAILS..."
                      value={formState.message}
                      onChange={(e) => setFormState({...formState, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-700 text-white font-gaming font-black py-6 sm:py-8 rounded-2xl sm:rounded-[3rem] shadow-xl shadow-blue-200 hover:bg-blue-800 transition-all flex items-center justify-center space-x-4 uppercase tracking-[0.4em] text-xs sm:text-lg active:scale-95"
                  >
                    <span>INITIATE SIGNAL</span>
                    <i className="fas fa-paper-plane text-xs sm:text-xl" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mt-24 sm:mt-40 animate-slide-up">
        <div className="text-center mb-16 sm:mb-24">
          <p className="text-[10px] sm:text-xs font-gaming text-blue-600 uppercase tracking-[0.5em] font-black mb-3">COMMAND MANUAL</p>
          <h3 className="text-2xl sm:text-5xl font-gaming font-black text-slate-900 uppercase tracking-tight">KNOWLEDGE <span className="text-blue-700">BASE</span></h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-[2rem] sm:rounded-[3rem] p-10 sm:p-12 hover:border-blue-200 transition-all group shadow-sm hover:shadow-lg">
              <h5 className="text-slate-900 text-sm sm:text-xl font-black mb-6 uppercase tracking-tight group-hover:text-blue-700 transition-colors font-gaming leading-tight">{faq.question}</h5>
              <p className="text-slate-500 text-[11px] sm:text-base font-medium leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
