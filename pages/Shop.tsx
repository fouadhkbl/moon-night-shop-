
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

// Fix: Adding the missing default export and completing the component to resolve the error in App.tsx
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

  const getCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Header */}
      <div className="pt-24 sm:pt-40 pb-6 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center space-x-0 relative">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Search for games, top-ups, items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-l-2xl px-12 py-5 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          </div>
          <button className="bg-blue-600 text-white px-8 py-5 rounded-r-2xl flex items-center justify-center hover:bg-blue-700 transition-all font-gaming text-xs font-black shadow-lg shadow-blue-100">
            SEARCH
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex overflow-x-auto no-scrollbar space-x-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-6 border-b-2 transition-all whitespace-nowrap text-[10px] font-gaming font-black uppercase tracking-widest ${
                activeCategory === cat ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {cat} <span className="ml-1 opacity-40">({getCount(cat)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <p className="text-[10px] font-gaming text-slate-400 uppercase tracking-widest font-black">
            Found {filteredProducts.length} Results
          </p>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-slate-100">
             <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value as any)}
               className="bg-transparent border-none outline-none text-[10px] font-gaming font-black uppercase tracking-widest text-slate-600 px-4 cursor-pointer"
             >
               <option value="Featured">Featured</option>
               <option value="PriceLow">Price: Low to High</option>
               <option value="PriceHigh">Price: High to Low</option>
               <option value="Newest">Newest</option>
             </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-32 text-center">
            <i className="fas fa-search-minus text-5xl text-slate-200 mb-6"></i>
            <h3 className="text-slate-400 font-gaming text-[12px] uppercase tracking-widest font-black">No matches found for your criteria</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product} 
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
