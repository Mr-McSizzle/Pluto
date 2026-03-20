import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import PayoutModal from '../components/PayoutModal';
import SendPaymentModal from '../components/SendPaymentModal';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, loading, spendable, savings, forgeScore, welfareTokens, processPayout, sendPayment, signOut, currentApy, claimDailyYield } = useAppContext();
  const navigate = useNavigate();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(847);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }

    if (!user) return;

    async function fetchTransactions() {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setPayoutsList(data.map(tx => {
          const amt = Number(tx.amount);
          return {
            title: tx.description,
            date: new Date(tx.created_at).toLocaleString(),
            amount: amt >= 0 ? `+₹${amt.toFixed(2)}` : `-₹${Math.abs(amt).toFixed(2)}`,
            type: tx.type === 'PAYOUT' ? 'green' : tx.type === 'PAYMENT' ? 'red' : 'primary'
          };
        }));
      }
    }

    fetchTransactions();
  }, [user, navigate, loading]);

  const handleProcessPayout = async () => {
    await processPayout(payoutAmount);
    setShowPayoutModal(false);
    
    setPayoutsList(prev => [
      {
        title: 'Automated Wage Split',
        date: new Date().toLocaleString(),
        amount: `+₹${payoutAmount.toFixed(2)}`,
        type: 'green'
      },
      ...prev
    ]);
  };

  // Dynamic Chart Path Generation
  const chartData = useMemo(() => {
    const points = chartPeriod === 'Weekly' ? 7 : 30;
    
    // Generate deterministic but "real-looking" points based on user ID and current score
    const seed = (user?.id.charCodeAt(0) || 0) + (user?.id.charCodeAt(1) || 0);
    const data = [];
    for (let i = 0; i < points; i++) {
        const variation = Math.sin((i + seed) * 0.5) * 40 + Math.cos((i * seed) * 0.2) * 20;
        data.push(Math.max(10, Math.min(90, 50 + (variation / 850 * 100))));
    }
    
    // Create SVG path
    const width = 472;
    const stepX = width / (points - 1);
    
    let path = `M0 ${150 - data[0] * 1.5}`;
    for (let i = 1; i < data.length; i++) {
        path += ` L${i * stepX} ${150 - data[i] * 1.5}`;
    }
    
    // Smooth version using Quadratic curves
    let smoothPath = `M0 ${150 - data[0] * 1.5}`;
    for (let i = 0; i < data.length - 1; i++) {
        const x1 = i * stepX;
        const y1 = 150 - data[i] * 1.5;
        const x2 = (i + 1) * stepX;
        const y2 = 150 - data[i+1] * 1.5;
        const xc = (x1 + x2) / 2;
        const yc = (y1 + y2) / 2;
        smoothPath += ` Q${x1} ${y1}, ${xc} ${yc}`;
    }
    smoothPath += ` L${width} ${150 - data[data.length-1] * 1.5}`;

    const fillPath = `${smoothPath} V150 H0 Z`;
    
    return { stroke: smoothPath, fill: fillPath };
  }, [chartPeriod, forgeScore, user?.id]);

  if (loading) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24">
      {/* Header Section */}
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full border-2 border-primary/50 p-0.5 overflow-hidden">
            <img 
              alt="Profile Avatar" 
              className="w-full h-full object-cover rounded-full" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC03JwCFCnRMA5Epm8JGLtTpL686lx8jYkOyxSnHAeMXW67TuoX5QZGCcjRcSOYeJuJyrCRsddtGEmJg-aNge9tlAsWWYJjSyXCZxwGCv4ATcmEjYLJm4f4J6gT_g7XM5lV10K3d3mtzIkU24dnQQMezgsfZe-KPK1MB4glv7cSszdefwzr5PRXcbgRDujTIEhDxONpLISaf5TXb5cl5R5EDlc4aBAvfFk4mg67Xib3aqBq0cNkVOwqAf1x4naJaWMpd5JC7HbkeJA"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Welcome 👋</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Aadhaar: **** {user?.email?.split('@')[0].slice(-4)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={signOut} className="size-10 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 hover:text-red-400 transition-colors">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button className="size-10 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-slate-100">notifications</span>
          </button>
        </div>
      </header>

      <main className="px-6 space-y-6">
        {/* Balance Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-xl border-green-500/20 relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Spendable</p>
            <p className="text-2xl font-bold text-green-400">₹{spendable.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 w-fit px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> {payoutsList.length > 0 ? `${Math.min(payoutsList.length * 1.3, 25).toFixed(1)}%` : '2.4%'}
            </div>
          </div>
          
          <div className="glass-card p-5 rounded-xl border-primary/20 relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Savings</p>
            <p className="text-2xl font-bold text-primary">₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                {currentApy?.toFixed(1) || '8.2'}% APY
              </div>
              <button onClick={claimDailyYield} className="text-[10px] bg-primary/20 hover:bg-primary/30 text-primary px-2 py-0.5 rounded transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">redeem</span>
              </button>
            </div>
          </div>
          
          <div className="glass-card p-5 rounded-xl border-cyan-500/20 relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ForgeScore</p>
            <div className="flex items-end gap-1">
              <p className="text-2xl font-bold text-cyan-400">{forgeScore}</p>
              <span className="text-[10px] mb-1.5 text-slate-500 font-bold">PTS</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-400/10 w-fit px-2 py-0.5 rounded-full uppercase">
              {forgeScore >= 700 ? 'Platinum' : forgeScore >= 500 ? 'Gold' : 'Silver'}
            </div>
          </div>
          
          <div className="glass-card p-5 rounded-xl border-white/10 relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Welfare</p>
            <p className="text-2xl font-bold text-white">{welfareTokens.toLocaleString()}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-white bg-white/10 w-fit px-2 py-0.5 rounded-full">
              {welfareTokens > 0 ? 'Active' : 'No Tokens'}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ANALYSIS CHART */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl relative overflow-hidden border-white/5">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-white">ForgeScore Analysis</h3>
                <p className="text-xs text-slate-500">Activity over the last {chartPeriod === 'Weekly' ? '7 days' : '30 days'}</p>
              </div>
              <div className="flex bg-slate-800/50 p-1 rounded-lg border border-white/10">
                <button 
                    onClick={() => setChartPeriod('Weekly')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${chartPeriod === 'Weekly' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >Weekly</button>
                <button 
                    onClick={() => setChartPeriod('Monthly')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${chartPeriod === 'Monthly' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >Monthly</button>
              </div>
            </div>
            
            <div className="relative h-[200px] w-full mt-4 group">
              {/* Vertical Guide Lines */}
              <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                {[...Array(chartPeriod === 'Weekly' ? 7 : 4)].map((_, i) => (
                    <div key={i} className="w-px h-full bg-slate-500 border-dashed border-l border-slate-500/50"></div>
                ))}
              </div>

              <svg className="w-full h-full overflow-visible transition-all duration-700" fill="none" preserveAspectRatio="none" viewBox="0 0 472 150">
                <defs>
                  <linearGradient id="chartGradientMain" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path 
                    d={chartData.fill} 
                    fill="url(#chartGradientMain)"
                    className="transition-all duration-700 ease-in-out"
                ></path>
                <path 
                    d={chartData.stroke} 
                    stroke="#00d4ff" 
                    strokeLinecap="round" 
                    strokeWidth="3"
                    className="transition-all duration-700 ease-in-out drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                ></path>
              </svg>

              {/* Data Points on Hover Placeholder */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary/20 px-2 py-1 rounded text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                 Verification Active
              </div>
            </div>

            <div className="flex justify-between mt-6 px-1">
              {chartPeriod === 'Weekly' ? (
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day} className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{day}</span>
                ))
              ) : (
                ['W1', 'W2', 'W3', 'W4'].map(w => (
                    <span key={w} className="text-[10px] font-bold text-slate-500 uppercase">{w}</span>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL - TRUST GAUGE */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-5 border-white/5 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 size-32 bg-cyan-500/5 rounded-full blur-3xl"></div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Trust Rank</h3>
             
             <div className="relative size-44 p-2">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-slate-800" cx="18" cy="18" fill="none" r="16" strokeDasharray="100 100" strokeWidth="2.5"></circle>
                  <circle 
                    className="stroke-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1)" 
                    cx="18" cy="18" fill="none" r="16" 
                    strokeDasharray={`${Math.floor((forgeScore / 850) * 100)} 100`} 
                    strokeLinecap="round" strokeWidth="2.5"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="flex items-baseline gap-0.5">
                      <span className="text-4xl font-black text-white">{Math.floor((forgeScore / 850) * 100)}</span>
                      <span className="text-sm font-bold text-cyan-500">%</span>
                   </div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      {forgeScore >= 700 ? 'Top 1%' : forgeScore >= 500 ? 'Top 10%' : 'Standard'}
                   </span>
                </div>
             </div>

             <div className="space-y-4 w-full">
                <button onClick={() => navigate('/open-finance')} className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500 text-background-dark font-black text-[11px] uppercase tracking-wider rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
                   <span className="material-symbols-outlined text-lg">verified_user</span> Open API Share
                </button>
                <button onClick={() => navigate('/skill-passport')} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all">
                   <span className="material-symbols-outlined text-lg">card_membership</span> Skill Passport
                </button>
             </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
               Recent Activity <span className="size-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </h3>
            <button onClick={() => navigate('/payouts')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-primary transition-all border border-white/5">
               View All
            </button>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden border-white/5">
            <div className="divide-y divide-white/5">
              {payoutsList.length > 0 ? payoutsList.map((payout, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl bg-${payout.type === 'green' ? 'emerald' : payout.type === 'red' ? 'red' : 'primary'}-500/10 flex items-center justify-center text-${payout.type === 'green' ? 'emerald' : payout.type === 'red' ? 'red' : 'primary'}-400 group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">
                        {payout.type === 'green' ? 'payments' : payout.type === 'red' ? 'send' : 'account_balance'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{payout.title}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{payout.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${payout.amount.startsWith('+') ? 'text-emerald-400' : 'text-slate-200'}`}>{payout.amount}</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                       <span className="size-1 bg-emerald-500 rounded-full"></span>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Settled</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center space-y-3">
                   <span className="material-symbols-outlined text-4xl text-slate-700">history</span>
                   <p className="text-sm text-slate-500">No activity found yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Navbar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-full px-2 py-2 flex items-center justify-between z-50 shadow-2xl">
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-primary" to="/dashboard">
          <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="text-[10px] font-bold mt-1">Home</span>
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

      {/* ACTIONS MODAL */}
      {showActionSheet && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowActionSheet(false)}>
          <div 
            className="w-full max-w-md bg-background-dark/95 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 space-y-4 animate-in slide-in-from-bottom-20 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-white text-center mb-6">Select Action</h3>
            
            <div className="grid grid-cols-1 gap-3">
                <button onClick={() => { setShowActionSheet(false); setShowSendModal(true); }} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left group">
                   <div className="size-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                      <span className="material-symbols-outlined">qr_code_scanner</span>
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-white">Send & Scan</p>
                      <p className="text-[10px] text-slate-500">Pay any merchant or contact</p>
                   </div>
                   <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                </button>

                <button onClick={() => { setShowActionSheet(false); setPayoutAmount(Math.floor(Math.random() * 1500) + 500); setShowPayoutModal(true); }} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left group">
                   <div className="size-12 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                      <span className="material-symbols-outlined">download</span>
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-white">Receive Payout</p>
                      <p className="text-[10px] text-slate-500">Simulate incoming wage split</p>
                   </div>
                   <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                </button>

                <button onClick={() => { setShowActionSheet(false); navigate('/cash-out'); }} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left group">
                   <div className="size-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                      <span className="material-symbols-outlined">local_atm</span>
                   </div>
                   <div className="flex-1">
                      <p className="font-bold text-white">Cash Out</p>
                      <p className="text-[10px] text-slate-500">Convert e₹ to local currency</p>
                   </div>
                   <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                </button>
            </div>
            
            <button onClick={() => setShowActionSheet(false)} className="w-full py-4 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Close Menu</button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <PayoutModal isOpen={showPayoutModal} onClose={() => setShowPayoutModal(false)} onConfirm={handleProcessPayout} amount={payoutAmount} />
      <SendPaymentModal 
        isOpen={showSendModal} onClose={() => setShowSendModal(false)}
        availableBalance={spendable}
        onSend={async (amount, recipient) => {
            const success = await sendPayment(amount, recipient);
            if (success) {
               setPayoutsList([{
                 title: recipient === 'Scanned UPI Merchant' ? 'UPI Scan Payment' : `Paid ${recipient}`,
                 date: new Date().toLocaleString(),
                 amount: `-₹${amount.toFixed(2)}`,
                 type: recipient === 'Scanned UPI Merchant' ? 'cyan' : 'primary'
               }, ...payoutsList]);
            }
            return success;
        }}
      />
    </div>
  );
}
