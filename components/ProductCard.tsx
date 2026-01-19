
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
      className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col h-full cursor-pointer"
      onClick={() => onViewDetails(product)}
    >
      {/* Product Image - Top Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 border-b border-slate-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
        
        {/* Category Badge overlay on image bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-blue-700/90 backdrop-blur-sm text-[8px] text-white text-center py-2 font-gaming uppercase font-bold tracking-[0.2em] transition-colors group-hover:bg-blue-600">
          {product.category}
        </div>

        {/* Wishlist Toggle - Floating */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-red-500 transition-all z-10 shadow-sm ${isWishlisted ? 'text-red-500' : ''}`}
        >
          <i className={`${isWishlisted ? 'fas' : 'far'} fa-heart text-xs`}></i>
        </button>
      </div>

      {/* Details - Body Section */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
           <span className="text-[9px] font-gaming text-blue-600 font-bold tracking-widest uppercase bg-blue-50 px-2 py-1 rounded">
             {product.stock > 0 ? `${product.stock} in Stock` : 'Sold Out'}
           </span>
           <div className="flex items-center space-x-1 text-yellow-400 text-[10px]">
             <i className="fas fa-star"></i>
             <span className="text-slate-500 font-bold">{product.rating}</span>
           </div>
        </div>

        <h3 className="text-slate-900 font-bold text-sm sm:text-[15px] mb-4 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 flex flex-col space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-gaming font-black text-slate-900 tracking-tighter">
                <span className="text-xs mr-0.5">$</span>
                {(product.price * 0.1).toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-slate-400 line-through">
                  ${(product.originalPrice * 0.1).toFixed(2)}
                </span>
              )}
            </div>
            <div className="bg-blue-50 text-blue-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">
              Instant
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full bg-blue-700 text-white py-3.5 rounded-xl text-[10px] font-gaming uppercase font-black transition-all duration-300 active:scale-95 shadow-lg shadow-blue-100 group-hover:bg-blue-600 group-hover:shadow-[0_0_20px_rgba(29,78,216,0.6)] group-hover:scale-[1.02]"
          >
            {buyText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
