# PrintCraft International

Premium printing-factory platform: cinematic 3D intro, public marketing site, customer portal and a separate admin console.
Business details (Faisalabad factory, CEO, contacts, garment-branding services, products, quote fields) come from the AI Studio reference app — see `reference/REFERENCE_NOTES.md`.

## Quick start

```bash
npm install
cp .env.example .env      # then set ADMIN_* and DEMO_CUSTOMER_* credentials
npm run dev               # API on :4000, site on http://localhost:5173
```

On first start the API creates `storage/printcraft.db`, seeds the catalogue and content, creates the admin and demo-customer accounts from `.env`, and adds clearly-flagged demo activity (sample customers, orders, inquiries, testimonials, portfolio).

| Command | What it does |
| --- | --- |
| `npm run dev` | API (tsx watch) + Vite dev server |
| `npm test` | End-to-end API workflow tests on a throwaway database |
| `npm run typecheck` | TypeScript for app, shared code and server |
| `npm run build` | Typecheck + production bundle in `dist/` |
| `npm start` | Production server: API + static `dist/` on `PORT` (default 4000) |
| `npm run seed` | **Wipes** the database and reseeds |

Sign-in pages: customers at `/login` / `/register`; staff at `/admin/login` (also linked as “Staff portal” in the footer).

Intro controls: plays once per browser on first visit to `/`; **Skip intro** or <kbd>Esc</kbd> skips; “Replay factory intro” in the footer replays; `?nointro` suppresses it; reduced-motion users never see it. In development, `?introfreeze=2.5` holds the shot at 2.5 s for inspection.

## Architecture

```
shared/     Zod schemas, constants (statuses, transitions, upload policy), pricing maths, API types — used by both sides
server/     Express 5 + node:sqlite (built into Node ≥ 22.13, no native deps)
  auth.ts       scrypt hashing, DB-backed sessions (httpOnly SameSite=Strict cookie), lockout, CSRF header guard, role guards
  uploads.ts    multer disk storage, extension allow-list + magic-byte verification, random stored names
  routes/       public · auth/account/notifications · customer · admin
src/
  components/three/   procedural factory scene (operator IK rig, hinged press, clip-plane ink reveal), hero + auth scenes
  components/intro/   intro gate, overlay, 2D fallback
  components/ui/      buttons, form fields, modal + confirm dialog, tables (cards on mobile), dropzone, feedback states
  pages/              public · auth · customer · admin · shared (notifications, account)
```

**Order lifecycle:** `pending_review → approved → in_production → quality_check → shipped → delivered`, with `rejected` / `cancelled` branches. Allowed moves live in `shared/constants.ts` (`ORDER_TRANSITIONS`) and are enforced on the server. Every move writes a timeline event and notifies the customer.

**Pricing:** each service has quantity tiers and a setup fee (Admin › Pricing). Customers see an indicative estimate; admins confirm the final price on approval.

**Security:** role-based route guards on client and server, per-owner data scoping, rate-limited auth and contact endpoints, 5-strike / 15-minute lockout, Helmet CSP, uploads served only as attachments to owner/admin, CSV formula-injection escaping, open-redirect-safe `next` handling.

**Performance:** route-level code splitting; three.js, React Three Fiber and Recharts load only where used (initial JS ≈ 75 KB gzip). 3D scenes mount only when visible, scale down on low-end devices (no shadows, lower DPR, fewer particles), fall back to SVG with no WebGL / data-saver, and are skipped entirely with `prefers-reduced-motion`.

## Demo data

Sample records carry `is_demo = 1` and show a **Demo** badge (testimonials show “Sample testimonial”). Remove them all from **Admin › Website content › Demo data**. Sample customers have random passwords and cannot sign in.

## Not included / next steps

- Outgoing email (notifications are in-app; the email preference is stored for when SMTP is configured).
- Payments — orders are quote-and-approve; no card handling.
- Self-service password reset — admins can issue a one-time temporary password from the customer page.
- Product photography — every item uses built-in vector mockups until an admin uploads photos.
