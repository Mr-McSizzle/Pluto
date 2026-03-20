import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';

type TabType = 'DISPUTES' | 'EMERGENCY';

interface Dispute {
  id: string;
  employer: string;
  expectedAmount: number;
  receivedAmount: number;
  date: string;
  status: 'PENDING' | 'RESOLVED' | 'ESCALATED';
}

const existingDisputes: Dispute[] = [
  { id: 'GRV-001', employer: 'Swiggy Deliveries', expectedAmount: 1200, receivedAmount: 980, date: '14 Mar 2026', status: 'RESOLVED' },
  { id: 'GRV-002', employer: 'Urban Company', expectedAmount: 2500, receivedAmount: 2500, date: '10 Mar 2026', status: 'RESOLVED' },
];

export default function Grievances() {
  const { user, loading, savings, lockEmergencyFunds } = useAppContext();
  const navigate = useNavigate();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [tab, setTab] = useState<TabType>('DISPUTES');
  const [disputes, setDisputes] = useState<Dispute[]>(existingDisputes);

  // Dispute filing state
  const [filing, setFiling] = useState(false);
  const [employer, setEmployer] = useState('');
  const [expected, setExpected] = useState('');
  const [received, setReceived] = useState('');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  // Emergency unlock state
  const [unlockAmount, setUnlockAmount] = useState('');
  const [unlockStep, setUnlockStep] = useState<'FORM' | 'VERIFY' | 'PROCESSING' | 'SUCCESS'>('FORM');
  const [selectedReason, setSelectedReason] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleFileDispute = () => {
    if (!employer || !expected || !received) return;
    const newDispute: Dispute = {
      id: `GRV-${(disputes.length + 1).toString().padStart(3, '0')}`,
      employer,
      expectedAmount: parseFloat(expected),
      receivedAmount: parseFloat(received),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'PENDING',
    };
    setDisputes([newDispute, ...disputes]);
    setDisputeSubmitted(true);
    setFiling(false);
    setEmployer(''); setExpected(''); setReceived('');
    setTimeout(() => setDisputeSubmitted(false), 4000);
  };

  const handleEmergencyUnlock = async () => {
    const amt = parseFloat(unlockAmount);
    if (!amt || amt <= 0 || amt > savings || !selectedReason) return;
    setUnlockStep('PROCESSING');
    await lockEmergencyFunds(amt, selectedReason);
    setTimeout(() => setUnlockStep('SUCCESS'), 2500);
  };

  const emergencyReasons = [
    { id: 'medical', label: 'Medical Emergency', icon: 'emergency', color: 'text-red-400 bg-red-500/20 border-red-500/30' },
    { id: 'death', label: 'Family Bereavement', icon: 'sentiment_very_dissatisfied', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' },
    { id: 'natural', label: 'Natural Disaster', icon: 'thunderstorm', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' },
    { id: 'education', label: 'Education Fee Due', icon: 'school', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  ];

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[30%] bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Exceptions Engine</h1>
            <p className="text-xs text-slate-400 font-medium">Smart-Contract Dispute & Emergency System</p>
          </div>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="px-6 mt-6 mb-6">
        <div className="glass-card rounded-xl p-1.5 flex gap-1">
          <button
            onClick={() => setTab('DISPUTES')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab === 'DISPUTES' ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,123,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span> Employer Disputes
          </button>
          <button
            onClick={() => setTab('EMERGENCY')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab === 'EMERGENCY' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'text-slate-400 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[18px]">emergency</span> Emergency Unlock
          </button>
        </div>
      </div>

      <main className="px-6 space-y-6">

        {/* ========= DISPUTES TAB ========= */}
        {tab === 'DISPUTES' && (
          <div className="animate-in fade-in duration-300 space-y-6">

            {/* Success Toast */}
            {disputeSubmitted && (
              <div className="glass-card p-4 rounded-xl border-emerald-500/20 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
                <div className="size-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Dispute Filed Successfully</p>
                  <p className="text-xs text-slate-400">Smart contract will auto-arbitrate within 48 hours.</p>
                </div>
              </div>
            )}

            {/* Explainer */}
            <div className="glass-card p-5 rounded-2xl border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                  <span className="material-symbols-outlined text-2xl">gavel</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Wage Dispute Resolution</h2>
                  <p className="text-sm text-slate-400">Automated on-chain arbitration</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                If an employer pays the wrong amount, file a dispute. The <span className="text-white font-bold">smart contract</span> cross-references the employer's committed wage schedule against the actual deposit. Verified discrepancies are auto-resolved within <span className="text-primary font-bold">48 hours</span>.
              </p>
            </div>

            {/* File New Dispute */}
            {!filing ? (
              <button onClick={() => setFiling(true)} className="w-full py-4 glass-card rounded-xl border-dashed border-2 border-white/10 hover:border-primary/30 text-slate-400 hover:text-primary font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add_circle</span> File New Dispute
              </button>
            ) : (
              <div className="glass-card p-5 rounded-2xl border-primary/20 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">New Dispute</h3>
                  <button onClick={() => setFiling(false)} className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">Employer / Platform</label>
                  <input value={employer} onChange={e => setEmployer(e.target.value)} placeholder="e.g. Swiggy, Zomato, Urban Company" className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">Expected (₹)</label>
                    <input type="number" value={expected} onChange={e => setExpected(e.target.value)} placeholder="1200" className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-500" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">Received (₹)</label>
                    <input type="number" value={received} onChange={e => setReceived(e.target.value)} placeholder="980" className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-primary/50 placeholder:text-slate-500" />
                  </div>
                </div>
                {expected && received && parseFloat(expected) > parseFloat(received) && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs font-bold animate-in fade-in">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    Discrepancy detected: ₹{(parseFloat(expected) - parseFloat(received)).toFixed(0)} underpaid
                  </div>
                )}
                <button onClick={handleFileDispute} disabled={!employer || !expected || !received} className="w-full py-4 bg-primary text-white font-bold rounded-xl glow-primary transition-all hover:bg-primary/90 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">send</span> Submit to Smart Contract
                </button>
              </div>
            )}

            {/* Dispute History */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dispute History</h3>
              <div className="space-y-3">
                {disputes.map(d => (
                  <div key={d.id} className="glass-card p-4 rounded-xl flex items-center gap-4 border-white/5">
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      d.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      d.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      <span className="material-symbols-outlined text-xl">{d.status === 'RESOLVED' ? 'check_circle' : d.status === 'PENDING' ? 'schedule' : 'priority_high'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{d.employer}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{d.date}</span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400">{d.id}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {d.expectedAmount !== d.receivedAmount ? (
                        <>
                          <p className="text-red-400 text-sm font-bold">−₹{(d.expectedAmount - d.receivedAmount).toFixed(0)}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            d.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                            d.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>{d.status === 'RESOLVED' ? 'REFUNDED' : d.status}</span>
                        </>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">NO DISCREPANCY</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========= EMERGENCY UNLOCK TAB ========= */}
        {tab === 'EMERGENCY' && (
          <div className="animate-in fade-in duration-300 space-y-6">

            {unlockStep === 'FORM' && (
              <>
                {/* Warning Banner */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex gap-4">
                  <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 border border-red-500/30 shrink-0">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Emergency Savings Unlock</h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Break your <span className="text-white font-bold">90-day savings lock</span> early for verified emergencies. A <span className="text-red-400 font-bold">5% early withdrawal penalty</span> applies. Requires Aadhaar re-verification.
                    </p>
                  </div>
                </div>

                {/* Savings Balance */}
                <div className="glass-card p-5 rounded-2xl border-white/5 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Locked Savings Balance</p>
                  <p className="text-4xl font-syne font-extrabold text-primary tracking-tight">₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400 mt-2">Lock expires in 67 days</p>
                </div>

                {/* Reason Selection */}
                <div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Select Emergency Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {emergencyReasons.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedReason(r.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selectedReason === r.id
                            ? `${r.color} shadow-lg scale-[1.02]`
                            : 'glass-card border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl mb-2 ${selectedReason === r.id ? '' : 'text-slate-400'}`}>{r.icon}</span>
                        <p className={`text-sm font-bold ${selectedReason === r.id ? '' : 'text-white'}`}>{r.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                {selectedReason && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-200 space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 block">Amount to Unlock</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={unlockAmount}
                          onChange={e => setUnlockAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3.5 pl-10 pr-4 text-white text-lg font-bold focus:outline-none focus:border-red-500/50 placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    {unlockAmount && parseFloat(unlockAmount) > 0 && (
                      <div className="glass-card p-4 rounded-xl space-y-3 border-white/5 animate-in fade-in">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-400">Requested</p>
                          <p className="text-sm font-bold text-white">₹{parseFloat(unlockAmount).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-400">Early Withdrawal Penalty (5%)</p>
                          <p className="text-sm font-bold text-red-400">−₹{Math.floor(parseFloat(unlockAmount) * 0.05).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-400">ForgeScore Impact</p>
                          <p className="text-sm font-bold text-orange-400">−15 pts</p>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-white font-bold">You Receive</p>
                          <p className="text-lg font-bold text-emerald-400">₹{Math.floor(parseFloat(unlockAmount) * 0.95).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setUnlockStep('VERIFY')}
                      disabled={!unlockAmount || parseFloat(unlockAmount) <= 0 || parseFloat(unlockAmount) > savings}
                      className="w-full py-5 bg-red-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:bg-red-400 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">lock_open</span>
                      <span className="text-lg">Proceed to Verification</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* AADHAAR RE-VERIFICATION */}
            {unlockStep === 'VERIFY' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div className="glass-card p-6 rounded-2xl border-red-500/20 text-center space-y-6">
                  <div className="size-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 border-2 border-red-500/30 mx-auto">
                    <span className="material-symbols-outlined text-3xl">fingerprint</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Aadhaar Re-Verification</h3>
                    <p className="text-sm text-slate-300">Emergency unlocks require identity re-confirmation via Aadhaar biometric or OTP to prevent unauthorized access.</p>
                  </div>
                  
                  <div className="glass-strong rounded-xl p-4 text-left space-y-3 border-slate-700/50">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Reason</span>
                      <span className="text-xs font-bold text-white">{emergencyReasons.find(r => r.id === selectedReason)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Unlock Amount</span>
                      <span className="text-xs font-bold text-white">₹{parseFloat(unlockAmount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Net After Penalty</span>
                      <span className="text-xs font-bold text-emerald-400">₹{Math.floor(parseFloat(unlockAmount) * 0.95).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleEmergencyUnlock}
                    className="w-full py-5 bg-red-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all hover:bg-red-400 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">verified_user</span>
                    <span className="text-lg">Confirm via Aadhaar OTP</span>
                  </button>
                  <button onClick={() => setUnlockStep('FORM')} className="text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* PROCESSING */}
            {unlockStep === 'PROCESSING' && (
              <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="size-20 rounded-full border-4 border-red-500/30 border-t-red-500 animate-spin"></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Breaking Savings Lock</h3>
                  <p className="text-sm text-slate-400">Smart contract is processing the exception...</p>
                </div>
                <div className="glass-strong rounded-xl p-4 text-xs text-slate-300 max-w-xs mx-auto border-slate-700/50 space-y-2">
                  <p className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-[14px]">check</span> Aadhaar identity verified</p>
                  <p className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-400 text-[14px]">check</span> Emergency reason validated</p>
                  <p className="flex items-center gap-2"><span className="material-symbols-outlined text-orange-400 text-[14px] animate-spin">sync</span> Executing savings contract override...</p>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {unlockStep === 'SUCCESS' && (
              <div className="animate-in zoom-in-95 fade-in duration-500 space-y-6">
                <div className="flex flex-col items-center text-center pt-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] animate-pulse"></div>
                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative z-10">
                      <span className="material-symbols-outlined text-emerald-500 text-5xl">lock_open</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">Savings Unlocked</h2>
                  <p className="text-slate-400 text-sm">Funds moved to your Spendable wallet</p>
                </div>

                <div className="glass-card p-5 rounded-2xl border-emerald-500/20 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2">Transferred to Spendable</p>
                  <p className="text-3xl font-syne font-extrabold text-emerald-400 tracking-tight">₹{Math.floor(parseFloat(unlockAmount) * 0.95).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-slate-400 mt-2">Penalty deducted: ₹{Math.floor(parseFloat(unlockAmount) * 0.05).toLocaleString('en-IN')} • ForgeScore: −15</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <p className="text-xs text-slate-300">This exception has been logged immutably on the CBDC ledger. Your employer and AA-connected lenders will see this event.</p>
                </div>

                <Link to="/dashboard" className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors border border-white/10 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span> Return to Dashboard
                </Link>
              </div>
            )}
          </div>
        )}
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
          <span className="material-symbols-outlined text-orange-400">gavel</span>
          <span className="text-[10px] font-bold mt-1 text-orange-400">Audit</span>
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
