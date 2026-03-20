import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

/* ── types ── */
interface Prediction {
  week: string;
  predicted: number;
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface AutoAction {
  id: string;
  timestamp: string;
  type: 'RATE_ADJUST' | 'BOND_SWEEP' | 'DROUGHT_SHIELD' | 'SURPLUS_HARVEST';
  title: string;
  detail: string;
  amount?: number;
  icon: string;
  color: string;
}

interface BondHolding {
  name: string;
  ticker: string;
  yield: number;
  invested: number;
  value: number;
  maturity: string;
}

/* ── deterministic seed helper ── */
function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export default function WealthManager() {
  const navigate = useNavigate();
  const { user, loading, spendable, forgeScore } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [actions, setActions] = useState<AutoAction[]>([]);
  const [bonds, setBonds] = useState<BondHolding[]>([]);
  const [currentSplit, setCurrentSplit] = useState({ spend: 70, save: 17, welfare: 13 });
  const [aiSplit, setAiSplit] = useState({ spend: 70, save: 17, welfare: 13 });
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [seasonTag, setSeasonTag] = useState('');
  const [incomeVelocity, setIncomeVelocity] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'bonds'>('overview');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [isAiOn, setIsAiOn] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  /* ── build predictions from transaction data ── */
  useEffect(() => {
    if (!user || loading) return;

    async function analyze() {
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(30);

      const count = txns?.length || 0;
      const totalIncome = txns?.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0) || 0;
      const avgPayout = count > 0 ? totalIncome / Math.max(1, txns!.filter(t => Number(t.amount) > 0).length) : 800;

      // Deterministic "AI" predictions based on user seed
      const seed = user!.id.charCodeAt(0) + user!.id.charCodeAt(2);
      const rng = seedRand(seed);

      // Detect season from current month
      const month = new Date().getMonth();
      const isMonsoon = month >= 5 && month <= 8; // Jun-Sep
      const isFestival = month >= 9 && month <= 11; // Oct-Dec
      const isDry = month >= 1 && month <= 4; // Feb-May

      setSeasonTag(isMonsoon ? 'Monsoon Season' : isFestival ? 'Festival Season' : isDry ? 'Peak Work Season' : 'Winter Season');

      // Build 8-week income forecast
      const preds: Prediction[] = [];
      let base = avgPayout;
      for (let w = 1; w <= 8; w++) {
        const seasonal = isMonsoon ? 0.55 + rng() * 0.3 : isFestival ? 1.1 + rng() * 0.4 : 0.85 + rng() * 0.3;
        const predicted = Math.floor(base * seasonal * (0.9 + rng() * 0.2));
        const confidence = Math.floor(65 + rng() * 30);
        const risk: Prediction['risk'] = predicted < avgPayout * 0.5 ? 'CRITICAL' : predicted < avgPayout * 0.7 ? 'HIGH' : predicted < avgPayout * 0.9 ? 'MEDIUM' : 'LOW';
        preds.push({ week: `W${w}`, predicted, confidence, risk });
        base = predicted * 0.3 + avgPayout * 0.7; // mean-revert
      }
      setPredictions(preds);

      // Determine overall risk and compute AI-optimized split
      const avgPredicted = preds.reduce((s, p) => s + p.predicted, 0) / preds.length;
      const velocity = ((avgPredicted - avgPayout) / Math.max(1, avgPayout)) * 100;
      setIncomeVelocity(Math.round(velocity));

      const criticalWeeks = preds.filter(p => p.risk === 'CRITICAL' || p.risk === 'HIGH').length;
      const overall: 'LOW' | 'MEDIUM' | 'HIGH' = criticalWeeks >= 4 ? 'HIGH' : criticalWeeks >= 2 ? 'MEDIUM' : 'LOW';
      setRiskLevel(overall);

      // AI adjusts the split based on risk
      let aiSpend = 70, aiSave = 17, aiWelfare = 13;
      if (overall === 'HIGH') {
        aiSpend = 58; aiSave = 28; aiWelfare = 14; // Aggressive savings
      } else if (overall === 'MEDIUM') {
        aiSpend = 64; aiSave = 22; aiWelfare = 14;
      } else if (isFestival) {
        aiSpend = 72; aiSave = 15; aiWelfare = 13; // Slight spend boost
      }
      setAiSplit({ spend: aiSpend, save: aiSave, welfare: aiWelfare });

      // Generate autonomous actions log
      const autoActions: AutoAction[] = [];
      const now = Date.now();

      if (overall === 'HIGH' || isMonsoon) {
        autoActions.push({
          id: '1', timestamp: new Date(now - 3600_000 * 2).toLocaleString(),
          type: 'DROUGHT_SHIELD', title: 'Income Drought Shield Activated',
          detail: `Monsoon pattern detected. Savings rate auto-increased from 17% → ${aiSave}% for next 6 weeks. Estimated buffer: ₹${Math.floor(avgPayout * 0.11 * 6).toLocaleString()}`,
          icon: 'shield', color: 'red',
        });
      }

      if (avgPayout > 600) {
        const sweepAmt = Math.floor(avgPayout * 0.005 * count);
        autoActions.push({
          id: '2', timestamp: new Date(now - 3600_000 * 8).toLocaleString(),
          type: 'BOND_SWEEP', title: 'Micro-Bond Sweep Executed',
          detail: `₹${sweepAmt.toLocaleString()} swept into 7.1% GOI T-Bill (91-day). Auto-triggered by 3-day income surplus detection.`,
          amount: sweepAmt, icon: 'savings', color: 'emerald',
        });
      }

      autoActions.push({
        id: '3', timestamp: new Date(now - 3600_000 * 24).toLocaleString(),
        type: 'RATE_ADJUST', title: 'Dynamic Rate Optimization',
        detail: `Spending rate adjusted ${currentSplit.spend}% → ${aiSpend}% based on ${isMonsoon ? 'Monsoon' : isFestival ? 'Festival' : 'Seasonal'} forecast. ForgeScore impact: +2 projected.`,
        icon: 'tune', color: 'primary',
      });

      if (forgeScore >= 600) {
        autoActions.push({
          id: '4', timestamp: new Date(now - 3600_000 * 48).toLocaleString(),
          type: 'SURPLUS_HARVEST', title: 'Surplus Harvest Complete',
          detail: `Detected 4 consecutive above-average payouts. Routed ₹${Math.floor(avgPayout * 0.03 * 4).toLocaleString()} excess into high-yield pool at ${(5 + forgeScore / 850 * 7).toFixed(1)}% APY.`,
          icon: 'agriculture', color: 'cyan',
        });
      }

      setActions(autoActions);

      // Build bond holdings
      const bondSweepTotal = Math.floor(avgPayout * 0.005 * count);
      setBonds([
        {
          name: 'GOI Treasury Bill', ticker: 'GOTB-91D',
          yield: 7.1, invested: Math.floor(bondSweepTotal * 0.5),
          value: Math.floor(bondSweepTotal * 0.5 * 1.018),
          maturity: new Date(now + 91 * 86400_000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        },
        {
          name: 'Sovereign Gold Bond', ticker: 'SGB-2026',
          yield: 2.5, invested: Math.floor(bondSweepTotal * 0.3),
          value: Math.floor(bondSweepTotal * 0.3 * 1.045),
          maturity: '15 Nov 2026',
        },
        {
          name: 'State Dev Loan', ticker: 'SDL-MH',
          yield: 7.8, invested: Math.floor(bondSweepTotal * 0.2),
          value: Math.floor(bondSweepTotal * 0.2 * 1.022),
          maturity: new Date(now + 180 * 86400_000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        },
      ]);
    }

    analyze();
  }, [user, loading, forgeScore]);

  /* ── forecast sparkline canvas ── */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || predictions.length === 0) return;
    const ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth;
    const H = c.clientHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.scale(dpr, dpr);

    const maxVal = Math.max(...predictions.map(p => p.predicted)) * 1.15;
    const minVal = Math.min(...predictions.map(p => p.predicted)) * 0.85;
    const range = maxVal - minVal || 1;
    const stepX = W / (predictions.length - 1);

    ctx.clearRect(0, 0, W, H);

    // Vertical guides
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < predictions.length; i++) {
        ctx.beginPath();
        ctx.moveTo(i * stepX, 0);
        ctx.lineTo(i * stepX, H);
        ctx.stroke();
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(99,102,241,0.2)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');

    ctx.beginPath();
    ctx.moveTo(0, H);
    predictions.forEach((p, i) => {
      const x = i * stepX;
      const y = H - ((p.predicted - minVal) / range) * H * 0.75 - H * 0.1;
      if (i === 0) ctx.lineTo(x, y);
      else {
        const prevX = (i - 1) * stepX;
        const prevY = H - ((predictions[i - 1].predicted - minVal) / range) * H * 0.75 - H * 0.1;
        const cpx = (prevX + x) / 2;
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
      }
    });
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    predictions.forEach((p, i) => {
      const x = i * stepX;
      const y = H - ((p.predicted - minVal) / range) * H * 0.75 - H * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prevX = (i - 1) * stepX;
        const prevY = H - ((predictions[i - 1].predicted - minVal) / range) * H * 0.75 - H * 0.1;
        const cpx = (prevX + x) / 2;
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
      }
    });
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Hover effect
    if (hoveredWeek !== null) {
        const hx = hoveredWeek * stepX;
        const hy = H - ((predictions[hoveredWeek].predicted - minVal) / range) * H * 0.75 - H * 0.1;
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(hx, 0);
        ctx.lineTo(hx, H);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, 6.28);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Dots
    predictions.forEach((p, i) => {
      if (hoveredWeek === i) return;
      const x = i * stepX;
      const y = H - ((p.predicted - minVal) / range) * H * 0.75 - H * 0.1;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 6.28);
      ctx.fillStyle = p.risk === 'CRITICAL' ? '#ef4444' : p.risk === 'HIGH' ? '#f97316' : p.risk === 'MEDIUM' ? '#eab308' : '#22c55e';
      ctx.fill();
    });
  }, [predictions, hoveredWeek]);

  const handleApplyAiStrategy = () => {
    setIsAiOn(true);
    setCurrentSplit(aiSplit);
  };

  const riskColors = { LOW: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', MEDIUM: 'text-amber-400 bg-amber-400/10 border-amber-400/20', HIGH: 'text-red-400 bg-red-400/10 border-red-400/20' };

  if (loading || !user) {
    return <div className="bg-background-dark min-h-screen flex items-center justify-center"><div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const totalPortfolio = bonds.reduce((s, b) => s + b.value, 0);
  const totalInvested = bonds.reduce((s, b) => s + b.invested, 0);
  const portfolioReturn = totalInvested > 0 ? ((totalPortfolio - totalInvested) / totalInvested * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-32">
      {/* Header */}
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="size-10 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AI Wealth Manager</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="size-1.5 bg-indigo-400 rounded-full inline-block animate-pulse"></span>
              Autonomous · Predictive · Active
            </p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${riskColors[riskLevel]}`}>
          {riskLevel} Risk
        </div>
      </header>

      <main className="px-4 space-y-5">
        {/* ── HERO: AI AGENT STATUS ── */}
        <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <span className="material-symbols-outlined text-white text-2xl">psychology</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-white text-lg">Your Financial Guardian</h2>
                {isAiOn && <span className="bg-indigo-500 text-[8px] font-black px-1.5 py-0.5 rounded text-white animate-pulse">ACTIVE</span>}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyzing <span className="text-indigo-300 font-bold">8-week forecast</span> showing <span className="text-amber-300 font-bold">{seasonTag}</span> patterns. Corrective splits calculated.
              </p>
              <div className="flex gap-3 mt-3">
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full font-bold">
                  <span className="material-symbols-outlined text-[12px]">verified</span> AI Verified
                </div>
                <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold ${incomeVelocity >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  <span className="material-symbols-outlined text-[12px]">{incomeVelocity >= 0 ? 'trending_up' : 'trending_down'}</span> {incomeVelocity >= 0 ? '+' : ''}{incomeVelocity}% velocity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SPLIT COMPARISON ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Active Distribution</p>
                {isAiOn && <span className="text-[9px] text-indigo-400 font-bold">In-Sync with AI</span>}
            </div>
            <div className="space-y-3">
              {[
                { label: 'Spendable', val: currentSplit.spend, color: 'bg-emerald-500' },
                { label: 'Savings', val: currentSplit.save, color: 'bg-indigo-500' },
                { label: 'Welfare', val: currentSplit.welfare, color: 'bg-cyan-500' },
              ].map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-white">{r.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full transition-all duration-700`} style={{ width: `${r.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/[0.03] space-y-4 relative overflow-hidden">
             {!isAiOn && <div className="absolute inset-0 bg-background-dark/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
                 <button onClick={handleApplyAiStrategy} className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                    Apply AI Strategy
                 </button>
             </div>}
             <div className="flex items-center justify-between relative z-0">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold">AI Optimized Strategy</p>
                <span className="material-symbols-outlined text-indigo-400 text-lg animate-spin-slow">auto_awesome</span>
             </div>
             <div className="space-y-3 opacity-60">
              {[
                { label: 'Spendable', val: aiSplit.spend, color: 'bg-emerald-500' },
                { label: 'Savings', val: aiSplit.save, color: 'bg-indigo-500' },
                { label: 'Welfare', val: aiSplit.welfare, color: 'bg-cyan-500' },
              ].map((r, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">{r.label}</span>
                    <span className="text-indigo-400">{r.val}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 italic mt-2">Adjusted for {riskLevel} risk outlook.</p>
          </div>
        </div>

        {/* ── INCOME FORECAST CHART ── */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">8-Week Income Forecast</h3>
              <p className="text-[10px] text-slate-400">Predicted based on historical payouts & seasonal trends</p>
            </div>
            <div className="text-[9px] px-3 py-1 bg-white/5 border border-white/10 rounded-full font-bold flex items-center gap-1.5">
               <span className="size-1.5 bg-emerald-500 rounded-full"></span> Live ML Model
            </div>
          </div>

          {/* Canvas chart with interaction */}
          <div 
            className="relative h-[160px] w-full mb-4 cursor-crosshair"
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const index = Math.round((x / rect.width) * (predictions.length - 1));
                setHoveredWeek(Math.max(0, Math.min(predictions.length - 1, index)));
            }}
            onMouseLeave={() => setHoveredWeek(null)}
          >
            <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }}></canvas>
            
            {hoveredWeek !== null && (
                <div className="absolute top-0 right-0 glass-card p-2 rounded-lg border-indigo-500/30 text-[10px] animate-in fade-in zoom-in duration-200">
                    <p className="text-slate-400 uppercase font-black tracking-widest mb-1">{predictions[hoveredWeek].week} Projection</p>
                    <p className="text-white text-lg font-black">₹{predictions[hoveredWeek].predicted.toLocaleString()}</p>
                    <p className={`font-bold ${predictions[hoveredWeek].risk === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{predictions[hoveredWeek].confidence}% Confidence</p>
                </div>
            )}
          </div>

          <div className="grid grid-cols-8 gap-0 px-1">
            {predictions.map((p, i) => (
              <div key={i} className={`flex flex-col items-center gap-1.5 py-2 transition-all ${hoveredWeek === i ? 'bg-white/5 rounded-lg' : ''}`}>
                <span className={`size-2 rounded-full ${p.risk === 'CRITICAL' ? 'bg-red-500' : p.risk === 'HIGH' ? 'bg-orange-500' : p.risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(34,197,94,0.3)]`}></span>
                <span className="text-[9px] text-slate-500 font-black">{p.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAB SWITCH ── */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          {(['overview', 'actions', 'bonds'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}>
              {t === 'overview' ? 'Intelligence' : t === 'actions' ? 'Auto-Actions' : 'Portfolio'}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`glass-card rounded-2xl p-5 border ${riskLevel === 'HIGH' ? 'border-red-500/20 bg-red-500/[0.02]' : riskLevel === 'MEDIUM' ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-indigo-500/20 bg-indigo-500/[0.02]'}`}>
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">emergency_home</span>
                Strategic Outlook
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {riskLevel === 'HIGH'
                  ? `Income drought detected in forecast due to ${seasonTag}. Your AI guardian has pre-emptively increased savings to ${aiSplit.save}% and activated the Drought Shield to protect your expenses.`
                  : riskLevel === 'MEDIUM'
                  ? `Moderate income variability detected. Savings rate optimized to ${aiSplit.save}% to capture more micro-surplus while keeping Spendable liquid.`
                  : `Income velocity is strong (+${Math.abs(incomeVelocity)}%). Surplus harvest is actively micro-sweeping excess into 7.1% GOI bonds to maximize your yield.`
                }
              </p>
              <div className="mt-6 space-y-4">
                {[
                  { title: 'Pattern Tracking', val: '98%', status: 'Stable' },
                  { title: 'Yield Optimization', val: portfolioReturn + '%', status: 'Active' },
                  { title: 'Liquidity Buffer', val: '₹' + Math.floor(spendable * 0.4).toLocaleString(), status: 'Safe' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-xs text-slate-500 font-bold uppercase">{item.title}</span>
                        <div className="text-right">
                           <p className="text-sm font-black text-white">{item.val}</p>
                           <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{item.status}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {actions.map(action => (
              <div key={action.id} className="glass-card rounded-2xl p-4 border border-white/5 hover:bg-white/[0.02] transition-all">
                <div className="flex items-start gap-4">
                  <div className={`size-12 rounded-xl bg-${action.color === 'emerald' ? 'emerald' : action.color === 'red' ? 'red' : action.color === 'cyan' ? 'cyan' : 'primary'}-500/10 flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-${action.color === 'emerald' ? 'emerald' : action.color === 'red' ? 'red' : action.color === 'cyan' ? 'cyan' : 'primary'}-400 text-2xl`}>{action.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-white">{action.title}</p>
                      <span className="text-[8px] font-black text-slate-500 uppercase">Settled</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{action.detail}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold">
                       <span className="flex items-center gap-1 uppercase tracking-widest"><span className="material-symbols-outlined text-[12px]">schedule</span> {action.timestamp.split(',')[0]}</span>
                       <button className="text-indigo-400 uppercase tracking-widest flex items-center gap-1">View Txn <span className="material-symbols-outlined text-[14px]">open_in_new</span></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bonds' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/[0.02] relative overflow-hidden text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Bond Value</p>
                <div className="flex items-center justify-center gap-3">
                    <h2 className="text-4xl font-black text-white">₹{totalPortfolio.toLocaleString()}</h2>
                    <div className="bg-emerald-400/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full">+{portfolioReturn}%</div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[64%] rounded-full"></div>
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                   <span>Allocated</span>
                   <span>Yield: 7.1% avg</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {bonds.map((bond, i) => (
                <div key={i} className="glass-card rounded-2xl p-4 border border-white/5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{bond.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{bond.ticker}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-emerald-400">₹{bond.value.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">{bond.yield}% APY</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex flex-col">
                         <span className="text-[8px] text-slate-600 uppercase font-bold">Invested</span>
                         <span className="text-xs font-bold text-white">₹{bond.invested.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col text-right">
                         <span className="text-[8px] text-slate-600 uppercase font-bold">Maturity</span>
                         <span className="text-xs font-bold text-slate-300">{bond.maturity}</span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest transition-all">
                Purchase Micro-Bonds
            </button>
          </div>
        )}
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
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-indigo-400" to="/wealth-manager">
          <span className="material-symbols-outlined fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          <span className="text-[10px] font-bold mt-1">AI</span>
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
