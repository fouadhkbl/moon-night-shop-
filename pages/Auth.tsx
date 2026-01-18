
import React, { useState } from 'react';
import { User } from '../types';
import { TranslationKeys } from '../translations';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  allUsers: User[];
  t: (key: TranslationKeys) => string;
}

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyrNB9GTXgYcMT6KA97xOmTZahp1Ou1yH5wjnXHNoG2UvvreAAWCw7sd19Ipa-HBGBT/exec";

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

    // Task 1: Login Verification Logic
    if (mode === 'login') {
      if (!existingUser) {
        setError("NO ACCOUNT FOUND. PLEASE SIGN UP.");
        setIsLoading(false);
        setMode('signup');
        return;
      }
      
      const userWithPass = existingUser as any;
      if (userWithPass.password && userWithPass.password !== formData.password) {
        setError("INVALID CREDENTIALS. ACCESS DENIED.");
        setIsLoading(false);
        return;
      }

      // Log Login Event with exact requested columns for User Sheet
      try {
        await fetch(SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "first name": existingUser.name,
            "password": formData.password,
            "email": emailLower,
            "date and time": new Date().toLocaleString(),
            type: 'LOGIN_ACTION'
          })
        });
      } catch (err) {
        console.debug("Login sync attempted");
      }

      localStorage.setItem('mn_user', JSON.stringify(existingUser));
      setTimeout(() => {
        onLogin(existingUser);
        setIsLoading(false);
      }, 800);
      return;
    }

    // Task 1: Sign Up Logic
    if (mode === 'signup' && existingUser) {
      setError("ACCOUNT ALREADY EXISTS. PLEASE LOGIN.");
      setIsLoading(false);
      setMode('login'); 
      return;
    }

    const now = new Date();
    
    // Task 1 Mapping (Users Sheet):
    // Column A: first name | Column B: password | Column C: email | Column G: date and time
    const payload = {
      "first name": formData.name || emailLower.split('@')[0],
      "password": formData.password,
      "email": emailLower,
      "date and time": now.toLocaleString(),
      type: 'USER_REGISTRY'
    };

    try {
      await fetch(SHEET_URL, {
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

      const finalUser: User = {
        id: emailLower,
        name: formData.name || emailLower.split('@')[0],
        email: emailLower,
        state: 'ACTIVE',
        joinedAt: now.toLocaleString(),
        balance: 0 
      };

      localStorage.setItem('mn_user', JSON.stringify(finalUser));
      
      setTimeout(() => {
        onLogin(finalUser);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('CONNECTION ERROR. PLEASE TRY AGAIN.');
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="pt-32 pb-24 max-w-[400px] mx-auto px-4 animate-fade-in text-center">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl">
          <div className="w-16 h-16 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
            <i className="fas fa-envelope text-sky-400 text-2xl"></i>
          </div>
          <h2 className="text-lg font-gaming font-black text-white uppercase mb-3">EMAIL SENT</h2>
          <p className="text-slate-500 text-[10px] uppercase mb-8 tracking-widest">CHECK YOUR INBOX FOR INSTRUCTIONS</p>
          <button onClick={() => { setResetSent(false); setMode('login'); }} className="w-full bg-sky-500 text-white font-gaming py-4 rounded-xl text-xs uppercase tracking-widest font-black shadow-lg">BACK TO LOGIN</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-[420px] sm:max-w-[500px] bg-slate-900/60 backdrop-blur-2xl border border-slate-800 p-10 sm:p-14 rounded-[3rem] shadow-[0_0_120px_rgba(0,0,0,0.6)] relative">
        <div className="text-center mb-10">
          <div className="inline-block p-2 bg-slate-950 rounded-xl mb-4 border border-slate-800/50 shadow-inner">
             <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-gaming font-black text-xl">M</span>
             </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-gaming font-black text-white uppercase tracking-tighter mb-1">
            MOONNIGHT <span className="text-sky-400">SHOP</span>
          </h1>
          <p className="text-slate-600 text-[9px] font-gaming uppercase tracking-[0.5em] font-black">SECURE UPLINK PORTAL</p>
        </div>

        <div className="flex bg-slate-950/80 p-1.5 rounded-xl mb-10 border border-slate-800/50">
          <button onClick={() => {setMode('login'); setError(null);}} className={`flex-1 py-3 rounded-lg text-[10px] sm:text-[11px] font-gaming uppercase tracking-[0.15em] font-black transition-all ${mode === 'login' ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-400'}`}>{t('login')}</button>
          <button onClick={() => {setMode('signup'); setError(null);}} className={`flex-1 py-3 rounded-lg text-[10px] sm:text-[11px] font-gaming uppercase tracking-[0.15em] font-black transition-all ${mode === 'signup' ? 'bg-sky-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-400'}`}>{t('signup')}</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center animate-shake">
            <p className="text-red-500 text-[10px] font-gaming uppercase font-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {mode === 'signup' && (
            <div className="animate-slide-up">
              <input required type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:border-sky-500 outline-none text-xs sm:text-sm font-bold transition-all placeholder:text-slate-700 shadow-inner" placeholder="PILOT NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          
          <div className="animate-slide-up">
            <input required type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:border-sky-500 outline-none text-xs sm:text-sm font-bold transition-all placeholder:text-slate-700 shadow-inner" placeholder="EMAIL ADDRESS" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="animate-slide-up">
            <input required type="password" minLength={6} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:border-sky-500 outline-none text-xs sm:text-sm font-bold transition-all placeholder:text-slate-700 shadow-inner" placeholder="SECURE PASSWORD" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          {mode === 'login' && (
            <div className="text-right px-2">
              <button type="button" onClick={() => setMode('forgot')} className="text-[8px] font-gaming uppercase tracking-widest text-slate-600 hover:text-sky-400 font-black transition-colors">FORGOT CREDENTIALS?</button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-sky-500 text-white font-gaming font-black py-5 rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:bg-sky-400 transition-all uppercase tracking-[0.3em] mt-4 text-xs sm:text-sm disabled:opacity-50 active:scale-95">
            {isLoading ? 'UPLINKING...' : (mode === 'login' ? 'ESTABLISH LINK' : 'INITIATE REGISTRY')}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button onClick={onBack} className="text-slate-700 hover:text-sky-400 text-[8px] sm:text-[9px] font-gaming uppercase tracking-[0.3em] transition-colors font-black flex items-center justify-center mx-auto space-x-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>RETURN TO MARKETPLACE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
