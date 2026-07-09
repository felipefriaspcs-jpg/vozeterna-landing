# VozEterna Landing Page

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run start
```

## Deploy

Push to GitHub, then import the repo into Vercel or Cloudflare Pages.

Suggested Vercel settings:
- Framework: Next.js
- Build command: npm run build
- Output: .next

For the MVP, connect CTA buttons to:
- Stripe Payment Links for refundable beta deposits or paid manual packages
- A lead form / waitlist / Calendly link
