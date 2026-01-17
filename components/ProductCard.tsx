
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onToggleWishlist,
  isWishlisted 
}) => {
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="group relative bg-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(14,165,233,0.1)]">
      {/* Product Image */}
      <div 
        className="relative aspect-[4/3] sm:aspect-video overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {discount > 0 && (
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-sky-500 text-white text-[8px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-full font-gaming">
            -{discount}%
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full glass transition-colors ${isWishlisted ? 'text-red-500' : 'text-white hover:text-red-500'}`}
        >
          <svg className="w-4 h-4 sm:w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-3 sm:p-5">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <span className="text-[8px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center text-yellow-500">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] ml-1 text-slate-300">{product.rating}</span>
          </div>
        </div>
        
        <h3 
          className="text-white font-bold text-xs sm:text-base md:text-lg mb-2 sm:mb-3 truncate cursor-pointer hover:text-sky-400 transition-colors"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-slate-500 text-[8px] sm:text-xs line-through">{product.originalPrice.toFixed(2)} DH</span>
            )}
            <span className="text-xs sm:text-lg md:text-xl font-gaming font-bold text-sky-400">{product.price.toFixed(2)} DH</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-slate-800 text-white p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-sky-500 transition-all transform active:scale-90"
          >
            <svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
