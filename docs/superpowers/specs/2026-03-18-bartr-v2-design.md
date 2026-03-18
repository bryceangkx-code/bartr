# Bartr V2 Design Spec
**Date:** 2026-03-18
**Status:** Approved
**Scope:** Visual refresh + functional fixes + credit system + blog + Instagram verification

---

## 1. Overview

Bartr is a creator-brand barter marketplace for Southeast Asia (Singapore-first). This spec covers the next major iteration of the product, addressing four areas:

1. **Visual refresh** — color system, landing page, auth/onboarding UX
2. **Critical fixes** — missing API route, dead code removal
3. **Monetisation** — brand credit wallet via Stripe
4. **New features** — blog (SEO/AEO), Instagram OAuth verification, Reports scaffold

The primary audiences are **creators** (supply) and **brands** (demand), both equally important. The landing page must convert both.

---

## 2. Color System

Replace all indigo references with violet across the entire codebase.

| Token | Old | New |
|---|---|---|
| Primary | `#4F46E5` (indigo-600) | `#7C3AED` (violet-600) |
| Primary hover | `#4338CA` (indigo-700) | `#6D28D9` (violet-700) |
| Light background | `bg-indigo-50` | `bg-violet-50` |
| Light text | `text-indigo-*` | `text-violet-*` |
| Shadows | `shadow-indigo-200` | `shadow-violet-200` |
| Tailwind config | `--primary: 231 100% 64%` (indigo HSL) | `--primary: 263 70% 50%` (violet HSL) |

**Implementation:** Global find-and-replace across all `.tsx`, `.ts`, `.css`, and config files. Update `tailwind.config.ts` CSS variables and the `coral`/`primary` custom color keys.

---

## 3. Landing Page (`app/page.tsx`)

### 3.1 Navbar
- Logo left: "Bartr" in violet, font-bold
- Right: "Log in" (ghost) + "Get started free" (violet filled button)
- "Get started free" links to `/signup`
- Sticky, `backdrop-blur`, border-bottom on scroll

### 3.2 Hero
- **Headline:** "Your content is worth more than likes"
- **Subhead:** "Bartr connects Southeast Asian creators and brands for product-for-content partnerships. No cash. No agents. Just real deals."
- **CTAs (side by side):**
  - "Join as a Creator" → `/signup?role=creator` (violet filled)
  - "List a Product" → `/signup?role=brand` (violet outline)
- No social proof bar — no fake metrics on a new product

### 3.3 How It Works (Two-track)
Two columns — Creator track and Brand track — each with 3 steps:

**Creator track:**
1. Build your profile → add Instagram stats (verified or self-reported)
2. Browse listings → filter by niche and product value
3. Apply → receive products, create content

**Brand track:**
1. Post a listing → describe your product and deliverables
2. Review applications → filter by followers, engagement, niche
3. Ship the product → get authentic UGC content

### 3.4 For Creators / For Brands
Keep the split card layout. Two cards side by side:
- **Creators card** (violet-50 bg): benefit list, "Join as a Creator" CTA
- **Brands card** (gray-900 bg): benefit list, "List a Product" CTA

No fabricated testimonials or stats.

### 3.5 Final CTA Banner
- Violet background
- Headline: "Ready to barter smarter?"
- Subhead: "Join creators and brands across Singapore and Southeast Asia."
- Single CTA: "Create your free account"

### 3.6 Footer
- Links: Log in · Sign up · Browse listings · Blog
- Copyright line
- No social links for now

---

## 4. Auth Pages

### 4.1 Signup (`app/(auth)/signup/page.tsx`)
**Remove:**
- `emailSent` state variable
- `setEmailSent(true)` call
- Entire "Check your email" JSX block (the `if (emailSent)` render path)
- `Mail` import from lucide-react (no longer needed)

**Add:**
- 3-step progress hint below the form heading:
  > "Pick your role → Complete your profile → Start browsing"
- Pre-select role tile if URL has `?role=creator` or `?role=brand` query param (from landing page CTAs)

### 4.2 Login (`app/(auth)/login/page.tsx`)
- Recolor all indigo references to violet
- Make "Don't have an account?" signup link more prominent (increase font weight, violet color)

### 4.3 Onboarding (`app/(auth)/onboarding/onboarding-form.tsx`)
- Add role-aware header at the top of the form:
  - Creator: "You're joining as a Creator 🎨"
  - Brand: "You're joining as a Brand 🏢"
- Add role-aware "what happens next" one-liner below the header:
  - Creator: "Once done, you'll be able to browse product listings and apply to brands."
  - Brand: "Once done, you can post your first product listing and start receiving creator applications."

---

## 5. Navigation (`components/shared/nav.tsx`)
- Recolor logo and active states to violet
- Add active link indicator: violet underline (`border-b-2 border-violet-600`) on current route using `usePathname()`
- Clean up mobile menu spacing

---

## 6. Critical Bug Fix

