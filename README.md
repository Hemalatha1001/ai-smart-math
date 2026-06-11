# Calcverse — Smart AI Multi Calculator

An AI-powered web application that brings together 10+ powerful calculators in one beautiful, modern interface. From quick arithmetic to scientific equations, financial planning, health metrics, and an AI math solver — all with step-by-step explanations and a polished user experience.

**Live Demo:** [https://ai-smart-math.lovable.app](https://ai-smart-math.lovable.app)

---

## Features

- **10+ Calculators** — Basic, Scientific, EMI/Loan, BMI, GPA, Unit Converter, Age, Percentage, and more
- **AI Math Solver** — Powered by AI SDK with step-by-step explanations
- **User Authentication** — Magic link email sign-in via Supabase Auth
- **Calculation History** — Save and revisit past calculations (authenticated users)
- **Leaderboard** — Gamified ranking system for active users
- **Admin Dashboard** — Protected admin panel for analytics and management
- **Responsive Design** — Fully responsive UI optimized for all devices
- **Dark/Light Mode** — Theme-aware design system
- **Modern UI** — Glassmorphism, gradients, and smooth animations

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [TanStack Start v1](https://tanstack.com/start) (Full-stack React 19) |
| Language | TypeScript (Strict) |
| Styling | Tailwind CSS v4 + Custom Design Tokens |
| UI Components | shadcn/ui + Radix UI primitives |
| State & Data | TanStack Query + TanStack Router |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS) |
| AI | AI SDK (@ai-sdk/openai-compatible) |
| Build Tool | Vite 7 |
| Package Manager | Bun |
| Runtime | Cloudflare Workers (Wrangler) |

---

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 18 (for compatibility)
- A [Supabase](https://supabase.com) project
- (Optional) An OpenAI-compatible API key for AI solver features

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# Server-side Supabase (used in server functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_PROJECT_ID=your-project-id

# Note: SUPABASE_SERVICE_ROLE_KEY is managed as a runtime secret
# and is NOT stored in .env for security reasons.
```

### Getting Supabase Credentials

1. Create a project at [Supabase](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy:
   - `URL` → `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY`
   - `Project ID` → `VITE_SUPABASE_PROJECT_ID` / `SUPABASE_PROJECT_ID`

### Runtime Secrets (for Lovable Cloud / Edge Functions)

If deploying via Lovable Cloud, the following secrets are managed separately:

- `SUPABASE_SERVICE_ROLE_KEY` — For admin/elevated server operations (never expose client-side)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Hemalatha1001/ai-smart-math.git
cd ai-smart-math

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

---

## Running the App

### Development Server

```bash
bun dev
```

The app will be available at `http://localhost:3000` (or the port shown in your terminal).

### Build for Production

```bash
# Production build
bun run build

# Development build
bun run build:dev
```

### Preview Production Build

```bash
bun run preview
```

### Lint & Format

```bash
# Run ESLint
bun run lint

# Format with Prettier
bun run format
```

---

## Project Structure

```
ai-smart-math/
├── src/
│   ├── components/          # Reusable UI components (shadcn/ui + custom)
│   ├── lib/                 # Utility libraries (auth, calculators, etc.)
│   ├── routes/              # TanStack Start file-based routes
│   │   ├── __root.tsx       # Root layout (HTML shell, providers)
│   │   ├── index.tsx        # Homepage with calculator directory
│   │   ├── login.tsx        # Login page
│   │   ├── reset-password.tsx
│   │   ├── calc.$slug.tsx   # Calculator detail pages
│   │   ├── _authenticated.tsx    # Auth guard layout
│   │   └── _authenticated/       # Protected routes
│   │       ├── history.tsx       # User calculation history
│   │       ├── leaderboard.tsx   # Global leaderboard
│   │       └── admin.tsx         # Admin dashboard
│   ├── server.ts            # SSR entry point (Cloudflare Worker)
│   ├── start.ts             # TanStack Start configuration
│   ├── router.tsx           # Router setup
│   └── styles.css           # Global styles, Tailwind config, design tokens
├── supabase/
│   └── migrations/          # Database migrations (RLS policies, tables)
├── .env                     # Environment variables (gitignored)
├── vite.config.ts           # Vite configuration
├── wrangler.jsonc           # Cloudflare Workers deployment config
├── bun.lock                 # Bun lockfile
└── package.json             # Dependencies and scripts
```

---

## Database Setup (Supabase)

### Required Tables

The app uses the following Supabase tables (managed via migrations in `supabase/migrations/`):

- **`profiles`** — User profiles linked to Supabase Auth
- **`user_roles`** — Role-based access control (admin, user)
- **`calculations`** — Saved calculation history
- **`leaderboard`** — User scores and rankings

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- `authenticated` users — Read/write own data
- `service_role` — Admin operations
- `has_role()` helper function — For admin privilege checks

### Running Migrations

Migrations are applied automatically when using Lovable Cloud. For manual Supabase projects:

```bash
# Using Supabase CLI
supabase db push
```

---

## Authentication

The app uses **Supabase Auth** with **Magic Link / OTP email** authentication:

1. User enters their email
2. A magic link is sent to their inbox
3. Clicking the link authenticates the user automatically

No passwords required. The auth flow is handled via:
- `src/lib/auth.ts` — Auth hook and session management
- `src/components/AuthCard.tsx` — Auth UI component
- `src/routes/_authenticated.tsx` — Route guard for protected pages

---

## Deployment

### Lovable Cloud (Recommended)

This project is built for [Lovable](https://lovable.dev) deployment:

1. Push to your connected GitHub repository
2. Lovable automatically builds and deploys
3. Live URL: `https://your-project.lovable.app`

### Self-Hosting / Cloudflare Workers

The app is configured for Cloudflare Workers via Wrangler:

```bash
# Build the project
bun run build

# Deploy (requires Wrangler CLI + Cloudflare account)
npx wrangler deploy
```

Ensure the `SUPABASE_SERVICE_ROLE_KEY` is configured as a secret in your hosting environment:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@tanstack/react-start` | Full-stack React framework (SSR + server functions) |
| `@tanstack/react-router` | File-based routing with type safety |
| `@tanstack/react-query` | Server state management |
| `@supabase/supabase-js` | Supabase client |
| `ai` + `@ai-sdk/openai-compatible` | AI SDK for streaming responses |
| `tailwindcss` + `tw-animate-css` | Utility-first CSS + animations |
| `zod` | Schema validation |
| `react-hook-form` + `@hookform/resolvers` | Form handling |
| `recharts` | Charts and data visualization |
| `mathjs` | Math expression evaluation |
| `lucide-react` | Icon library |
| `sonner` | Toast notifications |

---

## Security Notes

- **Never commit `.env`** — It contains API keys (already gitignored)
- **RLS is enforced** on all database tables
- **`SUPABASE_SERVICE_ROLE_KEY`** bypasses RLS — keep it server-side only
- **`has_role()`** security definer function restricts admin operations
- The `user_roles` table is locked down — only `service_role` can modify roles

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

[MIT](LICENSE) — feel free to use and modify for your own projects.

---

<p align="center">
  Built with ❤️ using <a href="https://tanstack.com/start">TanStack Start</a>, <a href="https://supabase.com">Supabase</a>, and <a href="https://lovable.dev">Lovable</a>
</p>
