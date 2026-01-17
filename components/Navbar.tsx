
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
    { id: 'shop', label: 'Market' },
    { id: 'contact', label: 'Support' },
  ];

  const handlePageChange = (pageId: string) => {
    setActivePage(pageId);
    setIsMenuOpen(false); 
  };

  const handleSupportClick = () => {
    if (user) {
      setActivePage('account');
    } else {
      setActivePage('contact');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-sky-500/30 h-28">
      <div className="max-w-[1440px] mx-auto px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div 
            className="flex items-center space-x-5 cursor-pointer group"
            onClick={() => handlePageChange('home')}
          >
            <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-2xl shadow-sky-500/20 flex items-center justify-center transform group-hover:scale-110 transition-all duration-500">
              <span className="text-white font-gaming font-black text-4xl">M</span>
            </div>
            <span className="text-white font-gaming text-3xl lg:text-4xl font-black tracking-tight">
              MoonNight <span className="text-sky-400">Shop</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-16">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-xl font-gaming uppercase tracking-[0.25em] font-black transition-all hover:scale-110 ${
                  activePage === link.id ? 'text-sky-400 neon-text-blue' : 'text-slate-400 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-8 lg:space-x-10">
            {/* Chat Icon - New Support Link */}
            <button 
              onClick={handleSupportClick}
              className="group relative p-4 text-slate-400 hover:text-sky-400 transition-all transform hover:scale-125"
              title="Contact Seller"
            >
              <i className="fas fa-comments text-3xl lg:text-4xl"></i>
              <span className="absolute top-2 right-2 w-4 h-4 bg-sky-500 rounded-full border-2 border-slate-950 notification-dot"></span>
            </button>

            {/* Shopping Cart */}
            <button 
              onClick={onOpenCart}
              className="group relative p-4 text-slate-400 hover:text-sky-400 transition-all transform hover:scale-125"
            >
              <i className="fas fa-shopping-bag text-3xl lg:text-4xl"></i>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-sky-500 text-white text-[14px] font-black w-8 h-8 flex items-center justify-center rounded-full ring-4 ring-slate-900 shadow-xl">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button 
              onClick={() => handlePageChange(user ? 'account' : 'auth')}
              className={`flex items-center space-x-4 px-6 py-4 rounded-2xl border-2 transition-all group ${
                user 
                  ? 'text-sky-400 border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10' 
                  : 'text-slate-400 border-slate-800 hover:border-sky-500/50 hover:text-sky-400'
              }`}
            >
              <i className="fas fa-user-circle text-3xl"></i>
              {user && (
                <span className="hidden xl:inline text-base font-gaming font-black uppercase tracking-widest max-w-[150px] truncate">
                  {user.name}
                </span>
              )}
            </button>

            <button 
              className="lg:hidden p-4 text-slate-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars-staggered'} text-4xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden glass border-t border-sky-500/20 py-20 animate-fade-in shadow-2xl h-screen">
          <div className="flex flex-col space-y-16 px-12 text-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-3xl font-gaming uppercase tracking-[0.3em] font-black ${
                  activePage === link.id ? 'text-sky-400' : 'text-slate-400'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button 
              onClick={handleSupportClick}
              className="text-3xl font-gaming uppercase tracking-[0.3em] font-black text-sky-400"
            >
              Contact Seller
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
