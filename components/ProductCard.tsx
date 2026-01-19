
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
  const buyText = t ? t('buyNow') : 'BUY NOW';

  return (
    <div 
      className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center p-3 sm:p-5 mb-3 cursor-pointer"
      onClick={() => onViewDetails(product)}
    >
      {/* Product Image - Left Side with intensified zoom */}
      <div className="relative w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-125"
        />
        {/* Category Badge overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 bg-blue-700/90 backdrop-blur-sm text-[6px] sm:text-[8px] text-white text-center py-1 font-gaming uppercase font-bold tracking-widest transition-colors group-hover:bg-blue-600">
          {product.category}
        </div>
      </div>

      {/* Details - Center */}
      <div className="flex-1 px-4 sm:px-6 flex flex-col justify-center min-w-0">
        <h3 className="text-slate-900 font-bold text-[12px] sm:text-[16px] mb-1 sm:mb-2 line-clamp-2 leading-tight font-sans group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="inline-block bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-medium transition-colors group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700">
            {product.stock > 0 ? `${product.stock} Stock` : 'Out of stock'}
          </span>
          <span className="inline-block bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold">
            Full Access
          </span>
        </div>
      </div>

      {/* Price Area - Right Side */}
      <div className="flex flex-col items-end justify-center min-w-[80px] sm:min-w-[120px] text-right">
        <span className="text-slate-400 text-[9px] sm:text-[11px] font-medium lowercase italic">starting from</span>
        <div className="text-[16px] sm:text-[24px] font-gaming font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-700 transition-colors">
          <span className="text-[10px] sm:text-[14px] mr-0.5">$</span>
          {(product.price * 0.1).toFixed(2)}
        </div>
        
        {/* Intensified Action Button with Neon Glow */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="mt-3 bg-blue-700 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-[8px] sm:text-[10px] font-gaming uppercase font-black transition-all duration-300 active:scale-90 shadow-sm group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(29,78,216,0.6),0_0_40px_rgba(29,78,216,0.3)] group-hover:ring-2 group-hover:ring-blue-400 group-hover:ring-offset-2 group-hover:scale-105"
        >
          {buyText}
        </button>
      </div>

      {/* Wishlist Toggle - Subtle corner */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product.id);
        }}
        className={`absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors z-10 ${isWishlisted ? 'text-red-500' : ''}`}
      >
        <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-[10px] sm:text-sm`}></i>
      </button>
    </div>
  );
};

export default ProductCard;
