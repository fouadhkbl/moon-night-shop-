
import React, { useState, useMemo } from 'react';
import { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';
import { TranslationKeys } from '../translations';

interface ShopProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
  t: (key: TranslationKeys) => string;
}

const Shop: React.FC<ShopProps> = ({ products, onAddToCart, onViewDetails, onToggleWishlist, wishlist, t }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Featured' | 'PriceLow' | 'PriceHigh' | 'Newest'>('Featured');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  const categories: (Category | 'All')[] = [
    'All', 'Games', 'Accounts', 'Gift Cards', 'Items', 'Subscriptions', 'Currency', 'Software', 'Keys'
  ];

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'All') result = result.filter(p => p.category === activeCategory);
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sortBy) {
      case 'PriceLow': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'PriceHigh': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'Newest': result = [...result].reverse(); break;
      default: break;
    }
    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-8 animate-fade-in">
      <div className="mb-8 space-y-4">
        <h1 className="text-white font-gaming uppercase tracking-widest text-xl sm:text-3xl">
          {t('shop')}
        </h1>
        
        {/* COMPACT FILTER ROW: SEARCH + CATEGORIES + SORT ALL ON SAME LEVEL */}
        <div className="flex flex-col lg:flex-row gap-2.5 items-center animate-slide-up bg-slate-900/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/50">
          
          {/* SEARCH BAR (Compact) */}
          <div className="relative w-full lg:w-44 xl:w-56 flex-shrink-0">
            <input 
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-8 py-2 text-[9px] text-white focus:outline-none focus:border-sky-500 w-full transition-all"
            />
            <i className="fas fa-search text-sky-500 absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px]" />
          </div>

          {/* CATEGORIES SCROLL */}
          <div className="flex-1 flex overflow-x-auto gap-1.5 no-scrollbar py-0.5 w-full lg:w-auto px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[8px] font-gaming font-black uppercase tracking-widest transition-all border ${
                  activeCategory === cat 
                    ? 'bg-sky-500 text-white border-sky-400 shadow-sm' 
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-sky-500/50 hover:text-white'
                }`}
              >
                {cat === 'All' ? t('all') : cat}
              </button>
            ))}
          </div>

          {/* SORT & VIEW MODE */}
          <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 border-slate-800/30 pt-2 lg:pt-0">
            <div className="relative flex-1 lg:flex-initial">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full lg:w-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-8 text-[8px] font-gaming uppercase text-white outline-none appearance-none cursor-pointer"
              >
                <option value="Featured">Recommended</option>
                <option value="PriceLow">Price: Low</option>
                <option value="PriceHigh">Price: High</option>
                <option value="Newest">Newest</option>
              </select>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[8px] pointer-events-none" />
            </div>

            <div className="hidden sm:flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`w-7 h-7 rounded-md flex items-center justify-center ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-600'}`}><i className="fas fa-th-large text-[9px]" /></button>
              <button onClick={() => setViewMode('large')} className={`w-7 h-7 rounded-md flex items-center justify-center ${viewMode === 'large' ? 'bg-sky-500 text-white' : 'text-slate-600'}`}><i className="fas fa-list text-[9px]" /></button>
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className={`grid gap-3 sm:gap-6 ${
          viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
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
      ) : (
        <div className="py-24 text-center opacity-40">
          <i className="fas fa-search text-3xl mb-4 block" />
          <p className="font-gaming text-[10px] uppercase">No results found</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
