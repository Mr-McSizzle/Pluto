import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import SplashScreen from './components/SplashScreen';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import LedgerCertificate from './pages/LedgerCertificate';
import CreditLoans from './pages/CreditLoans';
import Payouts from './pages/Payouts';
import WelfareTokens from './pages/WelfareTokens';
import MoreMenu from './pages/MoreMenu';
import OfflinePayments from './pages/OfflinePayments';
import SmartRules from './pages/SmartRules';
import OpenFinance from './pages/OpenFinance';
import CashOut from './pages/CashOut';
import Grievances from './pages/Grievances';
import SkillPassport from './pages/SkillPassport';
import WealthManager from './pages/WealthManager';
import TapToEmploy from './pages/TapToEmploy';

// Mock simple layout
const Layout = () => {
    return (
        <div className="w-full min-h-screen text-slate-100 font-display transition-all">
            <Outlet />
        </div>
    );
};

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splash_shown');
  });

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splash_shown', 'true');
  }, []);

  return (
    <AppProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ledger-certificate" element={<LedgerCertificate />} />
            <Route path="/credit-loans" element={<CreditLoans />} />
            <Route path="/payouts" element={<Payouts />} />
            <Route path="/welfare-tokens" element={<WelfareTokens />} />
            <Route path="/more-menu" element={<MoreMenu />} />
            <Route path="/offline-payments" element={<OfflinePayments />} />
            <Route path="/smart-rules" element={<SmartRules />} />
            <Route path="/open-finance" element={<OpenFinance />} />
            <Route path="/cash-out" element={<CashOut />} />
            <Route path="/grievances" element={<Grievances />} />
            <Route path="/skill-passport" element={<SkillPassport />} />
            <Route path="/wealth-manager" element={<WealthManager />} />
            <Route path="/tap-to-employ" element={<TapToEmploy />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
