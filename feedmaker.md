# Feedmaker.md — Master Build Plan for the Art Community Feed System

**Audience:** This document is written to be handed directly to an AI build agent (e.g. Antigravity, Gemini 3.6/3.7 Flash) as its complete brief. It is not a suggestion doc — it is a gated process. Do not skip gates.

**Owner:** Wacooked
**Purpose:** Build a Pinterest-style masonry feed system for an Art Community Website, adapted correctly across five distinct sections: Feed, Courses, Freelance, Contest, User Dashboard.

---

## 0. How To Use This Document (Read This First)

This is not "here's a spec, go build." It is a **three-gate process**:

```
GATE 0: Context Discovery  →  GATE 1: Implementation Plan  →  BUILD
   (understand the site)      (write the plan, don't code)     (only now, write code)
```

**You may not skip a gate.** Each gate produces an artifact (notes, then a plan) before any component or page code is written. If you find yourself writing JSX/HTML/CSS before Gate 1's plan exists, stop — you've skipped a step.

---

## 1. GATE 0 — Mandatory Service Context Discovery

Before touching the feed at all, understand what you're actually building into. This site is not a generic template — it has its own identity, and the feed must feel native to it, not bolted on.

Go through the existing project/repo/service and answer these before proceeding:

- [ ] **What is this website?** Read any README, landing page copy, brand docs, or about-page content. Summarize the platform's purpose, tone, and target audience (artists? hobbyists? students? professionals?) in 2–3 sentences.
- [ ] **What already exists?** Inventory existing pages/routes, components, and shared UI (navbars, buttons, cards, modals). Do NOT rebuild something that already exists — extend it.
- [ ] **Tech stack.** Identify framework (React/Next/Vue/plain HTML), styling approach (Tailwind/CSS Modules/plain CSS/SCSS), state management, and whether there's a backend/API already or if this is frontend-only with mock data for now.
- [ ] **Design system.** Colors, typography, spacing scale, existing card/button styles, border-radius conventions, dark/light mode support. The feed must reuse these, not invent new ones.
- [ ] **Auth/user model.** Is there already a logged-in user concept? What does a "user" object look like currently (id, name, avatar, etc.)?
- [ ] **Routing structure.** How are the five sections (Feed, Courses, Freelance, Contest, Dashboard) currently organized — separate routes/pages? Tabs in one shell? Confirm before assuming.

**Output of this gate:** a short written summary (can be at the top of your Gate 1 plan) of the above. If any of it is genuinely undiscoverable (e.g., no backend exists yet), note the assumption explicitly and move on — don't block indefinitely on missing info.

---

## 2. GATE 1 — Mandatory Implementation Plan (Write Before Coding)

Using what you learned in Gate 0, produce a full implementation plan **as a document**, covering:

1. **Architecture overview** — component tree for the feed system, how the reusable Masonry Engine (Section 6) is shared across Feed and Contest-submissions, and how Courses/Freelance diverge from it.
2. **Routing/page plan** — what pages/routes get created or modified.
3. **Data layer plan** — what data models are needed (see Section 7 for starting schemas), whether this is real API calls or mock/local data for now, and where that boundary lives so it's easy to swap later.
4. **Per-section layout decision** — for each of the 5 sections, explicitly state: masonry / adapted grid / list / not-a-feed, referencing Section 5's resolutions. Don't silently deviate from Section 5 — if you think a different call is right after seeing real context, say so and explain why.
5. **State & pagination strategy** — infinite scroll vs. paginated, loading states, empty states, error states.
6. **Responsive plan** — breakpoints and column counts per section.
7. **Sequencing** — the order you'll build things in (e.g., Masonry Engine component first since it's shared, then Feed, then adapt for Contest, then Courses, then Freelance, then Dashboard last since it's not feed-dependent).

**Only after this plan exists do you proceed to actually write code.** If the human operator is available, surface this plan for a quick sanity check before building — it's cheap to fix a plan, expensive to fix a built feature.

---

