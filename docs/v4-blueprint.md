# EdenShare v4 — Deep Platform Architecture Blueprint

**Version:** 4.0
**Date:** April 2026
**Status:** Pre-implementation blueprint

---

## TABLE OF CONTENTS

1. Reference Repos & What We Take From Each
2. User Types & Personas
3. Onboarding Flows (per user type)
4. App Architecture (public vs app)
5. Navigation & Layout Systems
6. Every Screen — Detailed Specifications
7. Database Schema Extensions
8. Component Library
9. Mobile Design System
10. Workflows & Triggers
11. Implementation Phases

---

## 1. REFERENCE REPOS & WHAT WE TAKE FROM EACH

### 1.1 From our earlier research (already identified):

| # | Repo | URL | What we extract |
|---|------|-----|-----------------|
| 1 | **Sharetribe Go** | github.com/sharetribe/sharetribe | Transaction engine pattern: listing → request → accept → agreement → review cycle. Multi-step listing creation with structured fields. Double-sided review system. Payment escrow flow. User verification states. Admin moderation queue. |
| 2 | **Stelace Marketplace Demo** | github.com/stelace/marketplace-demo | Headless marketplace API pattern. Typo-tolerant search with filters. Real-time messaging architecture. Map-based asset system with clustering. Rating aggregation. Availability calendar per listing. |
| 3 | **Cocorico** | github.com/Cocolabs-SAS/cocorico | Service marketplace booking flow. Calendar-based availability. Price per time unit (hour/day/week). Booking request → confirmation → completion → review pipeline. Dispute resolution workflow. |
| 4 | **Plantation Vegetation Web App** | github.com/coslynx/plantation-vegetation-web-app | Community/project modules. Interactive project maps. User profiles with skills. Forums and discussion boards. Resource directory pattern. Funding/donation integration. |
| 5 | **FarmOS** | github.com/farmOS/farmOS | Land parcel data model (fields, areas, assets). Crop/livestock tracking. Season/planting logs. Soil/water/climate metadata per parcel. GIS integration patterns. |
| 6 | **Greenstand Treetracker** | github.com/Greenstand/treetracker-web-map-client | Geo-tagged asset verification. Map client with Material UI. Tree/asset detail cards. Compensation/credit tracking. Photo verification workflow. |
| 7 | **AgroShare** | github.com/TheAlgo/Decentralized-Community-Farming | Community membership + roles. Investment/stake model. Task assignment within communities. Reputation scoring based on completed tasks. Decentralized governance concept. |

### 1.2 New repos identified for v4:

| # | Repo | URL | What we extract |
|---|------|-----|-----------------|
| 8 | **Open Food Network** | github.com/openfoodfoundation/openfoodnetwork | Producer → Hub → Consumer flow. Shop/storefront per producer. Product catalog with variants. Order cycle management. Multi-vendor marketplace with independent stores. Inventory management. Producer profile pages. |
| 9 | **Kiranism/next-shadcn-dashboard-starter** | github.com/Kiranism/next-shadcn-dashboard-starter | Sidebar layout with collapsible sections. RBAC navigation filtering. Data tables with server-side search/filter/pagination. Kanban board for task management. Chart components (Recharts). Feature-based folder structure. Mobile responsive sidebar → sheet. |
| 10 | **shadcnstore/shadcn-dashboard-landing-template** | github.com/shadcnstore/shadcn-dashboard-landing-template | Dual layout: dashboard + landing page in one project. Mail/chat/calendar app patterns. Theme customizer with live preview. Settings pages (profile, account, appearance, notifications). Error pages (404, 500). User management tables. |
| 11 | **taiwo-adewale/ecommerce-admin** | github.com/taiwo-adewale/ecommerce-admin | Supabase-backed e-commerce dashboard. Product management CRUD. Order tracking. Customer management. Notification system. React Query + Supabase pattern. Shadcn UI tables. |
| 12 | **react-shop/react-ecommerce** | github.com/react-shop/react-ecommerce | Monorepo: web + admin + server. Design system package. Product management with image galleries. Cart + checkout flow. Order history. Review system with ratings. |
| 13 | **vercel/commerce** | github.com/vercel/commerce | Next.js App Router e-commerce patterns. Server Components + Server Actions. Optimistic UI updates. Search with typeahead. Product grid with dynamic filtering. Cart management with useOptimistic. |
| 14 | **LiteFarm** | github.com/LiteFarm/LiteFarm | Farm management for small-scale farmers. Field/crop/task management. Worker management. Certification tracking. Sensor data integration. Mobile-optimized farm dashboard. Multi-language support. |
| 15 | **TailAdmin/free-nextjs-admin-dashboard** | github.com/TailAdmin/free-nextjs-admin-dashboard | 500+ UI components. 6 dashboard variations (SaaS, analytics, CRM, stock, marketing, e-commerce). Chart variations. Form elements library. Calendar component. Profile pages. Settings pages. |

---

## 2. USER TYPES & PERSONAS

### 2.1 Seeker / Explorer (free tier)
**Who:** Someone looking for land, resources, communities, or local produce.
**Goal:** Browse, discover, connect, message.
**Analogy:** Instagram user / Facebook Marketplace browser.

**What they see after login:**
- Feed of nearby listings (sorted by distance)
- Map with pins of what's available around them
- Community suggestions based on interests
- Messages from hosts/sellers
- Saved listings
- Their own profile (minimal — name, avatar, bio, interests, location)
- Notifications (new listings near me, messages, community invites)

**What they can DO:**
- Browse marketplace (listings)
- View listing details
- Save listings
- Send requests to hosts/sellers
- Message anyone
- Join communities
- Leave reviews after interactions
- Update their profile
- Set notification preferences

