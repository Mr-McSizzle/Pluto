import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  loading: boolean;
  spendable: number;
  savings: number;
  forgeScore: number;
  welfareTokens: number;
  currentApy: number;
  processPayout: (amount: number) => Promise<void>;
  sendPayment: (amount: number, recipient: string) => Promise<boolean>;
  claimDailyYield: () => Promise<void>;
  simulateTimePassage: () => Promise<void>;
  lockEmergencyFunds: (amount: number, reason: string) => Promise<void>;
  disburseLoan: (amount: number) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Balances
  const [spendable, setSpendable] = useState(0);
  const [savings, setSavings] = useState(0);
  const [welfareTokens, setWelfareTokens] = useState(0);
  const [forgeScore, setForgeScore] = useState(0);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      if (!user) {
        if (isMounted) {
          setSpendable(0); setSavings(0); setWelfareTokens(0); setForgeScore(0);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('forge_score')
          .eq('id', user.id)
          .single();

        if (profileData && isMounted) setForgeScore(profileData.forge_score || 0);

        // Fetch Wallet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('spendable_balance, savings_balance, welfare_balance')
          .eq('user_id', user.id)
          .single();

        if (walletData && isMounted) {
          setSpendable(Number(walletData.spendable_balance) || 0);
          setSavings(Number(walletData.savings_balance) || 0);
          setWelfareTokens(Number(walletData.welfare_balance) || 0);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUserData();
    return () => { isMounted = false; };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const processPayout = async (amount: number) => {
    if (!user) return;
    try {
      const spend = Math.floor(amount * 0.70);
      const save = Math.floor(amount * 0.17);
      const well = amount - spend - save;

      // 1. Calculate new values locally
      const newSpendable = spendable + spend;
      const newSavings = savings + save;
      const newWelfare = welfareTokens + well;
      const newForgeScore = Math.min(forgeScore + 14, 850);

      // Optimistically update UI
      setSpendable(newSpendable);
      setSavings(newSavings);
      setWelfareTokens(newWelfare);
      setForgeScore(newForgeScore);

      // 2. Perform backend updates
      // Update Wallet
      await supabase
        .from('wallets')
        .update({ 
          spendable_balance: newSpendable,
          savings_balance: newSavings,
          welfare_balance: newWelfare
        })
        .eq('user_id', user.id);

      // Update Profile Forge Score
      await supabase
        .from('profiles')
        .update({ forge_score: newForgeScore })
        .eq('id', user.id);

      // Log Transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'PAYOUT',
          destination_pool: 'SPLIT',
          description: 'Automated Wage Split',
          status: 'COMPLETED'
        });

    } catch (err) {
      console.error("Failed to process payout:", err);
    }
  };

  const sendPayment = async (amount: number, recipient: string): Promise<boolean> => {
    if (!user || spendable < amount) return false;
    try {
      const newSpendable = spendable - amount;
      
      // Optimistic update
      setSpendable(newSpendable);

      // Backend update wallet
      await supabase
        .from('wallets')
        .update({ spendable_balance: newSpendable })
        .eq('user_id', user.id);

      // Log transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          type: 'PAYMENT',
          destination_pool: 'SPENDABLE',
          description: `Payment to ${recipient}`,
          status: 'COMPLETED'
        });

      return true;
    } catch (err) {
      console.error("Failed to send payment:", err);
      return false;
    }
  };

  // Advanced Yield Formula:
  // Base APY = 5.0%
  // Bonus APY = Up to +7.0% based linearly on ForgeScore / 850
  const currentApy = 5.0 + ((forgeScore / 850) * 7.0);

  const claimDailyYield = async () => {
    if (!user || savings <= 0) return;
    try {
      // Calculate daily yield: Earnings = Savings * (APY / 100) / 365
      const dailyYield = savings * (currentApy / 100) / 365;
      const newSavings = savings + dailyYield;
      
      // Optimistic update
      setSavings(newSavings);

      // Backend update
      await supabase
        .from('wallets')
        .update({ savings_balance: newSavings })
        .eq('user_id', user.id);

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: dailyYield,
          type: 'YIELD',
          destination_pool: 'SAVINGS',
          description: `Daily Yield Compound (${currentApy.toFixed(1)}% APY)`,
          status: 'COMPLETED'
        });

    } catch (err) {
      console.error("Failed to claim yield:", err);
    }
  };

  const simulateTimePassage = async () => {
    if (!user) return;
    try {
      // Decay ForgeScore by 10 points (simulate 30 days inactivity)
      const newForgeScore = Math.max(forgeScore - 10, 300);
      setForgeScore(newForgeScore);

      await supabase
        .from('profiles')
        .update({ forge_score: newForgeScore })
        .eq('id', user.id);
      
      // Compound 30 days of yield in a single calculation
      if (savings > 0) {
        const dailyRate = currentApy / 100 / 365;
        const compoundedSavings = savings * Math.pow(1 + dailyRate, 30);
        const yieldGained = compoundedSavings - savings;
        
        setSavings(compoundedSavings);

        await supabase
          .from('wallets')
          .update({ savings_balance: compoundedSavings })
          .eq('user_id', user.id);

        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: yieldGained,
            type: 'YIELD',
            destination_pool: 'SAVINGS',
            description: `30-Day Compound Yield (${currentApy.toFixed(1)}% APY)`,
            status: 'COMPLETED'
          });
      }
    } catch (err) {
      console.error(err);
    }
  };
 
   const lockEmergencyFunds = async (amount: number, reason: string) => {
     if (!user || savings < amount) return;
     try {
       const penalty = Math.floor(amount * 0.05);
       const netAmount = amount - penalty;
       
       const newSavings = savings - amount;
       const newSpendable = spendable + netAmount;
       const newForgeScore = Math.max(forgeScore - 15, 300);
 
       // Optimistic update
       setSavings(newSavings);
       setSpendable(newSpendable);
       setForgeScore(newForgeScore);
 
       // Backend update wallet
       await supabase
         .from('wallets')
         .update({ 
           savings_balance: newSavings,
           spendable_balance: newSpendable 
         })
         .eq('user_id', user.id);
 
       // Update ForgeScore
       await supabase
         .from('profiles')
         .update({ forge_score: newForgeScore })
         .eq('id', user.id);
 
       // Log transaction
       await supabase
         .from('transactions')
         .insert({
           user_id: user.id,
           amount: -amount,
           type: 'EMERGENCY_UNLOCK',
           destination_pool: 'SAVINGS',
           description: `Emergency Unlock (${reason}) - 5% Penalty Paid`,
           status: 'COMPLETED'
         });
 
       await supabase
         .from('transactions')
         .insert({
           user_id: user.id,
           amount: netAmount,
           type: 'EMERGENCY_CREDIT',
           destination_pool: 'SPENDABLE',
           description: `Emergency Funds Credit (Net of Penalty)`,
           status: 'COMPLETED'
         });
 
     } catch (err) {
       console.error("Emergency unlock failed:", err);
     }
   };
 
   const disburseLoan = async (amount: number) => {
    if (!user) return;
    try {
      const newSpendable = spendable + amount;
      setSpendable(newSpendable);

      await supabase
        .from('wallets')
        .update({ spendable_balance: newSpendable })
        .eq('user_id', user.id);

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: amount,
          type: 'LOAN_DISBURSEMENT',
          destination_pool: 'SPENDABLE',
          description: `Instant Credit Loan Disbursed`,
          status: 'COMPLETED'
        });
    } catch (err) {
      console.error("Loan disbursement failed:", err);
    }
  };

  return (
    <AppContext.Provider value={{ user, loading, spendable, savings, forgeScore, welfareTokens, currentApy, processPayout, sendPayment, claimDailyYield, simulateTimePassage, lockEmergencyFunds, disburseLoan, signOut }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

