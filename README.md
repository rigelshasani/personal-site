# Personal Site - Rigels

A modern, feature-rich personal blog built with Next.js 15, TypeScript, and MDX. Designed for optimal performance, developer experience, and user engagement.

## Features

### Content Management
- **MDX Support** - Write posts with React components embedded in Markdown
- **Tag-based Categorization** - Automatic grouping by Philosophy, Tech, Analytics, and more
- **Project Series** - Link related posts together in project collections
- **Image Optimization** - Automatic WebP/AVIF conversion with blur placeholders
- **Hot Reload** - Enhanced development experience with real-time content updates

### User Experience
- **OpenAI-Style Homepage** - Beautiful featured post cards with image overlays
- **Minimalist Carousel** - Auto-playing featured posts with smooth navigation
- **Visual Analytics** - Anonymous view tracking with animated feedback
- **Theme Toggle** - Light/dark mode with system preference detection
- **Responsive Design** - Optimized for all screen sizes

### Performance
- **Next.js 15** - Latest features with Turbopack for fast development
- **Smart Images** - Optimized loading with responsive sizing
- **Intelligent Caching** - Development content caching with auto-invalidation
- **Real-time Updates** - Live view count updates across tabs

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── posts/[slug]/      # Dynamic post routes
│   ├── projects/[slug]/   # Dynamic project routes
│   └── layout.tsx         # Root layout with progress bar
├── components/            # React components
│   ├── FeaturedPostCard.tsx      # Hero post cards
│   ├── FeaturedPostsCarousel.tsx # Auto-playing carousel
│   ├── ViewCounter.tsx           # Anonymous analytics
│   ├── PopularPosts.tsx          # Most viewed posts
│   ├── DevToolbar.tsx            # Development utilities
│   └── mdx/                      # MDX components
│       ├── Figure.tsx            # Optimized images
│       └── OptimizedImage.tsx    # General images
├── content/               # Content files
│   ├── posts/            # Blog posts (.mdx)
│   └── projects/         # Project pages (.mdx)
├── lib/                  # Core utilities
│   ├── content.ts        # Content parsing & caching
│   ├── view-counter.ts   # Anonymous analytics
│   └── dev-utils.ts      # Development helpers
├── hooks/                # React hooks
│   └── useViewCounter.ts # View tracking logic
└── styles/               # Global styles
    └── global.css        # Tailwind + custom CSS
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd personal-site

# Install dependencies
pnpm install

# Start development server
pnpm dev

# For enhanced content development
pnpm dev:content
```

### Development Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm dev:content  # Dev server with HTTPS for enhanced features
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint checking
pnpm content:check # Validate content files
```

## Writing Content

### Creating Posts

Create `.mdx` files in `src/content/posts/`:

```mdx
---
title: "Your Post Title"
description: "SEO-friendly description"
date: "2025-01-18"
tags: ["tech", "analytics", "philosophy"]
project: "optional-project-slug"  # Links to project series
order: 1                          # Order within project
images: ["/images/posts/slug/image.png"]  # Optional images array
---

# Your Post Content

Regular Markdown content with React components:

![Standard Image](https://example.com/image.jpg)

<Figure 
  src="/images/posts/your-slug/hero.jpg" 
  alt="Descriptive text" 
  caption="Optional caption"
  align="center"
  priority={true}  // For above-the-fold images
/>

More content here...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title |
| `description` | Yes | SEO meta description |
| `date` | Yes | Publication date (YYYY-MM-DD) |
| `tags` | No | Array for categorization |
| `project` | No | Links to project series |
| `order` | No | Order within project series |
| `images` | No | Array of image URLs |

### Tag Categories

Posts are automatically categorized:

- **Philosophy & Thoughts**: `philosophy`, `thoughts`
- **Tech & Programming**: `tech`, `programming`, `tutorial` 
- **Data Analytics**: `analytics`
- **Other Posts**: Everything else

### Adding Images

1. **Create directory**: `public/images/posts/your-post-slug/`
2. **Add images**: Place your images in this folder
3. **Reference in post**: `/images/posts/your-post-slug/image.jpg`

**Recommended**: Use the `<Figure>` component for optimized images with captions.

### Project Series

Create related posts by:

1. **Create project page**: `src/content/projects/my-project.mdx`
2. **Link posts**: Add `project: "my-project"` to post frontmatter
3. **Set order**: Use `order: 1, 2, 3...` for sequence

## Components

### Figure Component

Enhanced image component with optimization:

```jsx
<Figure 
  src="/path/to/image.jpg"
  alt="Alternative text"
  caption="Optional caption"
  align="left|center|right"
  width={800}
  height={600}
  priority={false}
  quality={85}
