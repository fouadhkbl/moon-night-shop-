
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
            Connexion <span className="text-sky-400">Requise</span>
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-8">
            Connectez-vous pour finaliser votre commande en toute sécurité.
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
  const [isPaypalReady, setIsPaypalReady] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const subtotalAmountMAD = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => appliedPromo ? subtotalAmountMAD * (appliedPromo.discount / 100) : 0, [subtotalAmountMAD, appliedPromo]);
  const totalAmountMAD = subtotalAmountMAD - discountAmount;

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsInitializedRef = useRef<boolean>(false);

  // Robust PayPal Initialization for Phone and PC
  useEffect(() => {
    let isMounted = true;
    
    // Clear flags if context changes
    if (step !== 'review' || paymentMethod !== 'paypal' || !agreedToTerms) {
      paypalButtonsInitializedRef.current = false;
      return;
    }

    const initPaypal = async () => {
      try {
        const paypal = (window as any).paypal;
        if (!paypal) {
          if (isMounted) setPaypalError("SDK PayPal non chargé. Rafraîchissez la page.");
          return;
        }

        if (paypalContainerRef.current && !paypalButtonsInitializedRef.current) {
          paypalButtonsInitializedRef.current = true;
          paypalContainerRef.current.innerHTML = ''; 
          setPaypalError(null);
          setIsPaypalReady(false);

          const button = paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              const totalUSD = (totalAmountMAD * 0.1).toFixed(2);
              return actions.order.create({
                purchase_units: [{
                  amount: { currency_code: 'USD', value: totalUSD },
                  description: `Commande MoonNight - ${currentUser.email}`
                }]
              });
            },
            onApprove: async (data: any, actions: any) => {
              if (!isMounted) return;
              setIsSubmitting(true);
              try {
                await actions.order.capture();
                await handleFinalSubmit(true);
              } catch (e) {
                console.error("Capture Error:", e);
                if (isMounted) {
                  setPaypalError("Erreur de capture du paiement.");
                  setIsSubmitting(false);
                }
              }
            },
            onInit: () => {
              if (isMounted) setIsPaypalReady(true);
            },
            onError: (err: any) => {
              console.error("PayPal Error:", err);
              if (isMounted) {
                setPaypalError("Impossible d'initialiser PayPal. Vérifiez votre connexion.");
                paypalButtonsInitializedRef.current = false;
              }
            },
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'pill',
              label: 'pay',
              height: 48
            }
          });

          if (button.isEligible()) {
            await button.render(paypalContainerRef.current);
          } else {
            if (isMounted) setPaypalError("Paiement non éligible sur cet appareil.");
          }
        }
      } catch (err) {
        console.error("Exception in PayPal init:", err);
        if (isMounted) setPaypalError("Erreur technique de paiement.");
      }
    };

    // Delay initialization to ensure the container is fully visible in the DOM
    const timer = setTimeout(initPaypal, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [step, paymentMethod, agreedToTerms, totalAmountMAD]);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code);
    if (found) setAppliedPromo(found);
    else setAppliedPromo(null);
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
      console.error("Submit error:", error);
      alert("Erreur de validation de commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-center mb-10 space-x-3">
        <div className={`flex items-center space-x-2 ${step === 'billing' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-gaming text-[10px] ${step === 'billing' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>1</div>
          <span className="hidden sm:inline text-[9px] font-gaming uppercase">Détails</span>
        </div>
        <div className="w-8 h-px bg-slate-800" />
        <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-gaming text-[10px] ${step === 'review' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>2</div>
          <span className="hidden sm:inline text-[9px] font-gaming uppercase">Paiement</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-12">
          {step === 'billing' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-8 animate-slide-up">
              <h1 className="text-2xl sm:text-3xl font-gaming font-bold text-white uppercase tracking-widest">Informations</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2 ml-1">Prénom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:border-sky-500 outline-none" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2 ml-1">Nom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:border-sky-500 outline-none" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-1 ml-1">Code Coupon</label>
                <div className="flex space-x-2">
                  <input placeholder="VOTRE CODE" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs font-gaming uppercase outline-none" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} className="bg-sky-500 px-6 rounded-xl text-[10px] font-gaming text-white uppercase hover:bg-sky-600">Appliquer</button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-4 ml-1">Choisir un Paiement</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${paymentMethod === 'solde' ? 'bg-green-500/10 border-green-500 shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <i className={`fas fa-wallet text-xl mb-2 ${paymentMethod === 'solde' ? 'text-green-400' : 'text-slate-500'}`}></i>
                    <span className="font-gaming text-[10px] uppercase">Solde</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${paymentMethod === 'paypal' ? 'bg-[#ffc439]/10 border-[#ffc439] shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <i className={`fab fa-paypal text-xl mb-2 ${paymentMethod === 'paypal' ? 'text-[#ffc439]' : 'text-slate-500'}`}></i>
                    <span className={`font-gaming text-[10px] uppercase ${paymentMethod === 'paypal' ? 'text-[#ffc439]' : 'text-slate-500'}`}>PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${paymentMethod === 'card' ? 'bg-sky-500/10 border-sky-500 shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <i className={`fas fa-credit-card text-xl mb-2 ${paymentMethod === 'card' ? 'text-sky-400' : 'text-slate-500'}`}></i>
                    <span className="font-gaming text-[10px] uppercase">Carte</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="button" onClick={onCancel} className="sm:flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-4 rounded-xl border border-slate-800 uppercase">Annuler</button>
                <button type="submit" className="sm:flex-[2] bg-sky-500 text-white font-gaming text-[10px] py-4 rounded-xl shadow-xl hover:bg-sky-600 uppercase">Continuer</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-1">Résumé</h2>
                <p className="text-slate-500 text-[10px]">Vérifiez vos produits avant l'achat final.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{item.name} x{item.quantity}</span>
                    <span className="text-white font-gaming">{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-white text-[10px] font-gaming uppercase">Total Final</span>
                  <span className="text-2xl sm:text-3xl font-gaming font-bold text-sky-400">{totalAmountMAD.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-start space-x-4 cursor-pointer p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-sky-500/20 transition-all">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-[9px] leading-relaxed">
                    J'accepte les conditions générales. Les produits digitaux sont définitifs et non remboursables après livraison par email.
                  </span>
                </label>

                <div className="flex flex-col space-y-4">
                  {/* PayPal Container: No 'display: none' during rendering to avoid SDK host errors */}
                  <div className={`w-full flex flex-col items-center transition-all ${paymentMethod === 'paypal' && agreedToTerms ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute -z-10 h-0 overflow-hidden'}`}>
                     {paypalError && (
                       <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4 text-center">
                         <p className="text-red-500 text-[10px] font-gaming uppercase">{paypalError}</p>
                         <button onClick={() => { setAgreedToTerms(false); setTimeout(() => setAgreedToTerms(true), 200); }} className="mt-2 text-sky-400 text-[9px] font-gaming uppercase underline">Actualiser</button>
                       </div>
                     )}
                     <div id="paypal-button-container" ref={paypalContainerRef} className="w-full max-w-sm min-h-[150px] flex flex-col items-center justify-center bg-slate-950/30 rounded-3xl border border-slate-800/50">
                        {!isPaypalReady && !paypalError && <div className="text-[#ffc439] text-[9px] font-gaming uppercase py-8 animate-pulse">Chargement PayPal...</div>}
                     </div>
                     {isSubmitting && <p className="text-[#ffc439] text-[9px] font-gaming uppercase mt-4 animate-pulse">Finalisation...</p>}
                  </div>

                  {/* Standard Buttons (Visible for non-paypal or when terms not accepted) */}
                  {(!(paymentMethod === 'paypal' && agreedToTerms)) && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full animate-fade-in">
                      <button onClick={() => setStep('billing')} className="sm:flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-4 rounded-xl border border-slate-800 uppercase">Retour</button>
                      <button 
                        disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                        onClick={() => handleFinalSubmit(false)}
                        className={`sm:flex-[2] font-gaming text-[10px] py-4 rounded-xl shadow-xl transition-all uppercase ${
                          paymentMethod === 'paypal' 
                            ? 'bg-[#ffc439] !text-[#003087] hover:bg-[#f4bb3a] shadow-[#ffc439]/10' 
                            : 'bg-sky-500 text-white hover:bg-sky-600'
                        } disabled:opacity-40 disabled:grayscale`}
                      >
                        {isSubmitting ? 'INITIATION...' : 
                          paymentMethod === 'paypal' 
                            ? 'ACTIVER LE PAIEMENT PAYPAL' 
                            : `CONFIRMER ET PAYER (${totalAmountMAD.toFixed(2)} DH)`
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
