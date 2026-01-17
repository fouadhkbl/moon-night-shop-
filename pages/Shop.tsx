
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
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-gaming font-bold text-white mb-6 uppercase tracking-wider animate-slide-up">
          MARKET<span className="text-sky-400">PLACE</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:items-center lg:justify-between animate-slide-up stagger-1">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl text-xs font-gaming font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-sky-500/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 text-sm text-white focus:outline-none focus:border-sky-500 w-full sm:w-64"
              />
              <svg className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500 appearance-none cursor-pointer"
            >
              <option value="Featured">Featured</option>
              <option value="PriceLow">Price: Low to High</option>
              <option value="PriceHigh">Price: High to Low</option>
              <option value="Newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
        <div className="py-32 text-center animate-fade-in">
          <div className="text-6xl mb-6">🔍</div>
          <h3 className="text-2xl font-gaming text-white mb-2 uppercase">No items found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
