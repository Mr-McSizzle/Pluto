import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect } from 'react';

/* ── types ── */
interface EscrowContract {
  id: string;
  role: 'EMPLOYER' | 'WORKER';
  counterparty: string;
  taskType: string;
  amount: number;
  duration: string;
  startTime: string;
  endTime: string;
  status: 'PENDING_TAP' | 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED';
  hash: string;
}

const TASK_PRESETS = [
  { type: 'Kitchen Helper', icon: 'restaurant', avgRate: 350, avgHours: 6 },
  { type: 'Delivery Runner', icon: 'local_shipping', avgRate: 250, avgHours: 4 },
  { type: 'Construction Labor', icon: 'construction', avgRate: 500, avgHours: 8 },
  { type: 'Event Setup', icon: 'celebration', avgRate: 400, avgHours: 5 },
  { type: 'Shop Assistant', icon: 'storefront', avgRate: 300, avgHours: 10 },
  { type: 'Cleaning Service', icon: 'cleaning_services', avgRate: 200, avgHours: 3 },
];

function genHash() {
  const chars = '0123456789abcdef';
  let h = '0x';
  for (let i = 0; i < 16; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}

function genContractId() {
  return `ESC-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

export default function TapToEmploy() {
  const navigate = useNavigate();
  const { user, loading, spendable, processPayout, sendPayment } = useAppContext();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [step, setStep] = useState<'HOME' | 'CREATE' | 'SCANNING' | 'CONFIRM' | 'ACTIVE' | 'COMPLETE'>('HOME');
  const [role, setRole] = useState<'EMPLOYER' | 'WORKER'>('EMPLOYER');
  const [selectedTask, setSelectedTask] = useState(TASK_PRESETS[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [customHours, setCustomHours] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [activeContract, setActiveContract] = useState<EscrowContract | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [contracts, setContracts] = useState<EscrowContract[]>([]);

  useEffect(() => { if (!loading && !user) navigate('/'); }, [user, loading, navigate]);

  // Simulated past contracts
  useEffect(() => {
    if (!user) return;
    const seed = user.id.charCodeAt(0);
    setContracts([
      { id: 'ESC-7FK2A1-482', role: 'EMPLOYER', counterparty: 'Aditi M.', taskType: 'Kitchen Helper', amount: 350, duration: '6h', startTime: '12 Mar, 6:00 PM', endTime: '12 Mar, 12:00 AM', status: 'COMPLETED', hash: '0x3a7f9e2c1b4d' + (seed % 10) },
      { id: 'ESC-9BM3X4-195', role: 'WORKER', counterparty: 'Vikram S.', taskType: 'Event Setup', amount: 800, duration: '5h', startTime: '10 Mar, 2:00 PM', endTime: '10 Mar, 7:00 PM', status: 'COMPLETED', hash: '0x8c2e1f5a0b9d' + (seed % 10) },
      { id: 'ESC-4QP8R6-731', role: 'EMPLOYER', counterparty: 'Rajan K.', taskType: 'Delivery Runner', amount: 250, duration: '4h', startTime: '8 Mar, 10:00 AM', endTime: '8 Mar, 2:00 PM', status: 'COMPLETED', hash: '0x5f1d3b7a2e8c' + (seed % 10) },
    ]);
  }, [user]);

  // NFC scan simulation
  useEffect(() => {
    if (step !== 'SCANNING') return;
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Create the contract
          const amt = Number(customAmount) || selectedTask.avgRate;
          const hrs = Number(customHours) || selectedTask.avgHours;
          const now = new Date();
          const end = new Date(now.getTime() + hrs * 3600_000);
          setActiveContract({
            id: genContractId(),
            role,
            counterparty: role === 'EMPLOYER' ? 'Nearby Worker' : 'Nearby Employer',
            taskType: selectedTask.type,
            amount: amt,
            duration: `${hrs}h`,
            startTime: now.toLocaleString(),
            endTime: end.toLocaleString(),
            status: 'LOCKED',
            hash: genHash(),
          });
          setTimeout(() => setStep('CONFIRM'), 400);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [step]);

  // Active contract timer
  useEffect(() => {
    if (step !== 'ACTIVE' || !activeContract) return;
    const endMs = new Date(activeContract.endTime).getTime();
    const tick = () => {
      const diff = endMs - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setActiveContract(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
        setStep('COMPLETE');
        return;
      }
      const h = Math.floor(diff / 3600_000);
      const m = Math.floor((diff % 3600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [step, activeContract]);

  if (loading || !user) {
    return <div className="bg-background-dark min-h-screen flex items-center justify-center"><div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const contractAmt = Number(customAmount) || selectedTask.avgRate;

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-32">
      {/* Header */}
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {step === 'HOME' ? (
            <Link to="/dashboard" className="size-10 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
          ) : (
            <button onClick={() => setStep('HOME')} className="size-10 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tap-to-Employ</h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="size-1.5 bg-amber-400 rounded-full inline-block animate-pulse"></span>
              P2P Escrow · Zero Trust
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-5">

        {/* ═══════ HOME ═══════ */}
        {step === 'HOME' && (
          <>
            {/* Hero */}
            <div className="glass-card rounded-2xl p-5 border border-amber-500/20 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                  <span className="material-symbols-outlined text-white text-2xl">handshake</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-white text-lg mb-1">Decentralized Employment</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Turn any two smartphones into a <span className="text-amber-300 font-bold">mathematically guaranteed escrow agent</span>. 
                    No middle-men. No platforms. No trust required.
                  </p>
                </div>
              </div>
            </div>

            {/* Two CTA cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setRole('EMPLOYER'); setStep('CREATE'); }}
                className="glass-card rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-left group active:scale-[0.98]"
              >
                <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-400">
                  <span className="material-symbols-outlined text-2xl">person_add</span>
                </div>
                <h3 className="font-bold text-white mb-1">Hire Someone</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">Lock e₹ in escrow. Auto-releases when shift ends.</p>
                <div className="mt-3 flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[12px]">lock</span> Your funds are safe
                </div>
              </button>

              <button
                onClick={() => { setRole('WORKER'); setStep('CREATE'); }}
                className="glass-card rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-left group active:scale-[0.98]"
              >
                <div className="size-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 group-hover:bg-cyan-500 group-hover:text-white transition-colors text-cyan-400">
                  <span className="material-symbols-outlined text-2xl">work</span>
                </div>
                <h3 className="font-bold text-white mb-1">Find Work</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">See escrow locked before you start. Guaranteed pay.</p>
                <div className="mt-3 flex items-center gap-1 text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[12px]">verified</span> Payment guaranteed
                </div>
              </button>
            </div>

            {/* How it works */}
            <div className="glass-card rounded-2xl p-5 border border-white/5">
              <h3 className="font-bold text-white mb-4">How P2P Escrow Works</h3>
              <div className="space-y-4">
                {[
                  { n: '01', title: 'Tap Phones (NFC)', desc: 'Both parties bring devices within 4cm. Pluto exchanges encrypted identity proofs.', icon: 'contactless', color: 'amber' },
                  { n: '02', title: 'Lock Funds in Escrow', desc: 'Employer\'s e₹ is cryptographically locked. Neither party can touch it until conditions are met.', icon: 'lock', color: 'emerald' },
                  { n: '03', title: 'Work Commences', desc: 'Live countdown timer. Both phones act as witnesses. GPS + time verification on-chain.', icon: 'timer', color: 'cyan' },
                  { n: '04', title: 'Auto-Release', desc: 'Shift ends → funds release instantly to worker\'s Spendable wallet (70/17/13 split applies).', icon: 'send', color: 'green' },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`size-9 rounded-lg bg-${s.color}-500/20 flex items-center justify-center`}>
                        <span className={`material-symbols-outlined text-${s.color}-400 text-[18px]`}>{s.icon}</span>
                      </div>
                      {i < 3 && <div className="w-px h-6 bg-white/10 mt-1"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Step {s.n}</p>
                      <p className="text-white font-bold text-sm">{s.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past contracts */}
            {contracts.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Contract History</h3>
                <div className="space-y-2">
                  {contracts.map(c => (
                    <div key={c.id} className="glass-card rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${c.role === 'EMPLOYER' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'}`}>
                            {c.role}
                          </span>
                          <span className="text-white font-bold text-sm">{c.counterparty}</span>
                        </div>
                        <span className="text-emerald-400 text-xs font-bold">₹{c.amount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{c.taskType} · {c.duration}</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-emerald-400 text-[12px]">check_circle</span>
                          <span className="text-[9px] text-emerald-400 font-bold">SETTLED</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-600 font-mono mt-2 truncate">TX: {c.hash}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitch quote */}
            <div className="text-center py-3">
              <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto leading-relaxed">
                "Every smartphone becomes a mathematically guaranteed escrow agent. Any two humans can enter a zero-trust employment contract with a single tap."
              </p>
            </div>
          </>
        )}

        {/* ═══════ CREATE CONTRACT ═══════ */}
        {step === 'CREATE' && (
          <>
            <div className="text-center mb-2">
              <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border ${role === 'EMPLOYER' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'}`}>
                {role === 'EMPLOYER' ? '🧑‍💼 Hiring Mode' : '👷 Worker Mode'}
              </span>
            </div>

            {/* Task type selection */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3 px-1">Select Task Type</p>
              <div className="grid grid-cols-3 gap-2">
                {TASK_PRESETS.map(task => (
                  <button
                    key={task.type}
                    onClick={() => setSelectedTask(task)}
                    className={`glass-card rounded-xl p-3 text-center transition-all border ${selectedTask.type === task.type ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/5 hover:border-white/10'}`}
                  >
                    <span className={`material-symbols-outlined text-xl ${selectedTask.type === task.type ? 'text-amber-400' : 'text-slate-400'}`}>{task.icon}</span>
                    <p className="text-[10px] text-white font-bold mt-1">{task.type}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">~₹{task.avgRate}/{task.avgHours}h</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-4 border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-2">Amount (₹)</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-bold">₹</span>
                  <input
                    type="text" inputMode="numeric"
                    value={customAmount}
                    onChange={e => { if (/^\d*$/.test(e.target.value)) setCustomAmount(e.target.value); }}
                    placeholder={String(selectedTask.avgRate)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-9 pr-3 text-white text-lg font-bold focus:outline-none focus:border-amber-500/50 placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-2">Duration (hrs)</p>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">schedule</span>
                  <input
                    type="text" inputMode="numeric"
                    value={customHours}
                    onChange={e => { if (/^\d*$/.test(e.target.value)) setCustomHours(e.target.value); }}
                    placeholder={String(selectedTask.avgHours)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-3 text-white text-lg font-bold focus:outline-none focus:border-amber-500/50 placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Escrow preview */}
            <div className="glass-card rounded-2xl p-4 border border-amber-500/20 bg-amber-500/5">
              <p className="text-[9px] text-amber-400 uppercase tracking-wider font-bold mb-3">Contract Preview</p>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-xs text-slate-400">Task</span><span className="text-xs text-white font-bold">{selectedTask.type}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Escrow Amount</span><span className="text-xs text-amber-400 font-bold">₹{contractAmt.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Duration</span><span className="text-xs text-white font-bold">{customHours || selectedTask.avgHours}h</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Platform Fee</span><span className="text-xs text-emerald-400 font-bold">₹0 (Zero)</span></div>
                <div className="h-px bg-white/5 my-1"></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Worker Receives</span><span className="text-xs text-white font-bold">₹{contractAmt.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">ForgeScore Impact</span><span className="text-xs text-cyan-400 font-bold">+8 (both parties)</span></div>
              </div>
            </div>

            {role === 'EMPLOYER' && contractAmt > spendable && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                <p className="text-xs text-red-400 font-bold">Insufficient Spendable balance (₹{spendable.toLocaleString()})</p>
              </div>
            )}

            {/* Initiate NFC */}
            <button
              onClick={() => setStep('SCANNING')}
              disabled={role === 'EMPLOYER' && contractAmt > spendable}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 group
                ${role === 'EMPLOYER' && contractAmt > spendable
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] active:scale-[0.98]'
                }`}
            >
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">contactless</span>
              Tap to Connect
            </button>
          </>
        )}

        {/* ═══════ NFC SCANNING ═══════ */}
        {step === 'SCANNING' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Animated rings */}
            <div className="relative size-48 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-4 rounded-full border-2 border-amber-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>
              <div className="absolute inset-8 rounded-full border-2 border-amber-500/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.6s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-28 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                  <span className="material-symbols-outlined text-amber-400 text-5xl">contactless</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Bring Devices Together</h2>
            <p className="text-sm text-slate-400 max-w-[260px]">Hold phones within 4cm. Exchanging encrypted identity proofs...</p>

            {/* Progress */}
            <div className="w-full max-w-xs mt-8">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>NFC Handshake</span>
                <span className="text-amber-400 font-bold">{scanProgress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }}></div>
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 mt-2 font-mono">
                <span>Identity verify...</span>
                <span>Escrow prepare...</span>
                <span>Lock funds...</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ CONFIRM CONTRACT ═══════ */}
        {step === 'CONFIRM' && activeContract && (
          <>
            <div className="flex flex-col items-center text-center mb-4">
              <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-4">
                <span className="material-symbols-outlined text-emerald-500 text-4xl">handshake</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Contract Ready</h2>
              <p className="text-sm text-slate-400 mt-1">NFC handshake complete • Identity verified</p>
            </div>

            {/* Contract card */}
            <div className="glass-card rounded-2xl overflow-hidden border border-amber-500/20">
              {/* Contract header */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-amber-400 uppercase tracking-widest font-bold">Micro-Smart Contract</p>
                    <p className="text-white font-mono text-xs mt-0.5">{activeContract.id}</p>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/20 uppercase tracking-wider">
                    🔒 Escrow Locked
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between"><span className="text-xs text-slate-400">Your Role</span><span className={`text-xs font-bold ${role === 'EMPLOYER' ? 'text-emerald-400' : 'text-cyan-400'}`}>{role}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Counterparty</span><span className="text-xs text-white font-bold">{activeContract.counterparty}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Task</span><span className="text-xs text-white font-bold">{activeContract.taskType}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Locked Amount</span><span className="text-xs text-amber-400 font-bold">₹{activeContract.amount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Duration</span><span className="text-xs text-white font-bold">{activeContract.duration}</span></div>
                <div className="flex justify-between"><span className="text-xs text-slate-400">Auto-Release</span><span className="text-xs text-white font-bold">{activeContract.endTime}</span></div>
                <div className="h-px bg-white/5"></div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-[14px]">enhanced_encryption</span>
                  <p className="text-[9px] text-slate-400 font-mono truncate">Hash: {activeContract.hash}</p>
                </div>
              </div>
            </div>

            {/* Accept */}
            <button
              onClick={async () => { 
                if (role === 'EMPLOYER') {
                  const success = await sendPayment(activeContract.amount, `Escrow Lock: ${activeContract.id}`);
                  if (!success) return;
                }
                setActiveContract(prev => prev ? { ...prev, status: 'IN_PROGRESS' } : null); 
                setStep('ACTIVE'); 
              }}
              className="w-full py-5 rounded-2xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-2xl">check_circle</span>
              {role === 'EMPLOYER' ? 'Lock Funds & Start' : 'Accept & Start Work'}
            </button>
            <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[12px]">info</span>
              Funds are locked on-chain. Neither party can withdraw until the contract resolves.
            </p>
          </>
        )}

        {/* ═══════ ACTIVE CONTRACT ═══════ */}
        {step === 'ACTIVE' && activeContract && (
          <>
            {/* Live timer */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-[9px] text-amber-400 uppercase tracking-widest font-bold mb-1">Contract Active</p>
                <p className="font-syne text-5xl font-extrabold text-white tracking-tight mb-2">{timeLeft}</p>
                <p className="text-xs text-slate-400">Auto-release at {activeContract.endTime}</p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="size-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Escrow: ₹{activeContract.amount.toLocaleString()} Locked</span>
                </div>
              </div>
            </div>

            {/* Contract details */}
            <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3">
              <div className="flex justify-between"><span className="text-xs text-slate-400">Contract ID</span><span className="text-xs text-white font-mono">{activeContract.id}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Task</span><span className="text-xs text-white font-bold">{activeContract.taskType}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Counterparty</span><span className="text-xs text-white font-bold">{activeContract.counterparty}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Your Role</span><span className={`text-xs font-bold ${role === 'EMPLOYER' ? 'text-emerald-400' : 'text-cyan-400'}`}>{role}</span></div>
            </div>

            {/* Live verification */}
            <div className="glass-card rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3">Live Verification</p>
              <div className="space-y-2">
                {[
                  { label: 'GPS Co-location', value: 'Both devices within 50m', status: true },
                  { label: 'Time Attestation', value: 'Synced via NIST', status: true },
                  { label: 'Escrow Lock', value: `₹${activeContract.amount} immutable`, status: true },
                  { label: 'Chain Anchor', value: activeContract.hash, status: true },
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{v.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-300 font-mono truncate max-w-[140px]">{v.value}</span>
                      <span className="material-symbols-outlined text-emerald-400 text-[14px]">check_circle</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Early release / dispute */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setActiveContract(prev => prev ? { ...prev, status: 'COMPLETED' } : null); setStep('COMPLETE'); }}
                className="py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
              >
                ✓ Release Early
              </button>
              <button className="py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors">
                ⚠ Raise Dispute
              </button>
            </div>
          </>
        )}

        {/* ═══════ COMPLETE ═══════ */}
        {step === 'COMPLETE' && activeContract && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] animate-pulse"></div>
              <div className="w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative z-10">
                <span className="material-symbols-outlined text-emerald-500 text-6xl">check</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Contract Settled</h2>
            <p className="text-sm text-slate-400 mb-6">Funds released automatically</p>

            <div className="w-full glass-card rounded-2xl p-5 space-y-3 text-left border border-emerald-500/20">
              <div className="flex justify-between"><span className="text-xs text-slate-400">Contract</span><span className="text-xs text-white font-mono">{activeContract.id}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Amount Released</span><span className="text-xs text-emerald-400 font-bold">₹{activeContract.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Platform Fee</span><span className="text-xs text-emerald-400 font-bold">₹0</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">ForgeScore</span><span className="text-xs text-cyan-400 font-bold">+8 both parties</span></div>
              <div className="flex justify-between"><span className="text-xs text-slate-400">Skill Passport</span><span className="text-xs text-indigo-400 font-bold">+1 {activeContract.taskType} entry</span></div>
              <div className="h-px bg-white/5"></div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">enhanced_encryption</span>
                <p className="text-[9px] text-slate-400 font-mono truncate">Settled: {activeContract.hash}</p>
              </div>
            </div>

            <button 
              onClick={async () => { 
                if (role === 'WORKER') {
                  await processPayout(activeContract.amount);
                }
                setStep('HOME'); 
                setActiveContract(null); 
              }} 
              className="w-full mt-6 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Floating Navbar */}
      {step === 'HOME' && (
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
              className="size-14 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 text-white border-4 border-background-dark hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-3xl">handshake</span>
            </button>
          </div>
          <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/skill-passport">
            <span className="material-symbols-outlined">card_membership</span>
            <span className="text-[10px] font-medium mt-1">Skills</span>
          </Link>
          <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/more-menu">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </Link>
        </nav>
      )}

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
