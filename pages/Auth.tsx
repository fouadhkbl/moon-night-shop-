
import React, { useState } from 'react';
import { User } from '../types';
import { TranslationKeys } from '../translations';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  onFetchLatest: () => Promise<any[]>;
  onRegisterCloud: (email: string, pass: string) => Promise<void>;
  t: (key: TranslationKeys) => string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack, onFetchLatest, onRegisterCloud, t }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailInput = formData.email.toLowerCase().trim();
    const passInput = formData.password;

    try {
      // 1. FETCH LATEST DATA FOR VERIFICATION
      const latestUsers = await onFetchLatest();
      
      // 2. CHECK IF USER EXISTS (Case-insensitive)
      // The GS returns keys exactly as defined in headers: gmail, password, statut, date and time
      const existingUser = latestUsers.find(u => 
        String(u.gmail || "").toLowerCase() === emailInput
      );

      if (mode === 'signup') {
        // SIGNUP VERIFICATION
        if (formData.password !== formData.confirmPassword) {
          setError("PASSWORDS DO NOT MATCH");
          setIsLoading(false);
          return;
        }

        if (existingUser) {
          setError("IDENTITY ALREADY REGISTERED IN CLOUD");
          setIsLoading(false);
          return;
        }

        // UPLOAD TO CLOUD
        await onRegisterCloud(emailInput, passInput);
        
        const newUser: User = {
          id: emailInput,
          name: emailInput.split('@')[0],
          email: emailInput,
          state: 'active',
          joinedAt: new Date().toLocaleDateString(),
          balance: 0
        };
        onLogin(newUser);
      } else {
        // LOGIN VERIFICATION
        if (!existingUser) {
          setError("NO ACCOUNT FOUND WITH THIS EMAIL");
          setIsLoading(false);
          return;
        }

        if (String(existingUser.password) !== passInput) {
          setError("INVALID SECURITY KEY (PASSWORD)");
          setIsLoading(false);
          return;
        }

        const user: User = {
          id: existingUser.gmail,
          name: String(existingUser.gmail).split('@')[0],
          email: existingUser.gmail,
          state: existingUser.statut || 'active',
          joinedAt: existingUser["date and time"] || new Date().toLocaleDateString(),
          balance: 0
        };
        onLogin(user);
      }
    } catch (err) {
      setError("CLOUD UPLINK ERROR. PLEASE TRY AGAIN.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full" />
      
      <div className="w-full max-w-[450px] bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/40 transform rotate-3">
            <span className="text-white font-gaming font-black text-2xl">M</span>
          </div>
          <h1 className="text-2xl font-gaming font-black text-white uppercase tracking-tight">
            MoonNight <span className="text-blue-500">Shoop</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-gaming uppercase tracking-[0.4em] mt-3 font-bold">Cloud Encryption Protocol</p>
        </div>

        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-8 border border-slate-800 shadow-inner">
          <button 
            onClick={() => { setMode('login'); setError(null); }} 
            className={`flex-1 py-3 rounded-xl text-[10px] font-gaming uppercase tracking-widest font-black transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Access
          </button>
          <button 
            onClick={() => { setMode('signup'); setError(null); }} 
            className={`flex-1 py-3 rounded-xl text-[10px] font-gaming uppercase tracking-widest font-black transition-all ${mode === 'signup' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center animate-shake">
            <p className="text-red-500 text-[10px] font-gaming uppercase font-black tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-4 font-black">Cloud Identity (Gmail)</label>
            <input 
              required 
              type="email" 
              placeholder="PILOT@CENTRAL.NET"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-5 text-white outline-none focus:border-blue-500 font-bold transition-all text-sm shadow-inner" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-4 font-black">Security Key (Password)</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-5 text-white outline-none focus:border-blue-500 font-bold transition-all text-sm shadow-inner" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2 animate-slide-up">
              <label className="text-[9px] font-gaming text-slate-500 uppercase tracking-widest ml-4 font-black">Confirm Key</label>
              <input 
                required 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-6 py-5 text-white outline-none focus:border-blue-500 font-bold transition-all text-sm shadow-inner" 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-gaming py-6 rounded-2xl text-xs uppercase tracking-widest font-black shadow-xl shadow-blue-900/20 active:scale-95 disabled:opacity-50 transition-all mt-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>SYNCING CLOUD...</span>
              </div>
            ) : (
              mode === 'login' ? 'AUTHORIZE ACCESS' : 'CREATE CLOUD ID'
            )}
          </button>
        </form>

        <button 
          onClick={onBack} 
          className="w-full text-slate-600 text-[9px] font-gaming uppercase tracking-[0.4em] mt-12 hover:text-blue-500 transition-colors font-black"
        >
          ← ABORT AND RETURN
        </button>
      </div>
    </div>
  );
};

export default Auth;