/>
```

### View Counter

Anonymous view tracking with visual feedback:

- **5-second engagement** threshold
- **Visual animations** when views increment  
- **Privacy-focused** using localStorage
- **No session restrictions** - every visit counts

## Analytics

### View Counting System

- **Anonymous tracking** - no personal data collected
- **Local storage** - all data stays on user's device
- **Visual feedback** - users see their engagement recognized
- **Popular posts** - automatic ranking by view counts

### Development Analytics

In development mode, you get:
- **Content validation** warnings
- **Hot reload** with cache invalidation
- **Debug logging** for content operations
- **Development toolbar** with refresh controls

## Performance Features

### Image Optimization
- **WebP/AVIF** format conversion
- **Blur placeholders** while loading
- **Responsive sizing** based on viewport
- **Lazy loading** for better performance

### Development Experience
- **Hot reload** for MDX content changes
- **Content caching** with smart invalidation
- **Frontmatter validation** in development
- **Enhanced file watching** for faster updates

### Production Optimizations
- **Static generation** for all posts/projects
- **Image optimization** with Next.js
- **Bundle optimization** with Turbopack
- **SEO-friendly** meta tags and structure

## Deployment

### Vercel (Recommended)

```bash
# Build and deploy
pnpm build
# Deploy to Vercel
vercel --prod
```

### Environment Variables

No environment variables required for basic functionality. All features work client-side or with static generation.

### Build Optimization

The site is optimized for static generation:
- All posts/projects are pre-rendered
- Images are optimized at build time
- Analytics work entirely client-side
- No server-side dependencies

## Customization

### Styling
- **Tailwind CSS 4** for utility-first styling
- **CSS Custom Properties** for theme variables
- **Dark/Light mode** with automatic detection
- **Responsive design** with mobile-first approach

### Theme Customization

Edit `src/styles/global.css` for theme colors:

```css
:root {
  --color-accent: #1e40af;  /* Primary accent color */
  --background: #ffffff;     /* Background color */
  --foreground: #1a1a1a;     /* Text color */
  /* ... more variables */
}
```

### Adding New Tag Categories

Edit `src/app/posts/page.tsx` to add new categories:

```typescript
const newCategoryPosts = posts.filter(post => 
  post.meta.tags?.includes('your-new-tag')
);
```

## Troubleshooting

### Common Issues

**Hydration Errors**
- Ensure client components don't import server-side code
- Use `'use client'` directive for interactive components

**Image Loading Issues**  
- Verify image paths start with `/` for public folder
- Add external domains to `next.config.ts` if needed

**View Counts Not Showing**
- Views only appear after someone visits the post
- Requires 5 seconds of engagement to count
- Check browser localStorage for `blog-view-counts`

**Development Hot Reload Issues**
- Clear browser cache and restart dev server
- Check console for development warnings
- Use `pnpm content:check` to validate content files

## Contributing

This is a personal site, but the architecture can be adapted for other projects. Key patterns:

1. **Server/Client Separation** - Keep Node.js code on server side
2. **Progressive Enhancement** - Features work without JavaScript
3. **Developer Experience** - Rich development tools and validation
4. **Performance First** - Optimize for Core Web Vitals

## License

This project is for personal use. Feel free to use the patterns and components as inspiration for your own projects.

---

Built with Next.js, TypeScript, MDX, and Tailwind CSS.