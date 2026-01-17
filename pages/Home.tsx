import React from 'react';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface HomeProps {
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  setActivePage: (p: string) => void;
}

const Home: React.FC<HomeProps> = ({ onAddToCart, onViewDetails, onToggleWishlist, wishlist, setActivePage }) => {
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-32 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[800px] h-[250px] sm:h-[800px] bg-sky-500/5 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full text-sky-400 text-[9px] sm:text-[10px] font-gaming uppercase tracking-[0.2em] mb-6 sm:mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-ping" />
              <span>Next Gen Marketplace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-gaming font-extrabold text-white leading-[1.1] mb-6 sm:mb-8 animate-slide-up">
              LEVEL UP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                YOUR GAME
              </span>
            </h1>
            <p className="text-sm sm:text-xl text-slate-400 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto sm:mx-0 animate-slide-up">
              Instant delivery of digital games, high-tier accounts, and gift cards. Trusted by 15k+ gamers globally.
            </p>
            
            {/* Trust Badges - Mobile Optimized */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-10 animate-slide-up">
              <div className="flex items-center space-x-2 text-[9px] font-gaming uppercase tracking-widest text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
                <span>🔒 Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-gaming uppercase tracking-widest text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
                <span>⚡ Instant Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-gaming uppercase tracking-widest text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
                <span>🛡️ Money-Back</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up">
              <button 
                onClick={() => setActivePage('shop')}
                className="px-8 py-4 bg-sky-500 text-white font-gaming font-bold text-xs uppercase rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:bg-sky-600 transition-all flex items-center justify-center space-x-2"
              >
                <span>Browse Shop</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <a 
                href="https://discord.gg/eF9W6C6q" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 bg-slate-900 text-white font-gaming font-bold text-xs uppercase rounded-xl border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2"
              >
                <i className="fab fa-discord"></i>
                <span>Join Discord</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {[
            { label: 'Total Sales', value: '50k+', icon: '🚀' },
            { label: 'Happy Gamers', value: '15k+', icon: '🎮' },
            { label: 'Products', value: '1.2k', icon: '📦' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 flex items-center sm:block text-left sm:text-center hover:border-sky-500/30 transition-all animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <span className="text-2xl sm:text-3xl mr-4 sm:mr-0 sm:mb-4 block">{stat.icon}</span>
              <div>
                <div className="text-xl sm:text-3xl font-gaming font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-gaming font-bold text-white mb-2 sm:mb-4">
              HOT <span className="text-sky-400">DEALS</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-base max-w-xl">
              Exclusive limited-time discounts on our most popular items.
            </p>
          </div>
          <button 
            onClick={() => setActivePage('shop')}
            className="text-sky-400 font-gaming text-[9px] sm:text-sm uppercase tracking-widest hover:text-sky-300 flex items-center group transition-colors"
          >
            <span>View Marketplace</span>
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} className="animate-scale-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-r from-sky-600 to-purple-700 p-8 sm:p-20 text-center animate-fade-in">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-xl sm:text-4xl md:text-5xl font-gaming font-bold text-white mb-4 sm:mb-6 uppercase tracking-wider">Join the Community</h2>
            <p className="text-sky-100 text-sm sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto">
              Access member-only drops and 24/7 priority support.
            </p>
            <a 
              href="https://discord.gg/eF9W6C6q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 sm:px-10 sm:py-5 bg-white text-sky-600 font-gaming font-extrabold text-[10px] sm:text-base rounded-2xl hover:bg-slate-100 transition-all shadow-xl"
            >
              <i className="fab fa-discord mr-3 text-lg sm:text-2xl"></i>
              MOONNIGHT HUB
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;