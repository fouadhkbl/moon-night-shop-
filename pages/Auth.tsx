
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  allUsers: User[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack, allUsers }) => {
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
      setError("ERREUR: Un compte avec cet email existe déjà. Veuillez vous connecter.");
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
      authInfo: `Status: ${actionLabel} Attempt`
    };

    try {
      const logUrl = "https://script.google.com/macros/s/AKfycby2gXGh8SwZ4TrekT02pLmOW9NSh4h8Z87mugRZoH2xwJ1gZ23sDOFfqcKpEoTfAVk/exec";
      await fetch(logUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

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
      <div className="pt-48 pb-24 max-w-lg mx-auto px-6 animate-fade-in text-center">
        <div className="bg-slate-900 border-4 border-slate-800 p-16 rounded-[4rem] shadow-2xl">
          <div className="w-24 h-24 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-sky-500/30">
            <i className="fas fa-check text-4xl text-sky-400"></i>
          </div>
          <h2 className="text-3xl font-gaming font-black text-white uppercase tracking-[0.2em] mb-6">UPLINK SENT</h2>
          <p className="text-slate-400 text-sm uppercase tracking-widest mb-12 leading-relaxed font-bold">If the credentials match our database, an encryption key has been sent to your terminal.</p>
          <button onClick={() => { setResetSent(false); setMode('login'); }} className="w-full bg-sky-500 text-white font-gaming py-6 rounded-[2rem] text-xs uppercase tracking-[0.3em] font-black shadow-xl">RE-INITIATE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-24 max-w-3xl mx-auto px-6 animate-fade-in">
      <div className="bg-slate-900 border-4 border-slate-800 p-12 md:p-24 rounded-[5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 blur-[150px] -mr-48 -mt-48 rounded-full"></div>
        
        <div className="text-center mb-20 relative z-10">
          <h1 className="text-6xl md:text-8xl font-gaming font-black text-white uppercase tracking-tighter mb-6 leading-none">
            MoonNight <br />
            <span className="text-sky-400 drop-shadow-[0_0_20px_rgba(14,165,233,0.4)]">Shop</span>
          </h1>
          <p className="text-slate-500 text-xs font-gaming uppercase tracking-[1em] opacity-80 font-black">SECURE AUTHENTICATION GATEWAY</p>
        </div>

        <div className="flex bg-slate-950 p-3 rounded-[3rem] mb-16 border-4 border-slate-800 relative z-10 shadow-inner">
          <button onClick={() => {setMode('login'); setError(null);}} className={`flex-1 py-5 rounded-[2.5rem] text-xs font-gaming uppercase tracking-[0.3em] font-black transition-all duration-500 ${mode === 'login' ? 'bg-sky-500 text-white shadow-2xl' : 'text-slate-500 hover:text-white'}`}>LOG-IN</button>
          <button onClick={() => {setMode('signup'); setError(null);}} className={`flex-1 py-5 rounded-[2.5rem] text-xs font-gaming uppercase tracking-[0.3em] font-black transition-all duration-500 ${mode === 'signup' ? 'bg-sky-500 text-white shadow-2xl' : 'text-slate-500 hover:text-white'}`}>SIGN-UP</button>
        </div>

        {error && (
          <div className="mb-10 p-8 bg-red-500/10 border-4 border-red-500/30 rounded-[3rem] animate-scale-up text-center">
            <p className="text-red-500 text-xs font-gaming uppercase tracking-widest font-black leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          {mode === 'signup' && (
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-xs font-gaming uppercase mb-4 ml-8 tracking-widest font-black">PILOT NAME</label>
              <input required type="text" className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] px-10 py-7 text-white focus:border-sky-500 outline-none transition-all text-xl font-bold" placeholder="YOUR AVATAR NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          
          <div className="animate-slide-up">
            <label className="block text-slate-500 text-xs font-gaming uppercase mb-4 ml-8 tracking-widest font-black">COMM CHANNEL (EMAIL)</label>
            <input required type="email" className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] px-10 py-7 text-white focus:border-sky-500 outline-none transition-all text-xl font-bold" placeholder="PILOT@BASE.COM" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="animate-slide-up">
            <label className="block text-slate-500 text-xs font-gaming uppercase mb-4 ml-8 tracking-widest font-black">ENCRYPTION KEY (PASSWORD)</label>
            <input required type="password" minLength={6} className="w-full bg-slate-950 border-4 border-slate-800 rounded-[2.5rem] px-10 py-7 text-white focus:border-sky-500 outline-none transition-all text-xl font-bold" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          {mode === 'login' && (
            <div className="text-right pr-8">
              <button type="button" onClick={() => setMode('forgot')} className="text-xs font-gaming uppercase tracking-[0.2em] text-slate-500 hover:text-sky-400 transition-colors font-bold">FORGOT KEY?</button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-sky-500 text-white font-gaming font-black py-8 rounded-[2.5rem] shadow-2xl hover:bg-sky-600 transition-all uppercase tracking-[0.4em] mt-12 text-base disabled:opacity-50 active:scale-95">
            {isLoading ? 'SYNCING...' : (mode === 'login' ? 'ACCESS PORTAL' : 'REJOIN THE BASE')}
          </button>
        </form>

        <div className="mt-16 text-center relative z-10">
          <button onClick={onBack} className="text-slate-500 hover:text-sky-400 text-xs font-gaming uppercase tracking-[0.3em] transition-colors font-black">
            ← RETURN TO MARKETPLACE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
