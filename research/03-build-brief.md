# Bartr — Website Build Brief

**Status: AWAITING APPROVAL — Do not build until approved**

---

## Strategic Positioning

Bartr is the only self-serve, cash-free, barter-first influencer marketplace built for Southeast Asia with no minimum follower requirement. That combination is genuinely unowned.

**What we're NOT building:** A generic SaaS homepage. An agency tool. Another Partipost clone.

**What we ARE building:** The category-defining homepage for barter influencer marketing in SEA — that feels as polished as Statusphere but as accessible as Social Cat, with a Southeast Asian cultural identity woven through.

---

## Design Direction

### Color Palette (refined from current)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Violet | `#7C3AED` |
| Primary light | Violet tint | `#F5F3FF` |
| Accent | Energetic orange | `#FF6B35` |
| Dark | Near-black | `#1A1714` |
| Muted | Warm gray | `#6B6560` |
| Background | Off-white | `#FAFAF8` |
| Card | Pure warm white | `#FFFFFF` |

**Rationale:** Keep the violet brand identity (strong, distinct from every competitor). Add orange as a secondary accent for CTAs and energy — it complements violet on the color wheel and adds warmth that feels appropriate for Southeast Asia. Off-white background instead of pure white adds subtle premium feel.

### Typography
| Role | Font | Source |
|------|------|--------|
| Display / H1-H2 | Instrument Serif | Google Fonts |
| Body / UI | DM Sans | Google Fonts |
| Monospace (optional) | JetBrains Mono | Google Fonts (for stats/numbers) |

**Rationale:** Instrument Serif adds editorial credibility without feeling old. DM Sans is modern, legible at small sizes, and scores well in SaaS contexts. This combination is used by zero Bartr competitors — immediately distinctive.

### Photography / Visual Style
- **Creator content:** Real, casual, unposed — phones held up, content being shot in real spaces (cafes, outdoors, studios)
- **Product shots:** Clean flat lays with Southeast Asian context (batik, rattan, local textures as accents)
- **Avoid:** Corporate stock imagery, Western lifestyle photos, generic diverse-hands imagery
- **Placeholder note:** All hero images should be clearly marked for replacement with real creator photos once available

### Animation
- Scroll-triggered fade-up on section entries (100ms staggered delay between items)
- Number count-up on stats when they enter viewport
- Hover lift (translateY -4px + shadow) on listing and creator cards
- Hero: animated "deal cards" floating into place to show the platform in motion
- Smooth page scroll with CSS `scroll-behavior: smooth`
- `prefers-reduced-motion` respected for all animations

---

## Site Architecture

### Pages to Build Now

| Page | Priority | Purpose |
|------|----------|---------|
| `/` (Homepage) | P0 | Conversion + brand impression |
| `/browse` (Listings) | P0 | Already built — enhance UI |
| `/blog` (Blog index) | P1 | Already built — SEO engine |
| `/about` | P1 | Trust + founding story |
| `/pricing` | P1 | Reduce friction, explain credits |

### Navigation Structure
```
[Logo]  Browse  Blog  About  Pricing  |  Log in  [Get started →]
```

### Homepage Section Order
1. **Hero** — Headline + subhead + dual CTA + hero visual
2. **Social proof bar** — Creator count + brand count + deals completed (count-up)
3. **How it works** — 3 steps for each audience (tabbed: Creator / Brand)
4. **Browse teaser** — 3 featured listings, "See all →"
5. **Creator benefits** — 5 benefits with icons
6. **Brand benefits** — 5 benefits with icons
7. **Blog teaser** — 3 latest posts
8. **Bottom CTA** — "Ready to barter smarter?" + dual CTAs
9. **Footer** — Links, copyright, social links

---

## Content Framework

### Homepage Headline Options
**Recommended Option A (most SEO-friendly):**
> "Get brand deals without an agent."
> *subhead:* "Bartr connects Southeast Asian creators and brands for product-for-content partnerships. Free to join. No minimum followers."

**Option B (emotion-first, keep current hero vibe):**
> "Your content is worth more than likes."
> *subhead:* "Get real products from Singapore brands in exchange for honest content. No cash. No agents. Just bartr."

**Option C (outcome + geo):**
> "The barter marketplace for Southeast Asian creators."
> *subhead:* "Trade your content for products from brands across Singapore, Malaysia, and beyond. Zero cash. No middlemen."

**My recommendation:** Option A for SEO + clarity. Add Option B's emotional punch as a supporting line.

### Social Proof Numbers (use conservative/honest estimates)
- "150+ creators" (or your real number)
- "50+ brand listings"
- "Built for Singapore & Southeast Asia"

