
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

  // Helper to count items in a category
  const getCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Header - Fixed top spacing */}
      <div className="pt-24 sm:pt-32 pb-4 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center space-x-0 relative">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Search for games, top-ups, items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-l-md px-10 py-3 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <i className="fas fa-bars absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-r-md flex items-center justify-center hover:bg-blue-700 transition-all">
            <i className="fas fa-search" />
          </button>
        </div>
      </div>

      {/* Category Tabs Section */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center overflow-x-auto no-scrollbar py-4 space-x-2">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 min-w-[120px] sm:min-w-[160px] py-3 px-2 rounded-md border text-center transition-all ${
                activeCategory === cat 
                  ? 'bg-blue-700 border-blue-700 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="text-[12px] sm:text-[14px] font-bold leading-tight uppercase">
                {cat === 'All' ? 'Market' : cat}
              </div>
              <div className={`text-[9px] sm:text-[10px] mt-0.5 font-medium opacity-80`}>
                ({getCount(cat)})
              </div>
            </button>
          ))}
          {/* Arrow for scrolling indicator */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
            <i className="fas fa-chevron-right text-[10px]" />
          </div>
        </div>
      </div>

      {/* Filter & Results Sub-Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="text-slate-400 text-[10px] sm:text-[12px] mb-4">
          {filteredProducts.length} Product Contain {filteredProducts.length} Offers
        </div>
        
        <div className="flex items-center justify-between">
          {/* Filter Button exactly like screenshot */}
          <button className="flex items-center space-x-2 border border-blue-300 bg-white rounded-md px-6 py-2 transition-all hover:bg-blue-50">
            <i className="fas fa-filter text-blue-600 text-xs" />
            <span className="text-slate-800 font-bold text-[10px] sm:text-[12px] uppercase tracking-widest">FILTER</span>
            <span className="w-5 h-5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">0</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[10px] sm:text-[12px]">Sort:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-800 text-[10px] sm:text-[12px] font-bold outline-none cursor-pointer"
            >
              <option value="Featured">Default</option>
              <option value="PriceLow">Price: Low</option>
              <option value="PriceHigh">Price: High</option>
              <option value="Newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-24 mt-6">
        {filteredProducts.length > 0 ? (
          <div className="flex flex-col">
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
          <div className="py-32 text-center text-slate-300">
            <i className="fas fa-search text-5xl mb-6 block opacity-20" />
            <p className="font-gaming text-[12px] uppercase tracking-widest font-black">No products in this sector</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
