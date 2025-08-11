# SmartHive Automation – Quote Builder + 3D Demo (Next.js)

Production‑ready starter for a smart home automation company website with:

- **Quote Generator** (itemized devices, installation, labor, taxes)
- **Auth** (email + password via NextAuth Credentials Provider)
- **Postgres + Prisma** (devices, quotes, quote items, users)
- **3D Smart Home Demo** using React Three Fiber
- Tailwind UI, App Router, TypeScript

## Quick Start

### 1) Clone & install
```bash
pnpm i   # or npm i / yarn
```

### 2) Database
Use Docker (recommended) or a hosted Postgres (e.g. Neon).

**Docker Compose (local):**
```bash
docker compose up -d
```

Set env:
```
cp .env.example .env
# edit DATABASE_URL if needed
```

Push schema & seed devices:
```bash
pnpm db:push
pnpm db:seed
```

### 3) Run
```bash
pnpm dev
# open http://localhost:3000
```

### 4) Create your first user
Go to **Register** → create account → Sign in.

### Notes

- Quote saving requires sign‑in.
- 3D model is a schematic; replace with a GLB model later if you have one.
- Pricing is seeded in `prisma/seed.cjs`. Adjust unit prices and install costs to your market.
- To deploy: Vercel for the app + a managed Postgres (Neon/Render). Add `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` to environment variables.

## Scripts

- `pnpm db:push` – Create/update database schema
- `pnpm db:seed` – Seed catalog devices
- `pnpm build` – Build for production
- `pnpm start` – Start production server
```

