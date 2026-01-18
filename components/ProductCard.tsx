
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
  const buyText = t ? t('buyNow') : 'BUY NOW';

  return (
    <div className="group relative hud-card rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)] h-full flex flex-col">
      {/* Product Image */}
      <div 
        className="relative aspect-square sm:aspect-[16/10] overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60" />
        
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-cyan-500 text-white text-[7px] font-bold px-2 py-0.5 rounded font-gaming shadow-lg">
            -{discount}%
          </div>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full glass transition-all ${isWishlisted ? 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'text-white hover:text-red-500'}`}
        >
          <svg className="w-2.5 h-2.5 sm:w-3.5 h-3.5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[7px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-widest font-bold">{product.category}</span>
          <div className="flex items-center text-yellow-500">
            <i className="fas fa-star text-[7px] sm:text-[9px]" />
            <span className="text-[8px] sm:text-[11px] ml-1 text-slate-400 font-bold">{product.rating}</span>
          </div>
        </div>
        
        <h3 
          className="text-white font-bold text-[13px] sm:text-[18px] mb-4 line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors leading-tight min-h-[2.8em] font-gaming uppercase tracking-tight"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-cyan-500/10">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-slate-600 text-[8px] sm:text-[11px] line-through font-mono">{product.originalPrice.toFixed(0)} DH</span>
            )}
            <span className="text-[12px] sm:text-[17px] font-gaming font-black text-cyan-400 neon-text-cyan">{product.price.toFixed(0)} DH</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[8px] sm:text-[11px] font-gaming uppercase font-black hover:bg-cyan-500 hover:text-slate-950 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all active:scale-90"
          >
            {buyText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
