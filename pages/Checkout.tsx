import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CartItem, PromoCode, User } from '../types';

interface CheckoutProps {
  cart: CartItem[];
  promoCodes: PromoCode[];
  currentUser: User | null;
  onComplete: (billingData: { 
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    total: number;
    appliedPromo?: string;
    paymentMethod: string;
    isInstant: boolean;
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
      payInfo: `PayMethod: ${paymentMethod.toUpperCase()}${isInstant ? ' (Auto)' : ''}`
    };

    try {
      const logUrl = process.env.LOG_SCRIPT_URL;
      if (logUrl) {
        await fetch(logUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
      onComplete({ ...formData, total: totalAmountMAD, appliedPromo: appliedPromo?.code, paymentMethod, isInstant });
    } catch (error) {
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
          // Silently ignore close errors
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

      // Small delay to ensure the DOM is settled
      await new Promise(r => setTimeout(r, 600));
      
      if (!isMounted || !paypalContainerRef.current) {
        isRenderingRef.current = false;
        return;
      }

      try {
        const paypal = (window as any).paypal;
        if (!paypal) {
          if (isMounted) setPaypalError("SDK de paiement indisponible.");
          isRenderingRef.current = false;
          return;
        }

        paypalContainerRef.current.innerHTML = ''; 
        setPaypalError(null);
        setIsPaypalReady(false);

        const config = {
          fundingSource: paymentMethod === 'card' ? paypal.FUNDING.CARD : paypal.FUNDING.PAYPAL,
          createOrder: (data: any, actions: any) => {
            // MAD to USD conversion approx
            const usdVal = (totalAmountMAD * 0.1).toFixed(2);
            return actions.order.create({
              purchase_units: [{
                amount: { currency_code: 'USD', value: usdVal },
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
            if (isMounted) {
              setPaypalError("Erreur lors de l'initialisation du paiement.");
              isRenderingRef.current = false;
            }
          },
          style: { 
            layout: 'vertical', 
            color: paymentMethod === 'card' ? 'black' : 'gold', 
            shape: 'pill', 
            height: 48,
            label: paymentMethod === 'card' ? 'buynow' : 'pay'
          }
        };

        const buttons = paypal.Buttons(config);
        if (buttons.isEligible()) {
          paypalInstanceRef.current = buttons;
          await buttons.render(paypalContainerRef.current);
        } else {
          if (isMounted) setPaypalError("Ce mode de paiement n'est pas éligible.");
          isRenderingRef.current = false;
        }
      } catch (err) {
        console.error("PayPal Init Error:", err);
        if (isMounted) { 
          setPaypalError("Erreur technique de paiement."); 
          isRenderingRef.current = false; 
        }
      }
    };

    initPaypalFlow();
    return () => { 
      isMounted = false; 
      cleanupPaypal(); 
    };
  }, [step, paymentMethod, agreedToTerms, totalAmountMAD, isExternalPayment, isSuccess, currentUser?.email]);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code);
    if (found) {
      setAppliedPromo(found);
    } else {
      alert("Code invalide");
      setAppliedPromo(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2.5rem] shadow-2xl">
          <i className="fas fa-lock text-4xl text-sky-400 mb-6 block"></i>
          <h2 className="text-xl font-gaming font-bold text-white uppercase mb-6 tracking-widest">Connexion Requise</h2>
          <button onClick={() => setActivePage('auth')} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl text-[10px] uppercase tracking-[0.2em]">Se Connecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 animate-fade-in relative">
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm rounded-[2.5rem]">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <i className="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest">Transaction Réussie</h2>
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-12">
          {step === 'billing' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-8 animate-slide-up">
              <h1 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest">Billing Protocol</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-gaming text-slate-500 uppercase tracking-widest ml-4">Prénom</label>
                  <input required placeholder="First Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-sky-500 outline-none" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-gaming text-slate-500 uppercase tracking-widest ml-4">Nom</label>
                  <input required placeholder="Last Name" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:border-sky-500 outline-none" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-gaming text-slate-500 uppercase tracking-widest ml-4">Promotion</label>
                <div className="flex space-x-2">
                  <input placeholder="Code Promo" className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-gaming uppercase outline-none" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} className="bg-sky-500 px-8 rounded-2xl text-[10px] font-gaming text-white uppercase tracking-widest">Apply</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-gaming text-slate-500 uppercase tracking-widest ml-4">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'solde' ? 'border-green-500 bg-green-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fas fa-wallet mb-2"></i>
                    <span className="text-[10px] font-gaming uppercase">Solde</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'paypal' ? 'border-[#ffc439] bg-[#ffc439]/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fab fa-paypal mb-2"></i>
                    <span className="text-[10px] font-gaming uppercase">PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'card' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fas fa-credit-card mb-2"></i>
                    <span className="text-[10px] font-gaming uppercase">Carte</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-950 text-slate-400 font-gaming py-5 rounded-2xl border border-slate-800 uppercase tracking-widest text-[10px] hover:text-white transition-colors">Aborder</button>
                <button type="submit" className="flex-[2] bg-sky-500 text-white font-gaming py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all">Verify Order</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest">Final Review</h2>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Confirm your deployment</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-400 font-gaming uppercase">
                  <span>Subtotal</span>
                  <span>{subtotalAmountMAD.toFixed(2)} DH</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-xs text-green-500 font-gaming uppercase">
                    <span>Discount ({appliedPromo.discount}%)</span>
                    <span>-{discountAmount.toFixed(2)} DH</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-white text-xs font-gaming uppercase tracking-widest">Total Net</span>
                  <span className="text-3xl font-gaming font-bold text-sky-400">{totalAmountMAD.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-center space-x-4 cursor-pointer p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                  <input type="checkbox" className="w-5 h-5 rounded bg-slate-950 text-sky-500 focus:ring-0" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider leading-relaxed">J'accepte que l'achat de produits digitaux est ferme et définitif.</span>
                </label>

                {isExternalPayment && agreedToTerms ? (
                  <div className="w-full flex flex-col items-center min-h-[160px] animate-fade-in">
                    {!isPaypalReady && !paypalError && (
                      <div className="flex flex-col items-center space-y-4 py-8">
                        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sky-400 text-[10px] font-gaming uppercase animate-pulse">Initializing Gateway...</p>
                      </div>
                    )}
                    {paypalError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4 w-full text-center">
                        <p className="text-red-500 text-[10px] font-gaming uppercase">{paypalError}</p>
                      </div>
                    )}
                    <div id="paypal-button-container" ref={paypalContainerRef} className="w-full max-w-sm" />
                  </div>
                ) : (
                  <div className="flex gap-4 w-full animate-fade-in">
                    <button onClick={() => setStep('billing')} className="flex-1 bg-slate-950 text-slate-400 font-gaming py-5 rounded-2xl border border-slate-800 uppercase tracking-widest text-[10px]">Back</button>
                    <button 
                      disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                      onClick={() => handleFinalSubmit(false)}
                      className="flex-[2] bg-sky-500 text-white font-gaming py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-sky-500/20 hover:bg-sky-600 transition-all disabled:opacity-30"
                    >
                      {isSubmitting ? 'Processing...' : (paymentMethod === 'solde' ? `Confirmer (${totalAmountMAD.toFixed(2)} DH)` : 'Accept & Deploy')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;