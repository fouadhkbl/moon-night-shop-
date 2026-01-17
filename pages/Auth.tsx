
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const now = new Date();
    
    // Determine the action for the administrative log
    let action = '';
    if (mode === 'login') action = 'Connexion';
    else if (mode === 'signup') action = 'Inscription';
    else action = 'Demande de Réinitialisation';

    const payload = {
      firstName: formData.name || (mode === 'login' ? 'Existing' : 'Recovery'),
      lastName: mode === 'login' ? 'User' : (mode === 'signup' ? 'Member' : 'Account'),
      email: formData.email,
      country: 'AuthPortal',
      productBought: action,
      totalAmount: 0,
      date: now.toISOString(),
      password: mode === 'forgot' ? 'RESET_REQUEST' : formData.password
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbxo83LQBoTFgEMld7HcZ4FGUdTrnbM9wGvpH_5q77K-1OG18RqFaddk3AjfvWKsqpUy/exec', {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (mode === 'forgot') {
        setTimeout(() => {
          setResetSent(true);
          setIsLoading(false);
        }, 1200);
        return;
      }

      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        state: 'Authenticated',
        joinedAt: now.toLocaleString(),
        balance: 0 
      };

      localStorage.setItem('mn_user', JSON.stringify(mockUser));
      
      setTimeout(() => {
        onLogin(mockUser);
        setIsLoading(false);
      }, 1200);
      
    } catch (error) {
      console.error('Auth Error:', error);
      alert('Erreur technique. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
            <i className="fas fa-paper-plane text-2xl text-sky-400"></i>
          </div>
          <h2 className="text-2xl font-gaming font-bold text-white uppercase tracking-widest mb-4">Email Envoyé</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-8">
            Si un compte existe pour <span className="text-sky-400 font-bold">{formData.email}</span>, vous recevrez un lien de réinitialisation sous peu.
          </p>
          <button 
            onClick={() => { setResetSent(false); setMode('login'); }}
            className="w-full bg-slate-800 text-white font-gaming py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
          >
            Retour à la Connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 max-w-md mx-auto px-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-gaming font-bold text-white uppercase tracking-widest mb-2">
              {mode === 'forgot' ? 'Récupération' : 'Espace'} <span className="text-sky-400">{mode === 'forgot' ? 'Compte' : 'Client'}</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-gaming uppercase tracking-[0.3em]">
              {mode === 'forgot' ? 'Mot de passe oublié' : 'MoonNight Marketplace'}
            </p>
          </div>

          {mode !== 'forgot' && (
            <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800">
              <button onClick={() => setMode('login')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-gaming uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'text-slate-500'}`}>Connexion</button>
              <button onClick={() => setMode('signup')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-gaming uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'text-slate-500'}`}>S'inscrire</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="animate-slide-up">
                <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-2.5 ml-2">Nom Complet</label>
                <input required type="text" placeholder="Entrez votre nom" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-6 pr-6 py-4 text-white text-xs focus:border-sky-500 transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
            )}
            
            <div className="animate-slide-up">
              <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-2.5 ml-2">Email</label>
              <input required type="email" placeholder="votre@email.com" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-6 pr-6 py-4 text-white text-xs focus:border-sky-500 transition-colors" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            {mode !== 'forgot' && (
              <div className="animate-slide-up">
                <label className="block text-slate-500 text-[9px] font-gaming uppercase mb-2.5 ml-2">Mot de Passe</label>
                <input required type="password" placeholder="••••••••••••" className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-6 pr-6 py-4 text-white text-xs focus:border-sky-500 transition-colors" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="mt-3 ml-2 text-[9px] font-gaming uppercase text-sky-500/70 hover:text-sky-400 transition-colors tracking-widest"
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
            )}

            <button 
              disabled={isLoading} 
              className="w-full relative group overflow-hidden bg-sky-500 text-white font-gaming py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/10 disabled:opacity-50"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite_linear]" style={{ backgroundSize: '200% 100%' }} />
              <span className="relative">
                {isLoading ? 'Traitement...' : (mode === 'login' ? 'Se Connecter' : mode === 'signup' ? 'Créer un Compte' : 'Récupérer l\'accès')}
              </span>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center space-y-4">
            {mode === 'forgot' ? (
              <button onClick={() => setMode('login')} className="text-[9px] font-gaming text-slate-500 hover:text-sky-400 uppercase tracking-widest block mx-auto">Retour à la connexion</button>
            ) : (
              <button onClick={onBack} className="text-[9px] font-gaming text-slate-500 hover:text-sky-400 uppercase tracking-widest block mx-auto">Retour à la boutique</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
