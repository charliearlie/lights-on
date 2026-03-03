Illuminate: Project Plan & Claude Code Prompt
Context
Illuminate is an existing React Router SPA that showcases a Nordic-styled lamp and fireplace store. Its signature feature is a "Lights ON/OFF" toggle that switches every product image between a lights-off state (white/bright studio shots) and a lights-on state (dark, warm, atmospheric shots showing each lamp illuminated). The demo has received strong positive reception and is the developer's most popular project to date.
The goal is to evolve this showcase into a revenue-generating platform by building a shared "image state transformation" engine powered by Google's Nano Banana API (Gemini 2.5 Flash Image), then deploying that engine across multiple monetisation channels simultaneously.

Phase 0: Upgrade to React Router v7 Framework Mode
Why
The current app is a client-rendered SPA. Every revenue channel requires server-side capabilities: API key protection for Nano Banana, Stripe webhook endpoints, SEO for marketing pages, and server-side image processing orchestration. React Router v7 framework mode (the spiritual successor to Remix) provides all of this while preserving the existing React Router codebase.
What changes

Add react-router.config.ts to enable framework mode
Convert the entry point to use createBrowserRouter → framework conventions (root route, layout routes, loaders/actions)
Add server entry (entry.server.tsx) for SSR
Move sensitive logic (Nano Banana API calls, Stripe, Supabase admin) into loaders/actions (server-only code)
Keep the existing interactive toggle component largely as-is; it's client-side UI and doesn't need to change
Add Vite as the build tool if not already present (React Router v7 uses Vite)

What stays the same

All existing React components, styling, and the toggle interaction
The product data structure and image assets
TailwindCSS (or whatever CSS approach is currently used)

Phase 1: The Shared Engine (Week 1)
This is the reusable core that powers every revenue channel. Build it once, deploy it everywhere.
1.1 Nano Banana Integration Service
A server-side module that handles all communication with Google's Nano Banana API.
Core functions:

transformImage(sourceImage, transformationType, options) — Takes a source image and generates an alternate state. Transformation types include:

lights-on / lights-off — The Illuminate signature effect
day-to-night / night-to-day
empty-to-staged — For virtual staging
plain-to-lifestyle — Product on white background → product in styled scene

batchTransform(images[], transformationType, options) — Process multiple images
getTransformationStatus(jobId) — For async/queued processing

Implementation notes:

All API calls happen server-side via React Router loaders/actions
Store API keys in environment variables, never expose to client
Implement rate limiting and queue management (Nano Banana has rate limits)
Cache generated images in Supabase Storage or S3 to avoid re-generating
Store transformation metadata (source hash, params, output URL) in Supabase DB for deduplication

1.2 Interactive Toggle Component (Already Exists — Extract & Generalise)
Take the existing Illuminate lights on/off toggle and make it a reusable, embeddable component.
Requirements:

Accept any two (or more) image states, not just lights on/off
Configurable transition animation (crossfade, slider, flip, morph)
Configurable toggle UI (switch, slider, button, hover)
Responsive — works at any container size
Exportable as an embeddable script (for Shopify embed and white-label use later)
Accessible (keyboard navigation, screen reader labels for states)

1.3 Database & Auth (Supabase)

User accounts (email + OAuth)
Projects/workspaces (a user can have multiple transformation projects)
Image storage (source images + generated outputs)
Usage tracking (transformations consumed per billing period)
API key management (for white-label/agency partners, later)

1.4 Payments (Stripe)

Stripe Checkout for one-off purchases (productised service batches)
Stripe Subscriptions for recurring plans (SaaS tiers)
Webhook handler (React Router action route) for subscription lifecycle events
Usage-based billing metering (track transformations, report to Stripe)
Customer portal link for self-service billing management

Phase 2: Revenue Channels (Weeks 2-4, Parallel Tracks)
Channel A: Productised Service — "Illuminate Studio"
What it is: A done-for-you service where customers upload product photos and receive interactive showcase pages with AI-generated alternate states.
Pricing:

Starter: £149 — 8 products, 2 states each (on/off), hosted showcase page
Pro: £299 — 20 products, 3+ states, custom domain embed, analytics
Enterprise: £POA — bulk, API access, custom integration

Pages to build:

Marketing landing page (/studio) — SEO-optimised, showcases the Illuminate demo as proof
Order form (/studio/order) — Upload images, select package, pay via Stripe Checkout
Dashboard (/studio/dashboard) — Customer views their projects, downloads embeds
Admin panel (/studio/admin) — You manage orders, run transformations, deliver results

