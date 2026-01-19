
import React, { useState } from 'react';
import { TranslationKeys } from '../translations';

interface FooterProps {
  onSecretEntrance: () => void;
  t: (key: TranslationKeys) => string;
}

const Footer: React.FC<FooterProps> = ({ onSecretEntrance, t }) => {
  const [emailValue, setEmailValue] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailValue.trim() === 'admin02') {
      onSecretEntrance();
      setEmailValue('');
    } else {
      alert('Thank you for subscribing to MoonNight updates!');
      setEmailValue('');
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -mb-48 -mr-48" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-gaming font-black text-xl shadow-lg shadow-blue-950">
                M
              </div>
              <span className="text-white font-gaming text-xl font-black uppercase tracking-tight">
                MoonNight <span className="text-blue-400">Shop</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
              Elite marketplace for premium digital gaming assets. Secure protocol and instant deployment since 2024.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all group">
                <i className="fab fa-facebook-f text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="https://discord.gg/eF9W6C6q" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all group">
                <i className="fab fa-discord text-lg group-hover:scale-110 transition-transform"></i>
              </a>
              <a href="https://www.instagram.com/moonnight_community" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-all group">
                <i className="fab fa-instagram text-lg group-hover:scale-110 transition-transform"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-gaming text-[10px] font-black mb-10 tracking-[0.4em] uppercase opacity-50">Operations</h4>
            <ul className="space-y-5 text-sm font-bold uppercase tracking-widest">
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-slate-400 hover:text-blue-400 transition-colors text-[10px] flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" /> Back to Top</button></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-[10px] flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" /> Boutique</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-[10px] flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" /> VIP Assets</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-gaming text-[10px] font-black mb-10 tracking-[0.4em] uppercase opacity-50">Assistance</h4>
            <ul className="space-y-5 text-sm font-bold uppercase tracking-widest">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-[10px] flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" /> Protocol FAQ</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-[10px] flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" /> Command Uplink</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-[10px] flex items-center gap-2 group"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors" /> HQ Location</a></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-white font-gaming text-[10px] font-black mb-10 tracking-[0.4em] uppercase opacity-50">Newsletter</h4>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Secure exclusive intel and deployment drops directly to your inbox.</p>
            <form onSubmit={handleJoin} className="flex flex-col space-y-3">
              <input 
                type="text" 
                placeholder="PILOT COMM ID (EMAIL)" 
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-[10px] w-full focus:outline-none focus:border-blue-500 text-white font-bold tracking-widest shadow-inner"
              />
              <button type="submit" className="bg-blue-700 text-white px-6 py-4 rounded-xl hover:bg-blue-600 transition-all font-gaming text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-950/20 active:scale-95">
                JOIN UPLINK
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-10 flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
          <p className="text-slate-500 text-[9px] font-gaming font-black uppercase tracking-[0.3em]">
            © 2024 MoonNight Shop Operations. Security Protocol Active.
          </p>
          <div className="flex items-center space-x-8 opacity-40 hover:opacity-100 transition-opacity">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
            <span className="text-white font-gaming text-[8px] font-black tracking-[0.4em] border border-slate-700 px-3 py-1 rounded">CRYPTO READY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
