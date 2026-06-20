# Rialo Guard Desk v0.4 — Showcase Edition

This is a frontend-only demo built for presentations. It starts on a cinematic public landing page and then enters the product workspace.

## What changed

- New full-viewport public website / landing page at the root route.
- `Enter Personal Wallet` opens the wallet flow; `Open Team Guard` opens the team console.
- The app still contains the original demo flows: wallet import/generate/reset, transfer requests, Swap / Bridge, approvals, policies, address book, agent controls, vault and audit.
- Inner pages now use the same dark cinematic Liquid Glass visual system as the landing page.
- Wallet balance typography was reduced and restructured into smaller asset tiles.
- Image/video editorial blocks were added to make the product feel like a polished product surface rather than a generic dashboard.

## Demo safety

This project is **presentation-only**:

- no backend
- no RPC transaction broadcast
- no real on-chain Swap
- no real private key encryption or secure wallet custody
- all state is only in browser memory during the current session

Never use a real wallet private key or seed phrase in a demo build.

## Local startup

```bash
npm install
npm run dev
```

Open the address printed by Vite, normally `http://127.0.0.1:5173/`.

## Build for deployment

```bash
npm run build
```

Upload the contents of `dist/` to the web root of your Nginx static site.
