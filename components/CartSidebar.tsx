
import React from 'react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Overlay: Smooth Fade & Blur */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-all duration-500 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer: Refined Slide with custom easing */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-950 z-[101] shadow-[-20px_0_80px_rgba(0,0,0,0.8)] border-l border-slate-800/50 transition-all duration-500 transform ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
            <div className="space-y-1">
              <h2 className="text-xl font-gaming font-bold text-white tracking-[0.2em] uppercase">Inventory</h2>
              <p className="text-[10px] text-sky-400 font-gaming uppercase tracking-widest opacity-70">
                {items.length} Secure Assets
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all group"
            >
              <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 animate-float">
                  <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-gaming text-sm uppercase tracking-widest">System Empty</h3>
                  <p className="text-slate-500 text-xs max-w-[200px] leading-relaxed">No digital assets found in your current session.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-900 border border-sky-500/30 text-sky-400 text-[10px] font-gaming uppercase tracking-widest rounded-xl hover:bg-sky-500 hover:text-white transition-all shadow-lg hover:shadow-sky-500/20"
                >
                  Return to Market
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flex space-x-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 group hover:border-sky-500/40 transition-all duration-500 transform ${
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
                  }`}
                  style={{ transitionDelay: `${150 + index * 60}ms` }}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800 relative group-hover:border-sky-500/50 transition-colors">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-sm font-bold truncate mb-0.5 group-hover:text-sky-400 transition-colors">{item.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sky-400 text-xs font-gaming">{item.price.toFixed(2)} MAD</span>
                        <span className="text-slate-600 text-[8px] uppercase font-gaming">Per unit</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4 bg-slate-950/50 rounded-lg px-3 py-1.5 border border-slate-800">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="text-slate-500 hover:text-sky-400 transition-colors flex items-center justify-center w-4 h-4"
                        >
                          <i className="fas fa-minus text-[10px]"></i>
                        </button>
                        <span className="text-white text-xs font-gaming w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="text-slate-500 hover:text-sky-400 transition-colors flex items-center justify-center w-4 h-4"
                        >
                          <i className="fas fa-plus text-[10px]"></i>
                        </button>
                      </div>
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <i className="far fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Detailed summary and CTAs */}
          {items.length > 0 && (
            <div className={`p-8 border-t border-slate-800 bg-slate-900/40 backdrop-blur-sm transition-all duration-700 transform ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs uppercase font-gaming tracking-widest text-slate-500">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)} MAD</span>
                </div>
                <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-white font-gaming text-sm uppercase tracking-[0.2em]">Total Credits</span>
                  <span className="text-white text-3xl font-gaming neon-text-blue font-bold tracking-tighter">
                    {total.toFixed(2)} <span className="text-xs text-sky-500">MAD</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full relative overflow-hidden group bg-sky-500 text-white font-gaming font-bold py-5 rounded-2xl shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:shadow-sky-500/50 transition-all transform active:scale-[0.98]"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
                <span className="relative flex items-center justify-center space-x-3">
                  <span>INITIALIZE CHECKOUT</span>
                  <i className="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <div className="flex items-center justify-center space-x-6 mt-6 opacity-40">
                <i className="fab fa-cc-visa text-xl"></i>
                <i className="fab fa-cc-mastercard text-xl"></i>
                <i className="fab fa-cc-paypal text-xl"></i>
                <i className="fab fa-bitcoin text-xl"></i>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
