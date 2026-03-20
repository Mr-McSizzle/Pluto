import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';

export default function WelfareTokens() {
    const navigate = useNavigate();
    const { user, loading, welfareTokens } = useAppContext();
    const [showActionSheet, setShowActionSheet] = useState(false);
    
    // Proportional dynamic distribution of the total WFT balance 
    const food = Math.floor(welfareTokens * 0.5);
    const transport = Math.floor(welfareTokens * 0.2);
    const health = Math.floor(welfareTokens * 0.2);
    const edu = welfareTokens - food - transport - health;

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="bg-background-dark min-h-screen flex items-center justify-center">
                <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24">
            {/* Floating Top Header */}
            <header className="sticky top-4 z-50 px-4">
                <div className="glass-panel electric-glow rounded-xl flex items-center justify-between p-4 h-16 max-w-lg mx-auto bg-background-dark/50 backdrop-blur-md border border-primary/20">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="material-symbols-outlined text-primary hover:text-white transition-colors">
                            arrow_back
                        </Link>
                        <h1 className="text-lg font-bold">Welfare Tokens</h1>
                    </div>
                    <button className="bg-primary/20 p-2 rounded-lg text-primary hover:bg-primary/30 transition-colors">
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 mt-8 space-y-6">
                {/* Balance Overview */}
                <section className="glass-panel p-6 rounded-xl relative overflow-hidden bg-white/5 backdrop-blur-md border border-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
                    <p className="text-slate-400 text-sm font-medium">Total Balance</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h2 className="text-3xl font-bold">{welfareTokens.toLocaleString()}</h2>
                        <span className="text-primary font-bold">WFT</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm font-semibold">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        <span>+12.5% this month</span>
                    </div>
                </section>

                {/* Live Demo Spending Card */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-primary px-1">Live Demo Simulation</h3>
                    <div className="glass-panel rounded-xl overflow-hidden border border-primary/30 bg-white/5 backdrop-blur-md">
                        <div className="bg-primary/10 p-4 border-b border-primary/20 flex justify-between items-center">
                            <span className="text-xs font-bold">SMART RESTRICTION ENGINE</span>
                            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Allowed Scenario */}
                            <div className="flex items-center gap-4 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                                <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <span className="material-symbols-outlined">restaurant</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Green Grocers Ltd.</p>
                                    <p className="text-xs text-slate-400">Food & Dining Token</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">ALLOWED</span>
                                </div>
                            </div>
                            
                            {/* Blocked Scenario */}
                            <div className="flex items-center gap-4 bg-red-500/5 p-3 rounded-lg border border-red-500/20">
                                <div className="size-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                                    <span className="material-symbols-outlined">casino</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold">Luxury Casino & Bar</p>
                                    <p className="text-xs text-slate-400">Restricted Category</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded uppercase">Blocked</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Active Tokens Grid */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-lg font-bold">Active Tokens</h3>
                        <button className="text-primary text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Cyan: Food */}
                        <div className="glass-panel text-left rounded-xl p-4 border-t-4 border-t-cyan-400 relative group hover:bg-white/5 transition-colors cursor-pointer bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border hover:border-white/20 border-white/5">
                            <div className="flex flex-col h-full justify-between gap-8">
                                <span className="material-symbols-outlined text-cyan-400 text-3xl">restaurant</span>
                                <div>
                                    <p className="font-bold text-lg">Food</p>
                                    <p className="text-xs text-slate-400">{food.toLocaleString()} WFT</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Blue: Transport */}
                        <div className="glass-panel text-left rounded-xl p-4 border-t-4 border-t-primary relative group hover:bg-white/5 transition-colors cursor-pointer bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border hover:border-white/20 border-white/5">
                            <div className="flex flex-col h-full justify-between gap-8">
                                <span className="material-symbols-outlined text-primary text-3xl">directions_bus</span>
                                <div>
                                    <p className="font-bold text-lg">Transport</p>
                                    <p className="text-xs text-slate-400">{transport.toLocaleString()} WFT</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Purple: Healthcare */}
                        <div className="glass-panel text-left rounded-xl p-4 border-t-4 border-t-purple-500 relative group hover:bg-white/5 transition-colors cursor-pointer bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border hover:border-white/20 border-white/5">
                            <div className="flex flex-col h-full justify-between gap-8">
                                <span className="material-symbols-outlined text-purple-500 text-3xl">medical_services</span>
                                <div>
                                    <p className="font-bold text-lg">Health</p>
                                    <p className="text-xs text-slate-400">{health.toLocaleString()} WFT</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Gold: Education */}
                        <div className="glass-panel text-left rounded-xl p-4 border-t-4 border-t-amber-400 relative group hover:bg-white/5 transition-colors cursor-pointer bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md border hover:border-white/20 border-white/5">
                            <div className="flex flex-col h-full justify-between gap-8">
                                <span className="material-symbols-outlined text-amber-400 text-3xl">school</span>
                                <div>
                                    <p className="font-bold text-lg">Education</p>
                                    <p className="text-xs text-slate-400">{edu.toLocaleString()} WFT</p>
                                </div>
                            </div>
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
                        className="size-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 text-white border-4 border-background-dark hover:scale-105 transition-transform"
                    >
                        <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
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

            {/* Background Decoration */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]"></div>
            </div>
        </div>
    );
}
