
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CartItem, PromoCode, User } from '../types';
import { TranslationKeys } from '../translations';

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
  t: (key: TranslationKeys) => string;
}

const Checkout: React.FC<CheckoutProps & { setActivePage: (p: string) => void }> = ({ 
  cart, 
  promoCodes, 
  currentUser, 
  onComplete, 
  onCancel,
  setActivePage,
  t
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState<'billing' | 'review'>('billing');
  const [currency, setCurrency] = useState<'MAD' | 'USD'>('MAD');
  const [formData, setFormData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ')[1] || '',
    email: currentUser?.email || '',
    country: 'Morocco',
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

  const formatPrice = (amount: number) => {
    if (currency === 'USD') {
      return `$${(amount * 0.1).toFixed(2)}`;
    }
    return `${amount.toFixed(2)} DH`;
  };

  const logOrderToSheet = async () => {
    // A: firstName, B: lastName, C: email, D: contry, E: productBought, F: totalAmount, G: date, H: password, I: product
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      contry: formData.country, 
      productBought: cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
      totalAmount: totalAmountMAD,
      date: new Date().toLocaleString(), // Includes Time
      password: '', 
      product: cart.map(i => i.name).join(' | '),
      paymentMethod: paymentMethod.toUpperCase()
    };

    try {
      const logUrl = "https://script.google.com/macros/s/AKfycbwVgM0oHf1Y-kR1OfclYBOwo5ePnDVxiW2WCxz6vwp6oM65bwDycByvLAobuZUfR7qt/exec";
      // This sends the data regardless of payment status
      await fetch(logUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.debug("Silent log attempted");
    }
  };

  const handleFinalSubmit = async (isExternalSuccess = false) => {
    // If it's an external payment, we only proceed if success is true
    if (isExternalPayment && !isExternalSuccess) return;
    
    setIsSubmitting(true);
    const isInstant = paymentMethod === 'solde' || isExternalPayment;
    
    // Final callback to App state
    onComplete({ 
      ...formData, 
      total: totalAmountMAD, 
      appliedPromo: appliedPromo?.code, 
      paymentMethod, 
      isInstant 
    });
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
          if (isMounted) setPaypalError("Payment SDK unavailable.");
          isRenderingRef.current = false;
          return;
        }

        paypalContainerRef.current.innerHTML = ''; 
        setPaypalError(null);
        setIsPaypalReady(false);

        const config = {
          fundingSource: paymentMethod === 'card' ? paypal.FUNDING.CARD : paypal.FUNDING.PAYPAL,
          createOrder: (data: any, actions: any) => {
            // Save to sheet as soon as the user opens the PayPal portal
            logOrderToSheet();
            
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
                handleFinalSubmit(true);
              }
            } catch (e) {
              if (isMounted) { 
                setPaypalError("Payment capture failed."); 
                setIsSubmitting(false); 
              }
            }
          },
          onInit: () => { if (isMounted) setIsPaypalReady(true); },
          onError: (err: any) => { 
            if (isMounted) {
              setPaypalError("Error initializing payment.");
              isRenderingRef.current = false;
            }
          },
          style: { 
            layout: 'vertical', 
            color: paymentMethod === 'card' ? 'black' : 'gold', 
            shape: 'pill', 
            height: 48
          }
        };

        const buttons = paypal.Buttons(config);
        if (buttons.isEligible()) {
          paypalInstanceRef.current = buttons;
          await buttons.render(paypalContainerRef.current);
        } else {
          if (isMounted) setPaypalError("Payment method not supported.");
          isRenderingRef.current = false;
        }
      } catch (err) {
        console.error("PayPal Error:", err);
        if (isMounted) { 
          setPaypalError("Technical error during checkout."); 
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
    if (found) { setAppliedPromo(found); } else { alert("Invalid voucher code."); setAppliedPromo(null); }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="pt-40 pb-24 max-w-lg mx-auto px-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2rem] shadow-2xl">
          <i className="fas fa-lock text-4xl text-cyan-400 mb-6 block"></i>
          <h3 className="text-white font-gaming uppercase mb-8">Authentication Required</h3>
          <button onClick={() => setActivePage('auth')} className="w-full bg-cyan-500 text-slate-950 font-gaming py-4 rounded-xl uppercase tracking-widest font-black">Login to Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 sm:pt-40 pb-24 max-w-4xl mx-auto px-6 animate-fade-in relative">
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-md rounded-[3rem]">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <i className="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h2 className="text-white font-gaming uppercase">Order Synchronized</h2>
            <p className="text-slate-400 font-mono text-sm">Uplink verified. Your assets are being prepared.</p>
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl hud-card">
        <div className="p-6 sm:p-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white font-gaming text-sm uppercase tracking-widest">
              {step === 'billing' ? 'Billing Details' : 'Order Review'}
            </h2>
            
            <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 scale-90 sm:scale-100">
              <button onClick={() => setCurrency('MAD')} className={`px-3 py-1.5 rounded-lg text-[9px] font-gaming font-black transition-all ${currency === 'MAD' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>MAD</button>
              <button onClick={() => setCurrency('USD')} className={`px-3 py-1.5 rounded-lg text-[9px] font-gaming font-black transition-all ${currency === 'USD' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>USD</button>
            </div>
          </div>

          {step === 'billing' ? (
            <form onSubmit={handleProceedToReview} className="space-y-6 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-2">First Name</label>
                  <input required placeholder="FIRST NAME" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:border-cyan-500 outline-none text-xs font-mono" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-2">Last Name</label>
                  <input required placeholder="LAST NAME" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:border-cyan-500 outline-none text-xs font-mono" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-2">Promo Code</label>
                <div className="flex space-x-2">
                  <input placeholder="SCAN VOUCHER" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white font-mono uppercase outline-none text-xs" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <button type="button" onClick={handleApplyPromo} className="bg-slate-800 border border-slate-700 px-6 rounded-xl text-[9px] font-gaming text-cyan-400 uppercase font-black hover:bg-slate-700 transition-all">Apply</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-2">Payment Protocol</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${paymentMethod === 'solde' ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fas fa-wallet mb-2 text-lg text-cyan-400"></i>
                    <span className="text-[8px] font-gaming uppercase font-bold">Solde</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${paymentMethod === 'paypal' ? 'border-[#ffc439] bg-[#ffc439]/5' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fab fa-paypal mb-2 text-lg text-[#ffc439]"></i>
                    <span className="text-[8px] font-gaming uppercase font-bold">PayPal</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-4 rounded-xl border transition-all ${paymentMethod === 'card' ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700'}`}>
                    <i className="fas fa-credit-card mb-2 text-lg text-white"></i>
                    <span className="text-[8px] font-gaming uppercase font-bold">Card</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-950 text-slate-600 font-gaming py-4 rounded-xl border border-slate-800 uppercase tracking-widest text-[10px] font-bold">Cancel</button>
                <button type="submit" className="flex-[2] bg-cyan-500 text-slate-950 font-gaming py-4 rounded-xl uppercase tracking-widest text-[10px] font-black shadow-lg shadow-cyan-500/20">Review Order</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="text-center">
                <h3 className="text-white font-gaming uppercase text-sm tracking-widest">Order Summary</h3>
                <p className="text-slate-500 text-[10px] mt-1 font-mono tracking-widest">CURRENCY: {currency}</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotalAmountMAD)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-[10px] text-green-500 font-mono uppercase">
                    <span>Discount ({appliedPromo.discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-white font-gaming uppercase tracking-widest text-xs">Total</span>
                  <span className="text-2xl font-gaming font-bold text-cyan-400 neon-text-cyan">{formatPrice(totalAmountMAD)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-start space-x-4 cursor-pointer p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded bg-slate-950 text-cyan-500 focus:ring-0 border-slate-800" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-500 text-[9px] font-bold leading-relaxed uppercase tracking-widest">I verify that digital products are instant-access and non-refundable.</span>
                </label>

                {isExternalPayment && agreedToTerms ? (
                  <div className="w-full flex flex-col items-center min-h-[150px] animate-fade-in">
                    {!isPaypalReady && !paypalError && (
                      <div className="flex flex-col items-center space-y-4 py-8">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-cyan-400 text-[9px] font-gaming uppercase tracking-widest animate-pulse">Establishing Secure Uplink...</p>
                      </div>
                    )}
                    {paypalError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 w-full text-center">
                        <p className="text-red-500 text-[10px] font-bold">{paypalError}</p>
                      </div>
                    )}
                    <div id="paypal-button-container" ref={paypalContainerRef} className="w-full" />
                  </div>
                ) : (
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setStep('billing')} className="flex-1 bg-slate-950 text-slate-600 font-gaming py-4 rounded-xl border border-slate-800 uppercase text-[10px] font-bold">Back</button>
                    <button 
                      disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                      onClick={async () => {
                        await logOrderToSheet(); // Save immediately when user clicks Place Order
                        handleFinalSubmit(false);
                      }}
                      className="flex-[2] bg-cyan-500 text-slate-950 font-gaming py-4 rounded-xl uppercase tracking-widest text-[10px] font-black shadow-lg shadow-cyan-500/20 disabled:opacity-30"
                    >
                      {isSubmitting ? 'PROCESSING...' : (paymentMethod === 'solde' ? `CONFIRM UPLINK` : 'PLACE ORDER')}
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
