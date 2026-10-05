# Pluto

**Experimental web prototype for programmable digital-money and CBDC-inspired financial workflows.**

Pluto explores product ideas around digital-wallet identity, programmable transaction rules, emergency-access logic, offline-resilient payment experiences, and interoperability-oriented UX.

> Concept / application prototype. This repository does not itself provide an official e₹, RBI, UPI, banking, credit, or regulated financial integration.

## Product concepts explored

### ForgeScore

A behavior-oriented financial reputation concept intended to explore alternatives to purely collateral-driven interfaces. Any real-world lending or scoring use would require regulated data access, fairness analysis, risk governance, and independent validation.

### Programmable exception rules

UI and application concepts for conditional financial actions — for example, representing emergency-release or policy-triggered payment logic.

### Interoperable payment experience

The interface explores how CBDC-style and conventional payment experiences might coexist from a user's point of view. Production UPI or e₹ interoperability is outside the scope of the checked-in prototype.

### Offline-resilient flows

The project explores the user experience of payments that can survive intermittent connectivity and reconcile later. Secure real-world offline value transfer would require hardware-backed keys, replay protection, settlement rules, and regulated infrastructure beyond this prototype.

## Technology

- React 19
- TypeScript
- Vite
- React Router
- Supabase client integration
- PWA / service-worker tooling
- Custom responsive UI

## Development

```bash
npm install
npm run dev
```

Production builds:

```bash
npm run build
```

Supabase-backed features require valid environment configuration.

## Status

Fintech concept prototype. The interesting part of Pluto is the **product and systems design problem** around programmable money — not a claim that the repository implements or audits national payment infrastructure.