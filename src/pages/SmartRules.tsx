import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function SmartRules() {
  const navigate = useNavigate();
  const { user, loading } = useAppContext();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Daughter\'s School Fees',
      condition: 'Every 1st of the month',
      action: 'Lock ₹500 in Welfare Tokens',
      status: 'active',
      isTemplate: true
    }
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      const pctMatch = lowerPrompt.match(/(\d+)\s*%/);
      const pct = pctMatch ? pctMatch[1] : '10';
      const amtMatch = lowerPrompt.match(/(?:above|over|more than|exceeds?|₹|rs\.?)\s*(\d[\d,]*)/i);
      const amt = amtMatch ? amtMatch[1].replace(/,/g, '') : null;
      const toSavings = lowerPrompt.includes('saving');
      const toWelfare = lowerPrompt.includes('welfare') || lowerPrompt.includes('token');

      let condition: string;
      let action: string;
      let name: string;

      if (amt && (lowerPrompt.includes('if') || lowerPrompt.includes('when') || lowerPrompt.includes('above'))) {
        condition = `Payout amount > ₹${Number(amt).toLocaleString('en-IN')}`;
        action = `Route ${pct}% to ${toWelfare ? 'Welfare Tokens' : 'Savings Vault'}`;
        name = `Auto-split above ₹${Number(amt).toLocaleString('en-IN')}`;
      } else if (lowerPrompt.includes('every') || lowerPrompt.includes('month') || lowerPrompt.includes('daily')) {
        condition = lowerPrompt.includes('month') ? 'Every 1st of the month' : 'On every Payout event';
        action = `Lock ${pct}% in ${toWelfare ? 'Welfare Tokens' : toSavings ? 'Savings' : 'Savings Vault'}`;
        name = `Recurring ${toWelfare ? 'Welfare' : 'Savings'} Lock`;
      } else {
        condition = 'On every Payout event';
        action = `Send ${pct}% to ${toSavings ? 'Savings' : toWelfare ? 'Welfare Tokens' : 'Savings Vault'}`;
        name = `Smart ${toSavings ? 'Savings' : toWelfare ? 'Welfare' : 'Allocation'} Rule`;
      }

      setRules(prev => [
        { id: Date.now(), name, condition, action, status: 'active', isTemplate: false },
        ...prev
      ]);
      setPrompt('');
      setIsGenerating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  if (loading) return (
    <div className="bg-background-dark min-h-screen flex items-center justify-center">
      <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-slate-100">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Rules <span className="text-[10px] uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30">Beta</span>
          </h1>
        </div>
        <button className="material-symbols-outlined text-slate-400 hover:text-white">help</button>
      </nav>

      <main className="p-4 max-w-md mx-auto space-y-6 mt-4">
        
        {/* Intro */}
        <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <span className="material-symbols-outlined text-4xl text-primary relative z-10 animate-pulse">auto_awesome</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Programmable e-Rupee</h2>
          <p className="text-sm text-slate-400 max-w-[280px] mx-auto">Attach natural language rules to your CBDC without writing code.</p>
        </div>

        {/* AI Input Area */}
        <div className="glass-card p-5 rounded-2xl space-y-4 border-white/10 shadow-2xl relative">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
             Describe your logic <span className="text-[14px] material-symbols-outlined text-primary/60">robot_2</span>
          </label>
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300 ${isGenerating ? 'animate-pulse opacity-100' : ''}`}></div>
            <textarea 
              ref={textareaRef}
              className="relative w-full bg-black/60 border border-white/10 rounded-xl p-4 pb-14 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none placeholder:text-slate-600 transition-all min-h-[100px]"
              placeholder="e.g. If my daily payout is above ₹1000, send 20% to savings vault."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`absolute bottom-3 right-3 px-5 py-2.5 bg-primary text-black rounded-lg text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-40 disabled:scale-100 disabled:shadow-none ${isGenerating ? 'pr-8' : ''}`}
            >
              {isGenerating ? (
                <>
                  <div className="size-3 border-2 border-black border-t-transparent rounded-full animate-spin absolute right-3"></div>
                  Synthesizing...
                </>
              ) : (
                <>
                  Attach Rule
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                </>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
             <span>Press <kbd className="px-1 border border-slate-700 rounded bg-slate-800">Enter</kbd> to attach</span>
             <span>AI Agent: Pluto Core v1.4</span>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <div className="animate-in slide-in-from-top-4 fade-in glass-card border-emerald-500/30 bg-emerald-500/5 p-3 rounded-xl flex items-center gap-3">
             <span className="material-symbols-outlined text-emerald-400">check_circle</span>
             <p className="text-xs text-emerald-400 font-bold tracking-tight">Program attached successfully to your e-Rupee.</p>
          </div>
        )}

        {/* Active Rules List */}
        <div className="space-y-4 pt-4 pb-12">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Active CBDC Programs</h3>
            <span className="text-[10px] text-slate-500">{rules.length} Active</span>
          </div>
          
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="glass-card p-4 rounded-xl border-l-[3px] border-l-primary flex items-start justify-between group hover:bg-white/[0.05] transition-colors overflow-hidden relative">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{rule.name}</p>
                    {rule.isTemplate ? (
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold tracking-widest">Default</span>
                    ) : (
                      <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 flex items-center gap-1 uppercase font-bold tracking-widest">
                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 font-mono">
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40 rounded-lg text-[11px]">
                      <span className="text-primary opacity-60">IF:</span>
                      <span className="text-slate-300">{rule.condition}</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40 rounded-lg text-[11px]">
                      <span className="text-emerald-400 opacity-60">THEN:</span>
                      <span className="text-emerald-400">{rule.action}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="text-slate-600 hover:text-red-400 transition-colors shrink-0 p-1">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
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
            className="size-14 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 text-white border-4 border-background-dark hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">bolt</span>
          </button>
        </div>
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-primary bg-primary/10 rounded-full" to="/smart-rules">
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
