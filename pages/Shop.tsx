import React, { useState, useMemo } from 'react';
import { Category, Product } from '../types';
import ProductCard from '../components/ProductCard';

interface ShopProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  wishlist: string[];
}

const Shop: React.FC<ShopProps> = ({ products, onAddToCart, onViewDetails, onToggleWishlist, wishlist }) => {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'Featured' | 'PriceLow' | 'PriceHigh' | 'Newest'>('Featured');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  const categories: (Category | 'All')[] = [
    'All', 'Games', 'Accounts', 'Gift Cards', 'Items', 'Subscriptions', 'Currency', 'Software', 'Keys'
  ];

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'PriceLow': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'PriceHigh': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'Newest': result = [...result].reverse(); break;
      default: break;
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="pt-24 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-gaming font-bold text-white mb-6 uppercase tracking-wider animate-slide-up">
          MARKET<span className="text-sky-400">PLACE</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center lg:justify-between animate-slide-up">
          {/* Categories - Scrollable on mobile */}
          <div className="flex overflow-x-auto pb-4 lg:pb-0 gap-2 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-gaming font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-sky-500/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-10 py-3 text-sm text-white focus:outline-none focus:border-sky-500 w-full sm:w-48 lg:w-64"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-gaming uppercase tracking-widest"
              >
                <option value="Featured">Featured</option>
                <option value="PriceLow">Price Low</option>
                <option value="PriceHigh">Price High</option>
                <option value="Newest">Newest</option>
              </select>

              {/* View Mode Toggle Button */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Grid View"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('large')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'large' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Large List View"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 max-w-2xl mx-auto'
        }`}>
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
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
      ) : (
        <div className="py-24 text-center animate-fade-in">
          <div className="text-5xl mb-6 opacity-30">🔍</div>
          <h3 className="text-xl font-gaming text-white mb-2 uppercase tracking-widest">No items found</h3>
          <p className="text-slate-500 text-xs">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;