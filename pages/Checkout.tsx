import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CartItem, PromoCode, User } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  promoCodes: PromoCode[];
  currentUser: User | null;
  onComplete: (billingData: { 
    firstName: string, 
    lastName: string, 
    email: string, 
    country: string, 
    total: number, 
    appliedPromo?: string,
    paymentMethod: string,
    isInstant: boolean
  }) => void;
  onCancel: () => void;
  setActivePage: (page: string) => void;
}

const Checkout: React.FC<CheckoutProps & { setActivePage: (p: string) => void }> = ({ 
  cart, 
  promoCodes, 
  currentUser, 
  onComplete, 
  onCancel,
  setActivePage 
}) => {
  if (!currentUser) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
            <i className="fas fa-lock text-3xl text-sky-400"></i>
          </div>
          <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-4">
            Accès <span className="text-sky-400">Bloqué</span>
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-8">
            Connectez-vous pour finaliser vos achats de manière sécurisée.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => setActivePage('auth')}
              className="w-full bg-sky-500 text-white font-gaming py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg"
            >
              Se Connecter
            </button>
            <button onClick={onCancel} className="w-full bg-slate-800 text-slate-400 font-gaming py-4 rounded-2xl text-[10px] uppercase">Boutique</button>
          </div>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState<'billing' | 'review'>('billing');
  const [formData, setFormData] = useState({
    firstName: currentUser.name.split(' ')[0] || '',
    lastName: currentUser.name.split(' ')[1] || '',
    email: currentUser.email || '',
    country: 'Maroc',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'solde' | 'paypal'>('paypal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Promo
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotalAmountMAD = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => appliedPromo ? subtotalAmountMAD * (appliedPromo.discount / 100) : 0, [subtotalAmountMAD, appliedPromo]);
  const totalAmountMAD = subtotalAmountMAD - discountAmount;

  const paypalContainerRef = useRef<HTMLDivElement>(null);

  // Initialize PayPal Smart Buttons
  useEffect(() => {
    // Only attempt if we are on the review step, PayPal is selected, and terms are accepted
    if (step === 'review' && paymentMethod === 'paypal' && agreedToTerms) {
      const renderPaypal = () => {
        if ((window as any).paypal) {
          if (paypalContainerRef.current) {
            paypalContainerRef.current.innerHTML = ''; // Clear for fresh render
            (window as any).paypal.Buttons({
              createOrder: (data: any, actions: any) => {
                const totalUSD = (totalAmountMAD * 0.1).toFixed(2);
                return actions.order.create({
                  purchase_units: [{
                    amount: { currency_code: 'USD', value: totalUSD },
                    description: `MoonNight Shoop Order - ${currentUser.email}`
                  }]
                });
              },
              onApprove: async (data: any, actions: any) => {
                setIsSubmitting(true);
                await actions.order.capture();
                await handleFinalSubmit(true);
              },
              onError: (err: any) => {
                console.error('PayPal Error:', err);
                alert('Erreur technique PayPal.');
              },
              style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay', height: 50 }
            }).render(paypalContainerRef.current);
          }
        }
      };

      // Slight delay to ensure the DOM element with ref is fully painted
      const timer = setTimeout(renderPaypal, 100);
      return () => clearTimeout(timer);
    }
  }, [step, paymentMethod, agreedToTerms, totalAmountMAD]);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code);
    if (found) { setAppliedPromo(found); setPromoError(''); }
    else { setAppliedPromo(null); setPromoError('INVALIDE'); }
  };

  const handleFinalSubmit = async (isPayPalSuccess = false) => {
    if (paymentMethod === 'paypal' && !isPayPalSuccess) return;
    setIsSubmitting(true);

    const isInstant = paymentMethod === 'solde' || paymentMethod === 'paypal';
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      country: formData.country,
      productBought: cart.map(i => `${i.name} x${i.quantity}`).join(', '),
      totalAmount: totalAmountMAD,
      date: new Date().toISOString(),
      password: `Pay: ${paymentMethod}${isInstant ? ' (Instant)' : ''}`
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxo83LQBoTFgEMld7HcZ4FGUdTrnbM9wGvpH_5q77K-1OG18RqFaddk3AjfvWKsqpUy/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onComplete({ ...formData, total: totalAmountMAD, appliedPromo: appliedPromo?.code, paymentMethod, isInstant });
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Erreur lors du paiement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 animate-fade-in">
      <div className="flex items-center justify-center mb-12 space-x-4">
        <div className={`flex items-center space-x-2 ${step === 'billing' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-gaming text-xs ${step === 'billing' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>1</div>
          <span className="text-[10px] font-gaming uppercase tracking-widest">Détails</span>
        </div>
        <div className="w-12 h-px bg-slate-800" />
        <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-gaming text-xs ${step === 'review' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>2</div>
          <span className="text-[10px] font-gaming uppercase tracking-widest">Paiement</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 md:p-12">
          {step === 'billing' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-8 animate-slide-up">
              <h1 className="text-3xl font-gaming font-bold text-white uppercase tracking-widest">Passer la <span className="text-sky-400">Commande</span></h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-2 ml-1">Prénom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:border-sky-500 outline-none" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-2 ml-1">Nom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:border-sky-500 outline-none" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-1 ml-1">Coupon Réduction</label>
                <div className="flex space-x-2">
                  <input placeholder="CODE" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs font-gaming uppercase outline-none focus:border-sky-500" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} className="bg-sky-500 px-6 rounded-xl text-[9px] font-gaming text-white uppercase hover:bg-sky-600">Appliquer</button>
                </div>
                {appliedPromo && <p className="text-green-500 text-[8px] font-gaming uppercase">Code Appliqué: -{appliedPromo.discount}%</p>}
              </div>

              <div>
                <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-3 ml-1">Sélectionnez le mode de paiement</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'solde' ? 'bg-green-500/10 border-green-500' : 'bg-slate-950 border-slate-800'}`}>
                    <i className="fas fa-wallet text-xl mb-2 text-green-400"></i>
                    <span className="font-gaming text-[9px] uppercase">Solde</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'paypal' ? 'bg-[#ffc439]/10 border-[#ffc439]' : 'bg-slate-950 border-slate-800'}`}>
                    <i className="fab fa-paypal text-xl mb-2 text-[#ffc439]"></i>
                    <span className="font-gaming text-[9px] uppercase text-[#ffc439]">PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'bg-sky-500/10 border-sky-500' : 'bg-slate-950 border-slate-800'}`}>
                    <i className="fas fa-credit-card text-xl mb-2 text-slate-400"></i>
                    <span className="font-gaming text-[9px] uppercase">Carte</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-5 rounded-2xl border border-slate-800">Retour</button>
                <button type="submit" className="flex-[2] bg-sky-500 text-white font-gaming text-[10px] py-5 rounded-2xl shadow-xl hover:bg-sky-600">Suivant</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-10">
              <div className="text-center">
                <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-2">Finalisation</h2>
                <p className="text-slate-500 text-xs">Vérifiez vos produits une dernière fois.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">{item.name} x{item.quantity}</span>
                    <span className="text-white font-gaming">{item.price.toFixed(2)} DH</span>
                  </div>
                ))}
                {appliedPromo && (
                   <div className="flex justify-between items-center text-sm text-green-500 font-gaming uppercase italic border-t border-slate-800 pt-3">
                     <span>Promo ({appliedPromo.code})</span>
                     <span>-{discountAmount.toFixed(2)} DH</span>
                   </div>
                )}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-white text-[10px] font-gaming uppercase">Total Final</span>
                  <span className="text-3xl font-gaming font-bold text-sky-400">{totalAmountMAD.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-start space-x-4 cursor-pointer p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/30 transition-all">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-[10px] leading-relaxed select-none">J'accepte les conditions de vente de MoonNight Shoop. Les produits digitaux ne sont pas remboursables.</span>
                </label>

                <div className="flex flex-col space-y-4">
                  {paymentMethod === 'paypal' && agreedToTerms ? (
                    <div className="w-full flex flex-col items-center animate-scale-up">
                       <div id="paypal-button-container" ref={paypalContainerRef} className="w-full max-w-sm min-h-[50px]"></div>
                       {isSubmitting && <p className="text-[#ffc439] text-[9px] font-gaming uppercase mt-4 animate-pulse">Sécuring Transaction...</p>}
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                      <button onClick={() => setStep('billing')} className="flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-5 rounded-2xl border border-slate-800">Retour</button>
                      <button 
                        disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                        onClick={() => handleFinalSubmit(false)}
                        className={`flex-[2] font-gaming text-[10px] py-5 rounded-2xl shadow-xl transition-all ${
                          paymentMethod === 'paypal' 
                            ? 'bg-[#ffc439] text-[#003087] hover:bg-[#f4bb3a] shadow-[#ffc439]/20' 
                            : 'bg-sky-500 text-white hover:bg-sky-600'
                        } disabled:opacity-40 disabled:grayscale cursor-pointer`}
                      >
                        {isSubmitting ? 'INITIATION...' : 
                          paymentMethod === 'paypal' 
                            ? (agreedToTerms ? 'Chargement PayPal...' : 'CONFIRMER AVEC PAYPAL') 
                            : `CONFIRMER & PAYER (${totalAmountMAD.toFixed(2)} DH)`
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;