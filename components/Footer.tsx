
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
      alert('Welcome to the MoonNight Shoop community!');
      setEmailValue('');
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-gaming font-black text-xl">M</div>
              <span className="text-white font-gaming text-xl font-black uppercase tracking-tight">MoonNight <span className="text-blue-500">Shoop</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Premium marketplace for elite digital assets. Instant delivery protocols since 2024.</p>
          </div>
          <div>
            <h4 className="text-white font-gaming text-[10px] font-black mb-8 tracking-widest uppercase opacity-50">Quick Links</h4>
            <ul className="space-y-4 text-[10px] font-gaming uppercase tracking-widest">
              <li><a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">Marketplace</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">Support Center</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">Discord Link</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-gaming text-[10px] font-black mb-8 tracking-widest uppercase opacity-50">Legal</h4>
            <ul className="space-y-4 text-[10px] font-gaming uppercase tracking-widest">
              <li><a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">Refund Policy</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-gaming text-[10px] font-black mb-8 tracking-widest uppercase opacity-50">Newsletter</h4>
            <form onSubmit={handleJoin} className="flex flex-col space-y-3">
              <input 
                type="text" 
                placeholder="EMAIL ADDRESS" 
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 text-[10px] font-gaming text-white focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="bg-blue-600 text-white py-4 rounded-xl font-gaming text-[10px] font-black uppercase hover:bg-blue-500 transition-all">JOIN UPLINK</button>
            </form>
          </div>
        </div>
        <div className="border-t border-slate-900 pt-10 flex justify-between items-center">
          <p className="text-slate-600 text-[9px] font-gaming uppercase tracking-[0.2em]">© 2024 MoonNight Shoop Operations.</p>
          <div className="flex space-x-6 opacity-30">
            <i className="fab fa-paypal text-white"></i>
            <i className="fab fa-cc-visa text-white"></i>
            <i className="fab fa-cc-mastercard text-white"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
