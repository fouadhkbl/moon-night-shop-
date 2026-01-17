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
      const logUrl = process.env.LOG_SCRIPT_URL;
      if (logUrl) {
        await fetch(logUrl, {
          method: 'POST',
          mode: 'no-cors', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => console.warn('Logging skipped'));
      }

      if (mode === 'forgot') {
        setResetSent(true);
        setIsLoading(false);
        return;
      }

      // Simulation delay for realistic feel
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
      console.error('Auth Error:', err);
      setError('Erreur technique. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
            <i className="fas fa-check text-sky-400"></i>
          </div>
          <h2 className="text-xl font-gaming font-bold text-white uppercase tracking-widest mb-4">Lien Envoyé</h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-8 leading-relaxed">Si l'adresse mail est valide, vous recevrez un lien de réinitialisation.</p>
          <button onClick={() => { setResetSent(false); setMode('login'); }} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl text-[10px] uppercase tracking-widest">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-2xl mx-auto px-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
        
        <div className="text-center mb-16 relative z-10">
          <h1 className="text-5xl md:text-7xl font-gaming font-black text-white uppercase tracking-tighter mb-4 leading-none">
            MoonNight <br />
            <span className="text-sky-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">Shop</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-gaming uppercase tracking-[0.8em] opacity-80">AUTHENTICATION GATEWAY</p>
        </div>

        <div className="flex bg-slate-950 p-2 rounded-[2.5rem] mb-12 border border-slate-800 relative z-10">
          <button onClick={() => {setMode('login'); setError(null);}} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-gaming uppercase tracking-widest transition-all duration-300 ${mode === 'login' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Connexion</button>
          <button onClick={() => {setMode('signup'); setError(null);}} className={`flex-1 py-4 rounded-[2rem] text-[10px] font-gaming uppercase tracking-widest transition-all duration-300 ${mode === 'signup' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Inscription</button>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl animate-scale-up text-center">
            <p className="text-red-500 text-[10px] font-gaming uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {mode === 'signup' && (
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2 ml-4 tracking-widest">Username</label>
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-5 text-white focus:outline-none focus:border-sky-500 transition-all text-sm" placeholder="Votre avatar name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          
          <div className="animate-slide-up">
            <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2 ml-4 tracking-widest">Email Address</label>
            <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-5 text-white focus:outline-none focus:border-sky-500 transition-all text-sm" placeholder="votre@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="animate-slide-up">
            <label className="block text-slate-500 text-[10px] font-gaming uppercase mb-2 ml-4 tracking-widest">Secret Key (Password)</label>
            <input required type="password" minLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] px-8 py-5 text-white focus:outline-none focus:border-sky-500 transition-all text-sm" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          {mode === 'login' && (
            <div className="text-right pr-4">
              <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-gaming uppercase tracking-widest text-slate-500 hover:text-sky-400 transition-colors">Mot de passe oublié ?</button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-sky-500 text-white font-gaming font-bold py-6 rounded-[2rem] shadow-xl hover:bg-sky-600 transition-all uppercase tracking-[0.3em] mt-8 text-xs disabled:opacity-50 active:scale-95">
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Accéder au Portail' : 'Rejoindre la Base')}
          </button>
        </form>

        <div className="mt-12 text-center relative z-10">
          <button onClick={onBack} className="text-slate-500 hover:text-sky-400 text-[10px] font-gaming uppercase tracking-widest transition-colors">
            ← Revenir à la boutique
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;