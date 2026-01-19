
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
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-all duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-[320px] sm:max-w-md bg-white z-[151] border-l border-slate-200 shadow-2xl transition-all duration-500 transform ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="space-y-0.5">
              <h2 className="text-[11px] sm:text-[13px] font-gaming font-black text-slate-900 tracking-[0.2em] uppercase">{t('cart')}</h2>
              <p className="text-[8px] text-blue-600 font-gaming uppercase tracking-widest font-bold">
                {items.length} {t('items')} DETECTED
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-700 hover:bg-white transition-all border border-slate-200 shadow-sm"
            >
              <i className="fas fa-times text-[10px] sm:text-xs"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30">
                <i className="fas fa-shopping-basket text-5xl text-slate-300"></i>
                <h3 className="text-slate-400 font-gaming text-[10px] uppercase tracking-widest font-black">{t('emptyCart')}</h3>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex space-x-4 bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-slate-900 text-[10px] sm:text-[12px] font-black truncate mb-0.5 uppercase tracking-tight">{item.name}</h4>
                      <span className="text-blue-700 text-[10px] sm:text-[12px] font-gaming font-black">{item.price.toFixed(0)} DH</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="text-slate-400 hover:text-blue-700 px-1 transition-colors"><i className="fas fa-minus text-[8px]"></i></button>
                        <span className="text-slate-900 text-[10px] font-gaming font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="text-slate-400 hover:text-blue-700 px-1 transition-colors"><i className="fas fa-plus text-[8px]"></i></button>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors"><i className="far fa-trash-alt text-[11px]"></i></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50">
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center text-[9px] uppercase font-gaming tracking-widest text-slate-400 font-bold">
                  <span>Subtotal</span>
                  <span className="font-mono">{total.toFixed(0)} DH</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-slate-900 font-gaming text-[10px] sm:text-[12px] uppercase tracking-widest font-black">{t('total')}</span>
                  <span className="text-2xl sm:text-3xl font-gaming text-blue-700 font-black tracking-tighter">
                    {total.toFixed(0)} <span className="text-[10px] sm:text-[12px] text-blue-500">DH</span>
                  </span>
                </div>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-blue-700 text-white font-gaming font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all text-[10px] sm:text-[12px] uppercase tracking-[0.2em] active:scale-[0.98]"
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
