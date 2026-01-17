
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState<'billing' | 'review'>('billing');
  const [formData, setFormData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ')[1] || '',
    email: currentUser?.email || '',
    country: 'Maroc',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'solde' | 'paypal' | 'card'>('paypal');
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
  const paypalInstanceRef = useRef<any>(null);
  const isRenderingRef = useRef<boolean>(false);

  const isExternalPayment = paymentMethod === 'paypal' || paymentMethod === 'card';

  const handleFinalSubmit = async (isExternalSuccess = false) => {
    if (isExternalPayment && !isExternalSuccess) return;
    setIsSubmitting(true);

    const isInstant = paymentMethod === 'solde' || isExternalPayment;
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      country: formData.country,
      productBought: cart.map(i => `${i.name} x${i.quantity}`).join(', '),
      totalAmount: totalAmountMAD,
      date: new Date().toISOString(),
      paymentMeta: `PayMethod: ${paymentMethod.toUpperCase()}${isInstant ? ' (Auto-Complete)' : ''}`
    };

    try {
      if (process.env.LOG_SCRIPT_URL) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        await fetch(process.env.LOG_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }).catch(e => console.warn("Background log skipped:", e));
        
        clearTimeout(timeoutId);
      }
      onComplete({ ...formData, total: totalAmountMAD, appliedPromo: appliedPromo?.code, paymentMethod, isInstant });
    } catch (error) {
      console.error("Submit error:", error);
      onComplete({ ...formData, total: totalAmountMAD, appliedPromo: appliedPromo?.code, paymentMethod, isInstant });
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const cleanupPaypal = async () => {
      if (paypalInstanceRef.current) {
        try {
          if (typeof paypalInstanceRef.current.close === 'function') {
            await paypalInstanceRef.current.close();
          }
        } catch (e) {
          console.warn("PayPal cleanup:", e);
        }
        paypalInstanceRef.current = null;
      }
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
      }
      isRenderingRef.current = false;
    };

    if (step !== 'review' || !isExternalPayment || !agreedToTerms || isSuccess) {
      cleanupPaypal();
      setIsPaypalReady(false);
      return;
    }

    const initPaypalFlow = async () => {
      if (isRenderingRef.current) return;
      isRenderingRef.current = true;

      // DOM Wait
      await new Promise(r => setTimeout(r, 500));
      
      if (!isMounted || !paypalContainerRef.current) {
        isRenderingRef.current = false;
        return;
      }

      try {
        const paypal = (window as any).paypal;
        if (!paypal) {
          if (isMounted) setPaypalError("PayPal SDK indisponible.");
          isRenderingRef.current = false;
          return;
        }

        paypalContainerRef.current.innerHTML = ''; 
        setPaypalError(null);
        setIsPaypalReady(false);

        const config = {
          fundingSource: paymentMethod === 'card' ? paypal.FUNDING.CARD : paypal.FUNDING.PAYPAL,
          createOrder: (data: any, actions: any) => {
            const totalUSD = (totalAmountMAD * 0.1).toFixed(2);
            return actions.order.create({
              purchase_units: [{
                amount: { currency_code: 'USD', value: totalUSD },
                description: `MoonNight Order - ${currentUser?.email}`
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            if (!isMounted) return;
            try {
              setIsSubmitting(true);
              await actions.order.capture();
              if (isMounted) {
                setIsSuccess(true);
                setTimeout(() => handleFinalSubmit(true), 800);
              }
            } catch (e) {
              console.error("Capture failed:", e);
              if (isMounted) {
                setPaypalError("Capture du paiement échouée.");
                setIsSubmitting(false);
              }
            }
          },
          onInit: () => {
            if (isMounted) setIsPaypalReady(true);
          },
          onError: (err: any) => {
            console.error("PayPal SDK Error:", err);
            if (isMounted) {
              setPaypalError("Erreur de passerelle de paiement.");
              setIsPaypalReady(false);
              isRenderingRef.current = false;
            }
          },
          style: {
            layout: 'vertical',
            color: paymentMethod === 'card' ? 'black' : 'gold',
            shape: 'pill',
            label: paymentMethod === 'card' ? 'buynow' : 'pay',
            height: 48
          }
        };

        const button = paypal.Buttons(config);
        if (button.isEligible()) {
          paypalInstanceRef.current = button;
          await button.render(paypalContainerRef.current);
        } else {
          if (isMounted) setPaypalError("Mode de paiement non éligible.");
          isRenderingRef.current = false;
        }
      } catch (err) {
        console.error("Init Exception:", err);
        if (isMounted) {
          setPaypalError("Erreur d'initialisation PayPal.");
          isRenderingRef.current = false;
        }
      }
    };

    initPaypalFlow();
    
    return () => {
      isMounted = false;
      cleanupPaypal();
    };
  }, [step, paymentMethod, agreedToTerms, totalAmountMAD, isExternalPayment, currentUser?.email, isSuccess]);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code);
    if (found) setAppliedPromo(found);
    else setAppliedPromo(null);
  };

  if (!currentUser) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in text-center">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2.5rem] shadow-2xl">
          <i className="fas fa-lock text-3xl text-sky-400 mb-6 block"></i>
          <h2 className="text-xl font-gaming font-bold text-white uppercase tracking-widest mb-6">Connexion Requise</h2>
          <button onClick={() => setActivePage('auth')} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl text-[10px] uppercase">Se Connecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 animate-fade-in relative">
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm rounded-[2.5rem] animate-fade-in">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 animate-scale-up">
              <i className="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest">Transaction Réussie</h2>
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center mb-10 space-x-3">
        <div className={`flex items-center space-x-2 ${step === 'billing' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-gaming text-[10px] ${step === 'billing' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>1</div>
          <span className="hidden sm:inline text-[9px] font-gaming uppercase tracking-widest">Détails</span>
        </div>
        <div className="w-8 h-px bg-slate-800" />
        <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-gaming text-[10px] ${step === 'review' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>2</div>
          <span className="hidden sm:inline text-[9px] font-gaming uppercase tracking-widest">Validation</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-12">
          {step === 'billing' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-8 animate-slide-up">
              <h1 className="text-2xl sm:text-3xl font-gaming font-bold text-white uppercase tracking-widest">Paiement</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2">Prénom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:border-sky-500 outline-none" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2">Nom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white text-sm focus:border-sky-500 outline-none" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-1 ml-1">Code de réduction</label>
                <div className="flex space-x-2">
                  <input placeholder="MOONNIGHT24" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white text-xs font-gaming uppercase outline-none" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} className="bg-sky-500 px-6 rounded-xl text-[10px] font-gaming text-white uppercase hover:bg-sky-600">Vérifier</button>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-4">Mode de règlement</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'solde' ? 'bg-green-500/10 border-green-500 shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <i className={`fas fa-wallet text-2xl mb-2 ${paymentMethod === 'solde' ? 'text-green-400' : 'text-slate-500'}`}></i>
                    <span className="font-gaming text-[9px] uppercase">Solde</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'paypal' ? 'bg-[#ffc439]/10 border-[#ffc439] shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <i className={`fab fa-paypal text-2xl mb-2 ${paymentMethod === 'paypal' ? 'text-[#ffc439]' : 'text-slate-500'}`}></i>
                    <span className="font-gaming text-[9px] uppercase">PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'card' ? 'bg-sky-500/10 border-sky-500 shadow-lg' : 'bg-slate-950 border-slate-800'}`}>
                    <i className={`fas fa-credit-card text-2xl mb-2 ${paymentMethod === 'card' ? 'text-sky-400' : 'text-slate-500'}`}></i>
                    <span className="font-gaming text-[9px] uppercase">Carte</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="button" onClick={onCancel} className="sm:flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-4 rounded-xl border border-slate-800 uppercase tracking-widest">Boutique</button>
                <button type="submit" className="sm:flex-[2] bg-sky-500 text-white font-gaming text-[10px] py-4 rounded-xl shadow-xl hover:bg-sky-600 uppercase tracking-widest">Suivant</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-1">Résumé Final</h2>
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em]">Transaction Sécurisée</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{item.name} x{item.quantity}</span>
                    <span className="text-white font-gaming">{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
                {appliedPromo && (
                  <div className="flex justify-between items-center text-[10px] font-gaming text-green-400 uppercase pt-2">
                    <span>Coupon Appliqué</span>
                    <span>-{discountAmount.toFixed(2)} DH</span>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-white text-[10px] font-gaming uppercase tracking-widest">Total Net</span>
                  <span className="text-2xl sm:text-3xl font-gaming font-bold text-sky-400">{totalAmountMAD.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-start space-x-4 cursor-pointer p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-sky-500/20 transition-all group">
                  <input type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-800 bg-slate-950 text-sky-500 focus:ring-0 cursor-pointer" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-[9px] leading-relaxed select-none group-hover:text-slate-300">
                    J'accepte que l'achat de produits digitaux est ferme et définitif.
                  </span>
                </label>

                <div className="flex flex-col space-y-4">
                  {isExternalPayment && agreedToTerms ? (
                    <div className="w-full flex flex-col items-center animate-fade-in min-h-[200px]">
                      {paypalError && (
                        <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4 text-center">
                          <p className="text-red-500 text-[10px] font-gaming uppercase">{paypalError}</p>
                          <button onClick={() => { setAgreedToTerms(false); setTimeout(() => setAgreedToTerms(true), 200); }} className="mt-2 text-sky-400 text-[9px] font-gaming uppercase underline">Réessayer</button>
                        </div>
                      )}
                      
                      <div className="w-full max-w-sm flex flex-col items-center">
                        <div id="paypal-button-container" ref={paypalContainerRef} className="w-full min-h-[140px] bg-slate-950/30 rounded-3xl border border-slate-800/50 flex items-center justify-center p-6 relative">
                           {!isPaypalReady && !paypalError && (
                             <div className="flex flex-col items-center space-y-3">
                               <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                               <div className="text-sky-500 text-[9px] font-gaming uppercase animate-pulse tracking-widest">Synchronisation...</div>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4 w-full animate-fade-in">
                      <button onClick={() => setStep('billing')} className="sm:flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-4 rounded-xl border border-slate-800 uppercase tracking-widest hover:text-white transition-colors">Retour</button>
                      <button 
                        disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                        onClick={() => handleFinalSubmit(false)}
                        className={`sm:flex-[2] font-gaming text-[10px] py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest ${
                          paymentMethod === 'paypal' ? 'bg-[#ffc439] !text-[#003087]' :
                          paymentMethod === 'card' ? 'bg-white !text-black' :
                          'bg-sky-500 text-white'
                        } disabled:opacity-40 disabled:grayscale cursor-pointer`}
                      >
                        {isSubmitting ? 'Traitement...' : 
                          paymentMethod === 'solde' ? `Confirmer (${totalAmountMAD.toFixed(2)} DH)` : 'Accepter & Payer'
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
