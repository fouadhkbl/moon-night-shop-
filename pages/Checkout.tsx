
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
      const logUrl = "https://script.google.com/macros/s/AKfycby2gXGh8SwZ4TrekT02pLmOW9NSh4h8Z87mugRZoH2xwJ1gZ23sDOFfqcKpEoTfAVk/exec";
      await fetch(logUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      
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
        } catch (e) { }
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
          onInit: () => { if (isMounted) setIsPaypalReady(true); },
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
    return () => { isMounted = false; cleanupPaypal(); };
  }, [step, paymentMethod, agreedToTerms, totalAmountMAD, isExternalPayment, isSuccess, currentUser?.email]);

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    const found = promoCodes.find(p => p.code === code);
    if (found) { setAppliedPromo(found); } else { alert("Code invalide"); setAppliedPromo(null); }
  };

  if (!currentUser) {
    return (
      <div className="pt-40 pb-24 max-w-lg mx-auto px-6 text-center">
        <div className="bg-slate-900 border-4 border-slate-800 p-16 rounded-[4rem] shadow-2xl">
          <i className="fas fa-lock text-5xl text-sky-400 mb-8 block"></i>
          <h2 className="text-2xl font-gaming font-bold text-white uppercase mb-10 tracking-widest">Login Required</h2>
          <button onClick={() => setActivePage('auth')} className="w-full bg-sky-500 text-white font-gaming py-6 rounded-[2rem] text-sm uppercase tracking-[0.3em] font-black">ACCESS ACCOUNT</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-24 max-w-5xl mx-auto px-6 animate-fade-in relative">
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md rounded-[5rem]">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/30">
              <i className="fas fa-check text-5xl text-green-500"></i>
            </div>
            <h2 className="text-4xl font-gaming font-black text-white uppercase tracking-[0.2em]">MISSION COMPLETE</h2>
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border-4 border-slate-800 rounded-[5rem] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="p-10 sm:p-20">
          {step === 'billing' ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="space-y-12 animate-slide-up">
              <h1 className="text-4xl font-gaming font-black text-white uppercase tracking-[0.2em]">PILOT DETAILS</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest ml-6 font-black">First Name</label>
                  <input required placeholder="First Name" className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] px-10 py-6 text-white focus:border-sky-500 outline-none text-xl font-bold" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest ml-6 font-black">Last Name</label>
                  <input required placeholder="Last Name" className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] px-10 py-6 text-white focus:border-sky-500 outline-none text-xl font-bold" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest ml-6 font-black">Voucher Protocol</label>
                <div className="flex space-x-4">
                  <input placeholder="ENTER CODE" className="flex-1 bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] px-8 py-6 text-white font-gaming uppercase outline-none text-xl font-bold" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} className="bg-sky-500 px-12 rounded-[2.5rem] text-xs font-gaming text-white uppercase tracking-widest font-black">LINK</button>
                </div>
              </div>

              <div className="space-y-8">
                <label className="text-xs font-gaming text-slate-500 uppercase tracking-widest ml-6 font-black">Payment Protocol</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'solde' ? 'border-green-500 bg-green-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fas fa-wallet mb-4 text-3xl"></i>
                    <span className="text-xs font-gaming uppercase font-black">Solde</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'paypal' ? 'border-[#ffc439] bg-[#ffc439]/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fab fa-paypal mb-4 text-3xl"></i>
                    <span className="text-xs font-gaming uppercase font-black">PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-10 rounded-[3rem] border-4 transition-all ${paymentMethod === 'card' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fas fa-credit-card mb-4 text-3xl"></i>
                    <span className="text-xs font-gaming uppercase font-black">Carte</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-6 pt-10">
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-950 text-slate-400 font-gaming py-7 rounded-[2.5rem] border-4 border-slate-800 uppercase tracking-widest text-xs hover:text-white transition-colors font-black">ABORT</button>
                <button type="submit" className="flex-[2] bg-sky-500 text-white font-gaming py-7 rounded-[2.5rem] uppercase tracking-[0.3em] text-xs shadow-2xl shadow-sky-500/30 hover:bg-sky-600 transition-all font-black">INITIATE REVIEW</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-12">
              <div className="text-center">
                <h2 className="text-4xl font-gaming font-black text-white uppercase tracking-[0.2em]">FINAL UPLINK</h2>
                <p className="text-slate-500 text-xs font-gaming uppercase tracking-[0.4em] mt-4 font-bold">Review deployment details</p>
              </div>

              <div className="bg-slate-950 border-4 border-slate-800 rounded-[3rem] p-12 space-y-8">
                <div className="flex justify-between items-center text-sm text-slate-400 font-gaming uppercase font-black">
                  <span>Gross Total</span>
                  <span>{subtotalAmountMAD.toFixed(2)} DH</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-sm text-green-500 font-gaming uppercase font-black">
                    <span>Applied Discount ({appliedPromo.discount}%)</span>
                    <span>-{discountAmount.toFixed(2)} DH</span>
                  </div>
                )}
                <div className="pt-8 border-t-4 border-slate-800 flex justify-between items-center">
                  <span className="text-white text-base font-gaming uppercase tracking-[0.3em] font-black">NET TOTAL</span>
                  <span className="text-6xl font-gaming font-black text-sky-400 neon-text-blue">{totalAmountMAD.toFixed(2)} <span className="text-xl">DH</span></span>
                </div>
              </div>

              <div className="space-y-10">
                <label className="flex items-center space-x-6 cursor-pointer p-10 rounded-[3rem] bg-slate-950 border-4 border-slate-800 hover:border-slate-700 transition-all">
                  <input type="checkbox" className="w-8 h-8 rounded-[1rem] bg-slate-950 text-sky-500 focus:ring-0 border-4 border-slate-800" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-xs font-gaming uppercase tracking-widest leading-relaxed font-bold">I confirm that all digital sales are final and non-refundable once deployed.</span>
                </label>

                {isExternalPayment && agreedToTerms ? (
                  <div className="w-full flex flex-col items-center min-h-[220px] animate-fade-in">
                    {!isPaypalReady && !paypalError && (
                      <div className="flex flex-col items-center space-y-6 py-12">
                        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sky-400 text-xs font-gaming uppercase animate-pulse font-black tracking-widest">Bridging Gateway...</p>
                      </div>
                    )}
                    {paypalError && (
                      <div className="p-8 bg-red-500/10 border-4 border-red-500/20 rounded-[3rem] mb-8 w-full text-center">
                        <p className="text-red-500 text-xs font-gaming uppercase font-black">{paypalError}</p>
                      </div>
                    )}
                    <div id="paypal-button-container" ref={paypalContainerRef} className="w-full max-w-lg" />
                  </div>
                ) : (
                  <div className="flex gap-6 w-full animate-fade-in">
                    <button onClick={() => setStep('billing')} className="flex-1 bg-slate-950 text-slate-400 font-gaming py-7 rounded-[2.5rem] border-4 border-slate-800 uppercase tracking-widest text-xs font-black">BACK</button>
                    <button 
                      disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                      onClick={() => handleFinalSubmit(false)}
                      className="flex-[2] bg-sky-500 text-white font-gaming py-7 rounded-[2.5rem] uppercase tracking-[0.3em] text-xs shadow-2xl shadow-sky-500/30 hover:bg-sky-600 transition-all disabled:opacity-30 font-black"
                    >
                      {isSubmitting ? 'INITIATING...' : (paymentMethod === 'solde' ? `CONFIRM DEPLOYMENT` : 'ACCEPT PROTOCOL')}
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