## 3. Site Requirements (As Given — Source of Truth)

| Section | What it is |
|---|---|
| **Feed** | Showcase of artworks by other artists. No pricing. Not affiliated with / cross-linked to any other tab — it is a pure showcase. |
| **Courses** | Course lessons organized by art form and other factors (level, medium, instructor, etc.). |
| **Freelance** | Users post what they need from an artist; functions as a job board (job posts, not direct hiring flow necessarily). |
| **Contest** | Admins create weekly/monthly contests; users participate/submit entries. |
| **User Dashboard** | View and edit own user details/profile. |

**Hard constraints:**
- Feed shows **no pricing anywhere**.
- Feed has **no affiliation/cross-links to Courses, Freelance, or Contest** — a user browsing Feed should not see "enroll in a course" or "hire this artist" prompts. It's showcase-only.
- Overall visual language should be **Pinterest-like**: masonry grid, variable-height cards, browsable, visually led.

---

## 4. Known Conflicts Between "Pinterest Model" and These Requirements (Pre-Resolved — Re-validate in Gate 0/1)

These were identified before build. Treat them as defaults, but if Gate 0 reveals something that changes the calculus, override with a note explaining why.

### Conflict 1 — One unified feed vs. five different content types
Pinterest = one homogeneous stream. This site has four structurally different content types (image showcase, text-heavy job posts, sequential courses, time-boxed contests).
**Resolution:** True Pinterest masonry is used ONLY for:
- The **Feed** tab (artwork showcase)
- **Contest submission galleries** (the entries within a single contest — these are images too)

Courses and Freelance borrow the *visual card language* (rounded cards, imagery, hover states) but are **not** random masonry grids.

### Conflict 2 — Random/discovery ordering vs. Freelance job-hunting usability
A freelancer scanning job posts needs to sort/filter (deadline, budget, category, recency). Pure randomness actively hurts this use case.
**Resolution:** Freelance uses a card-grid visually inspired by masonry, but the underlying order is **deterministic and filterable/sortable** (newest first by default; filters for budget range, art form, deadline). Not shuffled.

### Conflict 3 — Sequential learning vs. open-ended browsing
Courses have inherent order (Lesson 1 → 2 → 3 within a course). Masonry assumes items are independent and order-agnostic.
**Resolution:** The **course catalog** (browsing many courses) can be a grid. The **inside of a single course** (its lessons) is a linear list/curriculum view — never masonry.

### Conflict 4 — Evergreen pins vs. time-boxed contests
Pinterest pins don't expire. Contests have start/end dates and a lifecycle (upcoming → active → ended).
**Resolution:** The **contest listing page** is a status-aware card grid with visible state (Active / Ends in Xd / Ended). Only the **submission gallery inside an active/ended contest** reuses the true masonry engine, since those submissions are images.

### Conflict 5 — Dashboard is not a feed
No real conflict — Dashboard is a standard profile/settings UI (form fields, avatar upload, saved info) and is explicitly **out of scope** for the masonry engine. Don't force it into a grid.

### Note — Pricing is not actually a Pinterest conflict
Pinterest doesn't require pricing; omitting it on Feed is just a constraint to respect, not a structural conflict. No resolution needed, just don't add price fields to Feed's artwork card or data model.

### Open question to confirm during Gate 0/1
Courses and Freelance may eventually involve money (paid courses, paid gigs) even though Feed explicitly must not show pricing. Don't assume either way — check if monetization exists elsewhere in the project, and keep price fields optional/nullable in those two data models until confirmed.

---

## 5. Per-Section Build Specs

