# CLAUDE.md — Bartr

## What is Bartr?
Bartr is a creator-brand barter marketplace for Southeast Asia. Creators offer their content/influence in exchange for products or services from brands. No cash changes hands on pure barter deals. The platform verifies creator metrics via Instagram OAuth and uses a credits system for brand monetisation.

## Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend:** Node.js / Express (separate API server OR Next.js API routes — prefer Next.js API routes for MVP simplicity)
- **Database + Auth:** Supabase (PostgreSQL + Supabase Auth + Row Level Security)
- **File storage:** Supabase Storage (for profile photos, portfolio assets)
- **Instagram OAuth:** For creator metric verification (followers, engagement rate)
- **Deployment target:** Vercel (frontend) + Supabase (backend/DB)

## Project Structure
```
bartr/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, signup, onboarding)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── creator/        # Creator-specific pages
│   │   └── brand/          # Brand-specific pages
│   ├── api/                # Next.js API routes
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── creator/            # Creator-specific components
│   ├── brand/              # Brand-specific components
│   └── shared/             # Shared components
├── lib/
│   ├── supabase/           # Supabase client + server helpers
│   ├── instagram/          # Instagram OAuth helpers
│   └── utils.ts
├── types/                  # TypeScript types
├── supabase/
│   └── migrations/         # SQL migrations
└── CLAUDE.md
```

## Core User Types
1. **Creator** — Individual content creator / KOL. Has Instagram profile, follower count, engagement rate, niche tags, portfolio.
2. **Brand** — Company or individual brand. Has product/service listings, credit balance, brand category.

## MVP Feature Scope (build in this order)
1. **Auth + Onboarding** — Supabase Auth email/password, role selection (creator vs brand), basic profile setup
2. **Creator Profile** — Instagram OAuth connect, metric display (followers, ER), niche tags, bio, portfolio images
3. **Brand Profile** — Company info, category, product/service listings with barter value estimate
4. **Barter Listings** — Brands post what they're offering + what they want in return (post type, reach requirement)
5. **Discovery / Browse** — Creators browse brand listings, brands browse creator profiles
6. **Barter Request / Match** — Creator applies to a listing → brand reviews → accepts/rejects → deal created
7. **Deal Tracker** — Simple status tracker (Applied → Accepted → In Progress → Completed)

## Database Schema (Supabase)

### Tables
```sql
-- Users (extends Supabase auth.users)
profiles (
  id uuid references auth.users primary key,
  role text check (role in ('creator', 'brand')),
  display_name text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz default now()
)

-- Creator profiles
creator_profiles (
  id uuid references profiles primary key,
  instagram_handle text,
  instagram_user_id text,
  followers int,
  engagement_rate numeric(5,2),
  niches text[],
  portfolio_urls text[],
  verified_at timestamptz
)

-- Brand profiles
brand_profiles (
  id uuid references profiles primary key,
  company_name text,
  website text,
  category text,
  credits int default 0
)

-- Brand listings (what brands offer)
listings (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brand_profiles,
  title text,
  description text,
  product_value_sgd numeric(10,2),
  deliverables text,           -- what creator must produce
  min_followers int,
  min_engagement_rate numeric(5,2),
  niches text[],
  status text default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz default now()
)

-- Barter deals
deals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings,
  creator_id uuid references creator_profiles,
  brand_id uuid references brand_profiles,
  status text default 'applied' check (status in ('applied', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  creator_note text,
  brand_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)
```

## Key Constraints
- **Do not build a payment system** in MVP — pure barter only
- **Instagram OAuth** is required for creator verification — use Instagram Basic Display API
- **Row Level Security** must be enabled on all tables — users can only see/edit their own data (except listings which are public)
- **No real-time features** in MVP — polling is fine
- **Mobile-first UI** — most SEA creators are on mobile
- **English only** for MVP — no i18n needed yet

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Code Style
- TypeScript strict mode — no `any` types
- Use Supabase client from `lib/supabase/` — never import directly in components
- All DB queries go through `lib/` helper functions — not inline in components
- Use `shadcn/ui` components wherever possible — don't build primitives from scratch
- Error handling: always handle Supabase errors explicitly, never silently swallow
- Loading states: every async action must have a loading state in UI

## What NOT to build
- No admin panel (MVP)
- No messaging / chat system (MVP)
- No email notifications (MVP)
- No payment / credits purchase flow (MVP)
- No mobile app — web only
- No dark mode (MVP)