### Section-by-Section Copy Direction

**How It Works — Creators:**
- H3: "How it works for creators"
- Step 1: "Build your profile in minutes" — Add your niche, platforms, and content style. No follower minimum.
- Step 2: "Browse and apply to deals" — Filter by product type and value. Apply to brands that fit your audience.
- Step 3: "Create content, keep the product" — Receive the product, make your content, deliver and done.

**How It Works — Brands:**
- H3: "How it works for brands"
- Step 1: "List your product" — Describe what you're offering, what content you need, who you're looking for.
- Step 2: "Review creator applications" — Filter by niche, following size, and engagement. Choose who fits.
- Step 3: "Ship and receive content" — Send the product. Receive authentic UGC. No cash changes hands.

**Creator Benefits (5):**
1. Zero minimum followers — "Whether you have 500 or 50,000, you can apply."
2. No intermediaries — "Apply directly. No agent fees, no platform cuts."
3. Real products, honest reviews — "Keep everything you receive. Post what you genuinely think."
4. Build your portfolio — "Every deal adds to your profile and track record."
5. Niche-matched deals — "Only see listings that fit your content category."

**Brand Benefits (5):**
1. Authentic UGC at product cost — "Trade product for content. No inflated influencer rates."
2. Access to micro and nano creators — "Reach highly engaged audiences that macro-influencers can't."
3. Fast, direct applications — "Creators come to you. Review, approve, and ship."
4. Southeast Asia-native network — "Creators who know your market, your culture, your language."
5. Free to start — "List your first product and find creators before spending a dollar."

---

## Conversion Playbook

### Primary Conversion Goals
- **Creator:** Sign up → complete profile → submit first application
- **Brand:** Sign up → post first listing → receive first application

### Lead Capture Strategy
- No email capture wall — marketplace requires two-sided trust, so both sides should be able to browse before signing up
- Browse listings page should show locked "apply" button with "Sign up to apply" prompt
- Consider a "Creator early access" badge for first 500 signups

### Social Proof Plan
**Immediate (add now):**
- Creator count badge in hero
- "Join creators and brands across Singapore and Southeast Asia" line
- Trust line: "Free to join · No credit card · No minimum followers"

**Medium term (when available):**
- First brand logos (even 3-5 logos is a strip)
- One creator quote/testimonial with photo
- Media mention if/when one appears

### Trust Signals
- [ ] "Free to join" visible above the fold
- [ ] "No minimum followers" in creator value prop
- [ ] "No cash changes hands" in brand value prop
- [ ] Privacy/terms links in footer
- [ ] SSL badge implicit from HTTPS
- [ ] "Built for Southeast Asia" as geographic trust signal

---

## SEO Strategy (Content + Technical)

### Priority Keywords to Target
1. "barter influencer marketing Singapore" — build page + blog posts
2. "micro influencer platform Singapore" — homepage optimization
3. "product seeding platform Southeast Asia" — About/Pricing page copy
4. "creator marketplace Singapore" — Homepage + Browse page

### Blog Cadence
- Current: 5 posts (good foundation)
- Target: 2 posts/month minimum
- Suggested next 3 posts:
  1. "Top 10 Brands in Singapore Offering Barter Deals [2026]"
  2. "How to Get Your First Brand Deal as a Nano Creator in Singapore"
  3. "Product Seeding vs. Paid Influencer Marketing: Which Is Right for Your Brand?"

### Technical SEO Checklist
- [x] `app/sitemap.ts` — already built
- [x] `app/robots.ts` — already built
- [ ] Structured data (Organization schema on homepage)
- [ ] OG images per page
- [ ] Canonical tags

---

## What to Build Next

### Immediate (P0 — this session)
1. **Homepage enhancement** — Add social proof numbers, Instrument Serif + DM Sans fonts, orange accent CTA color, hero visual placeholder, and improved copy
2. **About page** — Brand story, mission, Southeast Asia focus, team section placeholder

### Short-term (P1)
3. **Pricing page** — Credits explainer, "Free to join" + brand credits model
4. **Homepage logo strip** — Placeholder row with "Brand partners" label ready for logos
5. **Creator testimonial component** — Quote card with photo, name, niche, follower count

---

## Hard Stop — Approval Required

**Before any build work begins, the user must approve:**

1. **Headline choice** — A, B, or C (or a custom variant)
2. **Orange accent color** — Add `#FF6B35` or keep violet-only palette?
3. **Instrument Serif typography** — Approve the font direction
4. **Page priority** — Confirm starting with Homepage enhancement + About page

Once approved, build begins immediately.