### 5.1 Feed (Artwork Showcase) — TRUE Pinterest Masonry
- Variable-height cards driven by each artwork's real image aspect ratio (no cropping/forcing to square).
- Card contents: image, artist avatar + name, artwork title, tags/medium (e.g. "Digital Painting", "Watercolor"), like/save action, comment count if applicable.
- **No price, no "hire me" button, no course upsell, no contest badge** — strict showcase isolation per the hard constraint.
- Click/tap → detail view (modal or dedicated page) showing larger image, full artist attribution, tags, and a "more like this" or "more from this artist" module — still confined to Feed content only.
- Infinite scroll with lazy-loaded images and skeleton placeholders matching the eventual aspect ratio (prevents layout shift/jank).
- Optional: filter/sort by art form or "following" vs. "discover" — masonry order itself can still be algorithmic/random within whatever filter is active, consistent with real Pinterest behavior.

### 5.2 Courses
- **Catalog view:** grid of course cards (thumbnail, title, art form tag, level badge, instructor, lesson count, duration). Grid can be masonry-flavored visually (varied card heights are fine if thumbnails vary), but content order should be sensible (newest, most popular, or by category) — not pure random shuffle, since users are trying to find something specific.
- Filters: by art form, skill level, duration.
- **Course detail / curriculum view:** NOT masonry. Linear, ordered list of modules/lessons with progress indicators.

### 5.3 Freelance
- Card-grid layout (masonry-inspired visuals allowed) for job posts.
- Card contents: job title, short description, budget range (or "budget: TBD"), required art form/skills, deadline, poster name/avatar, applicant count.
- **Default sort: newest first.** Provide filter/sort controls (budget, deadline, category) — do not randomize order by default.
- Click → full job post detail with full description, requirements, and an apply/respond action.

### 5.4 Contest
- **Contest listing page:** status-aware card grid (Upcoming / Active / Ended), each card showing theme, prize (if any), deadline/countdown, entry count. Not masonry — order by status/deadline urgency.
- **Inside a contest → submission gallery:** THIS reuses the true Masonry Engine from Feed, since entries are artwork images. Same card language as Feed (image, artist, likes/votes) plus a vote/rank affordance if the contest is voting-based.
- Admin-only: contest creation form (title, theme, rules, start/end date, prize) — standard form UI, not a feed concern.

### 5.5 User Dashboard
- Not a feed. Standard profile UI: avatar, display name, bio, art forms/interests, editable fields, save/cancel actions.
- May show a small personal summary (e.g., "Your artworks", "Your submissions", "Your job posts") as simple lists or small grids linking out to the relevant section — but this is a summary, not the masonry engine itself.

---

## 6. The Reusable Masonry Engine (Shared Component)

Build this once, use it in **Feed** and **Contest submission galleries**. This is the true "Pinterest" piece.

**Behavior:**
- Responsive column count: 2 columns on mobile (<640px), 3 on tablet (640–1024px), 4 on desktop (1024–1536px), 5–6 on wide screens (>1536px). Adjust to match the site's actual breakpoints found in Gate 0.
- Column-balanced placement (items flow into whichever column is currently shortest), not simple row-wrapping — this is what makes it look like Pinterest rather than a plain grid.
- Card height driven by the real image aspect ratio; never force-crop.
- Skeleton/placeholder cards while images load, sized to the known aspect ratio to avoid layout shift.
- Lazy-load images (IntersectionObserver or framework-native lazy loading) — don't load full-res images until near viewport.
- Infinite scroll: fetch next page when user nears the bottom (sentinel element + IntersectionObserver), with a loading indicator, not a "load more" button, to match Pinterest's feel — unless the existing site convention (from Gate 0) already uses pagination, in which case stay consistent.
- Hover (desktop) / tap (mobile) reveals overlay: artist name, like/save action.
- Smooth entrance animation for newly loaded batches is a nice-to-have, not a blocker.

**Implementation approach (pick based on stack found in Gate 0):**
- React: a column-balancing library (e.g. `react-masonry-css`) or a hand-rolled column-distribution hook. Avoid pure CSS `column-count` if reading order / interactive elements matter, since it reflows top-to-bottom-then-across in a way that can feel wrong for click targets — verify this is acceptable before using it as a shortcut.
- Non-React/plain HTML: CSS Grid with `grid-auto-rows` + JS-computed row-span per item (classic masonry-via-grid technique), or a lightweight vanilla masonry library.

