
import React from 'react';
import { CartItem } from '../types';
import { TranslationKeys } from '../translations';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
  t: (key: TranslationKeys) => string;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onUpdateQuantity,
  onCheckout,
  t
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
          {/* Header - Fixed font size and normal tracking to prevent overlap */}
          <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
            <div className="space-y-0.5">
              <h2 className="text-xs font-gaming font-bold text-white tracking-wider uppercase m-0 leading-none">{t('cart')}</h2>
              <p className="text-[8px] text-sky-400 font-gaming uppercase tracking-widest opacity-70 m-0">
                {items.length} {t('items')}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in opacity-40">
                <i className="fas fa-shopping-basket text-4xl text-slate-700"></i>
                <h3 className="text-white font-gaming text-[9px] uppercase tracking-widest">{t('emptyCart')}</h3>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flex space-x-3 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/80 group hover:border-sky-500/40 transition-all duration-300 transform ${
                    isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${100 + index * 40}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-[10px] font-bold truncate mb-0.5">{item.name}</h4>
                      <span className="text-sky-400 text-[9px] font-gaming">{item.price.toFixed(2)} DH</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-slate-950/50 rounded-md px-1.5 py-0.5 border border-slate-800">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-slate-500 hover:text-sky-400"><i className="fas fa-minus text-[7px]"></i></button>
                        <span className="text-white text-[9px] font-gaming w-3 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-slate-500 hover:text-sky-400"><i className="fas fa-plus text-[7px]"></i></button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-slate-600 hover:text-red-500"><i className="far fa-trash-alt text-[9px]"></i></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-900/40 backdrop-blur-sm">
              <div className="space-y-1.5 mb-5">
                <div className="flex justify-between items-center text-[9px] uppercase font-gaming tracking-widest text-slate-500">
                  <span>Subtotal</span>
                  <span>{total.toFixed(2)} DH</span>
                </div>
                <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-white font-gaming text-[10px] uppercase tracking-widest">{t('total')}</span>
                  <span className="text-white text-xl font-gaming neon-text-blue font-bold tracking-tight">
                    {total.toFixed(2)} <span className="text-[9px] text-sky-500">DH</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-sky-500 text-white font-gaming font-bold py-3.5 rounded-xl shadow-lg hover:shadow-sky-500/30 transition-all text-[10px] uppercase tracking-widest"
              >
                {t('checkout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
