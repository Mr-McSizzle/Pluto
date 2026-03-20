import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function MoreMenu() {
    const navigate = useNavigate();
    const { user, forgeScore, simulateTimePassage } = useAppContext();
    const [showActionSheet, setShowActionSheet] = useState(false);

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-32">
            <header className="flex items-center justify-between p-6 bg-background-dark/80 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <Link to="/dashboard" className="p-2 rounded-lg bg-slate-800/50 text-slate-100 hover:bg-slate-700/50 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">More</h1>
                </div>
                <button className="glass-card p-2 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-slate-100">notifications</span>
                </button>
            </header>

            {/* Profile Glass Card */}
            <div className="px-4 mb-8">
                <div className="glass-card rounded-xl p-6 flex items-center gap-4 relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative">
                        <div className="size-20 rounded-full border-2 border-[#00f2ff]/50 p-1">
                            <div 
                                className="w-full h-full rounded-full bg-center bg-cover" 
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqqPDVbJ5wpfmRW2Am9stFnwbqi_0uFeMm4X6pWZOz8HK1f8UJWZSAj9HVNLZ0SEXn3WuESw97sQ53s_CRsfgqekgxL8R4oRhwzxk0qMuxJZZl31M_BVEZovHoNWJPmNGDUVLCqcCZIBHqQd_vt045TwPKhnasVHpVbCd63xkivrKTCIfsg_R48RyGr5TwvwzHpeSstDrRjzMn429DFAZCQLYA7xBGQUuH1GSw3vKAHoepHXTNIkD91tUTX5YEsrzQPhgbcFvnKgY')" }}
                            ></div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#00f2ff] text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(0,242,255,0.3)]">
                            VERIFIED
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">User {user?.email?.split('@')[0].slice(-4)}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#00f2ff] font-semibold text-sm">ForgeScore: {forgeScore}</span>
                            <span className="material-symbols-outlined text-[#00f2ff] text-sm hidden sm:inline-block">verified_user</span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">Pluto Citizen</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </div>
            </div>

            {/* Impact Stats Row */}
            <div className="px-4 grid grid-cols-3 gap-3 mb-8">
                <div className="glass-card rounded-xl p-4 text-center bg-white/5 backdrop-blur-md border border-white/10">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Impact</p>
                    <p className="text-[#00f2ff] text-xl font-bold">12.4k</p>
                    <p className="text-emerald-400 text-[10px] font-medium">+15%</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center bg-white/5 backdrop-blur-md border border-white/10">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Projects</p>
                    <p className="text-[#00f2ff] text-xl font-bold">48</p>
                    <p className="text-emerald-400 text-[10px] font-medium">+2</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center bg-white/5 backdrop-blur-md border border-white/10">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Earnings</p>
                    <p className="text-[#00f2ff] text-xl font-bold">$3.2k</p>
                    <p className="text-emerald-400 text-[10px] font-medium">+10%</p>
                </div>
            </div>

            {/* Menu List */}
            <div className="px-4 space-y-3">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest ml-1 mb-2">Services & Benefits</h3>
                
                <button 
                  onClick={() => navigate('/welfare-tokens')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors border border-white/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">health_and_safety</span>
                        </div>
                        <span className="font-medium">Welfare Program</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-100 transition-colors">chevron_right</span>
                </button>
                
                <button 
                  onClick={() => navigate('/ledger-certificate')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors border border-white/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        </div>
                        <span className="font-medium">Certificates</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded">3 NEW</span>
                        <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-100 transition-colors">chevron_right</span>
                    </div>
                </button>
                
                <button 
                  onClick={() => navigate('/offline-payments')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors border border-white/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">payments</span>
                        </div>
                        <span className="font-medium">Offline Pay</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-100 transition-colors">chevron_right</span>
                </button>
                
                <button 
                  onClick={() => navigate('/cash-out')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-orange-500/10 transition-colors border border-orange-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-orange-400">local_atm</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Cash Out</span>
                          <span className="text-[10px] text-orange-400">e₹ → Physical Cash via BC Agents</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-orange-500 group-hover:text-orange-400 transition-colors">chevron_right</span>
                </button>

                <button 
                  onClick={() => navigate('/open-finance')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-cyan-500/10 transition-colors border border-cyan-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-cyan-400">hub</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Open Finance Hub</span>
                          <span className="text-[10px] text-cyan-400 flex items-center gap-1"><span className="size-1.5 bg-cyan-400 rounded-full inline-block"></span> Sahamati AA Network</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded font-bold">1 NEW</span>
                        <span className="material-symbols-outlined text-cyan-500 group-hover:text-cyan-400 transition-colors">chevron_right</span>
                    </div>
                </button>
                
                <button className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                        </div>
                        <span className="font-medium">Tax Documents</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-100 transition-colors">chevron_right</span>
                </button>

                <button 
                  onClick={() => navigate('/grievances')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-red-500/10 transition-colors border border-red-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-400">gavel</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Disputes & Emergencies</span>
                          <span className="text-[10px] text-red-400">Smart-Contract Exception Engine</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-red-500 group-hover:text-red-400 transition-colors">chevron_right</span>
                </button>

                <button 
                  onClick={() => navigate('/skill-passport')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-indigo-500/10 transition-colors border border-indigo-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-400">card_membership</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Skill Passport</span>
                          <span className="text-[10px] text-indigo-400">Cryptographic Proof-of-Work · Global Mobility</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-1 rounded font-bold">NEW</span>
                        <span className="material-symbols-outlined text-indigo-500 group-hover:text-indigo-400 transition-colors">chevron_right</span>
                    </div>
                </button>

                {/* AI Wealth Manager */}
                <button 
                  onClick={() => navigate('/wealth-manager')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-purple-500/10 transition-colors border border-purple-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-400">psychology</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">AI Wealth Manager</span>
                          <span className="text-[10px] text-purple-400">Autonomous Financial Guardian · Predict & Protect</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-1 rounded font-bold">NEW</span>
                        <span className="material-symbols-outlined text-purple-500 group-hover:text-purple-400 transition-colors">chevron_right</span>
                    </div>
                </button>

                <button 
                  onClick={() => navigate('/tap-to-employ')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-amber-500/10 transition-colors border border-amber-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-400">handshake</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium">Tap-to-Employ</span>
                          <span className="text-[10px] text-amber-400">P2P Escrow · Zero-Trust Contracts</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-1 rounded font-bold">NEW</span>
                        <span className="material-symbols-outlined text-amber-500 group-hover:text-amber-400 transition-colors">chevron_right</span>
                    </div>
                </button>

                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest ml-1 mb-2 mt-8">Developer Tools</h3>
                <button 
                  onClick={simulateTimePassage}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group hover:bg-cyan-500/10 transition-colors border border-cyan-500/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-cyan-400">update</span>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-cyan-400">Simulate 30 Days (Decay)</span>
                          <span className="text-[10px] text-slate-400">Lowers ForgeScore, Compounds APY</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-cyan-500 group-hover:text-cyan-400 transition-colors">play_arrow</span>
                </button>
                
                <button 
                  onClick={() => navigate('/')}
                  className="w-full glass-card rounded-xl p-4 flex items-center justify-between group mt-8 hover:bg-red-500/10 transition-colors border border-white/10"
                >
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-400">logout</span>
                        </div>
                        <span className="font-medium text-red-400">Sign Out</span>
                    </div>
                </button>
            </div>

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
              <Link className="flex-1 flex flex-col items-center justify-center py-2 text-primary" to="/more-menu">
                <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                <span className="text-[10px] font-bold mt-1">Profile</span>
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
