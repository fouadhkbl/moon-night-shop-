
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
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[100] transition-all duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[320px] sm:max-w-md bg-slate-950 z-[101] border-l border-slate-800 shadow-2xl transition-all duration-500 transform ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/10">
            <div className="space-y-0.5">
              <h2 className="text-[11px] sm:text-[13px] font-gaming font-black text-white tracking-[0.2em] uppercase">{t('cart')}</h2>
              <p className="text-[8px] text-sky-500 font-gaming uppercase tracking-widest opacity-80">
                {items.length} {t('items')} DETECTED
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800"
            >
              <i className="fas fa-times text-[10px] sm:text-xs"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                <i className="fas fa-ghost text-4xl text-slate-700"></i>
                <h3 className="text-white font-gaming text-[9px] uppercase tracking-widest">{t('emptyCart')}</h3>
              </div>
            ) : (
              items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex space-x-3 bg-slate-900/20 p-3 rounded-xl border border-slate-800/50 hover:border-sky-500/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800 shadow-lg">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-[9px] sm:text-[11px] font-bold truncate mb-0.5">{item.name}</h4>
                      <span className="text-sky-400 text-[8px] sm:text-[10px] font-gaming font-black">{item.price.toFixed(0)} DH</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-md border border-slate-800">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-slate-600 hover:text-sky-400 px-1"><i className="fas fa-minus text-[6px]"></i></button>
                        <span className="text-white text-[9px] font-gaming w-3 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-slate-600 hover:text-sky-400 px-1"><i className="fas fa-plus text-[6px]"></i></button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-slate-700 hover:text-red-500 transition-colors"><i className="far fa-trash-alt text-[9px]"></i></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/30">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-[8px] sm:text-[10px] uppercase font-gaming tracking-widest text-slate-500">
                  <span>Subtotal</span>
                  <span>{total.toFixed(0)} DH</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
                  <span className="text-white font-gaming text-[9px] sm:text-[11px] uppercase tracking-widest">{t('total')}</span>
                  <span className="text-xl sm:text-2xl font-gaming neon-text-blue font-black tracking-tight">
                    {total.toFixed(0)} <span className="text-[9px] sm:text-[11px] text-sky-500">DH</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-sky-500 text-white font-gaming font-black py-4 rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:bg-sky-600 transition-all text-[10px] sm:text-[12px] uppercase tracking-[0.2em] active:scale-[0.98]"
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
