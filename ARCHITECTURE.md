# Technical Architecture

## Overview

This personal site is built using modern web development patterns with a focus on performance, developer experience, and maintainability. The architecture follows Next.js 15 App Router conventions with TypeScript and MDX for content management.

## Core Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **MDX** - Markdown with React components
- **Tailwind CSS 4** - Utility-first styling
- **Turbopack** - Fast development bundler

## Architecture Patterns

### 1. Server/Client Separation

**Server Components** (default):
- Page components (`app/*/page.tsx`)
- Content parsing (`lib/content.ts`)
- Static data fetching
- SEO and metadata generation

**Client Components** (`'use client'`):
- Interactive UI (carousel, theme toggle)
- View counting system
- Real-time updates
- Browser APIs (localStorage, etc.)

### 2. Content Management

```
Content Flow:
MDX Files → Gray Matter → React Components → Static Generation
```

**Content Processing Pipeline**:
1. **MDX Files** - Written in `src/content/`
2. **Gray Matter** - Parses frontmatter + content
3. **Content Library** - Processes and caches content
4. **Static Generation** - Pre-renders all routes
5. **MDX Remote** - Renders content with components

**Caching Strategy**:
- **Development**: Intelligent cache invalidation on file changes
- **Production**: Static generation with build-time optimization
- **Client**: localStorage for analytics, sessionStorage for UI state

### 3. Image Optimization

```
Image Pipeline:
Source → Next.js Image → WebP/AVIF → Responsive Sizes → Lazy Loading
```

**Components**:
- `<Figure>` - Enhanced images with captions
- `<OptimizedImage>` - General image optimization
- `next/image` - Core optimization engine

**Features**:
- Format conversion (WebP, AVIF)
- Responsive sizing with `sizes` attribute
- Blur placeholders during loading
- Lazy loading below the fold
- Priority loading for hero images

### 4. Analytics System

**Client-Side Only Architecture**:
- No external services or tracking
- localStorage for persistence
- Real-time updates across tabs
- Visual feedback for engagement

```typescript
// View Counter Data Flow
Page Load → useViewCounter → 5s Delay → recordView → localStorage → UI Update
```

**Components**:
- `useViewCounter` - Hook for tracking views
- `ViewCounter` - Display component
- `PopularPosts` - Ranking system
- `ViewNotification` - Visual feedback

## File Structure Deep Dive

### `/src/app` - Next.js App Router

```
app/
├── layout.tsx          # Root layout with theme, progress bar
├── page.tsx           # Homepage with featured posts
├── posts/
│   ├── page.tsx       # Posts listing with categories
│   └── [slug]/
│       └── page.tsx   # Dynamic post pages
├── projects/
│   ├── page.tsx       # Projects listing
│   └── [slug]/
│       └── page.tsx   # Dynamic project pages
└── about/
    └── page.tsx       # About page
```

### `/src/components` - React Components

**UI Components**:
- `SidebarLayout.tsx` - Main layout with navigation
- `PostBox.tsx` - Post preview cards
- `ProjectBox.tsx` - Project preview cards
- `ThemeToggle.tsx` - Dark/light mode switcher

**Feature Components**:
- `FeaturedPostCard.tsx` - Hero post cards with images
- `FeaturedPostsCarousel.tsx` - Auto-playing carousel
- `PopularPosts.tsx` - Most viewed posts
- `ProgressBar.tsx` - Reading progress indicator

**MDX Components**:
- `Figure.tsx` - Optimized images with captions
- `OptimizedImage.tsx` - General image component

**Development Tools**:
- `DevToolbar.tsx` - Development utilities
- `ViewNotification.tsx` - View count feedback

### `/src/lib` - Core Libraries

**Content Management**:
```typescript
// content.ts
export interface Post {
  slug: string;
  meta: PostMeta;
  content: string;
  readingTime: string;
}

export interface PostMeta {
  title: string;
  date: string;
  description: string;
  tags?: string[];
  project?: string;
  order?: number;
  images?: string[];
}
```

**Analytics System**:
```typescript
// view-counter.ts
export function recordView(slug: string): number;
export function getViewCount(slug: string): number;
export function getPopularPosts(limit: number): Array<{slug: string; views: number}>;
```

