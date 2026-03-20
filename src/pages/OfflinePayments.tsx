import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function OfflinePayments() {
    const navigate = useNavigate();
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showToken, setShowToken] = useState(false);

    return (
        <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-accent/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-background-dark/60 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
                <Link 
                  to="/dashboard"
                  className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-100">arrow_back</span>
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-white">Offline Payments</h1>
                <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-slate-100">help_outline</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="p-4 space-y-6">
                {/* Status Card */}
                <div className="bg-[#172636]/70 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 border-l-4 border-cyan-accent shadow-lg shadow-black/20 border-y border-r border-white/5">
                    <div className="size-12 rounded-full bg-cyan-accent/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-cyan-accent text-3xl">wifi_off</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">Offline Mode Active</h3>
                        <p className="text-slate-400 text-sm">Secure transactions enabled without cellular data or Wi-Fi.</p>
                    </div>
                </div>

                {/* NFC Hero Card */}
                <div className="relative group mx-2">
                    {/* Ripple Background Effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,242,255,0.15)_0%,rgba(15,25,35,0)_70%)] rounded-xl animate-pulse"></div>
                    
                    {/* Card Content with Custom Dashed Border */}
                    <div className="relative p-8 flex flex-col items-center justify-center text-center space-y-4 bg-background-dark/40 backdrop-blur-sm rounded-xl">
                        {/* Dashed Border SVG Overlay */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-xl" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="none" rx="12" ry="12" stroke="#00f2ff" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />
                        </svg>

                        <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(0,123,255,0.3)]">
                            <span className="material-symbols-outlined text-cyan-accent text-5xl">contactless</span>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold text-white">Tap to Pay</h2>
                            <p className="text-cyan-accent font-medium tracking-widest uppercase text-xs">Ready for terminal</p>
                        </div>
                        <div className="flex gap-1 py-2">
                            <div className="h-1 w-8 bg-cyan-accent rounded-full opacity-40 animate-pulse"></div>
                            <div className="h-1 w-8 bg-cyan-accent rounded-full opacity-70 animate-pulse delay-75"></div>
                            <div className="h-1 w-8 bg-cyan-accent rounded-full animate-pulse delay-150"></div>
                        </div>
                        <button 
                            onClick={() => setShowToken(true)}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_20px_rgba(0,123,255,0.4)] transition-all active:scale-95 w-full max-w-xs mt-2 relative z-10"
                        >
                            Generate Offline Token
                        </button>
                    </div>
                </div>

                {/* Token Modal */}
                {showToken && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md" onClick={() => setShowToken(false)}></div>
                        <div className="relative glass-card w-full max-w-sm p-8 rounded-3xl border border-primary/30 text-center space-y-6 shadow-[0_0_50px_rgba(0,123,255,0.2)]">
                            <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30 animate-pulse">
                                <span className="material-symbols-outlined text-primary text-4xl">key</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold">Secure Token</h3>
                                <p className="text-slate-400 text-sm">Hold near any PayForge terminal to complete payment offline.</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 font-mono text-xl tracking-[0.5em] text-primary">
                                8291-4402
                            </div>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Valid for 4:59 mins
                            </div>
                            <button 
                                onClick={() => setShowToken(false)}
                                className="w-full py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* How it Works Section */}
                <section className="space-y-4 pt-2">
                    <h3 className="text-lg font-bold px-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">info</span>
                        How it works
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-1">
                        <div className="min-w-[140px] flex-1 bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl text-center space-y-2 border border-white/5 shadow-lg">
                            <span className="material-symbols-outlined text-cyan-accent border border-cyan-accent/30 p-2 rounded-full bg-cyan-accent/10">lock</span>
                            <p className="text-xs font-bold text-white mt-2">Encrypted Tokens</p>
                        </div>
                        <div className="min-w-[140px] flex-1 bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl text-center space-y-2 border border-white/5 shadow-lg">
                            <span className="material-symbols-outlined text-cyan-accent border border-cyan-accent/30 p-2 rounded-full bg-cyan-accent/10">sync_alt</span>
                            <p className="text-xs font-bold text-white mt-2">Delayed Sync</p>
                        </div>
                        <div className="min-w-[140px] flex-1 bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl text-center space-y-2 border border-white/5 shadow-lg">
                            <span className="material-symbols-outlined text-cyan-accent border border-cyan-accent/30 p-2 rounded-full bg-cyan-accent/10">verified_user</span>
                            <p className="text-xs font-bold text-white mt-2">Secure Auth</p>
                        </div>
                    </div>
                </section>

                {/* Use Cases Grid */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold px-1">Common Use Cases</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                            <div className="bg-white/5 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">flight</span>
                            </div>
                            <span className="text-sm font-medium mt-1">In-flight</span>
                        </div>
                        <div className="bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                            <div className="bg-white/5 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">subway</span>
                            </div>
                            <span className="text-sm font-medium mt-1">Transit</span>
                        </div>
                        <div className="bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                            <div className="bg-white/5 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">landscape</span>
                            </div>
                            <span className="text-sm font-medium mt-1">Remote Area</span>
                        </div>
                        <div className="bg-[#172636]/70 backdrop-blur-md p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                            <div className="bg-white/5 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                                <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">festival</span>
                            </div>
                            <span className="text-sm font-medium mt-1">Events</span>
                        </div>
                    </div>
                </section>

                {/* Comparison Callout */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 space-y-3 mt-4">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined">compare_arrows</span>
                        <span className="font-bold">Pluto vs Standard Pay</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        Traditional apps require data to verify balances. Pluto uses pre-authorized <span className="font-semibold text-white">3D-secure vaults</span> to process payments instantly even in dead zones.
                    </p>
                </div>
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
