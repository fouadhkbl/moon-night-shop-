
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
      if (process.env.LOG_SCRIPT_URL) {
        await fetch(process.env.LOG_SCRIPT_URL, {
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
        } catch (e) { console.warn("Cleanup:", e); }
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

      // Ensure DOM stability before render
      await new Promise(r => setTimeout(r, 600));
      
      if (!isMounted || !paypalContainerRef.current) {
        isRenderingRef.current = false;
        return;
      }

      try {
        const paypal = (window as any).paypal;
        if (!paypal) {
          if (isMounted) setPaypalError("SDK indisponible.");
          isRenderingRef.current = false;
          return;
        }

        paypalContainerRef.current.innerHTML = ''; 
        setPaypalError(null);
        setIsPaypalReady(false);

        const config = {
          fundingSource: paymentMethod === 'card' ? paypal.FUNDING.CARD : paypal.FUNDING.PAYPAL,
          createOrder: (data: any, actions: any) => {
            const usd = (totalAmountMAD * 0.1).toFixed(2);
            return actions.order.create({
              purchase_units: [{
                amount: { currency_code: 'USD', value: usd },
                description: `MoonNight - ${currentUser?.email}`
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
              if (isMounted) { setPaypalError("Capture échouée."); setIsSubmitting(false); }
            }
          },
          onInit: () => { if (isMounted) setIsPaypalReady(true); },
          onError: (err: any) => { if (isMounted) setPaypalError("Erreur SDK."); isRenderingRef.current = false; },
          style: { layout: 'vertical', color: paymentMethod === 'card' ? 'black' : 'gold', shape: 'pill', height: 48 }
        };

        const button = paypal.Buttons(config);
        if (button.isEligible()) {
          paypalInstanceRef.current = button;
          await button.render(paypalContainerRef.current);
        } else {
          isRenderingRef.current = false;
        }
      } catch (err) {
        if (isMounted) { setPaypalError("Erreur technique."); isRenderingRef.current = false; }
      }
    };

    initPaypalFlow();
    return () => { isMounted = false; cleanupPaypal(); };
  }, [step, paymentMethod, agreedToTerms, totalAmountMAD, isExternalPayment, isSuccess]);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code);
    if (found) setAppliedPromo(found);
    else setAppliedPromo(null);
  };

  if (!currentUser) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2.5rem]">
          <h2 className="text-xl font-gaming font-bold text-white uppercase mb-6">Connexion Requise</h2>
          <button onClick={() => setActivePage('auth')} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl text-[10px] uppercase">Se Connecter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 animate-fade-in relative">
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm rounded-[2.5rem]">
          <div className="text-center">
            <h2 className="text-2xl font-gaming font-bold text-white uppercase mb-4 tracking-widest">Transaction Réussie</h2>
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 sm:p-12">
          {step === 'billing' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-8 animate-slide-up">
              <h1 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest">Paiement</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input required placeholder="Prénom" className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                <input required placeholder="Nom" className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="flex space-x-2">
                <input placeholder="Code Promo" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-white font-gaming" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                <button type="button" onClick={handleApplyPromo} className="bg-sky-500 px-6 rounded-xl text-[10px] font-gaming text-white uppercase">Vérifier</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button type="button" onClick={() => setPaymentMethod('solde')} className={`p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'solde' ? 'border-green-500 bg-green-500/10' : 'border-slate-800'}`}>Solde</button>
                <button type="button" onClick={() => setPaymentMethod('paypal')} className={`p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'paypal' ? 'border-[#ffc439] bg-[#ffc439]/10' : 'border-slate-800'}`}>PayPal</button>
                <button type="button" onClick={() => setPaymentMethod('card')} className={`p-6 rounded-3xl border-2 transition-all ${paymentMethod === 'card' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>Carte</button>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-950 text-slate-400 font-gaming py-4 rounded-xl border border-slate-800 uppercase">Boutique</button>
                <button type="submit" className="flex-[2] bg-sky-500 text-white font-gaming py-4 rounded-xl uppercase shadow-lg shadow-sky-500/20">Suivant</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white text-[10px] font-gaming uppercase">Total Net</span>
                  <span className="text-3xl font-gaming font-bold text-sky-400">{totalAmountMAD.toFixed(2)} DH</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-center space-x-4 cursor-pointer p-5 rounded-3xl bg-slate-950 border border-slate-800">
                  <input type="checkbox" className="w-5 h-5 rounded bg-slate-950 text-sky-500" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-[10px] uppercase">J'accepte que l'achat de produits digitaux est ferme et définitif.</span>
                </label>

                {isExternalPayment && agreedToTerms ? (
                  <div className="w-full flex flex-col items-center min-h-[160px]">
                    {!isPaypalReady && !paypalError && <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>}
                    {paypalError && <p className="text-red-500 text-[10px] uppercase mb-4">{paypalError}</p>}
                    <div id="paypal-button-container" ref={paypalContainerRef} className="w-full max-w-sm" />
                  </div>
                ) : (
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setStep('billing')} className="flex-1 bg-slate-950 text-slate-400 font-gaming py-4 rounded-xl border border-slate-800 uppercase">Retour</button>
                    <button 
                      disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                      onClick={() => handleFinalSubmit(false)}
                      className="flex-[2] bg-sky-500 text-white font-gaming py-4 rounded-xl uppercase shadow-xl"
                    >
                      {isSubmitting ? 'Traitement...' : (paymentMethod === 'solde' ? 'Confirmer' : 'Accepter & Payer')}
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