Launch timeline: This can go live as soon as the landing page and Stripe Checkout are wired up. The actual transformation work is semi-manual at first (you run Nano Banana, do QA, deliver). Automate progressively.
Channel B: Self-Serve SaaS — "Illuminate App"
What it is: A self-service tool where users upload images, generate alternate states via Nano Banana, and get embeddable interactive toggles for their own sites.
Pricing tiers:

Free: 5 transformations/month, Illuminate watermark on embed
Pro (£19/month): 100 transformations/month, no watermark, custom CSS
Business (£49/month): 500 transformations/month, custom domain, API access, priority rendering

Key pages:

App dashboard (/app) — List of projects
Project editor (/app/project/:id) — Upload images, configure states, preview toggle, get embed code
Embed code generator — Produces a <script> tag or iframe that merchants paste into their site
Account & billing (/app/settings)

This is the longer build but the highest-value channel long-term. The productised service (Channel A) funds development time and validates demand.
Channel C: Shopify App — "Product State Switcher" (Week 3-4)
What it is: A Shopify app that adds interactive product state toggling to any Shopify store.
Why it's separate: Shopify apps have their own auth flow (OAuth), their own app bridge UI, and their own billing (Shopify handles subscriptions). The Shopify app is a distribution channel into their app store, but under the hood it calls the same Nano Banana engine.
Pricing: $9/month (manual upload) / $19/month (AI-generated states)
Technical notes:

