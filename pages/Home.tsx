
import React from 'react';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { TranslationKeys } from '../translations';

interface HomeProps {
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  setActivePage: (page: string) => void;
  t: (key: TranslationKeys) => string;
}

const Home: React.FC<HomeProps> = ({ onAddToCart, onViewDetails, onToggleWishlist, wishlist, setActivePage, t }) => {
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-32 pb-24 overflow-hidden relative z-0">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center pt-24 sm:pt-32 pb-12 overflow-hidden z-0">
        <div className="absolute inset-0 z-[-1]">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950 to-slate-950" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-cyan-500/5 rounded-full blur-[80px] sm:blur-[140px]" />
          <div className="hud-scanline opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 w-full text-center sm:text-left">
          <div className="inline-flex items-center space-x-3 bg-slate-900/50 border border-cyan-500/20 px-4 py-2 rounded-lg text-cyan-400 text-[8px] sm:text-[10px] font-gaming uppercase tracking-[0.3em] mb-8 animate-fade-in shadow-xl">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,255,1)]" />
            <span>STORE ONLINE</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-gaming font-black text-white leading-[1.1] mb-8 animate-slide-up relative z-10">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              {t('heroTitle')}
            </span>
          </h1>
          
          <p className="text-xs sm:text-lg text-slate-500 mb-12 leading-relaxed max-w-xl mx-auto sm:mx-0 animate-slide-up relative z-10 font-mono tracking-wide uppercase">
            {t('heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up relative z-10">
            <button 
              onClick={() => setActivePage('shop')}
              className="px-10 py-5 bg-cyan-500 text-slate-950 font-gaming font-black text-[10px] sm:text-[11px] uppercase rounded-xl shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:bg-cyan-400 hover:scale-[1.02] transition-all active:scale-95 tracking-[0.2em]"
            >
              {t('accessMarket')}
            </button>
            <a 
              href="https://discord.gg/eF9W6C6q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-10 py-5 bg-slate-900 text-white font-gaming font-black text-[10px] sm:text-[11px] uppercase rounded-xl border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 tracking-[0.2em]"
            >
              <i className="fab fa-discord text-base"></i>
              <span>DISCORD</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex justify-between items-end mb-12 px-2">
          <div className="space-y-2">
            <p className="text-[9px] font-gaming text-cyan-500 uppercase tracking-[0.4em] font-bold">{t('recommended')}</p>
            <h2 className="text-2xl sm:text-4xl font-gaming font-black text-white uppercase tracking-tight">
              HOT <span className="text-cyan-400 neon-text-cyan">PRODUCTS</span>
            </h2>
          </div>
          <button 
            onClick={() => setActivePage('shop')}
            className="text-slate-500 hover:text-cyan-400 font-gaming text-[9px] uppercase tracking-widest font-black transition-colors mb-2"
          >
            VIEW ITEMS
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
                t={t}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