**Development Utilities**:
```typescript
// dev-utils.ts
export function cacheContent<T>(key: string, factory: () => T): T;
export function validateFrontmatter(frontmatter: any, filename: string): void;
export function watchContentChanges(): void;
```

## State Management

### Client State
- **Theme**: Context + localStorage persistence
- **View Counts**: localStorage with cross-tab sync
- **UI State**: Component-level useState
- **Navigation**: Next.js router state

### Server State
- **Content**: File system + gray-matter parsing
- **Static Generation**: Build-time pre-rendering
- **Caching**: Development-only intelligent caching

## Performance Optimizations

### Build Time
- **Static Generation**: All routes pre-rendered
- **Image Optimization**: WebP/AVIF generation
- **Bundle Splitting**: Automatic code splitting
- **CSS Optimization**: Tailwind purging

### Runtime
- **Lazy Loading**: Images and components
- **Client Hydration**: Minimal JavaScript
- **Cache Headers**: Long-term caching
- **Progressive Enhancement**: Works without JS

### Development
- **Hot Reload**: Fast refresh for content changes
- **Turbopack**: Faster bundling
- **Content Watching**: Automatic cache invalidation
- **TypeScript**: Build-time error catching

## Security Considerations

### Content Security
- **MDX Sanitization**: Safe component rendering
- **Image Validation**: Trusted sources only
- **XSS Prevention**: React's built-in protection

### Privacy
- **No External Tracking**: All analytics client-side
- **No Personal Data**: Anonymous view counting
- **Local Storage Only**: Data stays on device

### Build Security
- **Dependency Scanning**: Regular updates
- **Static Generation**: No server-side vulnerabilities
- **Environment Isolation**: No sensitive data in client

## Deployment Architecture

### Vercel (Recommended)
```
Git Push → Vercel Build → Static Generation → CDN Distribution
```

**Build Process**:
1. **Install Dependencies**: pnpm install
2. **TypeScript Compilation**: tsc --noEmit
3. **Content Processing**: Parse MDX files
4. **Image Optimization**: Generate optimized formats
5. **Static Generation**: Pre-render all routes
6. **Asset Optimization**: Minify JS/CSS
7. **CDN Distribution**: Global edge deployment

### Alternative Deployments
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting option
- **Docker**: Self-hosted containerization

## Development Workflow

### Content Creation
1. **Create MDX file** in `src/content/posts/`
2. **Add images** to `public/images/posts/slug/`
3. **Development server** auto-reloads
4. **Frontmatter validation** shows warnings
5. **Hot reload** updates content immediately

### Feature Development
1. **TypeScript-first** development
2. **Component isolation** with clear interfaces
3. **Server/client separation** maintained
4. **Performance monitoring** with Core Web Vitals
5. **Accessibility testing** with automated tools

## Monitoring and Analytics

### Built-in Analytics
- **View counts** with visual feedback
- **Popular posts** ranking
- **Engagement metrics** (5+ second threshold)
- **Real-time updates** across sessions

### Development Monitoring
- **Content validation** warnings
- **Performance profiling** with React DevTools
- **Bundle analysis** with Next.js analyzer
- **Accessibility auditing** with axe-core

## Extension Points

### Adding New Content Types
1. **Define interfaces** in `lib/content.ts`
2. **Create processing functions** for parsing
3. **Add route handlers** in `app/`
4. **Build UI components** for display

### Custom MDX Components
1. **Create component** in `components/mdx/`
2. **Add to MDX provider** in post pages
3. **Export for use** in content files
4. **Document usage** in README

### Analytics Extensions
1. **Extend storage schema** in `lib/view-counter.ts`
2. **Add new hooks** in `hooks/`
3. **Create visualization components**
4. **Maintain privacy-first approach**

## Best Practices

### Code Organization
- **Single Responsibility**: Each component has one purpose
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Graceful error handling
- **Testing**: Component and integration tests

### Performance
- **Core Web Vitals**: Optimize for LCP, FID, CLS
- **Bundle Size**: Monitor and optimize
- **Image Loading**: Lazy loading with proper sizing
- **Caching**: Leverage browser and CDN caching

### Accessibility
- **Semantic HTML**: Proper heading structure
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: WCAG compliant colors

### SEO
- **Meta Tags**: Proper title and description
- **Structured Data**: Rich snippets support
- **Open Graph**: Social media previews
- **Sitemap**: Auto-generated XML sitemap