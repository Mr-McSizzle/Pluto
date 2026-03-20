import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';

export default function CreditLoans() {
  const navigate = useNavigate();
  const { user, loading, forgeScore, disburseLoan } = useAppContext();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000);
  const [applyStep, setApplyStep] = useState<'FORM' | 'PROCESSING' | 'APPROVED'>('FORM');
  const [showInfo, setShowInfo] = useState(false);

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
  
  const maxCreditLimit = Math.floor((forgeScore / 850) * 20000);
  const interestRate = forgeScore >= 700 ? 8 : forgeScore >= 500 ? 10 : 12;
  const monthlyRepayment = Math.floor(loanAmount * (1 + interestRate / 100) / 12);
  const totalRepay = monthlyRepayment * 12;

  const handleApply = () => {
    setApplyStep('FORM');
    setLoanAmount(Math.min(5000, maxCreditLimit || 1000));
    setShowApply(true);
  };

  const handleSubmit = async () => {
    setApplyStep('PROCESSING');
    await disburseLoan(loanAmount);
    setTimeout(() => setApplyStep('APPROVED'), 2500);
  };

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 p-4">
        <div className="glass-card rounded-xl flex items-center justify-between px-4 py-3 bg-background-dark/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="material-symbols-outlined text-slate-100 cursor-pointer hover:text-white transition-colors">
              arrow_back
            </Link>
            <h1 className="text-lg font-bold tracking-tight">Credit & Loans</h1>
          </div>
          <button onClick={() => setShowInfo(!showInfo)} className="material-symbols-outlined text-slate-400 hover:text-white transition-colors">info</button>
        </div>
      </div>

      {/* Info banner */}
      {showInfo && (
        <div className="mx-4 mb-4 glass-card rounded-xl p-4 border border-cyan-500/20 bg-cyan-500/5 text-xs text-slate-300 leading-relaxed">
          <p><span className="text-cyan-400 font-bold">How it works:</span> Your ForgeScore ({forgeScore}/850) determines your credit limit. Loans are disbursed instantly as e₹ into your Spendable wallet, repaid in 12 monthly installments via automatic deductions. Powered by the Sahamati AA network — zero paperwork.</p>
          <button onClick={() => setShowInfo(false)} className="text-cyan-400 text-[10px] font-bold mt-2 uppercase">Dismiss</button>
        </div>
      )}

      <main className="px-4 space-y-6 mt-4">
        {/* Available Credit Card */}
        <div className="glass-card rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col items-center text-center gap-4 relative z-10">
            <p className="text-sm font-medium text-[#00d4ff] uppercase tracking-widest">Available Credit Limit</p>
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle className="text-white/5" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-[#00d4ff] drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552" strokeDashoffset={552 - (forgeScore / 850) * 552 * 0.67} strokeWidth="8" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-syne font-bold text-white">₹{maxCreditLimit.toLocaleString()}</span>
                <span className="text-xs text-slate-400 mt-1">{maxCreditLimit > 0 ? 'Instant Approval' : 'Build ForgeScore'}</span>
              </div>
            </div>
            <button
              onClick={handleApply}
              disabled={maxCreditLimit === 0}
              className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] ${maxCreditLimit > 0 ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              <span className="material-symbols-outlined">credit_card</span>
              {maxCreditLimit > 0 ? 'Apply Now' : 'Insufficient ForgeScore'}
            </button>
          </div>
        </div>

        {/* Loan Terms Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Repayment</span>
            <span className="text-sm font-bold text-white">Monthly</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Interest</span>
            <span className="text-sm font-bold text-white">{interestRate}% p.a.</span>
          </div>
          <div className="glass-card p-4 rounded-xl flex flex-col items-center text-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold mb-1">Duration</span>
            <span className="text-sm font-bold text-white">12 Mo.</span>
          </div>
        </div>

        {/* Repayment Simulation */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold px-1">Repayment Simulation</h3>
          <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400">Monthly Installment</p>
                <p className="text-xl font-bold text-white">₹{(Math.floor(maxCreditLimit * (1 + interestRate / 100) / 12)).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Total Repay</p>
                <p className="text-sm font-medium text-[#00d4ff]">₹{(Math.floor(maxCreditLimit * (1 + interestRate / 100))).toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00d4ff] to-emerald-400 w-0 rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 text-center">No active loan — apply to see live repayment tracking</p>
          </div>
        </section>

        {/* AA Network Integration */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold px-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-xl">hub</span>
            Powered by Open Finance
          </h3>
          <div className="glass-card rounded-xl p-5 border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4 relative z-10">
              Your ForgeScore (<span className="text-cyan-400 font-bold">{forgeScore}/850</span>) is shared with partner lenders via India's <span className="text-white font-bold">Sahamati Account Aggregator</span> network. Banks pull verified data directly — no paperwork, no branch visits.
            </p>
            <div className="flex flex-wrap gap-2 mb-4 relative z-10">
              {[
                { name: 'HDFC', label: 'HDFC Bank', bg: 'bg-white', text: 'text-blue-900' },
                { name: 'Bajaj', label: 'Bajaj Finserv', bg: 'bg-blue-600', text: 'text-white' },
                { name: 'KB', label: 'KreditBee', bg: 'bg-emerald-700', text: 'text-white' },
              ].map(b => (
                <div key={b.name} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                  <div className={`size-6 rounded-full ${b.bg} flex items-center justify-center`}>
                    <span className={`${b.text} font-extrabold text-[7px]`}>{b.name}</span>
                  </div>
                  <span className="text-xs font-medium text-white">{b.label}</span>
                  <span className="size-1.5 bg-emerald-400 rounded-full"></span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/open-finance')} className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl transition-all border border-cyan-500/20 flex items-center justify-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span> Manage Consents in Open Finance Hub
            </button>
          </div>
        </section>

        {/* Why Pluto? */}
        <section className="space-y-4 pb-12">
          <h3 className="text-lg font-bold px-1">Why Pluto?</h3>
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-4 font-bold text-slate-300">Feature</th>
                  <th className="p-4 font-bold text-slate-300">Traditional</th>
                  <th className="p-4 font-bold text-[#00d4ff]">Pluto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr><td className="p-4 text-slate-400 text-xs">Approval</td><td className="p-4 text-slate-300 text-xs">3-5 Days</td><td className="p-4 text-[#00d4ff] font-bold text-xs italic">Instant</td></tr>
                <tr><td className="p-4 text-slate-400 text-xs">Paperwork</td><td className="p-4 text-slate-300 text-xs">Extensive</td><td className="p-4 text-[#00d4ff] font-bold text-xs italic">Zero</td></tr>
                <tr><td className="p-4 text-slate-400 text-xs">Hidden Fees</td><td className="p-4 text-slate-300 text-xs">Yes</td><td className="p-4 text-[#00d4ff] font-bold text-xs italic">None</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ═══ APPLY NOW MODAL ═══ */}
      {showApply && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowApply(false); setApplyStep('FORM'); }}>
          <div
            className="w-full max-w-md bg-background-dark/95 backdrop-blur-xl rounded-t-3xl border-t border-primary/20 p-6 space-y-5 animate-in slide-in-from-bottom-full duration-300 shadow-[0_-10px_40px_rgba(0,123,255,0.15)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-1">
              <div className="h-1.5 w-12 bg-slate-700 rounded-full cursor-pointer" onClick={() => { setShowApply(false); setApplyStep('FORM'); }}></div>
            </div>

            {applyStep === 'FORM' && (
              <>
                <h2 className="text-xl font-bold">Apply for Credit</h2>
                <div className="glass-card rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Loan Amount</p>
                      <p className="text-3xl font-bold text-white">₹{loanAmount.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-slate-400">Max: ₹{maxCreditLimit.toLocaleString()}</p>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={Math.max(maxCreditLimit, 1000)}
                    step={500}
                    value={loanAmount}
                    onChange={e => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>₹500</span>
                    <span>₹{maxCreditLimit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Interest Rate</span><span className="text-xs text-white font-bold">{interestRate}% p.a.</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Monthly EMI</span><span className="text-xs text-emerald-400 font-bold">₹{monthlyRepayment.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Total Repayment</span><span className="text-xs text-white font-bold">₹{totalRepay.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Interest Cost</span><span className="text-xs text-amber-400 font-bold">₹{(totalRepay - loanAmount).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Disbursement</span><span className="text-xs text-cyan-400 font-bold">Instant to Spendable</span></div>
                </div>

                <button onClick={handleSubmit} className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                  <span className="material-symbols-outlined">check_circle</span>
                  Confirm & Apply — ₹{loanAmount.toLocaleString()}
                </button>
              </>
            )}

            {applyStep === 'PROCESSING' && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-white mb-2">Processing Application</h2>
                <p className="text-sm text-slate-400">Verifying ForgeScore via AA Network...</p>
                <div className="mt-6 space-y-2 w-full text-left">
                  {['Identity Verification', 'ForgeScore Check', 'AA Consent Pull', 'Credit Underwriting'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span> {s}
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> Disbursement...
                  </div>
                </div>
              </div>
            )}

            {applyStep === 'APPROVED' && (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[30px] animate-pulse"></div>
                  <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative z-10">
                    <span className="material-symbols-outlined text-emerald-500 text-5xl">check</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Loan Approved! 🎉</h2>
                <p className="text-sm text-slate-400 mb-4">₹{loanAmount.toLocaleString()} disbursed to Spendable wallet</p>

                <div className="w-full glass-card rounded-xl p-4 space-y-2 text-left">
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Amount</span><span className="text-xs text-emerald-400 font-bold">₹{loanAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Monthly EMI</span><span className="text-xs text-white font-bold">₹{monthlyRepayment.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">First EMI Due</span><span className="text-xs text-white font-bold">{(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); })()}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">ForgeScore Impact</span><span className="text-xs text-cyan-400 font-bold">+5 (on-time repayment)</span></div>
                </div>

                <button onClick={() => { setShowApply(false); setApplyStep('FORM'); }} className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors active:scale-[0.98]">
                  Done
                </button>
              </div>
            )}
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