### 6.1 Modify existing `/api/listings/create` route
`app/api/listings/create/route.ts` exists but lacks credit gating. **Do not rewrite** — add the following to the existing route:
- **Credit check**: fetch brand's `credits` from `brand_profiles`; return 402 if < 1
- On successful listing insert: decrement `credits` by 1 and insert a `credit_transactions` row (`action: 'post_listing'`, `amount: -1`, `listing_id`)
- All existing auth, role, and field validation logic must be preserved

---

## 7. Credit System

### 7.1 Data Model

**Add to `brand_profiles`:**
```sql
credits INTEGER NOT NULL DEFAULT 0
```

**New table `credit_transactions`:**
```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES profiles(id),
  amount INTEGER NOT NULL, -- positive = top-up, negative = spend
  action TEXT NOT NULL, -- 'topup', 'post_listing', 'feature_listing', 'admin_grant'
  stripe_session_id TEXT UNIQUE, -- populated for Stripe top-ups; UNIQUE enforces idempotency
  listing_id UUID REFERENCES listings(id), -- populated for spend actions
  note TEXT, -- free-text label, used by admin_grant for audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**RLS policies:**
- Brand can read own transactions
- Service role can insert (API routes use admin client)

### 7.2 Credit Actions & Costs

| Action | Cost |
|---|---|
| Post a listing | 1 credit |
| Feature a listing (top of /browse) | 2 credits |
| View a report (future) | TBD |

### 7.3 Stripe Integration

**Credit packs:**
| Pack | Credits | Price (SGD) |
|---|---|---|
| Starter | 5 | S$15 |
| Growth | 15 | S$40 |
| Pro | 30 | S$75 |

**Flow:**
1. Brand clicks "Buy Credits" in dashboard
2. POST `/api/stripe/checkout` → creates Stripe Checkout Session → returns URL
3. Brand completes payment on Stripe hosted page
4. Stripe sends webhook to `/api/stripe/webhook`
5. Webhook verifies signature; check for existing `credit_transactions` row with same `stripe_session_id` — if found, return 200 and skip (idempotency guard)
6. Credit brand's wallet, insert `credit_transactions` row
7. Brand redirected to `/dashboard/brand?credits=success`

**Env vars needed:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### 7.4 Brand Dashboard Credit UI
- Credit balance shown prominently in brand dashboard header: "⚡ 5 credits"
- "Buy Credits" button opens credit pack selector
- Transaction history tab in dashboard showing spend + top-up history

### 7.5 Admin Credit Grant
`POST /api/admin/credits` (service role only):
- Body: `{ brand_id, amount, note }`
- Validate that `brand_id` exists in `brand_profiles` before granting — return 404 if not found
- Adds credits + inserts `credit_transactions` row with `action: 'admin_grant'`, `note` stored on the row
- Protected by `ADMIN_SECRET` env var header check (`x-admin-secret` header must match)

### 7.6 Listing Creation Gate
`/dashboard/brand/listings/new`:
- On page load, check brand's credit balance
- If 0 credits: show "You need credits to post a listing" banner with "Buy Credits" CTA
- If ≥ 1 credit: show form normally, display "This will use 1 credit" notice before submit

---

## 8. Instagram Verification (Facebook Login + Graph API)

### 8.1 Overview
Creators can connect their Instagram Business or Creator account via Facebook Login. This pulls verified stats (follower count, username) directly from the Instagram Graph API. Creators without Business/Creator accounts can still enter stats manually (shown as "Self-reported").

### 8.2 Data Model

**Add to `creator_profiles`:**
```sql
instagram_verified BOOLEAN NOT NULL DEFAULT false,
instagram_access_token TEXT, -- encrypted, stored server-side only
instagram_token_expires_at TIMESTAMPTZ
```

### 8.3 OAuth Flow
1. Creator clicks "Connect Instagram" on profile page
2. Redirect to Facebook OAuth: `https://www.facebook.com/v19.0/dialog/oauth?...`
   - Scopes: `instagram_basic`, `pages_show_list`, `instagram_manage_insights`
   - Note: only works for Instagram Business or Creator accounts linked to a Facebook Page
3. Facebook redirects to `/api/auth/instagram/callback?code=...`
4. Exchange code for access token via server-side call
5. Call Graph API: `GET /me/accounts` → get connected Instagram Business Account
6. Call `GET /{ig-user-id}?fields=username,followers_count,media_count`
7. Calculate engagement rate from recent 12 posts: fetch `GET /{ig-user-id}/media?fields=like_count,comments_count,timestamp`, average `(likes + comments) / followers_count * 100`
8. Store verified stats + encrypted token in `creator_profiles`
9. Set `instagram_verified = true`
10. Redirect to `/dashboard/creator/profile?instagram=connected`

