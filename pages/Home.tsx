
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
    <div className="space-y-32 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full text-sky-400 text-xs font-gaming uppercase tracking-[0.2em] mb-8 animate-slide-down">
              <span className="w-2 h-2 bg-sky-400 rounded-full animate-ping" />
              <span>Next Gen Digital Marketplace</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-gaming font-extrabold text-white leading-tight mb-8 animate-slide-up stagger-1">
              LEVEL UP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                YOUR GAME
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl animate-slide-up stagger-2">
              Instant delivery of the world's most popular digital games, high-tier accounts, and gift cards. Trusted by 15k+ gamers on Discord.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up stagger-3">
              <button 
                onClick={() => setActivePage('shop')}
                className="px-8 py-4 bg-sky-500 text-white font-gaming font-bold rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:bg-sky-600 hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-1 active:scale-95"
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
                className="px-8 py-4 bg-slate-900 text-white font-gaming font-bold rounded-xl border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 transform hover:-translate-y-1 active:scale-95"
              >
                <i className="fab fa-discord"></i>
                <span>Join Discord (15k+)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 hidden lg:flex items-center justify-center opacity-40 animate-fade-in stagger-4">
           <div className="relative w-96 h-96">
             <div className="absolute inset-0 bg-sky-500 rounded-full blur-[100px] opacity-20" />
             <div className="absolute inset-0 border-4 border-sky-400/20 rounded-full animate-spin-slow" />
             <div className="absolute inset-8 border-2 border-purple-500/20 rounded-full animate-reverse-spin" />
             <div className="absolute inset-0 flex items-center justify-center animate-float">
                <div className="w-64 h-64 glass rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
                  <div className="w-12 h-12 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/50" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-slate-700/50 rounded" />
                    <div className="h-4 w-3/4 bg-slate-700/50 rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-sky-400/50 rounded" />
                    <div className="w-8 h-8 bg-slate-700/50 rounded-full" />
                  </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {[
            { label: 'Total Sales', value: '50k+', icon: '🚀' },
            { label: 'Happy Gamers', value: '15k+', icon: '🎮' },
            { label: 'Active Products', value: '1.2k', icon: '📦' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 text-center hover:border-sky-500/30 transition-all hover:-translate-y-2 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <span className="text-3xl mb-4 block">{stat.icon}</span>
              <div className="text-3xl font-gaming font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs font-gaming text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-5xl font-gaming font-bold text-white mb-4">
              HOT <span className="text-sky-400">DEALS</span>
            </h2>
            <p className="text-slate-400 max-w-xl">
              Hand-picked digital products with exclusive limited-time discounts. Grab them before they're gone!
            </p>
          </div>
          <button 
            onClick={() => setActivePage('shop')}
            className="text-sky-400 font-gaming text-sm uppercase tracking-widest hover:text-sky-300 flex items-center group transition-colors"
          >
            <span>View All Products</span>
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-600 to-purple-700 p-12 md:p-20 text-center animate-fade-in">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-gaming font-bold text-white mb-6 uppercase tracking-wider">Join the Elite Community</h2>
            <p className="text-sky-100 text-lg mb-10 max-w-2xl mx-auto">
              Get access to member-only drops, real-time restocking alerts, and 24/7 priority support on our Discord server.
            </p>
            <a 
              href="https://discord.gg/eF9W6C6q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-10 py-5 bg-white text-sky-600 font-gaming font-extrabold rounded-2xl hover:bg-slate-100 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:scale-95"
            >
              <i className="fab fa-discord mr-3 text-2xl"></i>
              ENTER MOONNIGHT HUB
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
