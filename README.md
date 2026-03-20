# 🪐 Pluto - Intelligent CBDC-Powered Financial OS

Pluto is a next-generation financial operating system designed for the future of digital currency. Built on the **e-Rupee (CBDC)** stack, it combines the security of central bank money with the intelligence of programmable smart contracts and universal UPI interoperability.

![Pluto Banner](https://lh3.googleusercontent.com/aida-public/AB6AXuAnfX89_v8Zun58X0i-U5s6Pvh-1IuzrV-Zt-U1Vv-U9k-S-X-S-X-S-X-S-X-S-X-S-X)

## 🚀 Key Features

### 💎 ForgeScore™ (Financial Identity)
A cryptographic, behavior-based financial reputation score that unlocks access to uncollateralized credit and personalized yields without traditional banking histories.

### 🛡️ Smart-Contract Exceptions & Grievances
- **Emergency Savings Unlock**: Intelligently detect financial crises or employer disputes to instantly unlock locked emergency funds via pre-approved smart-contract exceptions.
- **P2P Dispute Resolution**: A streamlined interface for filing grievances on high-value CBDC transfers.

### 🔌 Universal UPI Interoperability
Bridge the gap between CBDC and standard payment networks. Pluto natively translates e-Rupee transactions to any of India's 50M+ standard UPI QR codes.

### 📶 Offline Tap-to-Pay (3D Vaults)
Execute micro-transactions in dead zones using secure, pre-authorized 3D vaults that sync back to the ledger once connectivity is restored.

### 🤖 AI Wealth Manager
An autonomous financial guardian that redirects small fractions of every income stream into automated "Forge" strategies based on real-time velocity analysis.

---

## 🛠️ Technical Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (Vite-based SPA)
- **Styling**: Vanilla CSS + [Lucide Icons](https://lucide.dev/)
- **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Routing**: React Router 7
- **PWA**: `vite-plugin-pwa` for 100% offline & installable capability

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Setup
Create a `.env.local` in the project root:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```

---

## 🌍 Deployment

Pluto is optimized for zero-downtime deployment on **Vercel** or **Netlify**.

1. Connect your GitHub repository.
2. Add your `VITE_SUPABASE_*` environment variables.
3. Use the following build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment**: See `.env.local`

---

## ⚖️ License
Internal use for the Pluto Project. All rights reserved.

---

> [!TIP]
> **Pro Tip**: Use the central **"+" Action Sheet** to quickly access the most common tools like Payouts, Pools, and the Forge Rules engine.
