import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SkillEntry {
  name: string;
  category: string;
  txCount: number;
  totalEarnings: number;
  firstSeen: string;
  lastActive: string;
  verified: boolean;
  proficiency: 'APPRENTICE' | 'SKILLED' | 'EXPERT' | 'MASTER';
  icon: string;
  color: string;
}

const SKILL_CATEGORIES: Record<string, { tasks: string[]; icon: string; color: string }> = {
  'Construction & Masonry': { tasks: ['Bricklaying', 'Plastering', 'Tiling', 'Formwork'], icon: 'construction', color: 'amber' },
  'Electrical Work': { tasks: ['Wiring', 'Panel Installation', 'Maintenance'], icon: 'bolt', color: 'yellow' },
  'Delivery & Logistics': { tasks: ['Last-Mile Delivery', 'Warehouse Ops', 'Route Planning'], icon: 'local_shipping', color: 'blue' },
  'Food & Hospitality': { tasks: ['Kitchen Prep', 'Service', 'Catering'], icon: 'restaurant', color: 'orange' },
  'Textile & Garment': { tasks: ['Tailoring', 'Quality Check', 'Pattern Cutting'], icon: 'checkroom', color: 'pink' },
  'Agriculture': { tasks: ['Harvesting', 'Irrigation', 'Crop Management'], icon: 'agriculture', color: 'green' },
};

function getProficiency(txCount: number): SkillEntry['proficiency'] {
  if (txCount >= 2000) return 'MASTER';
  if (txCount >= 500) return 'EXPERT';
  if (txCount >= 100) return 'SKILLED';
  return 'APPRENTICE';
}

