import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

/* derive a platform from tx description deterministically */
function derivePlatform(desc: string, id: string): string {
  const d = (desc || '').toLowerCase();
  if (d.includes('swiggy') || d.includes('food') || d.includes('kitchen')) return 'Swiggy';
  if (d.includes('ola') || d.includes('uber') || d.includes('delivery') || d.includes('driver')) return 'Ola';
  if (d.includes('urban') || d.includes('repair') || d.includes('plumb') || d.includes('electric')) return 'UrbanCo';
  if (d.includes('payment') || d.includes('upi') || d.includes('send') || d.includes('scan')) return 'UPI';
  // deterministic fallback from id
  const platforms = ['Swiggy', 'Ola', 'UrbanCo', 'UPI'];
  const charSum = (id || 'x').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return platforms[charSum % platforms.length];
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Swiggy:  { bg: 'bg-orange-500/10', text: 'text-orange-400', bar: 'bg-orange-500' },
  Ola:     { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  UrbanCo: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  UPI:     { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
};

export default function Payouts() {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [payoutsList, setPayoutsList] = useState<any[]>([]);
    const [activePlatform, setActivePlatform] = useState('All');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [showActionSheet, setShowActionSheet] = useState(false);
    
    useEffect(() => {
        if (!user) return;
        async function fetchTx() {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });
            if (data) setPayoutsList(data);
        }
        fetchTx();
    }, [user]);

    // Derive platform stats from actual data
    const txWithPlatform = payoutsList.map(tx => ({ ...tx, platform: derivePlatform(tx.description, tx.id) }));
    const totalEarnings = txWithPlatform.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
    const totalSpent = txWithPlatform.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

    const platformStats = Object.entries(
      txWithPlatform.reduce<Record<string, { count: number; total: number }>>((acc, tx) => {
        const p = tx.platform;
        if (!acc[p]) acc[p] = { count: 0, total: 0 };
        acc[p].count++;
        acc[p].total += Math.abs(Number(tx.amount));
        return acc;
      }, {})
    ).map(([name, stats]) => ({
      name,
      count: stats.count,
      total: stats.total,
      pct: payoutsList.length > 0 ? Math.round((stats.count / payoutsList.length) * 100) : 0,
      ...(PLATFORM_COLORS[name] || PLATFORM_COLORS.UPI),
    })).sort((a, b) => b.count - a.count);

    // Filtered list
    const filtered = activePlatform === 'All' ? txWithPlatform : txWithPlatform.filter(t => t.platform === activePlatform);
    const displayList = showAll ? filtered : filtered.slice(0, 8);

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen pb-24 font-display">
            {/* Top Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between p-6 bg-background-dark/80 backdrop-blur-md">
                <Link to="/dashboard" className="p-2 rounded-lg bg-slate-800/50 text-slate-100 hover:bg-slate-700/50 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-xl font-bold tracking-tight">My Payouts</h1>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary">person</span>
                </div>
            </header>

            <main className="px-4 space-y-6">
                {/* Platform Filters — now functional */}
                <div className="flex gap-3 overflow-x-auto custom-scrollbar py-2">
                    <button
                      onClick={() => setActivePlatform('All')}
                      className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 transition-colors ${activePlatform === 'All' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                    >
                        {activePlatform === 'All' && <span className="material-symbols-outlined text-sm">done</span>}
                        <p className="text-sm font-semibold">All Platforms</p>
                    </button>
                    {platformStats.map(p => (
                      <button
                        key={p.name}
                        onClick={() => setActivePlatform(p.name === activePlatform ? 'All' : p.name)}
                        className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl px-5 transition-colors ${activePlatform === p.name ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-sm">payments</span>
                        <p className="text-sm font-medium">{p.name}</p>
                        <span className="text-[10px] opacity-60">({p.count})</span>
                      </button>
                    ))}
                </div>

                {/* Total Earnings Card — now dynamic */}
                <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Earnings</p>
                                <h2 className="text-4xl font-bold mt-1">₹{totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
                                {totalSpent > 0 && (
                                  <p className="text-xs text-slate-500 mt-1">Spent: ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 2 })} · Net: ₹{(totalEarnings - totalSpent).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                                )}
                            </div>
                            {/* Dynamic Split Bar */}
                            {platformStats.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-800">
                                    {platformStats.map(p => (
                                      <div key={p.name} className={`h-full ${p.bar}`} style={{ width: `${p.pct}%` }} title={`${p.name} (${p.pct}%)`}></div>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium">
                                    {platformStats.map(p => (
                                      <span key={p.name} className="flex items-center gap-1">
                                        <span className={`w-2 h-2 rounded-full ${p.bar}`}></span> {p.name} ({p.pct}%)
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => setShowAnalytics(true)} className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.98]">
                                <span>View Analytics</span>
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Payouts List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold">
                          {activePlatform === 'All' ? 'Recent Payouts' : `${activePlatform} Payouts`}
                          <span className="text-sm text-slate-500 font-normal ml-2">({filtered.length})</span>
                        </h3>
                        {filtered.length > 8 && (
                          <button onClick={() => setShowAll(!showAll)} className="text-primary text-sm font-semibold hover:underline">
                            {showAll ? 'Show Less' : 'See All'}
                          </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {displayList.length === 0 ? (
                            <div className="text-center py-12 glass-card rounded-xl">
                                <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">receipt_long</span>
                                <p className="text-slate-500 text-sm">No transactions found</p>
                                <p className="text-[10px] text-slate-600 mt-1">Process a payout to see it here</p>
                            </div>
                        ) : (
                            displayList.map((tx) => {
                                const colors = PLATFORM_COLORS[tx.platform] || PLATFORM_COLORS.UPI;
                                return (
                                  <div key={tx.id} className="glass-card rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text} group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined">
                                                {tx.type === 'PAYOUT' ? 'payments' : tx.type === 'YIELD' ? 'trending_up' : tx.type === 'PAYMENT' ? 'send' : 'account_balance_wallet'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-100">{tx.description || tx.type}</p>
                                            <p className="text-xs text-slate-400">
                                              {new Date(tx.created_at).toLocaleString()} · <span className={colors.text}>{tx.platform}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${Number(tx.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {Number(tx.amount) >= 0 ? '+' : '−'}₹{Math.abs(Number(tx.amount)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{tx.status}</p>
                                    </div>
                                  </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            {/* ═══ ANALYTICS MODAL ═══ */}
            {showAnalytics && (
              <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAnalytics(false)}>
                <div
                  className="w-full max-w-md bg-background-dark/95 backdrop-blur-xl rounded-t-3xl border-t border-primary/20 p-6 space-y-5 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,123,255,0.15)] max-h-[85vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-center mb-1">
                    <div className="h-1.5 w-12 bg-slate-700 rounded-full cursor-pointer" onClick={() => setShowAnalytics(false)}></div>
                  </div>
                  <h2 className="text-xl font-bold">Earnings Analytics</h2>

                  {/* Summary cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass-card rounded-xl p-3 text-center">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Earned</p>
                      <p className="text-lg font-bold text-emerald-400">₹{totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="glass-card rounded-xl p-3 text-center">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Spent</p>
                      <p className="text-lg font-bold text-red-400">₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="glass-card rounded-xl p-3 text-center">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Txns</p>
                      <p className="text-lg font-bold text-white">{payoutsList.length}</p>
                    </div>
                  </div>

                  {/* Platform breakdown */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">By Platform</h3>
                    <div className="space-y-3">
                      {platformStats.map(p => (
                        <div key={p.name} className="glass-card rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`size-8 rounded-lg ${p.bg} flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-[16px] ${p.text}`}>payments</span>
                              </div>
                              <span className="font-bold text-white">{p.name}</span>
                            </div>
                            <span className={`text-sm font-bold ${p.text}`}>₹{p.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${p.bar} rounded-full transition-all duration-700`} style={{ width: `${p.pct}%` }}></div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold w-8 text-right">{p.pct}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{p.count} transactions</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Avg per transaction */}
                  <div className="glass-card rounded-xl p-4 border border-primary/20">
                    <p className="text-[9px] text-primary uppercase tracking-wider font-bold mb-1">Average per Transaction</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{payoutsList.length > 0 ? Math.round((totalEarnings + totalSpent) / payoutsList.length).toLocaleString('en-IN') : '0'}
                    </p>
                  </div>

                  <button onClick={() => setShowAnalytics(false)} className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors active:scale-[0.98]">
                    Close
                  </button>
                </div>
              </div>
            )}

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
                        className="size-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 text-white border-4 border-background-dark hover:scale-105 transition-transform"
                    >
                        <span className="material-symbols-outlined text-3xl">add</span>
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
