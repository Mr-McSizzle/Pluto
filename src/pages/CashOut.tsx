import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';

interface BCAgent {
  id: string;
  name: string;
  network: string;
  distance: string;
  address: string;
  rating: number;
  available: boolean;
  fee: number;
}

const nearbyAgents: BCAgent[] = [
  { id: '1', name: 'Suresh Mobile Store', network: 'PayNearby', distance: '0.3 km', address: 'Shop 4, MG Road, Sector 12', rating: 4.8, available: true, fee: 0.5 },
  { id: '2', name: 'Anita General Store', network: 'SpiceMoney', distance: '0.7 km', address: '22B, Market Lane, Near Bus Stand', rating: 4.5, available: true, fee: 0.3 },
  { id: '3', name: 'Ravi Telecom Centre', network: 'PayNearby', distance: '1.2 km', address: 'Opp. Post Office, Main Bazaar', rating: 4.2, available: true, fee: 0.5 },
  { id: '4', name: 'Kumar Pharmacy', network: 'CSC-SPV', distance: '1.8 km', address: '14, Station Road, Block C', rating: 4.6, available: false, fee: 0.4 },
];

export default function CashOut() {
  const { user, loading, spendable, sendPayment } = useAppContext();
  const navigate = useNavigate();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [step, setStep] = useState<'AGENTS' | 'AMOUNT' | 'PROCESSING' | 'SUCCESS'>('AGENTS');
  const [selectedAgent, setSelectedAgent] = useState<BCAgent | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [txnCode, setTxnCode] = useState('');

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

  const handleSelectAgent = (agent: BCAgent) => {
    if (!agent.available) return;
    setSelectedAgent(agent);
    setAmount('');
    setError('');
    setStep('AMOUNT');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) setAmount(val);
  };

  const handleCashOut = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Enter a valid amount'); return; }
    if (num > spendable) { setError('Insufficient Spendable balance'); return; }
    if (num < 100) { setError('Minimum withdrawal is ₹100'); return; }

    setStep('PROCESSING');
    const code = `BC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setTxnCode(code);
    
    const success = await sendPayment(num, `Cash Out @ ${selectedAgent!.name}`);
    if (success) {
      setTimeout(() => setStep('SUCCESS'), 2000);
    } else {
      setError('Transaction failed. Try again.');
      setStep('AMOUNT');
    }
  };

  const fee = selectedAgent ? Math.max(5, Math.floor(parseFloat(amount || '0') * (selectedAgent.fee / 100))) : 0;

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[30%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          {step === 'AGENTS' ? (
            <Link to="/dashboard" className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </Link>
          ) : (
            <button onClick={() => setStep('AGENTS')} className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cash Out</h1>
            <p className="text-xs text-orange-400 font-medium flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              e₹ → Physical Cash
            </p>
          </div>
        </div>
        <div className="glass-strong px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 border-orange-500/20">
          <span className="material-symbols-outlined text-[14px] text-orange-400">location_on</span> 4 Nearby
        </div>
      </header>

      <main className="px-6 mt-6 space-y-6">

        {/* STEP 1: FIND NEARBY AGENTS */}
        {step === 'AGENTS' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">

            {/* Explainer Card */}
            <div className="glass-card p-5 rounded-2xl border-orange-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className="size-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 text-orange-400">
                  <span className="material-symbols-outlined text-2xl">local_atm</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Instant Cash Withdrawal</h2>
                  <p className="text-sm text-slate-400">Convert e-Rupee at any doorstep agent</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                Walk to any <span className="text-white font-bold">Business Correspondent</span> near you. Show your withdrawal code, receive physical cash instantly. No bank branch needed.
              </p>
            </div>

            {/* Balance Pill */}
            <div className="flex items-center justify-between glass-strong rounded-xl px-5 py-3 border-white/5">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <span className="material-symbols-outlined text-[18px] text-green-400">account_balance_wallet</span>
                Available for Cash Out
              </div>
              <span className="text-white font-bold text-lg">₹{spendable.toLocaleString('en-IN')}</span>
            </div>

            {/* Agent List */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Nearby BC Agents <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px]">{nearbyAgents.filter(a => a.available).length} Open</span>
              </h3>
              <div className="space-y-3">
                {nearbyAgents.map(agent => (
                  <div 
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent)}
                    className={`glass-card p-4 rounded-xl flex items-center gap-4 transition-all border-white/5 group ${agent.available ? 'cursor-pointer hover:bg-white/5 hover:border-white/10' : 'opacity-40 cursor-not-allowed'}`}
                  >
                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                      agent.network === 'PayNearby' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      agent.network === 'SpiceMoney' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm truncate">{agent.name}</p>
                        {!agent.available && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold shrink-0">CLOSED</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{agent.address}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded">{agent.network}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-yellow-400 text-[12px]">star</span> {agent.rating}
                        </span>
                        <span className="text-[10px] text-slate-400">{agent.distance}</span>
                        <span className="text-[10px] text-emerald-400 font-medium">{agent.fee}% fee</span>
                      </div>
                    </div>
                    <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-500 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER AMOUNT */}
        {(step === 'AMOUNT' || step === 'PROCESSING') && selectedAgent && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            {/* Selected Agent Card */}
            <div className="glass-card p-4 rounded-xl flex items-center gap-4 border-orange-500/20">
              <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                selectedAgent.network === 'PayNearby' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                selectedAgent.network === 'SpiceMoney' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{selectedAgent.name}</p>
                <p className="text-[10px] text-slate-400">{selectedAgent.network} · {selectedAgent.distance}</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">OPEN</span>
            </div>

            {/* Amount Entry */}
            <div className="flex flex-col items-center py-8">
              <p className="text-slate-400 font-medium mb-4">Withdraw Amount</p>
              <div className="flex items-center justify-center text-6xl font-syne font-extrabold text-white tracking-tighter w-full">
                <span className={`mr-1 transition-colors ${amount ? 'text-white' : 'text-slate-600'}`}>₹</span>
                <input 
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="bg-transparent border-none outline-none w-full max-w-[240px] text-center placeholder:text-slate-700 focus:ring-0"
                  disabled={step === 'PROCESSING'}
                />
              </div>
              
              <div className="mt-6 glass-strong rounded-xl px-4 py-2 text-xs text-slate-300 font-medium flex items-center gap-2 border-white/5">
                <span className="material-symbols-outlined text-[16px] text-green-400">account_balance_wallet</span>
                Spendable: <span className="text-white font-bold">₹{spendable.toLocaleString('en-IN')}</span>
              </div>

              {error && <p className="text-red-400 text-sm mt-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">{error}</p>}
            </div>

            {/* Fee Breakdown */}
            {amount && parseFloat(amount) > 0 && (
              <div className="glass-card p-4 rounded-xl space-y-3 border-white/5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Withdrawal</p>
                  <p className="text-sm font-bold text-white">₹{parseFloat(amount).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Agent Fee ({selectedAgent.fee}%)</p>
                  <p className="text-sm font-bold text-orange-400">−₹{fee}</p>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white font-bold">You Receive (Cash)</p>
                  <p className="text-lg font-bold text-emerald-400">₹{(parseFloat(amount) - fee).toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <button 
              onClick={handleCashOut}
              disabled={step === 'PROCESSING'}
              className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                ${amount && parseFloat(amount) >= 100
                  ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
            >
              {step === 'PROCESSING' ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> <span className="text-lg tracking-wide">Generating Withdrawal Code...</span></>
              ) : (
                <><span className="material-symbols-outlined opacity-90">local_atm</span> <span className="text-lg tracking-wide">Generate Cash-Out Code</span></>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[12px]">info</span> Min ₹100 · Max ₹10,000 per transaction
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS — SHOW CODE */}
        {step === 'SUCCESS' && selectedAgent && (
          <div className="animate-in zoom-in-95 fade-in duration-500 space-y-6">
            <div className="flex flex-col items-center text-center pt-4 pb-2">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] animate-pulse"></div>
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative z-10">
                  <span className="material-symbols-outlined text-emerald-500 text-5xl">check</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Withdrawal Ready</h2>
              <p className="text-slate-400 text-sm">Show this code to the agent to receive cash</p>
            </div>

            {/* The Code Card */}
            <div className="glass-card p-6 rounded-2xl border-orange-500/20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-orange-500/5"></div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 relative z-10">Withdrawal Code</p>
              <p className="text-4xl font-syne font-extrabold text-orange-400 tracking-[0.15em] mb-4 relative z-10">{txnCode}</p>
              <div className="h-px bg-white/10 my-4 relative z-10"></div>
              <div className="grid grid-cols-2 gap-4 text-left relative z-10">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Amount</p>
                  <p className="text-white font-bold text-lg">₹{parseFloat(amount).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">You Receive</p>
                  <p className="text-emerald-400 font-bold text-lg">₹{(parseFloat(amount) - fee).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
            
            {/* Agent Info */}
            <div className="glass-card p-4 rounded-xl flex items-center gap-4 border-white/5">
              <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
                selectedAgent.network === 'PayNearby' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                selectedAgent.network === 'SpiceMoney' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{selectedAgent.name}</p>
                <p className="text-[10px] text-slate-400">{selectedAgent.address}</p>
              </div>
              <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-lg border border-primary/20 flex items-center gap-1 hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-[14px]">directions</span> Navigate
              </button>
            </div>

            {/* Expiry Warning */}
            <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <span className="material-symbols-outlined text-orange-400">schedule</span>
              <div>
                <p className="text-sm font-bold text-white">Code expires in 30 minutes</p>
                <p className="text-xs text-slate-400">Visit the agent before expiry. Uncollected funds return to your wallet.</p>
              </div>
            </div>

            <Link to="/dashboard" className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors border border-white/10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Return to Dashboard
            </Link>
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
