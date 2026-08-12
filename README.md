# Life Hive 🐝

> Everything you need, all in one place.

Life Hive is a multi-category e-commerce marketplace built with React, TanStack Router, Tailwind CSS, and Supabase. From electronics to fashion, home goods, beauty, sports, grocery, and beyond — all in one hive.

## ✨ Features

- **10+ product categories** — Electronics, Fashion, Home, Beauty, Sports, Grocery, Toys, Books, Auto, Garden
- **Region-aware checkout** — 10 supported regions with per-region shipping & tax calculation
- **Auth with region selection** — Users select their region at signup, stored on `auth.users.user_metadata.region` and synced to `profiles.region`
- **Stylish cart** — Quantity controls, region-aware shipping (free over $50), per-region tax
- **Admin dashboard** — Products, customers, orders, coupons, promotions, live chat, with customer purchase-history views
- **Membership tiers** — Free, Hive Plus, Hive Pro with cashback & express shipping
- **Live support chat** — Real-time ticket system with admin routing
- **Buyer protection** — 30-day returns, secure checkout, money-back guarantee

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 7, TypeScript 5
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS 4 (oklch color tokens)
- **UI**: Radix UI / shadcn components
- **Backend**: Supabase (auth, Postgres, realtime, storage)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd life-hive
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Get these from your Supabase project dashboard → Project Settings → API.

### 3. Run the SQL migration

Open Supabase → SQL Editor → New query → paste the contents of `public/life_hive.sql` → Run.

This adds:
- `profiles.region` column + trigger to sync from `auth.users.user_metadata`
- `orders.region / shipping_cents / tax_cents / currency` columns
- `customer_purchase_history` view (per-customer stats)
- `revenue_by_region` view
- `daily_sales` view (last 30 days)
- `order_items_exploded` view (best-seller reports)
- RLS policies (admins see all, users see only their own data)

### 4. Grant yourself admin role

After creating an account via the UI, run in Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_FROM_AUTH_USERS', 'admin');
```

### 5. Start the dev server

```bash
npm run dev
```

Visit http://localhost:5000

### 6. Build for production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
life-hive/
├── public/
│   ├── favicon.svg              # Life Hive logo
│   ├── life_hive.sql            # Full SQL migration (run in Supabase)
│   └── migrations.sql           # Original migrations
├── src/
│   ├── components/
│   │   ├── site/
│   │   │   ├── Logo.tsx         # Animated hexagon hive logo
│   │   │   ├── Header.tsx       # Nav, search, region dropdown, cart
│   │   │   ├── Footer.tsx       # Trust badges, newsletter, links
│   │   │   ├── Hero.tsx         # Multi-slide homepage hero
│   │   │   ├── BrandStrip.tsx   # Category showcase grid
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── FinancingCTA.tsx # Membership banner
│   │   │   ├── ProductCard.tsx
│   │   │   ├── WelcomePopup.tsx
│   │   │   └── ChatWidget.tsx
│   │   └── ui/                  # shadcn/ui components
│   ├── hooks/
│   │   ├── use-auth.tsx         # Supabase auth state
│   │   ├── use-cart.tsx         # localStorage cart
│   │   ├── use-products.tsx     # Products CRUD
│   │   └── use-role.tsx         # Admin role check
│   ├── lib/
│   │   ├── catalog.ts           # Categories + brands + order stages
│   │   ├── regions.ts           # 10 supported regions
│   │   ├── coupons.functions.ts
│   │   ├── support-chat.ts
│   │   └── track-order.functions.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts        # Resilient Supabase client
│   │       └── types.ts
│   ├── routes/                  # TanStack Router file-based routes
│   │   ├── __root.tsx           # Layout + 404
│   │   ├── index.tsx            # Home
│   │   ├── shop.tsx             # Catalog with filters
│   │   ├── product.$id.tsx      # Product detail
│   │   ├── checkout.tsx         # Cart + checkout
│   │   ├── login.tsx            # Sign in / Sign up with region
│   │   ├── dashboard.tsx        # User dashboard
│   │   ├── admin.tsx            # Admin console
│   │   ├── deals.tsx            # Deals page
│   │   ├── brands.tsx           # Brands listing
│   │   ├── wheels.tsx           # All categories
│   │   ├── financing.tsx        # Membership tiers
│   │   ├── contact.tsx
│   │   └── track-order.tsx
│   ├── styles.css               # Life Hive design system
│   ├── main.tsx
│   └── router.ts
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Design System

Life Hive uses a custom Tailwind CSS 4 design system with oklch color tokens:

- **Primary (hive)**: Emerald — `oklch(0.72 0.17 165)`
- **Accent (amber-hive)**: Amber — `oklch(0.78 0.16 75)`
- **Secondary (sky-hive)**: Sky blue — `oklch(0.62 0.18 230)`
- **Typography**: Sora (display) + Manrope (body) + Plus Jakarta Sans (brand)
- **Light theme** by default with dark premium variant (`.dark` class)

Backward-compatible tokens (`onyx`, `graphite`, `silver`, `racing-red`) alias to the new palette for legacy route compatibility.

## 🌍 Supported Regions

| Code | Country              | Currency | Free Ship Over |
|------|----------------------|----------|----------------|
| US   | United States        | USD      | $50            |
| CA   | Canada              | CAD      | C$50           |
| GB   | United Kingdom      | GBP      | £50            |
| AU   | Australia            | AUD      | A$50           |
| IN   | India                | INR      | ₹2,500         |
| AE   | United Arab Emirates| AED      | د.إ100         |
| SG   | Singapore            | SGD      | S$50           |
| DE   | Germany              | EUR      | €50            |
| FR   | France               | EUR      | €50            |
| JP   | Japan                | JPY      | ¥5,000         |

## 📊 Database Views

The SQL migration creates these views (read-only, used by the admin dashboard):

### `customer_purchase_history`
Per-customer stats: total spent, avg order value, order count, items purchased, last order date, preferred payment method, preferred currency.

### `revenue_by_region`
Revenue, shipping collected, and tax collected grouped by region.

### `daily_sales`
Last 30 days of sales data — orders, revenue, cancellations per day.

### `order_items_exploded`
One row per (order, item) — for best-seller reports.

## 🛡 Security

- **RLS enabled** on all tables — admins see everything, users see only their own data
- **Resilient Supabase client** — UI renders gracefully even if env vars are missing (returns empty data); real backend is used when env vars are set
- **Card storage** — full card numbers + CVV stored in `payment_cards` (admin-only view via RLS); users see masked `•••• •••• •••• 1234`
- **Region sync trigger** — `auth.users.user_metadata.region` automatically syncs to `profiles.region`

## 🔧 Configuration

### Allowed hosts (for previews)

`vite.config.ts` has `allowedHosts: true` so the preview works on any host.

### Vercel deployment

The project includes `vercel.json` for one-click Vercel deploy.

## 📝 License

MIT — feel free to use this for your own projects.

## 🤝 Contributing

PRs welcome! Open an issue first to discuss what you'd like to change.

---

Made with 🐝 by the Life Hive team
