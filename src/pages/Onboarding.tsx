import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: contextLoading } = useAppContext();
  const [aadhaar, setAadhaar] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contextLoading && user) {
      navigate('/dashboard');
    }
  }, [user, contextLoading, navigate]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aadhaar || !pin) {
      setError('Please enter both Aadhaar Number and Verification Code.');
      return;
    }

    // Sanitize: strip everything except digits
    const cleanAadhaar = aadhaar.replace(/\D/g, '');
    if (cleanAadhaar.length < 4) {
      setError('Please enter a valid Aadhaar number (at least 4 digits).');
      return;
    }
    if (pin.length < 6) {
      setError('Verification code must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prefix with "user" so the local part always starts with a letter
      const email = `user${cleanAadhaar}@pluto.app`;
      
      // Attempt login first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pin,
      });

      if (signInError) {
        // If user doesn't exist, sign them up (Auto-registration flow for Hackathon)
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: pin,
            options: {
              // Skip email confirmation entirely for hackathon MVP
              emailRedirectTo: undefined,
              data: { aadhaar: cleanAadhaar },
            },
          });

          if (signUpError) {
            setError(signUpError.message);
          } else if (signUpData?.user && !signUpData.session) {
            // Email confirmation is blocking auto-login → retry sign-in
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password: pin,
            });
            if (retryError) {
              // Still blocked — likely email confirmation is on in Supabase dashboard
              // Navigate anyway; the AppContext auth listener will handle the state
              setError('Account created! If you see issues, go to Supabase Dashboard → Authentication → Settings → disable "Confirm email".');
            } else {
              navigate('/dashboard');
            }
          } else {
            // Session came back directly → auto-confirmed
            navigate('/dashboard');
          }
        } else if (signInError.message.includes('Email not confirmed')) {
          // User exists but email not confirmed — just navigate, hackathon MVP
          setError('Email not confirmed. Go to Supabase Dashboard → Authentication → Settings → disable "Confirm email", then try again.');
        } else {
          setError(signInError.message);
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md flex flex-col items-center mx-auto min-h-screen justify-center p-4" style={{ background: '#000000' }}>
      <div className="w-full rounded-2xl p-8 flex flex-col gap-8 relative overflow-hidden" style={{ background: 'rgba(8,10,20,.85)', border: '1px solid rgba(255,255,255,.06)', backdropFilter: 'blur(20px)' }}>
        {/* Decorative Light Ray */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]"></div>
        
        {/* Header Section */}
        <div className="flex flex-col items-center gap-2">
          <div className="font-syne text-3xl font-bold tracking-wide">
            <span className="text-white">PLU</span><span className="text-primary">TO</span>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-1.5 w-6 rounded-full bg-primary"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary/30"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-primary/30"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white leading-tight">Your financial identity starts here.</h1>
          <p className="text-slate-400 text-sm">Verify your credentials to secure your digital vault.</p>
        </div>
        
        {/* Illustration Area */}
        <div className="relative w-full h-32 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="material-symbols-outlined text-8xl text-primary">fingerprint</span>
          </div>
          <div className="z-10 flex items-center gap-3 bg-background-dark/60 backdrop-blur-md p-3 rounded-lg border border-white/10">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <span className="text-xs font-medium text-slate-200">Bank-grade encryption active</span>
          </div>
        </div>
        
        {/* Form Fields */}
        <form onSubmit={handleVerify} className="flex flex-col gap-5 z-10 w-full">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Aadhaar Number</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">badge</span>
              <input 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-600" 
                placeholder="XXXX XXXX XXXX" 
                type="text" 
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Verification Code</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">lock_open</span>
              <input 
                className="w-full h-14 bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-slate-600 tracking-[0.5em]" 
                placeholder="6-digit OTP" 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-xs text-primary/80 hover:text-primary transition-colors">Resend Code</button>
            </div>
          </div>
          
          {/* CTA Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white active:scale-[0.98] glow-button'} w-full h-14 bg-primary text-background-dark font-bold rounded-lg flex items-center justify-center gap-2 transition-all transform mt-2`}
          >
            <span>{loading ? 'Verifying...' : 'Verify & Activate'}</span>
            {!loading && <span className="material-symbols-outlined">bolt</span>}
          </button>
        </form>
        
        {/* Bottom Text */}
        <div className="text-center z-10">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
            Secure biometric authentication • Powered by Forge Protocol
          </p>
        </div>
      </div>
      
      {/* Secondary Background Elements */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}
