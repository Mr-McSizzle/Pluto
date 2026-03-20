import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useState, useEffect, useRef } from 'react';

export default function LedgerCertificate() {
  const navigate = useNavigate();
  const { user, loading, forgeScore } = useAppContext();
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!loading && !user) {
          navigate('/');
      }
  }, [user, loading, navigate]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const accountId = `PF-${user?.id?.substring(0, 6).toUpperCase() || '000000'}`;
  const issueDate = new Date(user?.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const validUntil = (() => { const d = new Date(user?.created_at || ''); d.setFullYear(d.getFullYear() + 2); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); })();
  const tier = forgeScore >= 700 ? 'Premium Gold' : forgeScore >= 500 ? 'Silver' : 'Standard';
  const userName = `User ${user?.email?.split('@')[0].slice(-4) || '0000'}`;

  const handleDownload = () => {
    const cert = [
      '═══════════════════════════════════════════',
      '          PLUTO — LEDGER CERTIFICATE        ',
      '═══════════════════════════════════════════',
      '',
      `  Name:         ${userName}`,
      `  Account ID:   ${accountId}`,
      `  ForgeScore:   ${forgeScore}`,
      `  Tier:         ${tier}`,
      `  Region:       South Asia`,
      `  Issue Date:   ${issueDate}`,
      `  Valid Until:  ${validUntil}`,
      `  Status:       Active`,
      '',
      '  This certificate is cryptographically',
      '  signed on the CBDC e-Rupee ledger.',
      '',
      `  Verified: ${new Date().toISOString()}`,
      '═══════════════════════════════════════════',
    ].join('\n');

    const blob = new Blob([cert], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pluto_Certificate_${accountId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Certificate downloaded!');
  };

  const handleShare = async () => {
    const text = `Pluto Ledger Certificate\n${userName} | ${accountId}\nForgeScore: ${forgeScore} | Tier: ${tier}\nVerified on CBDC e-Rupee Ledger`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Pluto Ledger Certificate', text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      showToast('Certificate copied to clipboard!');
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(accountId);
    setMenuOpen(false);
    showToast('Account ID copied!');
  };

  const handlePrint = () => { setMenuOpen(false); window.print(); };

  if (loading) {
      return (
          <div className="bg-background-dark min-h-screen flex items-center justify-center">
              <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-24">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span> {toast}
        </div>
      )}

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-dark/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="material-symbols-outlined text-slate-100 cursor-pointer hover:text-white transition-colors">
            arrow_back
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Ledger Certificate</h1>
        </div>
        <div className="flex gap-2 relative" ref={menuRef}>
          <button onClick={handleDownload} className="size-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" title="Download Certificate">
            <span className="material-symbols-outlined text-slate-100">download</span>
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="size-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors" title="More options">
            <span className="material-symbols-outlined text-slate-100">more_vert</span>
          </button>
          {menuOpen && (
            <div className="absolute top-12 right-0 w-48 glass-card rounded-xl border border-white/10 overflow-hidden shadow-2xl z-50">
              <button onClick={handlePrint} className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-400">print</span> Print Certificate
              </button>
              <button onClick={handleCopyId} className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/5">
                <span className="material-symbols-outlined text-[18px] text-slate-400">content_copy</span> Copy Account ID
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/skill-passport'); }} className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/5">
                <span className="material-symbols-outlined text-[18px] text-slate-400">card_membership</span> Skill Passport
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="p-4 max-w-md mx-auto space-y-6">
        {/* Premium Certificate Card */}
        <div className="relative overflow-hidden rounded-xl glass-strong hex-watermark p-6 shadow-2xl border-t border-white/20">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-6xl">verified_user</span>
          </div>
          <div className="flex justify-between items-start mb-8 z-10 relative">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">Pluto Digital Asset</p>
              <h2 className="text-3xl font-bold text-white leading-tight">{userName}</h2>
              <p className="text-sm text-slate-400">Verified Ledger Holder Since 2026</p>
            </div>
            <div className="bg-cyan-accent/10 border border-cyan-accent/30 rounded-lg px-3 py-1 text-cyan-accent">
              <p className="text-[10px] uppercase font-bold text-center">ForgeScore</p>
              <p className="text-xl font-bold text-center">{forgeScore}</p>
            </div>
          </div>

          {/* 6-Cell Data Grid */}
          <div className="grid grid-cols-2 gap-y-6 border-t border-white/10 pt-6 relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Account ID</p>
              <p className="text-sm font-semibold text-slate-200">{accountId}</p>
            </div>
            <div className="space-y-1 pl-4 border-l border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Issue Date</p>
              <p className="text-sm font-semibold text-slate-200">{issueDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Valid Until</p>
              <p className="text-sm font-semibold text-slate-200">{validUntil}</p>
            </div>
            <div className="space-y-1 pl-4 border-l border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Status</p>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-cyan-accent shadow-[0_0_8px_#00f2ff]"></span>
                <p className="text-sm font-semibold text-slate-200">Active</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Region</p>
              <p className="text-sm font-semibold text-slate-200">South Asia</p>
            </div>
            <div className="space-y-1 pl-4 border-l border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Tier</p>
              <p className="text-sm font-semibold text-slate-200">{tier}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-center relative z-10">
            <div className="p-3 bg-white rounded-lg shadow-inner">
              <img 
                alt="QR Code for digital verification" 
                className="w-24 h-24" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9af6dqh1WP6tyuGqjioBwRxHLzWZQO2xVRIF_OZzmsJBXy0El8B4G0fuiKrb3RNT5tgMMP-upCcmQjPAdVCU7t8is46T2ou5YfxLe_YuyLaGbdsrHtfqMoR7aKPzBy56QRBDjeSIULcJz4TfONJOn7hW4JLqqEYvgVN21BUrylLCQODc-VnoHIx3fVTuqi_d0LzuO2AgKeB3yKoZkomBbmDvc2yAGDTCITUD4kFsVu-tWYU-sPDMnw9M33OpJ57XWdjxq718ftC8"
              />
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button onClick={handleShare} className="w-full bg-primary shadow-[0_0_20px_rgba(0,123,255,0.4)] hover:shadow-[0_0_30px_rgba(0,123,255,0.6)] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined">share</span>
          Share Certificate
        </button>

        <div className="border-l-4 border-cyan-accent bg-cyan-accent/5 p-4 rounded-r-lg">
          <p className="text-sm font-bold text-cyan-accent mb-1">Instant Verification Active</p>
          <p className="text-xs text-slate-400 leading-relaxed">This ledger certificate is cryptographically signed and can be verified by any Pluto compatible terminal in real-time.</p>
        </div>

        {/* Consent Log Card */}
        <div className="glass-strong rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Consent Log</h3>
            <span className="material-symbols-outlined text-slate-500 text-lg">history</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">visibility</span>
              </div>
              <div>
                <p className="text-sm font-medium">Global Trade Bank</p>
                <p className="text-xs text-slate-500">Viewed certificate details • 2h ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm">handshake</span>
              </div>
              <div>
                <p className="text-sm font-medium">Authorized Credit Union</p>
                <p className="text-xs text-slate-500">Verified score eligibility • Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Navbar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card rounded-full px-2 py-2 flex items-center justify-between z-50 shadow-2xl">
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors" to="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link className="flex-1 flex flex-col items-center justify-center py-2 text-primary bg-primary/10 rounded-full" to="/ledger-certificate">
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