**What they CANNOT do:**
- Create listings (they'd need to upgrade to Producer)
- Manage a shop/storefront
- Create communities
- Access admin panel

### 2.2 Producer / Landowner / Seller (free tier, different onboarding)
**Who:** Someone with land, produce, resources, or services to offer.
**Goal:** List what they have, manage their storefront, connect with seekers.
**Analogy:** Etsy seller / Airbnb host / Facebook Marketplace seller.

**What they see after login:**
- **Shop Dashboard** (their own storefront management)
  - Overview: total views, active listings, pending requests, recent reviews, earnings
  - My Listings: create, edit, pause, delete, reorder
  - Requests: incoming requests with accept/reject
  - Reviews: all reviews left on their listings
  - Shop Settings: name, description, logo, cover image, policies, appearance
  - Analytics: views over time, top listings, conversion rate
- Messages
- Communities (they can also create communities)
- Explore/Map (same as seeker)
- Profile (richer — includes shop link, badges, trust score, skills)
- Notifications

**What they can DO (in addition to Seeker):**
- Create and manage listings (land, resources, services, produce)
- Upload up to 10 photos per listing with drag-to-reorder
- Set pricing, exchange type, availability
- Accept/reject/counter requests
- Customize their shop appearance (colors, layout)
- Create communities
- Post announcements in communities they own
- View shop analytics

### 2.3 Community Leader (extension of Producer)
**Who:** Someone who manages a community, co-op, or eco-village.
**Goal:** Grow and manage their community on the platform.
**Analogy:** Discord server owner / Facebook Group admin.

**What they see (in addition to Producer):**
- Community Dashboard
  - Member management (invite, approve, remove, assign roles)
  - Community listings (aggregate of member listings)
  - Announcements (create, pin, schedule)
  - Community analytics (member growth, listing activity, engagement)
  - Community settings (name, description, rules, privacy, appearance)
  - Join requests (if private community)

### 2.4 Admin (platform staff)
**Who:** EdenShare team.
**Goal:** Moderate content, manage users, resolve disputes, monitor health.

**What they see:**
- Platform analytics dashboard
- User management table (search, filter, suspend, delete, change role)
- Listing moderation queue (approve, reject, flag, delete)
- Community moderation
- Report resolution center
- Feature flags / settings

---

## 3. ONBOARDING FLOWS

### 3.1 Seeker Onboarding (4 steps, ~60 seconds)

**Step 1: Welcome + Role Selection**
- Screen: "What brings you to EdenShare?"
- Two big cards:
  - 🔍 "I'm looking for land, resources, or communities" → Seeker path
  - 🌱 "I have land, produce, or services to share" → Producer path
- Design: full-screen, centered, illustration behind cards, big touch targets

**Step 2: Location**
- Screen: "Where are you based?"
- Auto-detect with "Use my location" button (prominent)
- Manual fallback: City + Country fields
- Map preview showing their pin
- Privacy note: "Your exact location is never shared"
- Design: map background, single action

**Step 3: Interests**
- Screen: "What interests you?"
- Pill-style tags, 3 columns on mobile, scrollable
- Categories: Organic Produce, Permaculture, Urban Farming, Community Gardens, 
  Eco-Villages, Tool Sharing, Seed Exchange, Work Exchange, Homesteading, 
  Conservation, Food Forests, Composting, Beekeeping, Agroforestry, 
  Regenerative Ag, Off-Grid Living
- Minimum 3 required
- Design: colorful pills, selected = green fill, haptic-like press animation

**Step 4: Profile Quick Setup**
- Screen: "Set up your profile"
- Avatar upload (camera button, or tap to browse)
- Display name (pre-filled from signup if Google OAuth)
- Short bio (optional, with placeholder: "Tell people what you're about")
- "Skip for now" link + "Continue" button
- Design: avatar large and centered, form below

**After Step 4:**
- Redirect to **Home Feed** (not a "you're done" screen)
- First-time tooltip: "Here's what's near you — tap a listing to learn more"
- Bottom sheet prompt after 10 seconds: "Want to be notified when new listings appear near you?" → notification permission

### 3.2 Producer Onboarding (6 steps, ~2-3 minutes)

**Step 1:** Same role selection as Seeker (they chose Producer path)

**Step 2: Shop Setup**
- Screen: "Set up your shop"
- Shop name (this is their public storefront name)
- Shop logo upload
- Short tagline (max 100 chars): "What do you offer?"
- Design: preview card showing how their shop will look

**Step 3: Location**
- Same as Seeker Step 2
- Additional field: "How far are you willing to serve?" (radius slider: 5-100km)

**Step 4: What do you offer?**
- Screen: "What will you list?"
- Multi-select categories:
  - 🌾 Land / Farm / Garden plots
  - 🥕 Fresh produce / Goods
  - 🔧 Tools / Equipment
  - 🌱 Seeds / Plants / Seedlings
  - 💪 Services / Skills / Labor
  - 🏠 Accommodation / Stays
  - 📦 Other resources
- At least 1 required
- Design: icon + label cards, 2 columns

**Step 5: Profile Setup**
- Same as Seeker Step 4 but with additional fields:
  - Skills (tag input with autocomplete)
  - Years of experience (optional)
  - Certifications (optional, e.g., "Certified Organic", "PDC Completed")

**Step 6: Create Your First Listing**
- Screen: "Let's create your first listing"
- Simplified listing creation (title, description, 1-3 photos, type, exchange model)
- "Skip — I'll do this later" link
- If they create one → goes to their Shop Dashboard with the listing
- If they skip → goes to Shop Dashboard with empty state + "Create your first listing" CTA

---

## 4. APP ARCHITECTURE

### 4.1 Two Completely Separate Layouts

```
app/
├── (marketing)/           ← Public marketing site
│   ├── layout.tsx         ← Marketing navbar only
│   ├── page.tsx           ← Landing page
│   ├── about/
│   ├── pricing/
│   ├── login/
│   ├── register/
│   └── forgot-password/
│
├── (dashboard)/           ← Authenticated app
│   ├── layout.tsx         ← Sidebar (desktop) + Bottom tabs (mobile) + App header
│   ├── feed/              ← Home feed (Seeker default)
│   ├── explore/           ← Globe + Map + Search
│   ├── marketplace/       ← Browse all listings
│   ├── shop/              ← Producer's shop management
│   │   ├── page.tsx       ← Shop overview/dashboard
│   │   ├── listings/      ← My listings CRUD
│   │   ├── requests/      ← Incoming requests
│   │   ├── reviews/       ← Reviews on my listings
│   │   ├── analytics/     ← Shop analytics
│   │   └── settings/      ← Shop appearance & policies
│   ├── listings/
│   │   ├── [id]/          ← Listing detail (public view)
│   │   └── new/           ← Create listing (multi-step)
│   ├── communities/
│   │   ├── page.tsx       ← Browse communities
│   │   ├── new/           ← Create community
│   │   ├── [slug]/        ← Community detail
│   │   └── [slug]/manage/ ← Community management (leader only)
│   ├── messages/          ← Real-time chat
│   ├── notifications/     ← All notifications
│   ├── saved/             ← Saved listings
│   ├── requests/          ← My sent requests
│   ├── profile/
│   │   ├── page.tsx       ← Own profile (editable)
│   │   ├── [id]/          ← Other user's profile
│   │   └── edit/          ← Full profile editor
│   ├── settings/
│   │   ├── page.tsx       ← Settings hub
│   │   ├── account/       ← Email, password, delete
│   │   ├── appearance/    ← Theme, accent, layout
│   │   ├── notifications/ ← Notification preferences
│   │   └── privacy/       ← Visibility, location sharing
│   ├── admin/             ← Admin panel (role-gated)
│   │   ├── page.tsx       ← Admin dashboard
│   │   ├── users/         ← User management
│   │   ├── listings/      ← Listing moderation
│   │   ├── communities/   ← Community moderation
│   │   └── reports/       ← Report resolution
│   └── onboarding/        ← Post-signup onboarding
│
├── layout.tsx             ← Root: AuthProvider, ThemeProvider only
└── globals.css
```

### 4.2 Auth Guard

`(dashboard)/layout.tsx` checks authentication:
- If not logged in → redirect to `/login`
- If logged in but onboarding not completed → redirect to `/onboarding`
- If logged in and onboarded → render sidebar + content

---

## 5. NAVIGATION & LAYOUT SYSTEMS

### 5.1 Desktop Sidebar (280px, collapsible to 64px icons-only)

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  [🌱 Logo]  EdenShare            [◀ collapse]   │
│                                                  │
│  ─── DISCOVER ─────────────────                  │
│  🏠  Feed                           (active)    │
│  🗺️  Explore                                     │
│  🛒  Marketplace                                  │
│  👥  Communities                                  │
│                                                  │
│  ─── MY SHOP ──────────────────  (Producer only) │
│  📊  Shop Dashboard                              │
│  📦  My Listings                     (3)         │
│  📥  Requests                        (2 new)     │
│  ⭐  Reviews                                     │
│  📈  Analytics                                   │
│                                                  │
│  ─── PERSONAL ─────────────────                  │
│  💬  Messages                        (5)         │
│  🔔  Notifications                   (3)         │
│  ❤️  Saved                                        │
│  📋  My Requests                                  │
│                                                  │
│  ─────────────────────────────────               │
│  ⚙️  Settings                                     │
│  🛡️  Admin Panel        (admin only, amber text) │
│                                                  │
│  ─── USER ─────────────────────                  │
│  [👤 Avatar]                                     │
│  Johny                                           │
│  Producer · Ojai, CA                             │
│  [Sign Out]                                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Collapsed state saves to localStorage
- Hover on collapsed sidebar shows tooltip with label
- Active page has green left border + green text + subtle green bg
- Badge counts are real-time (Supabase subscription on notifications, messages, requests)
- "My Shop" section only visible if user.role includes 'producer'
- Smooth 200ms transition on collapse/expand
- On screens < 1024px: sidebar becomes a slide-out sheet triggered by hamburger

### 5.2 Mobile Bottom Tab Bar (56px, 5 tabs)

```
┌──────────────────────────────────────────────┐
│                                               │
│  🏠        🗺️        ➕        💬       👤    │
│  Feed    Explore   Create    Chat     Menu   │
│                                               │
│  ─── active indicator (green dot) ──          │
│                                               │
└──────────────────────────────────────────────┘
```

**Tab details:**
- **Feed:** Home feed with nearby listings
- **Explore:** Globe/map view
- **Create (➕):** Opens bottom sheet with options:
  - "Create Listing"
  - "Create Community"
  - "Post Announcement" (if community leader)
  - Floating action button style, green circle, raises with spring animation
- **Chat:** Messages page, badge shows unread count
- **Menu (👤):** Opens full-screen menu page:
  - User card at top (avatar, name, role, location)
  - Quick links: Shop Dashboard, My Listings, Requests, Saved, Notifications, Communities
  - Settings, Admin (if admin), Sign Out
  - Design: clean list with icons, grouped by section

**Active state:** Filled icon + green color + label text appears (inactive = outline icon, gray, no label)

### 5.3 Mobile App Header (48px, shown on all dashboard pages)

```
┌──────────────────────────────────────┐
│  EdenShare              🔔(3)  [👤] │
└──────────────────────────────────────┘
```

- Logo text (not icon — saves space but maintains brand)
- Notification bell with unread count badge (red dot)
- Avatar thumbnail (24px circle) → tap opens quick profile sheet

---

## 6. EVERY SCREEN — DETAILED SPECIFICATIONS

### 6.1 HOME FEED (/feed)

**Purpose:** First thing users see. Shows what's relevant and nearby.

**Layout (mobile):**
```
┌─────────────────────────────┐
│ [App Header]                │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📍 Near Ojai, CA   [⚙] │ │
│ └─────────────────────────┘ │
│                             │
│ ── Quick Actions ────────── │
│ [🗺 Map] [📦 Browse] [➕]  │
│                             │
│ ── Near You ─────────────── │
│ ┌─────────────────────────┐ │
│ │ [📸 Image         ]     │ │
│ │ 5-Acre Permaculture Farm│ │
│ │ 🌿 Land · 2.3 mi away  │ │
│ │ Work Exchange            │ │
│ │ ⭐ 4.8 · Sarah M.       │ │
│ │ [❤️ Save]   [→ View]    │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [📸 Image         ]     │ │
│ │ Organic Produce Box     │ │
│ │ 🥕 Resource · 0.8 mi   │ │
│ │ $25/week                 │ │
│ │ ⭐ 4.9 · Marcus T.      │ │
│ │ [❤️ Save]   [→ View]    │ │
│ └─────────────────────────┘ │
│                             │
│ ── Your Communities ──────── │
│ [LA Regenerators] [SoCal..]│
│                             │
│ ── Recommended ──────────── │
│ (more listing cards...)    │
│                             │
│ [Bottom Tab Bar]            │
└─────────────────────────────┘
```

**Data sources:**
```sql
-- Near You: listings within user's radius, sorted by distance
SELECT l.*, p.display_name, p.avatar_url,
  earth_distance(ll_to_earth(l.latitude, l.longitude), 
                 ll_to_earth(:user_lat, :user_lng)) as distance
FROM listings l
JOIN profiles p ON l.creator_id = p.id
WHERE l.status = 'active'
  AND earth_box(ll_to_earth(:user_lat, :user_lng), :radius_meters) 
      @> ll_to_earth(l.latitude, l.longitude)
ORDER BY distance ASC
LIMIT 20;

-- Your Communities: user's community memberships
SELECT c.* FROM communities c
JOIN community_members cm ON c.id = cm.community_id
WHERE cm.user_id = :user_id
ORDER BY c.member_count DESC;

-- Recommended: based on user interests matching listing tags
SELECT l.* FROM listings l
WHERE l.status = 'active'
  AND l.tags && :user_interests  -- array overlap
  AND l.creator_id != :user_id
ORDER BY l.view_count DESC
LIMIT 10;
```

**Interactions:**
- Pull-to-refresh (re-fetches all sections)
- Infinite scroll on "Near You" section
- Tap listing card → listing detail
- Tap community chip → community detail
- Tap "Map" quick action → explore page in map mode
- Tap "Browse" → marketplace
- Tap "+" → create listing
- Long-press listing card → quick actions: Save, Share, Report
- Location gear icon → change location/radius

**State management:**
- Feed data cached in Zustand store
- Refresh on pull-down or every 5 minutes background
- Skeleton loading cards on initial load (3 placeholder cards)

### 6.2 EXPLORE (/explore)

**Purpose:** Discovery. The "wow" layer (globe) + practical layer (map).

**Tabs at top:** Globe | Map | List

**Globe view:**
- NASA Blue Marble Earth with bump/specular maps
- Community + listing nodes as glowing dots
- Node colors: green (land), blue (resources), purple (communities), amber (services)
- Click node → slide-up card (280px) showing:
  - Image thumbnail
  - Title, type badge
  - Location, distance
  - Rating, member count
  - "View" and "Message" buttons
- Slow auto-rotation when idle
- Pinch to zoom on mobile
- Double-tap to zoom to region

**Map view (daily use):**
- Mapbox dark style map
- Listing pins (same color coding)
- Cluster markers at zoom-out (show count in circle)
- Tap pin → popup card (same as globe card)
- Filter panel (slide from right on mobile):
  - Type: Land / Resources / Services / All
  - Exchange: Free / Trade / Paid / Work Exchange / Any
  - Distance: slider 1-100km
  - Availability: Now / This week / This month / Any
  - Verified hosts only: toggle
  - Price range: min-max inputs (if paid)
- "Search this area" button when user pans
- User's location shown as blue pulsing dot

**List view:**
- Same filter panel
- Sort dropdown: Nearest / Newest / Most Popular / Price Low-High
- Listing cards in vertical scroll (image left, info right, save button)
- Infinite scroll with skeleton loading

### 6.3 MARKETPLACE (/marketplace)

**Purpose:** Browse all listings. Like Facebook Marketplace or Etsy search.

**Layout (mobile):**
```
┌─────────────────────────────┐
│ [Search bar with icon     ] │
│                             │
│ [Land] [Resources] [Service]│  ← horizontal scroll chips
│ [Free] [Trade] [Paid] ...  │
│                             │
│ Sort: Nearest ▼             │
│                             │
│ ┌──────────┐ ┌──────────┐  │  ← 2-column grid
│ │ [Image]  │ │ [Image]  │  │
│ │ Title    │ │ Title    │  │
│ │ Price    │ │ Free     │  │
│ │ Location │ │ Location │  │
│ │ ⭐ 4.8   │ │ ⭐ 4.5   │  │
│ └──────────┘ └──────────┘  │
│ ┌──────────┐ ┌──────────┐  │
│ │ ...      │ │ ...      │  │
│ └──────────┘ └──────────┘  │
│                             │
│ [Bottom Tab Bar]            │
└─────────────────────────────┘
```

**Search:**
- Full-text search across title, description, tags
- Autocomplete suggestions as user types
- Recent searches saved (localStorage)
- Voice search button (mobile, uses Web Speech API)

**Filter chips:**
- Horizontal scrollable row
- Active chips are green filled
- Tap to toggle on/off
- "Clear all" button appears when any filter is active

**Listing cards (compact marketplace style):**
- Square image (16:9 aspect on desktop, 1:1 on mobile grid)
- Title (truncated to 2 lines)
- Price or exchange type
- Location (city name)
- Rating (stars + number)
- Save heart icon (top-right overlay on image)
- Verified badge on image if host is verified

### 6.4 LISTING DETAIL (/listings/[id])

**Purpose:** Full information about a listing. The "product page."

**Layout (mobile, scrollable):**
```
┌─────────────────────────────┐
│ [← Back]           [⋯ More]│
│                             │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │    [Image Carousel]     │ │  ← swipeable, dots indicator
│ │                         │ │
│ └─────────────────────────┘ │
│  1/5  ●○○○○                │
│                             │
│ 🌿 LAND · Work Exchange    │
│ 5-Acre Permaculture Farm   │
│ 📍 Ojai, CA · 2.3 mi      │
│                             │
│ ┌─────────────────────────┐ │
│ │ [👤 Sarah M.]  ⭐ 4.8   │ │  ← host strip
│ │  Verified · Responds <2h│ │
│ │  [Message]              │ │
│ └─────────────────────────┘ │
│                             │
│ ── About ─────────────────  │
│ Beautiful established       │
│ permaculture farm with      │
│ food forest, pond, and      │
│ multiple growing zones...   │
│ [Read more ▼]              │
│                             │
│ ── Details ───────────────  │
│ ┌────┐ ┌────┐ ┌────┐      │
│ │ 5  │ │ 🌍 │ │ 💧 │      │
│ │acre│ │Med.│ │Yes │      │
│ │Size│ │Clim│ │Water│     │
│ └────┘ └────┘ └────┘      │
│ ┌────┐ ┌────┐ ┌────┐      │
│ │ ⚡ │ │ 🛣️ │ │ 🌱 │      │
│ │Yes │ │Yes │ │Loam│      │
│ │Elec│ │Road│ │Soil│      │
│ └────┘ └────┘ └────┘      │
│                             │
│ ── Tags ──────────────────  │
│ [permaculture] [food forest]│
│ [work-exchange] [organic]  │
│                             │
│ ── Location ──────────────  │
│ ┌─────────────────────────┐ │
│ │    [Mini Map Preview]   │ │  ← approximate area
│ └─────────────────────────┘ │
│                             │
│ ── Reviews (23) ──────────  │
│ ⭐⭐⭐⭐⭐ 4.8 average       │
│ ┌─────────────────────────┐ │
│ │ [👤] Marcus T. · ⭐⭐⭐⭐⭐│ │
│ │ "Incredible experience. │ │
│ │  Sarah is wonderful..." │ │
│ │ 2 months ago            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [👤] Elena K. · ⭐⭐⭐⭐⭐ │ │
│ │ "Clean accommodation,   │ │
│ │  clear expectations..." │ │
│ └─────────────────────────┘ │
│ [See all 23 reviews ▶]     │
│                             │
│ ── Similar Listings ──────  │
│ [horizontal scroll cards]  │
│                             │
│ ┌─────────────────────────┐ │
│ │ [💚 Request to Join    ]│ │  ← sticky bottom bar
│ │ [❤️] [↗️ Share]          │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Sticky bottom bar:**
- Always visible at bottom (above tab bar)
- Primary CTA: "Request to Join" (green button, full width)
- Secondary: Save heart + Share icon
- If already requested: shows "Request Sent ✓" (disabled green)
- If own listing: shows "Edit Listing" button

**"Request to Join" flow:**
1. Tap button → bottom sheet slides up
2. Sheet contains:
   - Listing title (reference)
   - Text area: "Introduce yourself" (placeholder: "Hi! I'm interested because...")
   - Proposed dates (optional date picker)
   - Guest count (optional stepper)
   - "Send Request" button
3. On send:
   - INSERT into requests table
   - INSERT into conversations + conversation_participants
   - INSERT system message + user message into messages
   - INSERT notification for host
   - Sheet closes, button changes to "Request Sent ✓"
   - Toast: "Request sent! You'll be notified when the host responds."

**"Message Host" flow:**
1. Check if conversation already exists between these two users
2. If yes → navigate to /messages with that conversation selected
3. If no → create conversation + participants → navigate to /messages

### 6.5 SHOP DASHBOARD (/shop) — Producer Only

**Purpose:** The Etsy-like seller backend. Where producers manage everything.

**Overview page (/shop):**
```
┌─────────────────────────────┐
│ My Shop                     │
│ "Sarah's Permaculture Farm" │
│                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │  234 │ │   3  │ │  2   │ │  ← stat cards
│ │views │ │active│ │pend. │ │
│ │this  │ │list- │ │req.  │ │
│ │month │ │ings  │ │      │ │
│ └──────┘ └──────┘ └──────┘ │
│ ┌──────┐ ┌──────┐          │
│ │ 4.8  │ │  23  │          │
│ │avg   │ │total │          │
│ │rating│ │reviews│         │
│ └──────┘ └──────┘          │
│                             │
│ ── Recent Requests ──────── │
│ ┌─────────────────────────┐ │
│ │ 👤 Marcus T. wants to   │ │
│ │ join "5-Acre Farm"      │ │
│ │ 2h ago                  │ │
│ │ [Accept] [Decline] [Msg]│ │
│ └─────────────────────────┘ │
│                             │
│ ── Quick Actions ────────── │
│ [➕ New Listing]            │
│ [📊 View Analytics]        │
│ [⚙️ Shop Settings]          │
│                             │
│ ── Recent Reviews ─────────│
│ ⭐⭐⭐⭐⭐ from Elena K.      │
│ "Amazing experience..."    │
│                             │
└─────────────────────────────┘
```

### 6.6 SHOP LISTINGS (/shop/listings)

**Purpose:** CRUD management of all the producer's listings.

**Tabs:** All | Active | Draft | Paused | Closed

**Each listing row:**
```
┌─────────────────────────────────────┐
│ [📸]  5-Acre Permaculture Farm     │
│       🌿 Land · Active · ⭐ 4.8    │
│       234 views · 8 requests       │
│       [Edit] [Pause] [⋯]          │
└─────────────────────────────────────┘
```

**Actions per listing:**
- Edit → full edit form (same as create but pre-filled)
- Pause → sets status to 'paused', removed from public
- Resume → sets back to 'active'
- Delete → confirmation modal → soft delete (status = 'archived')
- Feature → toggle isFeatured (for future promoted listings)
- Duplicate → copies listing as a new draft
- View as public → opens listing detail in new tab

**Empty state (no listings):**
```
┌─────────────────────────────────────┐
│          🌱                         │
│   You haven't listed anything yet   │
│                                     │
│   Share your land, produce, or      │
│   services with the community.     │
│                                     │
│   [Create Your First Listing →]    │
└─────────────────────────────────────┘
```

### 6.7 CREATE LISTING (/listings/new) — Multi-Step

**8 steps, progress bar at top, save draft at any point:**

**Step 1: Type** (full-screen cards)
- Land / Farm / Garden
- Produce / Goods
- Tools / Equipment
- Seeds / Plants
- Services / Skills
- Accommodation / Stays

**Step 2: Title & Description**
- Title input (max 80 chars, character counter)
- Short description (max 200 chars, shown in cards)
- Full description (rich text: bold, italic, lists, links)
- AI suggestion button: "✨ Help me write this" (uses Anthropic API to improve description)

**Step 3: Photos**
- Grid of photo slots (up to 10)
- Drag to reorder
- Tap to upload (camera or gallery)
- First photo = cover photo (badge indicator)
- Crop/rotate tool per photo
- "Tips for great photos" collapsible section

**Step 4: Location**
- Auto-detect button
- Map with draggable pin
- Address fields (auto-filled from pin, editable)
- Privacy: "Show exact location" vs "Show approximate area"

**Step 5: Type-Specific Details**
Dynamically rendered based on Step 1 choice:

*If Land:*
- Acreage (number input + unit: acres/hectares)
- Soil type (dropdown: sandy, clay, loam, silt, peat, chalky)
- Water access (toggle + details: well, spring, municipal, rain harvest)
- Electricity (toggle + type: grid, solar, wind, none)
- Road access (toggle + type: paved, dirt, 4WD only)
- Climate zone (dropdown or auto from location)
- Zoning (text input)
- Current use (multi-select: forest garden, row crops, pasture, unused, etc.)

*If Produce:*
- Category (vegetables, fruits, eggs, dairy, meat, honey, herbs, etc.)
- Organic certification (toggle + cert name)
- Availability (seasonal calendar picker)
- Quantity available (number + unit: lbs, kg, bunches, dozens)

*If Service:*
- Category (design, labor, teaching, consulting, etc.)
- Availability (calendar or "flexible")
- Remote possible (toggle)
- Experience level (years)

**Step 6: Exchange Model**
- Selection (only one):
  - Free (no cost)
  - Work Exchange (hours per week + what's included)
  - Trade / Barter (describe what you want in return)
  - Paid (price + interval: per hour/day/week/month/season)
  - Donation Based (suggested donation amount)
  - Flexible (open to discussion)
- If Paid: price input + currency selector + interval picker
- If Work Exchange: hours/week input + "What's included" checklist (accommodation, meals, wifi, tools)

**Step 7: Availability**
- Available from (date picker)
- Available to (date picker, or "Ongoing")
- Flexible dates toggle
- Minimum stay (if accommodation)
- Booking lead time (how far in advance)

**Step 8: Preview & Publish**
- Full preview of the listing as it will appear
- Edit buttons per section to jump back
- [Save as Draft] [Publish] buttons
- On publish: listing goes to status = 'active' (or 'pending_review' if moderation is enabled)

### 6.8 SHOP SETTINGS (/shop/settings)

**Sections (tab or accordion on mobile):**

**6.8.1 Shop Profile**
- Shop name
- Shop tagline
- Shop description (longer, supports formatting)
- Shop logo upload
- Shop cover image upload
- Shop category
- Contact preferences (show email, show phone, messaging only)

**6.8.2 Shop Appearance**
- Accent color picker (8 presets + custom hex)
- Layout style: Grid / List / Magazine
- Cover image position: cover / contain / parallax
- Preview button showing live changes

**6.8.3 Policies**
- Cancellation policy (free text or template: flexible/moderate/strict)
- Response time commitment (auto-calculated from history)
- Work exchange terms template
- House rules (if offering accommodation)
- Liability disclaimer

**6.8.4 Notifications (shop-specific)**
- Email me when: new request, new message, new review
- Daily digest vs instant
- Quiet hours

### 6.9 MESSAGES (/messages)

**Same as current but with these improvements:**

**Conversation list improvements:**
- Unread conversations have bold text + green left border
- Each conversation shows context: "Re: 5-Acre Farm" or just the user name
- Request status chip in conversation: "Pending" / "Accepted" / "Rejected"
- Online status indicator (green dot on avatar if online in last 5 min)
- Swipe left on conversation → Archive
- Swipe right → Mark as read/unread

**Chat view improvements:**
- Day separators: "Today", "Yesterday", "April 15, 2026"
- Message grouping: consecutive messages from same sender grouped under one avatar
- Image messages: tap to view full screen
- System messages styled differently (centered, gray, smaller text):
  "Request sent for '5-Acre Permaculture Farm'" 
  "Request accepted by Sarah M."
- Typing indicator: "Sarah is typing..."
- Delivered/read receipts (double check marks)
- Context bar at top: shows listing name + image thumbnail if conversation is about a listing
  - Tap context bar → goes to listing detail
- Quick actions in header: View Profile, View Listing, Report

**Real-time:**
- Supabase Realtime subscription per open conversation
- Presence channel for online/offline status
- New message sound (subtle, optional in settings)

### 6.10 COMMUNITY DETAIL (/communities/[slug])

**Tabs:** Feed | Listings | Members | About

**Feed tab:**
- Pinned announcements at top (yellow border-left)
- Recent listing activity from community members
- "What's new" cards

**Listings tab:**
- All active listings from community members
- Same card layout as marketplace
- Filter by type

**Members tab:**
- Grid of member cards (avatar, name, role badge)
- Roles shown: Owner (gold), Admin (blue), Moderator (silver), Member
- Tap member → their public profile

**About tab:**
- Long description
- Rules
- Owner info
- Stats: created date, total listings, total members
- Category, tags
- Location on map

**Actions:**
- Join (if not member) → instant for public communities, request for private
- Leave (if member, unless owner)
- Share community link
- Report community

### 6.11 NOTIFICATIONS (/notifications)

**Full page, not just dropdown.**

**Notification types with icons:**
| Type | Icon | Example text |
|------|------|-------------|
| request_received | 📥 | Marcus T. sent a request for "5-Acre Farm" |
| request_accepted | ✅ | Sarah M. accepted your request |
| request_rejected | ❌ | Your request was declined |
| new_message | 💬 | New message from Elena K. |
| new_review | ⭐ | Marcus left a 5-star review |
| community_invite | 👥 | You've been invited to "LA Regenerators" |
| listing_nearby | 📍 | New listing near you: "Organic Produce Box" |
| listing_approved | ✅ | Your listing "Tool Library" is now live |

**Layout:**
- Grouped by: Today, This Week, Earlier
- Unread: white text, slight green-tinted bg
- Read: gray text
- Tap → navigate to relevant page
- "Mark all as read" button
- Pull-to-refresh

**Real-time:** Supabase subscription on notifications table filtered by user_id

### 6.12 PROFILE (/profile)

**Own profile — editable inline:**
- Cover photo (tap to change)
- Avatar (tap to change, with camera icon overlay)
- Name (tap to edit inline)
- Bio (tap to edit, expandable text area)
- Location (city, region — tap to change)
- Role badge: "Producer" / "Seeker" / "Community Leader"
- Trust score with visual bar
- Badges earned (horizontal scroll)
- Skills (editable tag chips)
- Interests (editable tag chips)
- Member since date

**Tabs below:** Listings | Reviews | Communities

**Other user's profile (/profile/[id]) — read-only:**
- Same layout without edit controls
- "Message" button (prominent)
- "Report" button (in ⋯ menu)
- If producer: "View Shop" button linking to their public listings

### 6.13 SETTINGS (/settings)

**Sections (list on mobile, sidebar on desktop):**

**Account:** Email (read-only), password change, connected accounts, delete account
**Profile:** Edit all profile fields (same as inline but form-style)
**Appearance:** Theme (dark/light/system), accent color, font size (small/medium/large), compact mode
**Notifications:** Per-type toggles (email, push, in-app), quiet hours, digest frequency
**Privacy:** Profile visibility, location precision, online status visibility, search indexing
**Shop:** (Producer only) — links to /shop/settings

### 6.14 ADMIN PANEL (/admin)

**Accessible only to role='admin' users.**

**Dashboard:**
- Stats cards: Users (total + new this week), Listings, Communities, Pending Reports
- Line chart: signups over last 30 days (Recharts)
- Bar chart: listings by type
- Recent activity feed

**Users (/admin/users):**
- Data table with columns: Avatar, Name, Email, Role, Joined, Trust Score, Status, Actions
- Search + filter by role
- Click row → user detail panel (slide-in)
- Actions: Change role, Suspend, Delete, Impersonate (view as user)

**Listings (/admin/listings):**
- Data table: Image, Title, Type, Creator, Status, Views, Reports, Actions
- Filter by status, type
- Actions: Approve, Pause, Delete, Feature

**Reports (/admin/reports):**
- Kanban-style: Pending | Under Review | Resolved | Dismissed
- Each card: report type, reporter, content preview, date
- Click → full detail modal with context + action buttons
- Actions: Resolve (with note), Dismiss, Escalate, Take Action (suspend user / delete content)

---

## 7. DATABASE SCHEMA EXTENSIONS

Add to existing schema:

```sql
-- Shop settings (per producer)
ALTER TABLE profiles ADD COLUMN shop_name text;
ALTER TABLE profiles ADD COLUMN shop_tagline text;
ALTER TABLE profiles ADD COLUMN shop_description text;
ALTER TABLE profiles ADD COLUMN shop_logo_url text;
ALTER TABLE profiles ADD COLUMN shop_cover_url text;
ALTER TABLE profiles ADD COLUMN shop_accent_color text DEFAULT '#3ec878';
ALTER TABLE profiles ADD COLUMN shop_layout text DEFAULT 'grid';
ALTER TABLE profiles ADD COLUMN shop_policies text;
ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'seeker' 
  CHECK (user_type IN ('seeker', 'producer', 'community_leader'));
ALTER TABLE profiles ADD COLUMN location_radius_km int DEFAULT 25;
ALTER TABLE profiles ADD COLUMN show_exact_location boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN show_online_status boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN notification_email boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN notification_push boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN notification_digest text DEFAULT 'instant';
ALTER TABLE profiles ADD COLUMN font_size text DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN compact_mode boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN last_seen_at timestamptz;

-- Listing enhancements
ALTER TABLE listings ADD COLUMN organic_certified boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN organic_cert_name text;
ALTER TABLE listings ADD COLUMN work_exchange_hours_per_week int;
ALTER TABLE listings ADD COLUMN work_exchange_includes text[];
ALTER TABLE listings ADD COLUMN min_stay_days int;
ALTER TABLE listings ADD COLUMN booking_lead_days int;
ALTER TABLE listings ADD COLUMN show_exact_location boolean DEFAULT false;
ALTER TABLE listings ADD COLUMN listing_order int DEFAULT 0;

-- Community enhancements
ALTER TABLE communities ADD COLUMN is_private boolean DEFAULT false;
ALTER TABLE communities ADD COLUMN join_approval_required boolean DEFAULT false;

-- Join requests for private communities
CREATE TABLE community_join_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- User presence (for online status)
CREATE TABLE user_presence (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  is_online boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now()
);
```

---

## 8. MOBILE DESIGN SYSTEM

### Colors (dark mode)
```
Background:        #0a1a10  (very dark green-black)
Surface:           #0f2318  (cards, sidebar)
Surface elevated:  #142e1e  (modals, hover states)
Surface pressed:   #1a3d28  (active/pressed states)

Text primary:      #f0f4f1  (headings, important text)
Text secondary:    #b8c4ba  (body text, descriptions)
Text muted:        #6b7e6f  (timestamps, hints, labels)
Text disabled:     #3d4f41  (disabled buttons)

Accent:            #3ec878  (primary actions, links)
Accent hover:      #52d68a  (button hover)
Accent subtle:     #1a3d28  (accent backgrounds)

Border:            #1a3424  (cards, inputs)
Border focus:      #3ec87860 (input focus ring)

Danger:            #ef4444
Warning:           #f59e0b
Info:              #3b82f6
Success:           #22c55e

Type colors:
Land:              #3ec878
Resource:          #60b9fa
Community:         #c084fc
Service:           #fbbf24
```

### Typography
```
Font family:       'DM Sans', system-ui, sans-serif
Display font:      'DM Serif Display', Georgia, serif

Mobile sizes:
  H1:              28px / 1.2 / 700 (display font)
  H2:              22px / 1.3 / 700 (display font)
  H3:              18px / 1.3 / 600
  Body:            15px / 1.65 / 400  ← KEY: readable on mobile
  Body small:      13px / 1.5 / 400
  Caption:         11px / 1.4 / 500
  Label:           12px / 1.0 / 600 / uppercase / tracking 0.05em
  Button:          14px / 1.0 / 600

Minimum touch target: 44px height (Apple HIG)
Input height:      48px
Button height:     44px (primary), 40px (secondary)
Bottom tab height: 56px (with labels)
App header height: 48px
Card padding:      16px (mobile), 20px (desktop)
Section spacing:   24px (mobile), 32px (desktop)
```

### Loading States
Every page has three states:
1. **Loading:** Skeleton cards (animated shimmer, not spinner)
2. **Empty:** Illustration + title + description + CTA button
3. **Error:** Red-tinted card + retry button

---

## 9. WORKFLOWS & TRIGGERS

### 9.1 Request Lifecycle
```
PENDING → ACCEPTED → COMPLETED
    ↓         ↓
 REJECTED  CANCELLED
    ↓
 EXPIRED (auto after 7 days)
```

**Triggers:**
- Request created → notification to host + conversation created
- Request accepted → notification to requester + match created
- Request rejected → notification to requester
- Request completed → prompt both parties to leave reviews
- Request expired (7 days no response) → notification to requester + host

### 9.2 Review Lifecycle
- Only available after request status = 'completed' or 'accepted'
- Both parties can review (double-sided)
- Reviews are permanent (cannot be deleted by either party)
- Editing allowed within 48 hours of posting
- After review posted → recalculate host's trust_score:
  ```sql
  UPDATE profiles SET trust_score = (
    SELECT AVG(rating) FROM reviews WHERE subject_id = :host_id
  ) WHERE id = :host_id;
  ```

### 9.3 Notification Triggers
| Event | Notification to | Type |
|-------|----------------|------|
| New request on my listing | Host | request_received |
| My request accepted | Requester | request_accepted |
| My request rejected | Requester | request_rejected |
| New message in conversation | Other participant | new_message |
| New review on me | Subject | new_review |
| Invited to community | Invitee | community_invite |
| New listing within my radius | Nearby users | listing_nearby |
| My listing approved by admin | Creator | listing_approved |
| Community join request | Community owner | request_received |

### 9.4 Listing Status Machine
```
DRAFT → ACTIVE ←→ PAUSED
  ↓       ↓          ↓
  ↓     CLOSED     CLOSED
  ↓       ↓          ↓
  ↓    ARCHIVED   ARCHIVED
  ↓
PENDING_REVIEW → ACTIVE (if approved)
               → REJECTED (if moderation fails)
```

### 9.5 Real-Time Subscriptions
```typescript
// In messages page:
supabase.channel('messages:' + convoId)
  .on('postgres_changes', { event: 'INSERT', table: 'messages', 
      filter: 'conversation_id=eq.' + convoId }, handleNewMessage)
  .subscribe();

// In notifications:  
supabase.channel('notifications:' + userId)
  .on('postgres_changes', { event: 'INSERT', table: 'notifications',
      filter: 'user_id=eq.' + userId }, handleNewNotification)
  .subscribe();

// In sidebar (badge counts):
supabase.channel('badges:' + userId)
  .on('postgres_changes', { event: '*', table: 'notifications',
      filter: 'user_id=eq.' + userId }, refreshBadgeCounts)
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, 
      refreshMessageCount)
  .subscribe();