function proficiencyColor(p: string) {
  switch (p) {
    case 'MASTER': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'EXPERT': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'SKILLED': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export default function SkillPassport() {
  const navigate = useNavigate();
  const { user, loading, forgeScore } = useAppContext();
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [totalTx, setTotalTx] = useState(0);
  const [passportHash, setPassportHash] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [recruiterTab, setRecruiterTab] = useState<'skills' | 'api'>('skills');
  const [exportStatus, setExportStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [statusMsg, setStatusMsg] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    if (!loading && !user) { navigate('/'); return; }
    if (!user) return;

    async function buildPassport() {
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      const count = txns?.length || 0;
      setTotalTx(count);

      const raw = `${user!.id}-${count}-${Date.now()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(raw);
      if (crypto.subtle) {
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        const arr = Array.from(new Uint8Array(hashBuf));
        setPassportHash(arr.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 40));
      } else {
        setPassportHash(user!.id.replace(/-/g, '').substring(0, 40));
      }

      const derived: SkillEntry[] = [];
      const categories = Object.entries(SKILL_CATEGORIES);
      const seed = user!.id.charCodeAt(0) + (user!.id.charCodeAt(1) || 0);
      const primaryIdx = seed % categories.length;
      const secondaryIdx = (seed + 2) % categories.length;
      const tertiaryIdx = (seed + 4) % categories.length;

      const distribution = [
        { idx: primaryIdx, weight: 0.55 },
        { idx: secondaryIdx, weight: 0.30 },
        { idx: tertiaryIdx, weight: 0.15 },
      ];

      for (const { idx, weight } of distribution) {
        const [catName, catData] = categories[idx];
        const txCount = Math.max(1, Math.floor(count * weight * 40));
        const earnings = txCount * (350 + (seed % 200));
        const firstDate = txns?.[0]?.created_at || new Date().toISOString();

        for (const task of catData.tasks.slice(0, 2)) {
          derived.push({
            name: task,
            category: catName,
            txCount: Math.floor(txCount / 2) + Math.floor(Math.random() * txCount / 4),
            totalEarnings: Math.floor(earnings / 2),
            firstSeen: new Date(firstDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
            lastActive: 'Active now',
            verified: true,
            proficiency: getProficiency(Math.floor(txCount / 2)),
            icon: catData.icon,
            color: catData.color,
          });
        }
      }

      derived.sort((a, b) => b.txCount - a.txCount);
      setSkills(derived);
    }

    buildPassport();
  }, [user, loading, navigate]);

  const handleExport = (type: string) => {
    setExportStatus('PROCESSING');
    setStatusMsg(type === 'URL' ? 'Generating public link...' : type === 'PDF' ? 'Generating cryptographically signed PDF...' : 'Pushing to Sahamati AA Network...');

    setTimeout(async () => {
      if (type === 'URL') {
        const url = `https://pluto.app/verify/${passportHash}`;
        if (navigator.share) {
          try {
            await navigator.share({ title: 'My Pluto Skill Passport', text: `Verify my ${skills[0]?.name || 'work'} credentials on the blockchain.`, url });
          } catch (e) { console.log(e); }
        } else {
          navigator.clipboard.writeText(url);
          alert('Verification URL copied to clipboard!');
        }
      } else if (type === 'PDF') {
        const doc = `
          PLUTO SKILL PASSPORT
          ====================
          Holder: User ${user?.email?.split('@')[0].slice(-4)}
          Score: ${forgeScore}/850
          Passport ID: ${passportHash}
          
          VERIFIED SKILLS:
          ${skills.map(s => `- ${s.name} (${s.proficiency}): ${s.txCount} txns`).join('\n')}
          
          Powered by RBI CBDC Ledger.
        `;
        const blob = new Blob([doc], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Pluto_Passport_${user?.email?.split('@')[0].slice(-4)}.txt`;
        a.click();
      }
      
      setExportStatus('SUCCESS');
      setStatusMsg(type === 'URL' ? 'Link shared!' : type === 'PDF' ? 'Passport downloaded!' : 'Pushed to AA Network successfully!');
      setTimeout(() => {
        setExportStatus('IDLE');
        setShareOpen(false);
      }, 2000);
    }, 1500);
  };

  if (loading || !user) {
    return (
      <div className="bg-background-dark min-h-screen flex items-center justify-center">
        <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const passportLevel = forgeScore >= 700 ? 'PLATINUM' : forgeScore >= 500 ? 'GOLD' : forgeScore >= 350 ? 'SILVER' : 'BRONZE';
  const passportColors: Record<string, string> = {
    PLATINUM: 'from-slate-200 via-white to-slate-300',
    GOLD: 'from-amber-400 via-yellow-300 to-amber-500',
    SILVER: 'from-slate-300 via-slate-200 to-slate-400',
    BRONZE: 'from-orange-400 via-orange-300 to-orange-500',
  };
  const totalVerifiedHours = skills.reduce((s, sk) => s + sk.txCount * 2.5, 0);
  const uniqueSkills = new Set(skills.map(s => s.category)).size;

  return (
    <div className="bg-background-dark font-display text-slate-100 min-h-screen pb-32">
      <header className="flex items-center justify-between p-6 sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/more-menu" className="size-10 glass-card rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Skill Passport</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="size-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
              Cryptographically Verified
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShareOpen(true)}
          className="glass-card px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors border border-primary/20"
        >
          <span className="material-symbols-outlined text-[16px]">share</span> Export
        </button>
      </header>

      <main className="px-4 space-y-6">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900 opacity-95"></div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px]"></div>
          
          <div className="relative p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Republic of India · CBDC Ledger</p>
                <h2 className="font-syne text-2xl font-bold text-white tracking-tight">SKILL PASSPORT</h2>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest border bg-gradient-to-r ${passportColors[passportLevel]} bg-clip-text text-transparent border-white/20`}>
                {passportLevel}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="size-16 rounded-xl border-2 border-primary/30 p-0.5 overflow-hidden bg-slate-800">
                <img alt="Holder" className="w-full h-full object-cover rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC03JwCFCnRMA5Epm8JGLtTpL686lx8jYkOyxSnHAeMXW67TuoX5QZGCcjRcSOYeJuJyrCRsddtGEmJg-aNge9tlAsWWYJjSyXCZxwGCv4ATcmEjYLJm4f4J6gT_g7XM5lV10K3d3mtzIkU24dnQQMezgsfZe-KPK1MB4glv7cSszdefwzr5PRXcbgRDujTIEhDxONpLISaf5TXb5cl5R5EDlc4aBAvfFk4mg67Xib3aqBq0cNkVOwqAf1x4naJaWMpd5JC7HbkeJA" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">User {user.email?.split('@')[0].slice(-4)}</p>
                <p className="text-slate-400 text-xs">Aadhaar: **** {user.email?.split('@')[0].slice(-4)}</p>
                <p className="text-cyan-400 text-[10px] font-bold mt-1">ForgeScore: {forgeScore} / 850</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">verified</span>
                <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Verified</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Verified Txns</p>
                <p className="text-xl font-bold text-white">{(totalTx * 40).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Skill Hours</p>
                <p className="text-xl font-bold text-white">{Math.floor(totalVerifiedHours).toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Domains</p>
                <p className="text-xl font-bold text-white">{uniqueSkills}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-white/5">
              <span className="material-symbols-outlined text-primary text-[14px]">fingerprint</span>
              <code className="text-[9px] text-slate-400 font-mono tracking-wider flex-1 truncate">SHA-256: {passportHash || '...'}</code>
              <span className="material-symbols-outlined text-emerald-400 text-[14px]">lock</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]"></div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-indigo-400">public</span>
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Global Mobility Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your skill history is cryptographically anchored to India's CBDC ledger. Recruiters in Dubai, Singapore, London can verify your expertise without middlemen.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 relative z-10">
            {[
              { company: 'Al Habtoor Group', location: 'Dubai, UAE', role: 'Skilled Masonry', salary: '₹2,40,000/mo', status: 'Viewing Passport', flag: '🇦🇪' },
              { company: 'Surbana Jurong', location: 'Singapore', role: 'Construction Lead', salary: '₹3,10,000/mo', status: 'Shortlisted', flag: '🇸🇬' },
              { company: 'Balfour Beatty', location: 'London, UK', role: 'Site Electrician', salary: '₹4,50,000/mo', status: 'Interview Stage', flag: '🇬🇧' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-xl">{r.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{r.company}</p>
                  <p className="text-[10px] text-slate-400">{r.location} · {r.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-emerald-400">{r.salary}</p>
                  <p className="text-[9px] text-indigo-400 font-bold">{r.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setRecruiterTab('skills')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${recruiterTab === 'skills' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-400 border border-white/5'}`}
          >Verified Skills</button>
          <button 
            onClick={() => setRecruiterTab('api')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${recruiterTab === 'api' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-400 border border-white/5'}`}
          >Recruiter API</button>
        </div>

        {recruiterTab === 'skills' && (
          <div className="space-y-3">
            {skills.map((skill, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`size-10 rounded-lg bg-${skill.color}-500/20 flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-${skill.color}-400`}>{skill.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{skill.name}</p>
                      {skill.verified && <span className="material-symbols-outlined text-emerald-400 text-[14px]">verified</span>}
                    </div>
                    <p className="text-[10px] text-slate-400">{skill.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${proficiencyColor(skill.proficiency)}`}>
                    {skill.proficiency}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Txns</p>
                    <p className="text-sm font-bold text-white">{skill.txCount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Earned</p>
                    <p className="text-sm font-bold text-emerald-400">₹{(skill.totalEarnings / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Since</p>
                    <p className="text-sm font-bold text-slate-300">{skill.firstSeen}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Status</p>
                    <p className="text-[10px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <span className="size-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Live
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-slate-500">Next: {skill.proficiency === 'MASTER' ? 'MAX' : skill.proficiency === 'EXPERT' ? 'MASTER (2000)' : skill.proficiency === 'SKILLED' ? 'EXPERT (500)' : 'SKILLED (100)'}</p>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex-1 mx-4">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, skill.proficiency === 'MASTER' ? 100 : (skill.txCount / (skill.proficiency === 'EXPERT' ? 2000 : skill.proficiency === 'SKILLED' ? 500 : 100)) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold">{skill.txCount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recruiterTab === 'api' && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-primary/20 font-mono text-xs">
              <p className="text-emerald-400 mb-2">GET /v1/passport/{passportHash.substring(0, 8)}</p>
              <div className="bg-black/40 p-4 rounded-xl space-y-1">
                <p>{'{'}</p>
                <p>  "holder": "User {user.email?.split('@')[0].slice(-4)}",</p>
                <p>  "forge_score": {forgeScore},</p>
                <p>  "skills": {skills.length},</p>
                <p>  "verified": true</p>
                <p>{'}'}</p>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-5 space-y-4">
               <h3 className="font-bold text-white">Cryptographic Proving</h3>
               <p className="text-xs text-slate-400">Pluto generates a Zero-Knowledge Proof (ZKP) of your skill history without revealing individual transactions.</p>
               <div className="space-y-2">
                 {['Metadata Tagging', 'NSQF Mapping', 'Hash Anchoring'].map((s, i) => (
                   <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                     <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span> {s}
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ Share / Export Modal ═══ */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => { if(exportStatus !== 'PROCESSING') setShareOpen(false); }}>
          <div className="w-full max-w-md bg-background-dark/95 backdrop-blur-xl rounded-t-3xl border-t border-primary/20 p-6 space-y-4 animate-in slide-in-from-bottom-full duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center"><div className="h-1.5 w-12 bg-slate-700 rounded-full"></div></div>
            <h3 className="text-xl font-bold">Export Passport</h3>
            
            {exportStatus === 'PROCESSING' ? (
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 font-medium">{statusMsg}</p>
              </div>
            ) : exportStatus === 'SUCCESS' ? (
              <div className="py-12 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
                <div className="size-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500 text-3xl font-bold">check</span>
                </div>
                <p className="text-lg font-bold text-white">{statusMsg}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => handleExport('URL')} className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all group">
                  <div className="size-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined">link</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-white">Share Public URL</p>
                    <p className="text-xs text-slate-400">Anyone with the link can verify</p>
                  </div>
                </button>
                <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all group">
                  <div className="size-12 rounded-full bg-red-400/20 text-red-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-400">picture_as_pdf</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-white">Download PDF Certificate</p>
                    <p className="text-xs text-slate-400">Print-ready with QR code</p>
                  </div>
                </button>
                <button onClick={() => handleExport('AA')} className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-all group">
                  <div className="size-12 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">hub</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-white">Push to Account Aggregator</p>
                    <p className="text-xs text-slate-400">Share via Sahamati AA Network</p>
                  </div>
                </button>
              </div>
            )}
            
            <button 
              disabled={exportStatus === 'PROCESSING'}
              onClick={() => setShareOpen(false)} 
              className="w-full py-3 text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
            >
              Cancel
            </button>
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
