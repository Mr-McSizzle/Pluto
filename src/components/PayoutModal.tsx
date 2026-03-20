

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
}

export default function PayoutModal({ isOpen, onClose, onConfirm, amount }: PayoutModalProps) {
  if (!isOpen) return null;

  const spend = Math.floor(amount * 0.70);
  const save = Math.floor(amount * 0.17);
  const well = amount - spend - save;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div 
        className="relative w-full max-w-md bg-background-dark/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-primary/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle Area */}
        <div className="flex h-8 w-full items-center justify-center">
            <div className="h-1.5 w-12 rounded-full bg-slate-700"></div>
        </div>
        
        <div className="px-6 pb-8 pt-4">
            {/* Header */}
            <div className="text-center space-y-1 mb-8">
                <p className="text-primary font-bold tracking-widest text-xs uppercase">Payout Confirmed</p>
                <h1 className="font-syne text-white text-6xl font-extrabold tracking-tighter">₹{amount.toLocaleString('en-IN')}</h1>
            </div>

            {/* Allocation Distribution */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                    <p className="text-slate-300 text-sm font-medium">Allocation Distribution</p>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">Automated</span>
                </div>
                
                {/* Segmented Bar */}
                <div className="h-3 w-full bg-slate-800 rounded-full flex overflow-hidden ring-4 ring-slate-900/50">
                    <div className="h-full bg-primary" style={{ width: '70%' }}></div>
                    <div className="h-full bg-green-500" style={{ width: '17%' }}></div>
                    <div className="h-full bg-cyan-500" style={{ width: '13%' }}></div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 text-primary">
                        <span className="w-2 h-2 rounded-full bg-primary"></span> Spendable
                    </div>
                    <div className="flex items-center gap-1.5 text-green-500">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Savings
                    </div>
                    <div className="flex items-center gap-1.5 text-cyan-500">
                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Welfare
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Spend</p>
                    <p className="text-white text-lg font-bold">₹{spend}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Save</p>
                    <p className="text-white text-lg font-bold">₹{save}</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl text-center">
                    <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Well</p>
                    <p className="text-white text-lg font-bold">₹{well}</p>
                </div>
            </div>

            {/* ForgeScore Footer */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl mb-8 border border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <span className="material-symbols-outlined text-cyan-500 leading-none">bolt</span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-medium">ForgeScore Impact</p>
                        <p className="text-white font-bold">Excellent Momentum</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-cyan-500">
                    <span className="material-symbols-outlined text-sm font-bold">keyboard_double_arrow_up</span>
                    <span className="text-xl font-bold tracking-tight">+14</span>
                </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={onConfirm}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl shadow-[0_0_30px_rgba(0,123,255,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
                <span>Process to Wallet</span>
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
            <p className="text-center text-slate-500 text-[11px] mt-6 font-medium">Transaction ID: PF-{Date.now().toString(36).toUpperCase().slice(-8)}</p>
        </div>
      </div>
    </div>
  );
}
