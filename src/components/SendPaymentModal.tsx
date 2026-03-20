import { useState, useEffect } from 'react';

interface Contact {
    id: string;
    name: string;
    handle: string;
    color: string;
    icon: string;
}

const recentContacts: Contact[] = [
    { id: '1', name: 'Rajesh K.', handle: '@rajesh.forge', color: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30', icon: 'person' },
    { id: '2', name: 'Maya S.', handle: '@maya.forge', color: 'bg-purple-500/20 text-purple-500 border border-purple-500/30', icon: 'person' },
];

interface SendPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (amount: number, recipient: string) => Promise<boolean>;
  availableBalance: number;
}

export default function SendPaymentModal({ isOpen, onClose, onSend, availableBalance }: SendPaymentModalProps) {
    const [step, setStep] = useState<'CONTACT' | 'AMOUNT' | 'PROCESSING' | 'SUCCESS'>('CONTACT');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep('CONTACT');
            setSelectedContact(null);
            setAmount('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setStep('AMOUNT');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const val = e.target.value;
        if (/^\d*\.?\d*$/.test(val)) {
            setAmount(val);
        }
    };

    const handleSend = async () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            setError('Enter a valid amount');
            return;
        }
        if (numAmount > availableBalance) {
            setError('Insufficient Spendable balance');
            return;
        }

        setStep('PROCESSING');
        const success = await onSend(numAmount, selectedContact!.name);
        
        if (success) {
            setStep('SUCCESS');
            setTimeout(() => {
                onClose();
            }, 2500);
        } else {
            setError('Transaction failed. Try again.');
            setStep('AMOUNT');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <div 
                className="relative w-full max-w-md bg-background-dark/95 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-2xl border border-primary/20 transition-all duration-300 min-h-[500px] flex flex-col animate-in zoom-in-95 duration-500"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="flex h-8 w-full items-center justify-center">
                    <div className="h-1.5 w-12 rounded-full bg-slate-700"></div>
                </div>

                <div className="px-6 pb-8 flex-1 flex flex-col">
                    {/* STEP 1: SELECT CONTACT & UPI INTEROPERABILITY */}
                    {step === 'CONTACT' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col">
                            
                            {/* The UPI Interoperability Hero Card */}
                            <div 
                                className="glass-card glow-cyan p-5 mb-8 rounded-2xl relative overflow-hidden group cursor-pointer border-cyan-500/20 hover:border-cyan-400/50 transition-all" 
                                onClick={() => handleSelectContact({ id: 'upi', name: 'Scanned UPI Merchant', handle: 'Any UPI QR', color: 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30', icon: 'storefront' })}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-cyan-400/30 transition-colors"></div>
                                
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                        Universal Interoperability
                                    </div>
                                    <div className="size-10 glass-strong rounded-full flex items-center justify-center text-white/90">
                                        <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">Scan any UPI QR Code</h3>
                                <p className="text-slate-300 text-xs leading-relaxed max-w-[90%] relative z-10">
                                    Pluto natively connects your e-Rupee to India's <span className="text-cyan-300 font-bold group-hover:text-cyan-200 transition-colors">50M+ standard UPI terminals</span>. No CBDC merchant required.
                                </p>

                                {/* Mock Logos Row */}
                                <div className="flex gap-2.5 mt-5 relative z-10">
                                    <div className="px-3 py-1.5 glass-strong rounded-lg text-[10px] font-bold tracking-wider text-white">PhonePe</div>
                                    <div className="px-3 py-1.5 glass-strong rounded-lg text-[10px] font-bold tracking-wider text-white">Google Pay</div>
                                    <div className="px-3 py-1.5 glass-strong rounded-lg text-[10px] font-bold tracking-wider text-white">Paytm</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Send to Contact</h2>
                                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:text-white transition-colors bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                                    <span className="material-symbols-outlined text-[14px]">qr_code</span> Show My QR
                                </button>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Search name, @handle, or Aadhaar" 
                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors placeholder:text-slate-500"
                                />
                                <button className="absolute right-2 top-2 size-9 glass-strong rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">contacts</span>
                                </button>
                            </div>

                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Recent Transfers</p>
                            <div className="space-y-2">
                                {recentContacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        onClick={() => handleSelectContact(contact)}
                                        className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 cursor-pointer transition-all border border-slate-800 hover:border-white/10 group shadow-sm"
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${contact.color}`}>
                                            <span className="material-symbols-outlined">{contact.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white text-base">{contact.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{contact.handle}</p>
                                        </div>
                                        <div className="size-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-slate-400">
                                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: ENTER AMOUNT */}
                    {(step === 'AMOUNT' || step === 'PROCESSING') && selectedContact && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setStep('CONTACT')} className="text-slate-400 hover:text-white transition-colors bg-white/5 size-10 rounded-full flex items-center justify-center" disabled={step === 'PROCESSING'}>
                                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                    </button>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paying</p>
                                        <p className="text-white font-bold">{selectedContact.name}</p>
                                    </div>
                                </div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${selectedContact.color}`}>
                                    <span className="material-symbols-outlined text-[18px]">{selectedContact.icon}</span>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-6 relative">
                                {selectedContact.id === 'upi' && (
                                     <div className="absolute top-0 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full animate-pulse flex items-center gap-2">
                                         <span className="size-1.5 bg-cyan-400 rounded-full"></span>
                                         UPI Interop Active
                                     </div>
                                )}
                                <p className="text-slate-400 font-medium mb-4 mt-8">Enter Amount</p>
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
                                
                                <div className="mt-8 px-4 py-2 flex items-center gap-2 glass-strong rounded-xl text-xs text-slate-300 font-medium border-slate-700/50">
                                    <span className="material-symbols-outlined text-[16px] text-green-400">account_balance_wallet</span>
                                    Spendable Balance: <span className="text-white font-bold tracking-wide">₹{availableBalance.toLocaleString('en-IN')}</span>
                                </div>
                                
                                {error && <p className="text-red-400 text-sm mt-4 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in shake">{error}</p>}
                            </div>

                            <div className="mt-8 pt-4">
                                <button 
                                    onClick={handleSend}
                                    disabled={step === 'PROCESSING'}
                                    className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                                        ${amount && parseFloat(amount) > 0 
                                            ? selectedContact.id === 'upi' ? 'bg-cyan-500 text-slate-900 glow-cyan hover:bg-cyan-400 active:scale-[0.98]' : 'bg-primary text-white glow-primary hover:bg-primary/90 active:scale-[0.98]' 
                                            : 'bg-slate-800 text-slate-500 shadow-none cursor-not-allowed border border-white/5'}`}
                                >
                                    {step === 'PROCESSING' && (
                                        <div className="absolute inset-0 w-full h-full bg-black/10 flex items-center justify-center"></div>
                                    )}
                                    {step === 'PROCESSING' ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin opacity-80">sync</span>
                                            <span className="tracking-wide text-lg">{selectedContact.id === 'upi' ? 'Translating to UPI Node...' : 'Processing CBDC Transfer...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined group-hover:scale-110 transition-all opacity-90">{selectedContact.id === 'upi' ? 'qr_code_scanner' : 'send'}</span>
                                            <span className="text-lg tracking-wide">{selectedContact.id === 'upi' ? 'Pay via UPI CBDC' : 'Send Payment'}</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-widest flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">lock</span> 256-bit CBDC Encrypted
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'SUCCESS' && (
                        <div className="animate-in zoom-in-95 fade-in duration-500 flex flex-col items-center justify-center py-6 text-center h-full flex-1">
                            <div className="relative mb-2">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[40px] animate-pulse"></div>
                                <div className="w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] relative z-10">
                                    <span className="material-symbols-outlined text-emerald-500 text-6xl">check</span>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2 mt-6">{selectedContact?.id === 'upi' ? 'Scanned & Paid' : 'Sent Successfully'}</h2>
                            <p className="text-emerald-400 bg-emerald-500/10 px-6 py-2 rounded-full font-syne font-extrabold text-3xl tracking-tight mb-10 border border-emerald-500/20 shadow-inner">
                                ₹{parseFloat(amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                            
                            <div className="w-full glass-strong rounded-2xl p-5 flex flex-col gap-4 text-left shadow-lg border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Paid To</p>
                                        <p className="text-white font-bold text-lg">{selectedContact?.name}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border ${selectedContact?.color}`}>
                                        <span className="material-symbols-outlined text-[18px]">{selectedContact?.icon}</span>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Network</p>
                                    <p className="text-xs font-bold text-cyan-400">{selectedContact?.id === 'upi' ? 'UPI Interoperability Node' : 'Pluto Direct Chain'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