// Presence (online status):
supabase.channel('presence')
  .on('presence', { event: 'sync' }, handlePresenceSync)
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId, online_at: new Date() });
    }
  });
```

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Architecture (2-3 sessions)
- Create (marketing) and (dashboard) route groups with separate layouts
- Build Sidebar component (desktop + mobile sheet)
- Build Bottom Tab Bar component
- Build App Header component
- Auth guard in dashboard layout
- Migrate existing pages into correct route groups
- Add user_type to profiles + schema migration

### Phase 2: Producer Experience (3-4 sessions)
- Shop Dashboard page
- Shop Listings management (CRUD table)
- Create Listing multi-step (8 steps, image reorder)
- Shop Settings (profile, appearance, policies)
- Requests received page (accept/reject/message)
- Shop Analytics page (basic stats + charts)

### Phase 3: Seeker Experience (2-3 sessions)
- Home Feed (nearby + recommended + communities)
- Improved Explore (globe + map + list with real data + filters)
- Improved Marketplace (2-column grid, search, filter chips)
- Improved Listing Detail (image carousel, sticky CTA, reviews)
- Improved Messages (grouping, system messages, context bar)
- Notifications page (grouped, real-time)

### Phase 4: Community Features (1-2 sessions)
- Community Detail with tabs (feed, listings, members, about)
- Community Management (member management, announcements)
- Private communities with join requests

### Phase 5: Polish & Admin (1-2 sessions)
- Admin Dashboard with charts
- User/Listing/Report management tables
- Settings with all sections
- Profile editing improvements
- Loading skeletons on all pages
- Empty states on all pages
- Error handling on all pages

---

**END OF BLUEPRINT**

Total estimated screens: 35+
Total components needed: 50+
Total database tables: 15
Total real-time subscriptions: 4
Total notification trigger types: 9
