
import React, { useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks: { id: string; label: TranslationKeys }[] = [
    { id: 'home', label: 'home' },
    { id: 'shop', label: 'shop' },
    { id: 'contact', label: 'support' },
  ];

  const handlePageChange = (pageId: string) => {
    setActivePage(pageId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-sky-500/20 h-20 sm:h-28 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* MOBILE ONLY: Professional Hamburger on the LEFT with "Etage" look */}
          <div className="lg:hidden flex items-center w-12">
            <button 
              className="w-10 h-10 flex flex-col items-start justify-center space-y-1.5 focus:outline-none z-[80] group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className={`block h-0.5 bg-slate-100 transition-all duration-300 ease-out ${isMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
              <span className={`block h-0.5 bg-sky-400 transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-0 translate-x-4' : 'w-4'}`}></span>
              <span className={`block h-0.5 bg-slate-100 transition-all duration-300 ease-out ${isMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`}></span>
            </button>
          </div>

          {/* Logo Area */}
          <div 
            className="flex items-center space-x-2 sm:space-x-5 cursor-pointer group lg:flex-1"
            onClick={() => handlePageChange('home')}
          >
            <div className="relative w-8 h-8 sm:w-16 sm:h-16 flex-shrink-0 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg sm:rounded-2xl shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-all">
              <span className="text-white font-gaming font-black text-sm sm:text-4xl">M</span>
            </div>
            <span className="text-white font-gaming text-base sm:text-3xl lg:text-4xl font-black tracking-tight whitespace-nowrap">
              MoonNight <span className="text-sky-400">Shop</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center justify-center space-x-12 flex-[2]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-sm xl:text-lg font-gaming uppercase tracking-widest font-black transition-all hover:text-sky-400 ${
                  activePage === link.id ? 'text-sky-400 neon-text-blue' : 'text-slate-400'
                }`}
              >
                {t(link.label)}
              </button>
            ))}
          </div>

          {/* Icons Area */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-6 lg:flex-1">
            <div className="hidden md:flex bg-slate-900/50 border border-slate-800 rounded-lg p-0.5">
              <button onClick={() => setLanguage('EN')} className={`px-2 py-0.5 rounded text-[8px] font-gaming font-black transition-all ${language === 'EN' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>EN</button>
              <button onClick={() => setLanguage('FR')} className={`px-2 py-0.5 rounded text-[8px] font-gaming font-black transition-all ${language === 'FR' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>FR</button>
            </div>

            <button 
              onClick={() => handlePageChange(user ? 'account' : 'auth')}
              className={`p-2 sm:p-3 rounded-lg border transition-all ${
                user ? 'text-sky-400 border-sky-500/20 bg-sky-500/5' : 'text-slate-500 border-transparent hover:text-sky-400'
              }`}
            >
              <i className="fas fa-user-circle text-xl sm:text-3xl"></i>
            </button>

            <button 
              onClick={onOpenCart}
              className="relative p-2 sm:p-3 text-slate-500 hover:text-sky-400 transition-all transform active:scale-90"
            >
              <i className="fas fa-shopping-bag text-xl sm:text-3xl"></i>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] sm:text-[12px] font-black w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border-2 border-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER - DEEP BLACK BACKGROUND */}
      <div className={`lg:hidden fixed inset-0 z-[70] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Deepest Black Overlay */}
        <div className="absolute inset-0 bg-[#020617] border-r border-slate-800" />
        
        <div className="relative flex flex-col h-full pt-20">
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 px-8">
            {navLinks.map((link, idx) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-2xl font-gaming uppercase tracking-[0.3em] font-black transition-all transform duration-500 ${
                  isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } ${
                  activePage === link.id ? 'text-sky-400 neon-text-blue scale-105' : 'text-slate-300 hover:text-white'
                }`}
                style={{ transitionDelay: `${100 + idx * 50}ms` }}
              >
                {t(link.label)}
              </button>
            ))}
          </div>

          {/* DISTINCT LANGUAGE SECTION */}
          <div className={`p-6 pb-12 transition-all duration-700 transform ${
            isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`} style={{ transitionDelay: '300ms' }}>
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <p className="text-center text-[7px] font-gaming text-slate-500 uppercase tracking-widest mb-4">Select Region</p>
              
              <div className="flex space-x-2">
                 <button 
                  onClick={() => setLanguage('EN')} 
                  className={`flex-1 py-3 rounded-lg text-[9px] font-gaming font-black transition-all ${
                    language === 'EN' 
                    ? 'bg-sky-500 text-white shadow-lg' 
                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                  }`}
                 >
                   ENGLISH
                 </button>
                 <button 
                  onClick={() => setLanguage('FR')} 
                  className={`flex-1 py-3 rounded-lg text-[9px] font-gaming font-black transition-all ${
                    language === 'FR' 
                    ? 'bg-sky-500 text-white shadow-lg' 
                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                  }`}
                 >
                   FRANÇAIS
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
