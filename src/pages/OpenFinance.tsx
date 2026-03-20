import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';

export default function AccountAggregator() {
  const { user, loading, forgeScore } = useAppContext();
  const navigate = useNavigate();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [authorizing, setAuthorizing] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAuthorize = () => {
    setAuthorizing(true);
    setTimeout(() => {
      setAuthorizing(false);
      setAuthorized(true);
    }, 2500);
  };

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[30%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header View */}
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-xl text-white">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Open Finance Hub</h1>
            <p className="text-xs text-cyan-400 font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Sahamati AA Network Node
            </p>
          </div>
        </div>
        <div className="glass-strong px-3 py-1.5 rounded-lg text-xs font-bold text-white border-primary/20 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span> FIP Active
        </div>
      </header>

      <main className="px-6 mt-8 space-y-8">
        
        {/* Intro Card */}
        <section className="glass-card p-6 rounded-2xl relative overflow-hidden group border-white/5">
            <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                    <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Data Portability</h2>
                    <p className="text-sm text-slate-400">Share your ForgeScore with banks.</p>
                </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
                Pluto acts as a certified <span className="text-white font-bold">Financial Information Provider (FIP)</span> on India's Account Aggregator network. Banks can query your verifiable income and ForgeScore without manual paperwork.
            </p>
        </section>

        {/* Pending Requests */}
        <section>
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            Pending API Requests <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[9px]">{authorized ? '0' : '1'} New</span>
          </h3>

          {!authorized ? (
              <div className="glass-card p-5 rounded-2xl border-orange-500/20 shadow-[0_4px_20px_rgba(249,115,22,0.1)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
                 
                 <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white flex items-center justify-center p-1 shadow-md">
                            <span className="text-blue-900 font-extrabold text-sm tracking-tighter">HDFC</span>
                        </div>
                        <div>
                            <p className="text-white font-bold tracking-wide">HDFC Bank Ltd.</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Loan Origination System</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">Awaiting Consent</span>
                 </div>

                 <div className="bg-background-dark/50 rounded-xl p-4 mb-4 border border-white/5 space-y-3 relative z-10">
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">Requested Data</p>
                        <p className="text-xs font-bold text-white flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-cyan-400">data_check</span> ForgeScore 
                            <span className="text-slate-600 ml-1">({forgeScore})</span>
                        </p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">Date Range</p>
                        <p className="text-xs font-bold text-white">Last 6 Months</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">Purpose</p>
                        <p className="text-xs font-bold text-white">Unsecured Personal Loan</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 relative z-10 mt-6">
                    <button className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/10">Deny</button>
                    <button 
                      onClick={handleAuthorize}
                      disabled={authorizing}
                      className="flex-[2] py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,123,255,0.4)] flex items-center justify-center gap-2"
                    >
                      {authorizing ? (
                          <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Cryptographically Signing...</>
                      ) : (
                          <><span className="material-symbols-outlined text-[18px]">lock_open</span> Authorize via Sahamati</>
                      )}
                    </button>
                 </div>
              </div>
          ) : (
             <div className="p-8 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="size-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-3">
                    <span className="material-symbols-outlined text-2xl">done_all</span>
                </div>
                <p className="text-slate-400 font-medium">No pending requests</p>
             </div>
          )}
        </section>

        {/* Active Integrations */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Consents</h3>
            <span className="text-[10px] text-primary hover:underline cursor-pointer">View Aggregator Log</span>
          </div>

          <div className="space-y-3">
              {authorized && (
                  <div className="glass-card p-4 rounded-xl flex items-center justify-between border-emerald-500/20 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                            <span className="text-blue-900 font-extrabold text-[10px] tracking-tighter leading-none">HDFC</span>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">HDFC Bank Ltd.</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                                <span className="size-1.5 bg-emerald-400 rounded-full"></span> Live Data Feed Active
                            </p>
                        </div>
                    </div>
                    <button className="text-[10px] font-bold text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors uppercase tracking-wider border border-transparent hover:border-red-500/20">Revoke</button>
                  </div>
              )}

              <div className="glass-card p-4 rounded-xl flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-extrabold text-[10px] tracking-tight">Bajaj</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Bajaj Finserv</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Expires: 12 Oct 2026</p>
                    </div>
                </div>
                <button className="text-[10px] font-bold text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors uppercase tracking-wider border border-transparent hover:border-red-500/20">Revoke</button>
              </div>

              <div className="glass-card p-4 rounded-xl flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-emerald-700 flex items-center justify-center shadow-lg text-white">
                        <span className="material-symbols-outlined text-xl">payments</span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">KreditBee</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Expires: 04 Nov 2026</p>
                    </div>
                </div>
                <button className="text-[10px] font-bold text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 transition-colors uppercase tracking-wider border border-transparent hover:border-red-500/20">Revoke</button>
              </div>
          </div>
        </section>
    </main>

      {/* Floating Navbar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-full px-2 py-2 flex items-center justify-between z-50 shadow-2xl">
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/ledger-certificate">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[10px] font-medium mt-1">Wallet</span>
        </Link>
        <div className="flex-none -mt-8">
          <button 
            onClick={() => setShowActionSheet(true)}
            className="size-14 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 text-white border-4 border-background-dark hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">hub</span>
          </button>
        </div>
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/smart-rules">
          <span className="material-symbols-outlined">bolt</span>
          <span className="text-[10px] font-medium mt-1">Forge</span>
        </Link>
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/more-menu">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </Link>
      </nav>

      {/* ACTION SHEET */}
      {showActionSheet && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={() => setShowActionSheet(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-3xl p-8 border-t border-white/10 animate-in slide-in-from-bottom-10 duration-500">
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <button onClick={() => navigate('/payouts')} className="flex flex-col items-center gap-2 group">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/20">
                  <span className="material-symbols-outlined text-2xl">send</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Send</span>
              </button>
              <button onClick={() => navigate('/ledger-certificate')} className="flex flex-col items-center gap-2 group">
                <div className="size-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-500/20">
                  <span className="material-symbols-outlined text-2xl">grid_view</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Pools</span>
              </button>
              <button onClick={() => navigate('/smart-rules')} className="flex flex-col items-center gap-2 group">
                <div className="size-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform border border-orange-500/20">
                  <span className="material-symbols-outlined text-2xl">bolt</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Forge</span>
              </button>
            </div>
            <button 
              onClick={() => setShowActionSheet(false)}
              className="w-full py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
