
import React from 'react';
import { User, Language } from '../types';
import { TranslationKeys } from '../translations';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  user: User | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, activePage, setActivePage, user, language, setLanguage, t }) => {
  const navLinks: { id: string; label: TranslationKeys; icon: string }[] = [
    { id: 'home', label: 'home', icon: 'fa-home' },
    { id: 'shop', label: 'shop', icon: 'fa-shopping-basket' },
    { id: 'contact', label: 'support', icon: 'fa-headset' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-slate-800 h-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-full flex items-center justify-between">
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setActivePage('home')}>
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-all shadow-lg shadow-blue-900/20">
            <span className="text-white font-gaming font-black text-xl">M</span>
          </div>
          <span className="text-white font-gaming text-xl font-black uppercase tracking-tight">
            MoonNight <span className="text-blue-500">Shoop</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center space-x-10">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActivePage(link.id)}
              className={`text-[10px] font-gaming uppercase tracking-widest font-black transition-all hover:text-blue-500 ${activePage === link.id ? 'text-blue-500' : 'text-slate-400'}`}
            >
              {t(link.label)}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setActivePage(user ? 'account' : 'auth')}
            className={`text-slate-400 hover:text-blue-500 transition-all ${user ? 'text-blue-500 font-bold' : ''}`}
          >
            <i className="fas fa-user-circle text-2xl"></i>
          </button>
          <button onClick={onOpenCart} className="relative text-slate-400 hover:text-blue-500 transition-all">
            <i className="fas fa-shopping-bag text-2xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
