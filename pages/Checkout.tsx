
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

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyrNB9GTXgYcMT6KA97xOmTZahp1Ou1yH5wjnXHNoG2UvvreAAWCw7sd19Ipa-HBGBT/exec";

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
    const payload = {
      "firstName": formData.firstName,
      "lastName": formData.lastName,
      "email": formData.email,
      "payment methode": paymentMethod.toUpperCase(),
      "productBought": cart.map(i => `${i.name} (x${i.quantity})`).join(', '),
      "totalAmount": totalAmountMAD.toFixed(2),
      "date and time": new Date().toLocaleString(), 
      "password": "", 
      "product": cart.map(i => i.name).join(' | '),
      type: 'BILLING_LOG'
    };

    try {
      await fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.debug("Billing sync attempted");
    }
  };

  const handleFinalSubmit = async (isExternalSuccess = false) => {
    if (isExternalPayment && !isExternalSuccess) return;
    
    setIsSubmitting(true);
    const isInstant = paymentMethod === 'solde' || isExternalPayment;
    
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
            height: 52
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

  const handleProceedToReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await logOrderToSheet();
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

  const userBalance = currentUser?.balance || 0;
  const canPayWithSolde = userBalance >= totalAmountMAD;

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in relative">
      {isSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-950/95 backdrop-blur-md">
          <div className="text-center space-y-8 animate-scale-up">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <i className="fas fa-check text-5xl text-green-500"></i>
            </div>
            <h2 className="text-3xl font-gaming font-black text-white uppercase tracking-tighter">Transmission Secured</h2>
            <p className="text-slate-400 font-mono text-sm max-w-xs mx-auto">Assets are being deployed to your registry. Processing confirmed.</p>
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur-xl border-2 sm:border-4 border-slate-800 rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
        <div className="hud-scanline opacity-10" />
        
        <div className="p-8 sm:p-20 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 sm:mb-16">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-4xl font-gaming font-black text-white uppercase tracking-tight">
                {step === 'billing' ? 'BILLING DETAILS' : 'ORDER REVIEW'}
              </h2>
              <div className="w-12 h-1 bg-cyan-500 rounded-full" />
            </div>
            
            <div className="flex bg-slate-950/80 border-2 border-slate-800 rounded-2xl p-1.5 shadow-inner">
              <button 
                onClick={() => setCurrency('MAD')} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-gaming font-black tracking-widest transition-all ${currency === 'MAD' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                MAD
              </button>
              <button 
                onClick={() => setCurrency('USD')} 
                className={`px-5 py-2.5 rounded-xl text-[10px] font-gaming font-black tracking-widest transition-all ${currency === 'USD' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                USD
              </button>
            </div>
          </div>

          {step === 'billing' ? (
            <form onSubmit={handleProceedToReview} className="space-y-8 sm:space-y-12 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                <div className="space-y-3">
                  <label className="text-[8px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-[0.4em] ml-2 font-black">First Name</label>
                  <input 
                    required 
                    placeholder="ENTER PILOT FIRST NAME" 
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl sm:rounded-3xl px-8 py-5 sm:py-6 text-white focus:border-cyan-500 outline-none text-xs sm:text-lg font-bold placeholder:text-slate-800 transition-all shadow-inner" 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[8px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-[0.4em] ml-2 font-black">Last Name</label>
                  <input 
                    required 
                    placeholder="ENTER PILOT LAST NAME" 
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl sm:rounded-3xl px-8 py-5 sm:py-6 text-white focus:border-cyan-500 outline-none text-xs sm:text-lg font-bold placeholder:text-slate-800 transition-all shadow-inner" 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[8px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-[0.4em] ml-2 font-black">Email Address</label>
                <input 
                  required 
                  type="email"
                  placeholder="PILOT COMM CHANNEL" 
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl sm:rounded-3xl px-8 py-5 sm:py-6 text-white focus:border-cyan-500 outline-none text-xs sm:text-lg font-bold placeholder:text-slate-800 transition-all shadow-inner" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[8px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-[0.4em] ml-2 font-black">Promo Protocol</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    placeholder="SCAN VOUCHER CODE..." 
                    className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-2xl sm:rounded-3xl px-8 py-5 sm:py-6 text-white font-mono uppercase outline-none text-xs sm:text-lg font-bold placeholder:text-slate-800 transition-all shadow-inner" 
                    value={promoInput} 
                    onChange={(e) => setPromoInput(e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyPromo} 
                    className="bg-slate-800 border-2 border-slate-700 px-10 py-5 rounded-2xl sm:rounded-3xl text-[10px] sm:text-xs font-gaming text-cyan-400 uppercase font-black hover:bg-slate-700 transition-all active:scale-95"
                  >
                    APPLY
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[8px] sm:text-[10px] font-gaming text-slate-500 uppercase tracking-[0.4em] ml-2 font-black">Payment Gateway Selection</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('solde')} 
                    className={`flex flex-col items-center justify-center py-6 sm:py-10 rounded-2xl sm:rounded-[2rem] border-2 transition-all relative overflow-hidden ${paymentMethod === 'solde' ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,255,255,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${paymentMethod === 'solde' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-600'}`}>
                      <i className="fas fa-wallet text-xl sm:text-2xl"></i>
                    </div>
                    <span className="text-[10px] sm:text-sm font-gaming uppercase font-black tracking-widest">SOLDE</span>
                    {paymentMethod === 'solde' && (
                      <div className="mt-2 text-[8px] font-gaming font-black text-green-400">
                        {userBalance.toFixed(0)} DH AVAILABLE
                      </div>
                    )}
                    {!canPayWithSolde && paymentMethod === 'solde' && (
                      <div className="mt-1 text-[7px] font-gaming font-black text-red-500 uppercase">INSUFFICIENT FUNDS</div>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('paypal')} 
                    className={`flex flex-col items-center justify-center py-6 sm:py-10 rounded-2xl sm:rounded-[2rem] border-2 transition-all ${paymentMethod === 'paypal' ? 'border-[#ffc439] bg-[#ffc439]/10 shadow-[0_0_30px_rgba(255,196,57,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${paymentMethod === 'paypal' ? 'bg-[#ffc439] text-slate-950' : 'bg-slate-950 text-slate-600'}`}>
                      <i className="fab fa-paypal text-xl sm:text-2xl"></i>
                    </div>
                    <span className="text-[10px] sm:text-sm font-gaming uppercase font-black tracking-widest">PAYPAL</span>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('card')} 
                    className={`flex flex-col items-center justify-center py-6 sm:py-10 rounded-2xl sm:rounded-[2rem] border-2 transition-all ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30_rgba(99,102,241,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${paymentMethod === 'card' ? 'bg-indigo-500 text-white' : 'bg-slate-950 text-slate-600'}`}>
                      <i className="fas fa-credit-card text-xl sm:text-2xl"></i>
                    </div>
                    <span className="text-[10px] sm:text-sm font-gaming uppercase font-black tracking-widest">CARD</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={onCancel} 
                  className="w-full sm:flex-1 bg-slate-950 text-slate-700 font-gaming py-5 sm:py-7 rounded-2xl sm:rounded-[2.5rem] border-2 border-slate-800 uppercase tracking-widest text-[10px] sm:text-xs font-black hover:text-white hover:border-slate-600 transition-all"
                >
                  ABORT TRANSACTION
                </button>
                <button 
                  type="submit" 
                  disabled={paymentMethod === 'solde' && !canPayWithSolde}
                  className="w-full sm:flex-[2] bg-cyan-500 text-slate-950 font-gaming py-5 sm:py-7 rounded-2xl sm:rounded-[2.5rem] uppercase tracking-[0.2em] text-[10px] sm:text-base font-black shadow-[0_0_40px_rgba(0,255,255,0.3)] hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-30"
                >
                  REVIEW ORDER
                </button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-10 sm:space-y-16">
              <div className="bg-slate-950/80 border-2 border-slate-800 rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 space-y-6 sm:space-y-8 shadow-inner">
                <div className="flex justify-between items-center text-xs sm:text-lg text-slate-500 font-bold uppercase tracking-widest">
                  <span>SUBTOTAL</span>
                  <span>{formatPrice(subtotalAmountMAD)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-xs sm:text-lg text-green-500 font-bold uppercase tracking-widest">
                    <span>DISCOUNT APPLIED ({appliedPromo.discount}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-8 border-t-2 border-slate-800 flex justify-between items-end">
                  <span className="text-white font-gaming uppercase tracking-[0.3em] text-[10px] sm:text-xl font-black">FINAL TOTAL</span>
                  <span className="text-3xl sm:text-6xl font-gaming font-black text-cyan-400 neon-text-cyan tracking-tighter">
                    {formatPrice(totalAmountMAD)}
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                <label className="flex items-start space-x-6 cursor-pointer p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-slate-950/60 border-2 border-slate-800 hover:border-slate-600 transition-all group">
                  <div className="relative flex-shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      className="peer absolute opacity-0 w-6 h-6 cursor-pointer" 
                      checked={agreedToTerms} 
                      onChange={(e) => setAgreedToTerms(e.target.checked)} 
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all ${agreedToTerms ? 'bg-cyan-500 border-cyan-500' : 'border-slate-800 bg-slate-950'}`}>
                      {agreedToTerms && <i className="fas fa-check text-[10px] text-slate-950 flex items-center justify-center h-full"></i>}
                    </div>
                  </div>
                  <span className="text-slate-500 text-[9px] sm:text-sm font-black leading-relaxed uppercase tracking-[0.15em] transition-colors group-hover:text-slate-400">
                    I verify that all digital assets are instant-access and non-refundable once the link is established.
                  </span>
                </label>

                {isExternalPayment && agreedToTerms ? (
                  <div className="w-full flex flex-col items-center min-h-[200px] animate-fade-in p-2">
                    {!isPaypalReady && !paypalError && (
                      <div className="flex flex-col items-center space-y-6 py-12">
                        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-cyan-400 text-[10px] sm:text-xs font-gaming uppercase tracking-[0.4em] animate-pulse font-black">INITIATING SECURE ENCRYPTION...</p>
                      </div>
                    )}
                    {paypalError && (
                      <div className="p-6 bg-red-500/10 border-2 border-red-500/20 rounded-[2rem] mb-6 w-full text-center">
                        <p className="text-red-500 text-xs sm:text-base font-black uppercase tracking-widest">{paypalError}</p>
                      </div>
                    )}
                    <div id="paypal-button-container" ref={paypalContainerRef} className="w-full relative z-[50]" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button 
                      onClick={() => setStep('billing')} 
                      className="w-full sm:flex-1 bg-slate-950 text-slate-700 font-gaming py-5 sm:py-8 rounded-2xl sm:rounded-[3rem] border-2 border-slate-800 uppercase text-[10px] sm:text-xs font-black transition-all"
                    >
                      RETURN
                    </button>
                    <button 
                      disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && !canPayWithSolde)}
                      onClick={async () => {
                        handleFinalSubmit(false);
                      }}
                      className="w-full sm:flex-[2] bg-cyan-500 text-slate-950 font-gaming py-5 sm:py-8 rounded-2xl sm:rounded-[3rem] uppercase tracking-[0.3em] text-[10px] sm:text-base font-black shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:bg-cyan-400 transition-all active:scale-95 disabled:opacity-20"
                    >
                      {isSubmitting ? 'ENCRYPTING...' : (paymentMethod === 'solde' ? `EXECUTE UPLINK` : 'ESTABLISH LINK')}
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
