# 🌱 EdenShare v3

**A coordination layer for regenerative communities.**

EdenShare connects communities, landowners, and seekers through a map-based platform built on trust, transparency, and real-world collaboration.

Part of the **Edverse** ecosystem.

## Stack

- **Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Framer Motion
- **Globe:** react-three-fiber · drei · Three.js
- **Map:** Mapbox GL
- **Auth:** Supabase Auth
- **Database:** PostgreSQL · Prisma ORM
- **Realtime:** Supabase Realtime
- **Payments:** Stripe (phase 2)
- **Deployment:** Vercel + Supabase

## Features (v3 MVP)

- Interactive 3D globe with community nodes
- 2D operational map with filters
- User profiles with trust scores and verification badges
- Community pages with members and listings
- Land / Resource / Service listings with detailed info
- Request & match workflow
- Real-time messaging
- Double-sided reviews (no deletions)
- Multi-step onboarding flow
- Dashboard with activity feed
- Admin/moderation tools
- Responsive design (mobile-first)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Generate Prisma client
npx prisma generate --schema=prisma/schema.prisma

# Run database migrations
npx prisma migrate dev --schema=prisma/schema.prisma --name init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
Edenshare/
├── apps/web/              # Next.js application
│   └── src/
│       ├── app/           # Pages (App Router)
│       │   ├── components/  # Shared components
│       │   ├── dashboard/   # User dashboard
│       │   ├── explore/     # Globe + map explorer
│       │   ├── listings/    # Listings index + detail
│       │   ├── communities/ # Communities index + detail
│       │   ├── messages/    # Real-time messaging
│       │   ├── profile/     # User profile
│       │   ├── onboarding/  # Multi-step onboarding
│       │   ├── login/       # Authentication
│       │   └── register/
│       └── lib/           # Utilities
├── packages/
│   ├── ui/                # Shared UI components
│   ├── types/             # Domain type definitions
│   └── config/            # Shared configs
├── prisma/
│   └── schema.prisma      # Full database schema
└── docs/
    └── architecture.md    # Technical architecture
```

## Design Philosophy

- **Globe = emotional discovery** — the "wow" layer
- **2D Map = practical search** — the "use" layer
- **Trust-first** — ID verification, honest reviews, transparent safety
- **Community-driven** — built around real pain points from Reddit, Discord, WWOOF and land-sharing forums
- **Ship-ready** — every page is functional, responsive, and polished

## License

MIT — Built by Edverse.
