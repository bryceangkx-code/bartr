# MASTER_PROMPT.md — Bartr MVP Build

## Your Role
You are a senior full-stack engineer building Bartr — a creator-brand barter marketplace for Southeast Asia. You are building the full MVP in one session. Read `CLAUDE.md` fully before writing a single line of code.

## Mission
Build a working MVP of Bartr with the following features:
1. Auth + role-based onboarding (creator vs brand)
2. Creator profile with Instagram OAuth verification
3. Brand profile with product/service listings
4. Barter listing browse + apply flow
5. Deal status tracker

## Build Order — Follow This Exactly

### Phase 1: Project Setup
1. Initialise Next.js 14 with TypeScript, Tailwind, App Router
2. Install and configure shadcn/ui
3. Set up Supabase client (browser + server + middleware)
4. Create all SQL migrations (full schema from CLAUDE.md)
5. Enable RLS on all tables with correct policies
6. Set up environment variable structure

### Phase 2: Auth + Onboarding
1. Sign up page (email + password + role selection: creator / brand)
2. Login page
3. Supabase Auth middleware — protect all `/dashboard` routes
4. Post-signup onboarding flow:
   - Creator: display name, bio, location, niche tags (multi-select)
   - Brand: company name, website, category
5. Redirect logic: new user → onboarding → dashboard

### Phase 3: Creator Profile + Instagram OAuth
1. Creator dashboard home (shows profile completion %)
2. Instagram OAuth connect button
   - Redirect to Instagram Basic Display API
   - Handle callback, fetch followers + engagement rate
   - Save to `creator_profiles` table
   - Show verified badge once connected
3. Portfolio upload (up to 6 images via Supabase Storage)
4. Public creator profile page (`/creator/[id]`)

### Phase 4: Brand Profile + Listings
1. Brand dashboard home
2. Brand profile edit page
3. Create listing form:
   - Title, description, product value (SGD)
   - Deliverables required
   - Min followers, min engagement rate
   - Niche tags
4. Brand listings management page (view / pause / close own listings)
5. Public listing page (`/listings/[id]`)

### Phase 5: Discovery
1. Listings browse page (`/browse`) — visible to creators
   - Filter by niche, min product value
   - Card grid layout
2. Creator discovery page (`/creators`) — visible to brands
   - Filter by niche, min followers
   - Card grid layout

### Phase 6: Barter Flow
1. Creator applies to listing (with optional note)
2. Brand receives application in dashboard (list of applicants per listing)
3. Brand accepts or rejects
4. On accept: deal record created, status = `accepted`
5. Deal tracker page for both parties showing status timeline

## UI Guidelines
- Mobile-first, clean, modern
- Primary colour: use a warm coral/orange (`#FF6B4A` or similar) — evokes marketplace energy
- Font: Inter (already in Next.js)
- Card-based layouts for listings and creator profiles
- Use shadcn/ui: Button, Card, Badge, Input, Select, Textarea, Avatar, Tabs
- Empty states: always show a helpful empty state with a CTA (don't show blank pages)
- Loading states: use skeleton loaders (shadcn Skeleton) for all async content

## Supabase RLS Policies to Implement
```sql
-- profiles: users can read all, only edit own
-- creator_profiles: users can read all, only edit own
-- brand_profiles: users can read all, only edit own
-- listings: anyone can read active listings, only brand owner can insert/update
-- deals: creator and brand involved can read, creator can insert, brand can update status
```

## Instagram OAuth Flow
```
1. User clicks "Connect Instagram"
2. Redirect to: https://api.instagram.com/oauth/authorize
   - client_id: INSTAGRAM_APP_ID
   - redirect_uri: NEXT_PUBLIC_APP_URL/api/instagram/callback
   - scope: user_profile,user_media
   - response_type: code
3. Instagram redirects to /api/instagram/callback?code=xxx
4. Exchange code for access token (server-side POST to Instagram)
5. Fetch user profile: GET https://graph.instagram.com/me?fields=id,username,followers_count,media_count
6. Calculate engagement rate from recent media (likes + comments / followers)
7. Save to creator_profiles
```

Note: Instagram Basic Display API requires app review for public use. For MVP/dev, use test users added in the Instagram developer portal.

## Error Handling Rules
- All Supabase calls: check `error` and show toast notification on failure
- Instagram OAuth: handle token exchange failure gracefully with user-facing error
- Form validation: use react-hook-form + zod for all forms
- Never expose service role key to client — only use in API routes

## Definition of Done
The MVP is complete when:
- [ ] A creator can sign up, connect Instagram, and have a public profile
- [ ] A brand can sign up, create a listing, and have it appear on the browse page
- [ ] A creator can apply to a listing with a note
- [ ] A brand can accept/reject applications from their dashboard
- [ ] Both parties can see deal status on a tracker page
- [ ] All routes are protected appropriately
- [ ] RLS is enforced on all tables
- [ ] The app runs without errors on `npm run dev`
- [ ] No TypeScript errors (`npm run type-check` passes)

## Start Command
Begin with Phase 1. Confirm completion of each phase before moving to the next. After each phase, run `npm run dev` and verify no errors before continuing.