---

## 7. Data Model Sketches (Adjust Once Gate 0 Reveals Real Backend/Schema)

```jsonc
// Artwork (Feed + Contest entries)
{
  "id": "string",
  "imageUrl": "string",
  "imageWidth": 1200,
  "imageHeight": 1600,      // used to compute card aspect ratio
  "title": "string",
  "artistId": "string",
  "artistName": "string",
  "artistAvatarUrl": "string",
  "medium": "string",       // e.g. "Digital Painting", "Oil on Canvas"
  "tags": ["string"],
  "likesCount": 0,
  "createdAt": "ISO8601"
  // NOTE: intentionally no price field
}

// Course
{
  "id": "string",
  "title": "string",
  "thumbnailUrl": "string",
  "artForm": "string",
  "level": "beginner | intermediate | advanced",
  "instructorId": "string",
  "instructorName": "string",
  "lessonCount": 0,
  "durationMinutes": 0,
  "enrolledCount": 0,
  "price": null              // nullable — confirm monetization model in Gate 0
}

// JobPost (Freelance)
{
  "id": "string",
  "posterId": "string",
  "posterName": "string",
  "title": "string",
  "description": "string",
  "artFormNeeded": "string",
  "budgetMin": null,
  "budgetMax": null,
  "budgetType": "fixed | hourly | tbd",
  "deadline": "ISO8601",
  "requiredSkills": ["string"],
  "status": "open | in_progress | closed",
  "applicantsCount": 0,
  "createdAt": "ISO8601"
}

// Contest
{
  "id": "string",
  "title": "string",
  "theme": "string",
  "description": "string",
  "rules": "string",
  "prize": "string",
  "createdByAdminId": "string",
  "startDate": "ISO8601",
  "endDate": "ISO8601",
  "status": "upcoming | active | ended",
  "submissionCount": 0
}

// UserProfile (Dashboard)
{
  "id": "string",
  "username": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "bio": "string",
  "artForms": ["string"],
  "portfolioLinks": ["string"],
  "joinedAt": "ISO8601"
}
```

---

## 8. Technical Notes

- **Performance:** lazy-load all feed images; use a modern image format/CDN transform if one exists in the project already (don't introduce a new image pipeline without checking Gate 0 first).
- **Accessibility:** every artwork card needs real alt text (artwork title + artist name at minimum); infinite scroll needs a visible loading state announced to screen readers; interactive cards need keyboard focus states.
- **Empty states:** design for zero-content states per section (new user with no artworks yet, no active contests this week, no job posts matching filters, etc.) — don't let any section just render blank.
- **Loading states:** skeleton cards for Feed/Contest masonry; simple skeleton rows/cards for Courses/Freelance.
- **Consistency:** reuse existing buttons, typography, spacing, and color tokens discovered in Gate 0 — the feed should look like it belongs to this site, not like a pasted-in Pinterest clone.

---

## 9. Out of Scope (Do Not Build Unless Asked)

- Payment/checkout flows for courses or freelance gigs.
- Messaging/chat between freelancer and job poster.
- Admin moderation tooling beyond basic contest creation.
- Any pricing display anywhere inside the Feed tab.
- Cross-tab recommendation widgets inside Feed (e.g. "check out this course") — explicitly forbidden by the hard constraint in Section 3.

---

## 10. Pre-Flight Checklist (Confirm Before Writing Code)

- [ ] Gate 0 context summary written and makes sense against the real project.
- [ ] Gate 1 implementation plan written, including explicit per-section layout decisions.
- [ ] Conflicts in Section 4 reviewed and either accepted as-is or overridden with a stated reason.
- [ ] Masonry Engine scoped as a shared component for Feed + Contest submissions only.
- [ ] Data models adjusted to match any real backend/schema found in Gate 0.
- [ ] Confirmed Feed has zero pricing and zero cross-tab links, anywhere in its UI.

Only once every box above is checked does actual component/page building begin.
