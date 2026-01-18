
import React, { useState } from 'react';
/* Import TranslationKeys to define prop type */
import { TranslationKeys } from '../translations';

interface FooterProps {
  onSecretEntrance: () => void;
  /* Add t prop to resolve TS mismatch */
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
      alert('Merci de rejoindre notre communauté !');
      setEmailValue('');
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-sky-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-gaming font-bold text-sm">
                M
              </div>
              <span className="text-white font-gaming text-lg font-bold">
                MoonNight <span className="text-sky-400">Shop</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Marketplace premium pour actifs de gaming digitaux. Sécurisé, rapide et fiable depuis 2021.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-400 transition-all">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://discord.gg/eF9W6C6q" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-400 transition-all">
                <i className="fab fa-discord"></i>
              </a>
              <a href="https://www.instagram.com/moonnight_community?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-400 transition-all">
                <i className="fab fa-instagram text-lg"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-gaming text-sm font-bold mb-6 tracking-widest uppercase">Navigation</h4>
            <ul className="space-y-4 text-sm">
              <li><button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-slate-400 hover:text-sky-400 transition-colors text-left">Retour en haut</button></li>
              <li><a href="#" className="text-slate-400 hover:text-sky-400 transition-colors">Boutique</a></li>
              <li><a href="#" className="text-slate-400 hover:text-sky-400 transition-colors">Comptes VIP</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-gaming text-sm font-bold mb-6 tracking-widest uppercase">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-sky-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-slate-400 hover:text-sky-400 transition-colors">Contactez-nous</a></li>
              <li><a href="#" className="text-slate-400 hover:text-sky-400 transition-colors">Discord Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-gaming text-sm font-bold mb-6 tracking-widest uppercase">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Recevez les offres exclusives par email.</p>
            <form onSubmit={handleJoin} className="flex">
              <input 
                type="text" 
                placeholder="Votre email" 
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-sky-500 text-white"
              />
              <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-r-lg hover:bg-sky-600 transition-colors font-gaming text-[10px] uppercase">
                OK
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-500 text-[10px] font-gaming uppercase">
            © 2024 MoonNight Shop. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
            <span className="text-slate-400 text-xs font-gaming">CRYPTO</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;