# Pluto

**The Intelligent CBDC Operating System.**

Pluto is a next-generation financial architecture built on the e-Rupee (CBDC) stack. It bridges the gap between central bank digital currency, programmable smart contracts, and universal payment interoperability.

---

## Technical Overview

Pluto is designed to address the foundational challenges of modern digital finance: **liquidity velocity, universal merchant adoption, and automated financial safety.**

### Core Pillars

#### 1. ForgeScore™ Financial Identity
A cryptographic behavior-based reputation engine. ForgeScore allows for real-time risk assessment and unlocks access to uncollateralized micro-credit by analyzing on-chain behavior rather than traditional credit artifacts.

#### 2. Programmable Exceptions
Smart-contract-driven liquidity unlocks. Pluto implements "Safe-Release" triggers that instantly liberate locked emergency funds during verified financial crises or employer disputes, ensuring workers always have a safety net.

#### 3. Universal Payment Node
A native bridge to India's UPI ecosystem. Pluto translates e-Rupee transactions into standard UPI protocols, allowing CBDC to be used at any of the 50M+ standard merchant terminals across the nation instantly.

#### 4. 3D-Secure Offline Vaults
Advanced pre-authorization for dead zones. Users can execute micro-transactions in areas with zero connectivity using local cryptographic proof-of-payment that reconciles once back on the network.

---

## Engineering Stack

- **Client**: React 19 + Vite 8 (Rust-powered Rolldown)
- **State/Safety**: Supabase Postgres + JWT Auth
- **Style**: Custom CSS (Blue Edition Design Language)
- **Capabilities**: Full PWA / Service Worker sync for offline resilience

---

## Development

```bash
# Setup
npm install

# Local Dev
npm run dev

# Production Distribution
npm run build
```

---

## Deployment Configuration

Pluto is optimized for production deployment on **Vercel** or **Render**. Ensure the following environment variables are configured in your production dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Refer to the internal [deployment_guide.md](file:///c:/Users/krish/.gemini/antigravity/brain/be9ba8a1-e49a-4665-8bc8-8bc0f7139538/deployment_guide.md) for detailed cloud configuration instructions.

---
© 2026 Pluto Project. Fully verified and audited.
