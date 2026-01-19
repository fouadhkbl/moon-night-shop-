
import React, { useState } from 'react';
import { User } from '../types';
import { TranslationKeys } from '../translations';

interface AuthProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  cloudRecords: any[];
  onSync: (gmail: string, pass: string, status?: string) => Promise<void>;
  t: (key: TranslationKeys) => string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onBack, cloudRecords, onSync, t }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailInput = formData.email.toLowerCase().trim();
    const passInput = formData.password;

    // STEP 1: Search for existing identity in the cloud
    const existingRecord = cloudRecords.find(r => (r.gmail || "").toLowerCase() === emailInput);

    if (mode === 'login') {
      // LOGIN PROTOCOL: Email must exist AND password must match
      if (!existingRecord) {
        setError("UPLINK DENIED: Account does not exist in the cloud database.");
        setIsLoading(false);
        return;
      }
      if (existingRecord.password !== passInput) {
        setError("SECURITY ALERT: Credentials do not match cloud registry.");
        setIsLoading(false);
        return;
      }

      // Valid Credentials - Authorize Session
      const user: User = {
        id: emailInput,
        name: emailInput.split('@')[0],
        email: emailInput,
        state: existingRecord.statut || 'ACTIVE',
        joinedAt: existingRecord["date and time"] || new Date().toLocaleString(),
        balance: 0
      };
      onLogin(user);
    } else {
      // SIGNUP PROTOCOL: Email must NOT exist in the cloud
      if (existingRecord) {
        setError("REGISTRATION FAILED: This Gmail is already registered in the cloud.");
        setIsLoading(false);
        return;
      }

      // Transmit new identity to Cloud
      await onSync(emailInput, passInput, 'Pending');
      
      // Auto-login after successful sync
      const user: User = {
        id: emailInput,
        name: emailInput.split('@')[0],
        email: emailInput,
        state: 'Pending',
        joinedAt: new Date().toLocaleString(),
        balance: 0
      };
      
      onLogin(user);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-[450px] bg-white border border-slate-200 p-10 sm:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
             <span className="text-white font-gaming font-black text-xl">M</span>
          </div>
          <h1 className="text-2xl font-gaming font-black text-slate-900 uppercase tracking-tighter">MoonNight <span className="text-blue-600">Secure</span></h1>
          <p className="text-slate-400 text-[9px] font-gaming uppercase tracking-[0.4em] mt-2">Cloud Infrastructure Active</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10 border border-slate-200">
          <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-gaming uppercase tracking-widest font-black transition-all ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Login</button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-gaming uppercase tracking-widest font-black transition-all ${mode === 'signup' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Sign Up</button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
            <p className="text-red-600 text-[10px] font-gaming uppercase font-black">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-gaming text-slate-400 uppercase tracking-widest ml-4">Cloud GMAIL</label>
            <input 
              required 
              type="email" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-blue-700 font-bold transition-all text-sm" 
              placeholder="PILOT@HQ.NET" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-gaming text-slate-400 uppercase tracking-widest ml-4">Cloud Password</label>
            <input 
              required 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 outline-none focus:border-blue-700 font-bold transition-all text-sm" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-700 text-white font-gaming py-5 rounded-2xl text-xs uppercase tracking-widest font-black shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'ESTABLISHING LINK...' : (mode === 'login' ? 'AUTHORIZE LOGIN' : 'CREATE CLOUD IDENTITY')}
          </button>
        </form>

        <button onClick={onBack} className="w-full text-slate-400 text-[8px] font-gaming uppercase tracking-widest mt-10 hover:text-blue-700 transition-colors">← Back to Boutique</button>
      </div>
    </div>
  );
};

export default Auth;
