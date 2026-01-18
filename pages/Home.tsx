
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
    <div className="space-y-12 sm:space-y-32 pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center pt-20 sm:pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[800px] h-[280px] sm:h-[800px] bg-sky-500/5 rounded-full blur-[60px] sm:blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 w-full text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-full text-sky-400 text-[8px] sm:text-[10px] font-gaming uppercase tracking-widest mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping" />
            <span>Lunar Marketplace Active</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-gaming font-black text-white leading-[1] mb-6 animate-slide-up">
            LEVEL <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              UP
            </span>
          </h1>
          
          <p className="text-sm sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto sm:mx-0 animate-slide-up">
            Premium gaming assets, verified accounts, and instant delivery codes. Fast. Secure. Reliable.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up">
            <button 
              onClick={() => setActivePage('shop')}
              className="px-8 py-4 bg-sky-500 text-white font-gaming font-black text-[11px] uppercase rounded-xl shadow-lg hover:bg-sky-600 transition-all active:scale-95"
            >
              SHOP NOW
            </button>
            <a 
              href="https://discord.gg/eF9W6C6q" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-900 text-white font-gaming font-black text-[11px] uppercase rounded-xl border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-center space-x-2"
            >
              <i className="fab fa-discord text-base"></i>
              <span>COMMUNITY</span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl sm:text-4xl font-gaming font-black text-white uppercase">
              HOT <span className="text-sky-400">UPLINKS</span>
            </h2>
          </div>
          <button 
            onClick={() => setActivePage('shop')}
            className="text-sky-400 font-gaming text-[9px] uppercase tracking-widest font-black"
          >
            VIEW ALL
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
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