**Env vars needed:**
```
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

### 8.4 Verified Badge
- Public creator profile (`/creator/[id]`): "✓ Verified via Instagram" badge next to handle
- Browse creators page (`/creators`): small verified checkmark on creator cards
- Brand applications view: verified badge next to creator name
- Self-reported stats labelled: "Self-reported" in muted text

### 8.5 Token Refresh
Instagram long-lived tokens expire in 60 days. Refresh logic runs only when the authenticated creator views their own dashboard (not on public `/creator/[id]` pages, to avoid firing on every visitor):
- In `app/dashboard/creator/profile/page.tsx` (server component), check `instagram_token_expires_at`
- If within 7 days of expiry, call the Graph API refresh endpoint server-side and update the stored token
- If expired, set `instagram_verified = false` and show a "Reconnect Instagram" prompt
- Do not trigger refresh on unauthenticated or third-party profile views

---

## 9. Blog (`/blog`)

### 9.1 Structure
- `content/blog/` — MDX files, one per post
- `app/blog/page.tsx` — index listing all posts, sorted by date
- `app/blog/[slug]/page.tsx` — individual post page
- Posts statically generated at build time (`generateStaticParams`)

### 9.2 Post Frontmatter
```mdx
---
title: string
description: string      # used for meta description + card preview
date: YYYY-MM-DD
slug: string             # must match the filename (e.g. file: my-post.mdx → slug: my-post); filename takes precedence in generateStaticParams
tags: string[]
author: string           # defaults to "Bartr Team"
published: boolean       # defaults to true; set to false to hide from index and block the route
---
```

### 9.3 Starter Posts (SEA creator economy focus)
5 posts targeting high-intent search queries:

1. **"How to Get Brand Deals as a Micro-Influencer in Singapore"**
   Target: micro-influencers searching for their first brand deal

2. **"What is Barter Marketing? A Guide for Southeast Asian Creators"**
   Target: creators unfamiliar with product-for-content model

3. **"How Brands in Singapore Can Work with Influencers Without a Big Budget"**
   Target: SME brands exploring influencer marketing

4. **"Micro-Influencer vs Macro-Influencer: Which is Better for SEA Brands?"**
   Target: brand marketers researching influencer tiers

5. **"How to Write a Winning Creator Application (With Examples)"**
   Target: creators wanting to improve their application success rate

### 9.4 SEO
- Each post has a unique `<title>` and `<meta name="description">`
- OpenGraph tags for social sharing
- Canonical URL
- Blog linked from footer on all pages

---

## 10. Reports Scaffold

### 10.1 Brand Dashboard — Reports Tab
- Add "Reports" tab to brand dashboard navigation
- Page shows: "AI-powered creator performance reports — coming soon"
- Display the future credit cost: "Each report will cost 3 credits"
- Static "coming soon" state only — no email capture form in this iteration (avoids ambiguity around data storage)

### 10.2 Future State (not built now)
When a deal is marked `completed`, Claude API will generate a report containing:
- Estimated reach and impressions
- Content quality assessment
- Audience fit score
- Recommendations for future partnerships

---

## 11. Database Migrations Required

```sql
-- Migration 003: credit system + instagram verification
-- NOTE: brand_profiles.credits already exists in 001_initial_schema.sql — do NOT re-add
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS instagram_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS instagram_token_expires_at TIMESTAMPTZ;

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('topup', 'post_listing', 'feature_listing', 'admin_grant')),
  stripe_session_id TEXT UNIQUE, -- UNIQUE constraint provides idempotency for Stripe webhooks
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON credit_transactions(brand_id);
CREATE INDEX ON credit_transactions(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands read own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = brand_id);
```

---

## 12. New Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Facebook / Instagram Graph API
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Admin
ADMIN_SECRET=
```

---

## 13. Files Affected / Created

### Modified
- `tailwind.config.ts` — violet color system
- `app/globals.css` — CSS variable update
- `app/page.tsx` — full landing page rewrite
- `app/(auth)/signup/page.tsx` — remove dead email state, add progress hint, role pre-select
- `app/(auth)/login/page.tsx` — recolor
- `app/(auth)/onboarding/onboarding-form.tsx` — role-aware header + next-step hint
- `components/shared/nav.tsx` — violet active states
- `app/dashboard/brand/listings/new/page.tsx` — credit check gate
- `app/api/listings/create/route.ts` — add credit check + transaction insert (file already exists)
- All other files with hardcoded indigo color values

### Created
- `app/api/stripe/checkout/route.ts` — create Stripe Checkout Session
- `app/api/stripe/webhook/route.ts` — handle payment confirmation
- `app/api/admin/credits/route.ts` — admin credit grant
- `app/api/auth/instagram/callback/route.ts` — Instagram OAuth callback
- `app/blog/page.tsx` — blog index
- `app/blog/[slug]/page.tsx` — blog post page
- `content/blog/*.mdx` — 5 starter posts
- `app/dashboard/brand/reports/page.tsx` — reports scaffold
- `supabase/migrations/003_credits_instagram.sql` — DB migration

---

## 14. Out of Scope (Future)
- Local SEA payment methods (PayNow, GrabPay)
- AI report generation (Claude API integration)
- AEO content automation engine (separate project)
- TikTok / YouTube verification
- Featuring a listing UI (credit action defined but not built yet)
- Creator analytics dashboard
