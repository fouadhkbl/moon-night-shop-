
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

  const handleSupportClick = () => {
    if (user) {
      setActivePage('account');
      // Note: Account tab switching would need to be handled, 
      // but standard behavior is to go to the chat tab if linked.
    } else {
      setActivePage('contact');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-sky-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => handlePageChange('home')}
          >
            <div className="relative w-12 h-12 flex-shrink-0 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300">
              <span className="text-white font-gaming font-bold text-2xl">M</span>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full animate-pulse shadow-sm"></div>
            </div>
            <span className="text-white font-gaming text-xl sm:text-2xl font-bold tracking-tight">
              MoonNight <span className="text-sky-400">Shop</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-base font-gaming uppercase tracking-widest transition-all hover:scale-110 ${
                  activePage === link.id ? 'text-sky-400 neon-text-blue scale-110' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Chat Icon - New Support Link */}
            <button 
              onClick={handleSupportClick}
              className="p-2.5 text-slate-300 hover:text-sky-400 transition-all hover:scale-110 relative"
              title="Contact Seller"
            >
              <i className="fas fa-comment-dots text-xl sm:text-2xl"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full animate-ping"></span>
            </button>

            <button 
              onClick={onOpenCart}
              className="relative p-2.5 text-slate-300 hover:text-sky-400 transition-all hover:scale-110"
            >
              <i className="fas fa-shopping-cart text-xl sm:text-2xl"></i>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-slate-900">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => handlePageChange(user ? 'account' : 'auth')}
              className={`p-2 transition-all flex items-center space-x-2 border rounded-full px-4 py-2 hover:bg-slate-800/50 ${user ? 'text-sky-400 border-sky-500/30' : 'text-slate-300 border-slate-700 hover:text-sky-400'}`}
            >
              <i className="fas fa-user text-lg"></i>
              {user && (
                <span className="hidden lg:inline text-xs font-gaming uppercase tracking-widest truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </button>

            <button 
              className="md:hidden p-2 text-slate-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden glass border-t border-sky-500/20 py-10 animate-fade-in shadow-2xl">
          <div className="flex flex-col space-y-10 px-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handlePageChange(link.id)}
                className={`text-left text-lg font-gaming uppercase tracking-[0.2em] py-2 ${
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
