# Personal Site — Rigels

A personal blog and portfolio built with Next.js 15, TypeScript, MDX, and PostgreSQL.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + React 19, App Router, Turbopack |
| Styling | Tailwind CSS 4 + Typography plugin |
| Content | MDX Remote, Gray Matter |
| Auth | NextAuth 4 (GitHub OAuth) |
| Database | PostgreSQL via Neon + Prisma 5 |
| Testing | Jest 30 + Testing Library |
| Runtime | pnpm |

## Features

- **Blog posts** with MDX, reading time, tag categories, and project series
- **View counting** — per-post analytics tracked in the DB
- **Comments** — anonymous, shared across all visitors, stored in DB
- **Admin panel** at `/admin` — create and edit posts with Monaco editor
- **Dark/light theme** with system preference detection
- **Featured posts carousel** and popular posts ranking

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A [Neon](https://neon.tech) PostgreSQL database
- A GitHub OAuth app (for admin auth)

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

# GitHub OAuth (create at github.com/settings/developers)
GITHUB_ID=<oauth-app-client-id>
GITHUB_SECRET=<oauth-app-client-secret>

# Admin access — comma-separated GitHub usernames
ADMIN_GITHUB_LOGINS=yourusername

# Neon PostgreSQL
DATABASE_URL=postgresql://<pooled-connection-string>
MIGRATE_DATABASE_URL=postgresql://<direct-connection-string>

# Content backend: "db" or "fs"
CONTENT_BACKEND=db
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

### Creating a Post

Add a `.mdx` file to `src/content/posts/`:

```mdx
---
title: "Your Post Title"
description: "SEO-friendly description"
date: "2025-01-18"
tags: ["tech", "philosophy"]
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
| `images` | No | Array of image paths for the carousel |

### Tag Categories

| Category | Tags |
|----------|------|
| Philosophy & Thoughts | `philosophy`, `thoughts` |
| Tech & Programming | `tech`, `programming`, `tutorial` |
| Data Analytics | `analytics` |

### Project Series

1. Create a project page at `src/content/projects/my-project.mdx`
2. Add `project: "my-project"` to posts that belong to it
3. Use `order: 1`, `order: 2` etc. to set reading order

### Adding Images

1. Place images in `public/images/posts/your-post-slug/`
2. Reference them as `/images/posts/your-post-slug/image.jpg`
3. Use the `<Figure>` component for optimized images with captions:

```jsx
<Figure
  src="/images/posts/your-slug/hero.jpg"
  alt="Description"
  caption="Optional caption"
  priority={true}
/>
```

## Admin Panel

Visit `/admin` (requires GitHub login with an account in `ADMIN_GITHUB_LOGINS`).

- **Dashboard** — list, edit, delete posts
- **Create** — write posts with Monaco editor and live preview
- **Edit** — update existing posts

## Database Schema

| Model | Purpose |
|-------|---------|
| `Post` | Blog posts |
| `Project` | Project pages with linked posts |
| `ViewCount` | Per-post view analytics |
| `Comment` | Anonymous comments per post |

## Deployment

Deployed on Vercel. Set all environment variables from `.env.local` in the Vercel dashboard under Project → Settings → Environment Variables.

The `postinstall` script runs `prisma generate` automatically during Vercel builds.

## Troubleshooting

**Prisma Studio shows `DATABASE_URL not found`**
The `pnpm db:studio` script handles this automatically by loading `.env.local`. If running `prisma studio` directly, use:
```bash
sh -c 'set -a && . .env.local && set +a && prisma studio'
```

**`NEXT_PUBLIC_ADMIN_GITHUB_LOGINS` is not needed**
Admin status is resolved server-side. Only `ADMIN_GITHUB_LOGINS` (no `NEXT_PUBLIC_` prefix) is required.
