
import React, { useState } from 'react';
import { User } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, activePage, setActivePage, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'contact', label: 'Support' },
  ];

  const handlePageChange = (pageId: string) => {
    setActivePage(pageId);
    setIsMenuOpen(false); 
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-sky-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handlePageChange('home')}
          >
            <div className="relative w-10 h-10 flex-shrink-0 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300">
              <span className="text-white font-gaming font-bold text-xl">M</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse shadow-sm"></div>
            </div>
            <span className="text-white font-gaming text-lg sm:text-xl font-bold tracking-tight">
              MoonNight <span className="text-sky-400">Shop</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-sm font-gaming uppercase tracking-widest transition-colors ${
                  activePage === link.id ? 'text-sky-400 neon-text-blue' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => handlePageChange(user ? 'account' : 'auth')}
              className={`p-2 transition-all flex items-center space-x-2 ${user ? 'text-sky-400' : 'text-slate-300 hover:text-sky-400'}`}
            >
              <div className="relative">
                <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </div>
              {user && (
                <span className="hidden lg:inline text-[10px] font-gaming uppercase tracking-widest truncate max-w-[80px]">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </button>
            
            <button 
              onClick={onOpenCart}
              className="relative p-2 text-slate-300 hover:text-sky-400 transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-slate-900">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              className="md:hidden p-2 text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass border-t border-sky-500/20 py-6 animate-fade-in shadow-2xl">
          <div className="flex flex-col space-y-6 px-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-left text-sm font-gaming uppercase tracking-[0.2em] py-2 ${
                  activePage === link.id ? 'text-sky-400' : 'text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
