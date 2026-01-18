
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

  const handlePageChange = (pageId: string) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-cyan-500/20 h-16 sm:h-24 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo Area */}
            <div 
              className="flex items-center space-x-2 sm:space-x-4 cursor-pointer group flex-shrink-0"
              onClick={() => handlePageChange('home')}
            >
              <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.3)] flex items-center justify-center transform group-hover:scale-105 transition-all">
                <span className="text-white font-gaming font-black text-sm sm:text-2xl">M</span>
              </div>
              <span className="text-white font-gaming text-sm sm:text-2xl lg:text-3xl font-black tracking-tight whitespace-nowrap uppercase">
                MoonNight <span className="text-cyan-400">Shop</span>
              </span>
            </div>

            {/* Desktop Only Center Nav */}
            <div className="hidden lg:flex items-center justify-center space-x-12 flex-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handlePageChange(link.id)}
                  className={`text-[11px] xl:text-[13px] font-gaming uppercase tracking-[0.2em] font-bold transition-all hover:text-cyan-400 ${
                    activePage === link.id ? 'neon-text-cyan' : 'text-slate-500'
                  }`}
                >
                  {t(link.label)}
                </button>
              ))}
            </div>

            {/* Right Icons Area */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-4">
              <div className="hidden md:flex bg-slate-900/50 border border-slate-800 rounded-lg p-0.5">
                <button onClick={() => setLanguage('EN')} className={`px-2.5 py-1 rounded text-[8px] font-gaming font-black transition-all ${language === 'EN' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500'}`}>EN</button>
                <button onClick={() => setLanguage('FR')} className={`px-2.5 py-1 rounded text-[8px] font-gaming font-black transition-all ${language === 'FR' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500'}`}>FR</button>
              </div>

              <button 
                onClick={() => handlePageChange(user ? 'account' : 'auth')}
                className={`p-2 sm:p-2.5 rounded-lg border transition-all ${
                  user ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' : 'text-slate-500 border-transparent hover:text-cyan-400'
                }`}
              >
                <i className="fas fa-user-circle text-lg sm:text-2xl"></i>
              </button>

              <button 
                onClick={onOpenCart}
                className="relative p-2 sm:p-2.5 text-slate-500 hover:text-cyan-400 transition-all transform active:scale-90"
              >
                <i className="fas fa-shopping-bag text-lg sm:text-2xl"></i>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[8px] sm:text-[10px] font-black w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR: HIGH-END NEON HUD */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/98 backdrop-blur-2xl border-t border-cyan-500/40 h-16 flex justify-around items-center px-4 pb-safe shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
        <div className="hud-scanline opacity-10" />

        {navLinks.map((link) => {
          const isActive = activePage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => handlePageChange(link.id)}
              className="relative flex flex-col items-center justify-center w-full h-full transition-all group overflow-hidden"
            >
              {isActive && (
                <div className="absolute inset-0 nav-button-glow animate-pulse" />
              )}
              
              <div className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive ? 'translate-y-0' : 'translate-y-0.5'
              }`}>
                <div className="relative">
                  <i className={`fas ${link.icon} ${isActive ? 'text-xl text-cyan-400' : 'text-lg text-slate-500'} transition-all`}></i>
                  {isActive && (
                    <div className="absolute -inset-2 bg-cyan-400/20 rounded-full blur-lg animate-pulse -z-1" />
                  )}
                </div>
                <span className={`text-[8px] font-gaming font-black uppercase tracking-[0.25em] transition-all ${
                  isActive ? 'text-cyan-400' : 'text-slate-600'
                }`}>
                  {t(link.label)}
                </span>
              </div>
              
              {isActive && (
                <>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.6)] rounded-b-full" />
                  <div className="absolute bottom-1.5 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,1)]" />
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Navbar;
