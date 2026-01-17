
import React, { useState, useMemo } from 'react';
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
}

const Checkout: React.FC<CheckoutProps> = ({ cart, promoCodes, currentUser, onComplete, onCancel }) => {
  const [step, setStep] = useState<'billing' | 'review'>('billing');
  const [formData, setFormData] = useState({
    firstName: currentUser?.name.split(' ')[0] || '',
    lastName: currentUser?.name.split(' ')[1] || '',
    email: currentUser?.email || '',
    country: 'Maroc',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'solde'>('paypal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Promo states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotalAmountMAD = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    return subtotalAmountMAD * (appliedPromo.discount / 100);
  }, [subtotalAmountMAD, appliedPromo]);

  const totalAmountMAD = subtotalAmountMAD - discountAmount;
  const totalAmountUSD = (totalAmountMAD * 0.1).toFixed(2);
  const productsBought = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');

  const countries = [
    "Maroc", "United States", "United Kingdom", "France", "Germany", "Canada", 
    "Spain", "Italy", "United Arab Emirates", "Saudi Arabia", "Algeria", "Tunisia"
  ];

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    if (!code) return;
    
    const found = promoCodes.find(p => p.code === code);
    if (found) {
      setAppliedPromo(found);
      setPromoError('');
    } else {
      setAppliedPromo(null);
      setPromoError('CODE INVALIDE');
    }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
  };

  const handleFinalSubmit = async () => {
    if (!agreedToTerms) return;

    if (paymentMethod === 'solde') {
      const userBalance = currentUser?.balance || 0;
      if (userBalance < totalAmountMAD) {
        alert("Solde insuffisant ! Veuillez recharger votre compte.");
        return;
      }
    }

    setIsSubmitting(true);

    const isInstant = paymentMethod === 'solde';

    const dataToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      country: formData.country,
      productBought: productsBought,
      totalAmount: totalAmountMAD,
      date: new Date().toISOString(),
      password: `Pay: ${paymentMethod}${isInstant ? ' (Instant)' : ''}`
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxo83LQBoTFgEMld7HcZ4FGUdTrnbM9wGvpH_5q77K-1OG18RqFaddk3AjfvWKsqpUy/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      
      if (paymentMethod === 'paypal') {
        window.open(`https://paypal.me/1syrfouad1/${totalAmountUSD}`, '_blank');
      }

      onComplete({
        ...formData,
        total: totalAmountMAD,
        appliedPromo: appliedPromo?.code,
        paymentMethod,
        isInstant
      });
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 animate-fade-in">
      <div className="flex items-center justify-center mb-12 space-x-4">
        <div className={`flex items-center space-x-2 ${step === 'billing' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-gaming text-xs ${step === 'billing' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>1</div>
          <span className="text-[10px] font-gaming uppercase tracking-widest">Facturation</span>
        </div>
        <div className="w-12 h-px bg-slate-800" />
        <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-sky-400' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-gaming text-xs ${step === 'review' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>2</div>
          <span className="text-[10px] font-gaming uppercase tracking-widest">Confirmation</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="p-8 md:p-12">
          {step === 'billing' ? (
            <form onSubmit={handleProceedToReview} className="space-y-8 animate-slide-up">
              <h1 className="text-3xl font-gaming font-bold text-white uppercase tracking-widest">
                Passer la <span className="text-sky-400">Commande</span>
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase tracking-widest mb-3">Prénom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-gaming uppercase tracking-widest mb-3">Nom</label>
                  <input required className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-6 py-4 text-white" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-gaming uppercase tracking-widest mb-3">Mode de Paiement</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => setPaymentMethod('solde')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'solde' ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/10' : 'bg-slate-950 border-slate-800'}`}>
                    <i className="fas fa-wallet text-xl mb-2 text-green-400"></i>
                    <span className="font-gaming text-[9px] uppercase">Solde Compte</span>
                    <span className="text-[7px] text-slate-500 mt-1">Instantané</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('paypal')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'paypal' ? 'bg-sky-500/10 border-sky-500' : 'bg-slate-950 border-slate-800'}`}>
                    <i className="fab fa-paypal text-xl mb-2 text-sky-400"></i>
                    <span className="font-gaming text-[9px] uppercase">PayPal</span>
                    <span className="text-[7px] text-slate-500 mt-1">Verification manuelle</span>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'card' ? 'bg-sky-500/10 border-sky-500' : 'bg-slate-950 border-slate-800'}`}>
                    <i className="fas fa-credit-card text-xl mb-2 text-slate-400"></i>
                    <span className="font-gaming text-[9px] uppercase">Carte Bancaire</span>
                    <span className="text-[7px] text-slate-500 mt-1">Verification manuelle</span>
                  </button>
                </div>
                {paymentMethod === 'solde' && currentUser && (
                  <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Votre Solde Actuel:</span>
                      <span className="text-white font-gaming">{currentUser.balance.toFixed(2)} DH</span>
                    </div>
                    {currentUser.balance < totalAmountMAD && (
                      <p className="text-red-500 text-[8px] mt-2 font-gaming uppercase">Solde insuffisant pour cette commande.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-5 rounded-2xl border border-slate-800">Annuler</button>
                <button type="submit" className="flex-[2] bg-sky-500 text-white font-gaming text-[10px] py-5 rounded-2xl shadow-xl">Continuer</button>
              </div>
            </form>
          ) : (
            <div className="animate-fade-in space-y-10">
              <div className="text-center">
                <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-2">Récapitulatif</h2>
                <p className="text-slate-500 text-xs">Vérifiez les détails avant de finaliser.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6">
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">{item.name} x{item.quantity}</span>
                      <span className="text-white font-gaming">{(item.price * item.quantity).toFixed(2)} DH</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-800 flex flex-col items-end">
                   <div className="flex items-center space-x-4 mb-1">
                     <span className="text-white text-[10px] font-gaming uppercase tracking-widest">Total Final</span>
                     <span className="text-3xl font-gaming font-bold text-sky-400">{totalAmountMAD.toFixed(2)} DH</span>
                   </div>
                   <div className="text-sky-400 text-[8px] font-gaming uppercase tracking-widest">Paiement via {paymentMethod}</div>
                </div>
              </div>

              <div className="space-y-6">
                <label className="flex items-start space-x-4 cursor-pointer group">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-800 bg-slate-950 text-sky-500" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                  <span className="text-slate-400 text-[10px] leading-relaxed">
                    J'accepte les conditions de vente de MoonNight Shoop. Les produits digitaux ne sont pas remboursables après livraison.
                  </span>
                </label>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button onClick={() => setStep('billing')} className="flex-1 bg-slate-950 text-slate-400 font-gaming text-[10px] py-5 rounded-2xl border border-slate-800">Retour</button>
                  <button 
                    disabled={!agreedToTerms || isSubmitting || (paymentMethod === 'solde' && (currentUser?.balance || 0) < totalAmountMAD)}
                    onClick={handleFinalSubmit}
                    className="flex-[2] bg-sky-500 text-white font-gaming text-[10px] py-5 rounded-2xl shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Traitement...' : `Payer ${totalAmountMAD.toFixed(2)} DH`}
                  </button>
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
