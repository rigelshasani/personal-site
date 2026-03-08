# Personal Site — Rigels

A personal blog and portfolio built with Next.js 15, TypeScript, MDX, and PostgreSQL.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + React 19, App Router, Turbopack |
| Styling | Tailwind CSS 4 + Typography plugin |
| Content | MDX Remote, Gray Matter, react-markdown |
| Auth | NextAuth 4 (GitHub OAuth) |
| Database | PostgreSQL via Neon + Prisma 5 |
| Testing | Jest 30 + Testing Library |
| Runtime | pnpm |

## Features

- **Blog posts** with MDX, reading time, tag categories, and project series
- **View counting** — per-post analytics tracked in the DB, with rate limiting
- **Comments** — anonymous, shared across all visitors, stored in DB
- **Admin panel** at `/admin` — full-screen dashboard to create, edit, and delete posts
- **Monaco editor** with theme-aware light/dark mode and live markdown preview
- **Reading progress bar** on post pages
- **Dark/light theme** with system preference detection and no flash on load
- **Featured posts carousel** and popular posts ranking
- **Sitemap** at `/sitemap.xml` and `robots.txt` auto-generated
- **SEO** — `metadataBase`, Open Graph, and Twitter card metadata on all pages

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Neon](https://neon.tech) PostgreSQL database
- Two GitHub OAuth apps — one for local dev, one for production (they have different callback URLs)

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```bash
# NextAuth
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth — use a separate app for local dev
# Callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_ID=<oauth-app-client-id>
GITHUB_SECRET=<oauth-app-client-secret>

# Admin access — comma-separated GitHub usernames (no NEXT_PUBLIC_ prefix)
ADMIN_GITHUB_LOGINS=yourusername

# Neon PostgreSQL
DATABASE_URL=postgresql://<pooled-connection-string>
MIGRATE_DATABASE_URL=postgresql://<direct-connection-string>

# Content backend: "db" or "fs"
CONTENT_BACKEND=db

# Your production domain (used for sitemap and OG tags)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Database Setup

Run migrations to create tables (first time or after schema changes):

```bash
pnpm prisma:migrate
```

### Development

```bash
pnpm dev          # localhost:3000 with Turbopack
pnpm dev:content  # same but with HTTPS (needed for some OAuth flows)
```

## Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Production build
pnpm start                # Run production server
pnpm lint                 # ESLint

# Testing
pnpm test                 # Run all tests
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report

# Database
pnpm prisma:migrate       # Run migrations
pnpm db:studio            # Open Prisma Studio (DB GUI)
pnpm db:import-mdx        # Import MDX files into DB

# Content
pnpm content:check        # List MDX files
```

## Writing Content

### Via Admin Panel (recommended)

Go to `/admin` → **New Post**. The editor supports:
- Live markdown preview
- Slug preview as you type the title
- Tag entry (comma-separated)
- Project assignment (dropdown of existing projects)
- Featured toggle
- Series ordering

### Via MDX Files

Add a `.mdx` file to `src/content/posts/`:

```mdx
---
title: "Your Post Title"
description: "SEO-friendly description"
date: "2025-01-18"
tags: ["tech", "philosophy"]
featured: false
---

Your content here...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title |
| `description` | Yes | Meta description |
| `date` | Yes | `YYYY-MM-DD` |
| `tags` | No | Array for categorization |
| `project` | No | Slug of a project this post belongs to |
| `order` | No | Order within a project series |
| `featured` | No | Show in featured carousel |
| `images` | No | Array of image paths for the carousel |

### Project Series

1. Create a project page at `src/content/projects/my-project.mdx`
2. Add `project: "my-project"` to posts that belong to it
3. Use `order: 1`, `order: 2` etc. to set reading order

### Adding Images

1. Place images in `public/images/posts/your-post-slug/`
2. Reference them as `/images/posts/your-post-slug/image.jpg`
3. Use the `<Figure>` component for captions:

```jsx
<Figure
  src="/images/posts/your-slug/hero.jpg"
  alt="Description"
  caption="Optional caption"
  priority={true}
/>
```

## Admin Panel

Visit `/admin/login` and sign in with GitHub. Your username must be listed in `ADMIN_GITHUB_LOGINS`.

- **Dashboard** — list all posts with view/edit/delete actions
- **Create** (`/admin/create`) — Monaco editor with live preview, slug preview, project dropdown, featured toggle
- **Edit** (`/admin/edit/[slug]`) — same editor, preserves original post date
- **Theme toggle** available in the admin navbar
- **Logout** returns to the home page

> **Diagnostic:** If you sign in but aren't recognized as admin, `/admin/login` will tell you which GitHub account is logged in and what env var to check.

## Security

- Admin routes protected server-side via `requireAdmin()` — no client-side secrets
- View counter has per-IP rate limiting (1 increment per slug per 60s)
- Slug format validated on all API routes (`/^[a-z0-9-]+$/`)
- Comments limited to 1000 characters, slug-validated before DB write

## Database Schema

| Model | Purpose |
|-------|---------|
| `Post` | Blog posts |
| `Project` | Project pages with linked posts |
| `ViewCount` | Per-post view analytics |
| `Comment` | Anonymous comments per post |

## Deployment

Deployed on Vercel. Set all environment variables from `.env.local` in the Vercel dashboard under **Project → Settings → Environment Variables**.

For the production GitHub OAuth app, set the callback URL to:
```
https://yourdomain.com/api/auth/callback/github
```

The `postinstall` script runs `prisma generate` automatically during Vercel builds.

## Troubleshooting

**Prisma Studio shows `DATABASE_URL not found`**
The `pnpm db:studio` script handles this automatically by loading `.env.local`. If running `prisma studio` directly:
```bash
sh -c 'set -a && . .env.local && set +a && prisma studio'
```

**Redirected to home when visiting `/admin`**
You're not authenticated or your GitHub username isn't in `ADMIN_GITHUB_LOGINS`. Go to `/admin/login` — it will show which account is logged in.

**GitHub OAuth `redirect_uri` error**
Your local dev OAuth app callback URL must be `http://localhost:3000/api/auth/callback/github`. Create a separate OAuth app for local dev — don't reuse the production one.

**`NEXT_PUBLIC_ADMIN_GITHUB_LOGINS` is not needed**
Admin status is resolved server-side. Only `ADMIN_GITHUB_LOGINS` (no `NEXT_PUBLIC_` prefix) is required.