Shopify CLI scaffolds Remix (React Router v7's sibling) — this aligns with your framework choice
The Shopify app can be a separate repo/deploy that calls your core API, OR a monorepo with shared packages
Shopify takes 0% on first $1M revenue
App review process takes 1-4 weeks; submit early

Defer this to week 3-4. Get the core engine and Channel A live first.
Channel D: Agency White-Label (Month 2+)
What it is: Agencies get a branded version of the tool to offer their clients.
Implementation: This is mostly a Supabase row-level security + theming layer on top of Channel B. Each agency gets: custom subdomain or CNAME, their logo/colours, their own client accounts underneath, a billing relationship with you (flat monthly fee or per-transformation usage).
Defer until Channel B is stable. The work to enable this is incremental once the SaaS exists.

Tech Stack
LayerChoiceWhyFrameworkReact Router v7 (framework mode)Upgrade, not rewrite. SSR + loaders/actions. Shopify alignment.StylingTailwindCSSAlready in use (assumed). Utility-first, fast iteration.Database + AuthSupabaseAuth, Postgres, Storage, Realtime. Generous free tier.AI Image GenerationNano Banana API (Gemini 2.5 Flash Image)Strong at image editing/transformation. API access confirmed.PaymentsStripeCheckout, Subscriptions, Usage billing, Customer Portal.HostingVercel or Cloudflare PagesEdge deployment, serverless functions for loaders/actions.Image CDN/StorageSupabase Storage or Cloudflare R2Store source + generated images. Serve via CDN.Queue (if needed)Inngest or BullMQFor async batch transformation jobs. Can defer until needed.
Estimated monthly infrastructure cost at MVP: Under £50/month (Supabase free tier, Vercel free tier, Nano Banana API usage pay-as-you-go, Stripe 1.4% + 20p per transaction UK).

File Structure (Target)
illuminate/
├── app/
│ ├── root.tsx # Root layout, global providers
│ ├── entry.server.tsx # SSR entry
│ ├── entry.client.tsx # Client hydration
│ │
│ ├── routes/
│ │ ├── \_index.tsx # Homepage — the Illuminate showcase
│ │ ├── \_marketing.tsx # Layout for marketing pages
│ │ ├── \_marketing.studio.tsx # Productised service landing page
│ │ ├── \_marketing.pricing.tsx # Pricing page
│ │ │
│ │ ├── \_app.tsx # Layout for authenticated app
│ │ ├── \_app.dashboard.tsx # User dashboard
│ │ ├── \_app.project.$id.tsx   # Project editor
│   │   ├── _app.settings.tsx      # Account & billing
│   │   │
│   │   ├── _admin.tsx             # Admin layout
│   │   ├── _admin.orders.tsx      # Manage service orders
│   │   │
│   │   ├── api.webhooks.stripe.tsx # Stripe webhook handler
│   │   ├── api.transform.tsx       # Transformation API endpoint
│   │   └── api.embed.$projectId.tsx # Serve embeddable widget JS
│ │
│ ├── components/
│ │ ├── image-toggle/ # The core interactive toggle (extracted from showcase)
│ │ │ ├── ImageToggle.tsx
│ │ │ ├── transitions/ # Crossfade, slider, flip animations
│ │ │ └── controls/ # Switch, slider, button, hover triggers
│ │ ├── ui/ # Shared UI components
│ │ └── marketing/ # Landing page sections
│ │
│ ├── services/
│ │ ├── nano-banana.server.ts # Nano Banana API client (server-only)
│ │ ├── stripe.server.ts # Stripe client + helpers
│ │ ├── supabase.server.ts # Supabase admin client
│ │ └── supabase.client.ts # Supabase browser client
│ │
│ ├── lib/
│ │ ├── auth.ts # Auth helpers
│ │ ├── billing.ts # Plan/usage logic
│ │ └── image-processing.ts # Image resize, optimise, format
│ │
│ └── types/
│ └── index.ts # Shared TypeScript types
│
├── public/
│ ├── images/ # Static showcase images
│ └── embed.js # Compiled embeddable toggle widget
│
├── supabase/
│ └── migrations/ # Database schema migrations
│
├── react-router.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── .env.local # NANO_BANANA_API_KEY, STRIPE_SECRET_KEY, SUPABASE_URL, etc.
└── package.json

Database Schema (Supabase / Postgres)
sql-- Users (extends Supabase auth.users)
create table public.profiles (
id uuid references auth.users primary key,
display_name text,
stripe_customer_id text unique,
plan text default 'free' check (plan in ('free', 'pro', 'business', 'agency')),
transformations_used int default 0,
transformations_limit int default 5,
billing_period_start timestamptz,
created_at timestamptz default now()
);

-- Projects
create table public.projects (
id uuid primary key default gen_random_uuid(),
user_id uuid references public.profiles not null,
name text not null,
slug text unique,
settings jsonb default '{}', -- toggle type, animation, custom CSS
is_public boolean default false,
created_at timestamptz default now(),
updated_at timestamptz default now()
);

-- Image states within a project
create table public.image_states (
id uuid primary key default gen_random_uuid(),
project_id uuid references public.projects on delete cascade not null,
product_name text,
sort_order int default 0,
states jsonb not null, -- [{label: "Off", image_url: "..."}, {label: "On", image_url: "..."}]
created_at timestamptz default now()
);

-- Transformation jobs
create table public.transformations (
id uuid primary key default gen_random_uuid(),
user_id uuid references public.profiles not null,
project_id uuid references public.projects,
source_image_url text not null,
source_image_hash text, -- for deduplication
transformation_type text not null,
parameters jsonb default '{}',
status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
result_image_url text,
error_message text,
created_at timestamptz default now(),
completed_at timestamptz
);

-- Service orders (Channel A: productised service)
create table public.service_orders (
id uuid primary key default gen_random_uuid(),
user_id uuid references public.profiles,
package text not null, -- 'starter', 'pro', 'enterprise'
stripe_payment_id text,
status text default 'pending' check (status in ('pending', 'paid', 'in_progress', 'delivered', 'cancelled')),
brief jsonb, -- customer requirements, uploaded images, etc.
deliverables jsonb, -- links to completed showcase
amount_paid int, -- in pence
created_at timestamptz default now(),
delivered_at timestamptz
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.image_states enable row level security;
alter table public.transformations enable row level security;
alter table public.service_orders enable row level security;

Milestones
WeekDeliverableRevenue channel0React Router v7 framework mode upgrade. Existing showcase working with SSR.—1Core engine: Nano Banana service, generalised toggle component, Supabase schema, Stripe integration—1"Illuminate Studio" landing page + order flow liveChannel A2Self-serve app MVP: upload → transform → preview → embed codeChannel B3Shopify app scaffolded, using core engine APIChannel C4Shopify app submitted for review. Agency white-label scopingChannel C prep6+Agency partnerships, iterate based on real usage dataChannel D

Risks & Mitigations
Nano Banana API reliability/rate limits. Mitigation: aggressive caching of generated images, queue-based processing with retries, fallback to manual generation for service orders. Keep the architecture model-agnostic so you could swap in Replicate/Stability AI if needed.
Shopify app rejection. Their review process is strict on performance, accessibility, and code quality. Mitigation: build to their guidelines from day one, test with Lighthouse, submit early. The app works independently of the other channels, so rejection doesn't block revenue.
Low initial demand. The productised service might not get traction immediately. Mitigation: the Illuminate showcase IS the marketing. Post it on Product Hunt, Indie Hackers, X/Twitter, relevant Shopify merchant communities. Every transformation you do becomes a portfolio piece.
Scope creep across four channels. Mitigation: Channel A is semi-manual and generates revenue with just a landing page. Channel B is the core product. Channel C is a distribution wrapper. Channel D is a permissions layer. They share 80% of the same code. Don't build four products; build one engine with four frontends.
