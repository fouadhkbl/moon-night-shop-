
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  t?: (key: any) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onToggleWishlist,
  isWishlisted,
  t
}) => {
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const buyText = t ? t('buyNow') : 'Buy Now';

  return (
    <div className="group relative bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden hover:border-sky-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] h-full flex flex-col">
      {/* Product Image */}
      <div 
        className="relative aspect-square sm:aspect-[16/10] overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
        
        {discount > 0 && (
          <div className="absolute top-1.5 left-1.5 bg-sky-500 text-white text-[6px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded-full font-gaming">
            -{discount}%
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-1.5 right-1.5 p-1 rounded-full glass transition-colors ${isWishlisted ? 'text-red-500' : 'text-white hover:text-red-500'}`}
        >
          <svg className="w-2.5 h-2.5 sm:w-3 h-3" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[6px] sm:text-[7px] font-gaming text-slate-500 uppercase tracking-widest truncate max-w-[50px]">{product.category}</span>
          <div className="flex items-center text-yellow-500">
            <svg className="w-1.5 h-1.5 sm:w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[6px] sm:text-[8px] ml-0.5 text-slate-400 font-bold">{product.rating}</span>
          </div>
        </div>
        
        {/* Title - Compact size for better professional look */}
        <h3 
          className="text-white font-bold text-[8px] sm:text-[10px] mb-2 line-clamp-2 cursor-pointer hover:text-sky-400 transition-colors leading-tight min-h-[2em]"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-slate-800/30">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-slate-600 text-[6px] sm:text-[8px] line-through">{product.originalPrice.toFixed(0)} DH</span>
            )}
            <span className="text-[9px] sm:text-[11px] font-gaming font-bold text-sky-400">{product.price.toFixed(0)} DH</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-slate-800 text-white px-2 py-1 rounded-md text-[6px] sm:text-[7px] font-gaming uppercase font-black hover:bg-sky-500 transition-all"
          >
            {buyText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
