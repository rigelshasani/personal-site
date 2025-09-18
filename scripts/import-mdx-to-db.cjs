/*
 Import MDX content from src/content into the database using Prisma.
 Usage:
   DATABASE_URL="postgresql://user:pass@host:5432/db" node scripts/import-mdx-to-db.cjs
 or use SQLite/local:
   DATABASE_URL="file:./dev.db" node scripts/import-mdx-to-db.cjs
*/

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function calculateReadingTime(content) {
  const words = String(content).split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 225))
  return `${minutes} min`
}

async function importProjects(contentDir) {
  const projectsDir = path.join(contentDir, 'projects')
  if (!fs.existsSync(projectsDir)) return 0
  const files = fs.readdirSync(projectsDir).filter((f) => f.endsWith('.mdx'))
  let count = 0
  for (const file of files) {
    const slug = file.replace(/\.mdx$/i, '')
    const full = path.join(projectsDir, file)
    const raw = fs.readFileSync(full, 'utf8')
    const { data, content } = matter(raw)
    const title = data.title || slug
    const description = data.description || ''
    const dateStr = data.date || new Date().toISOString()
    const status = data.status || 'active'
    const tech = Array.isArray(data.tech) ? data.tech : []
    const github = data.github || null
    const demo = data.demo || null
    const featured = !!data.featured

    await prisma.project.upsert({
      where: { slug },
      update: {
        title,
        description,
        date: new Date(dateStr),
        status,
        techJson: tech.length ? JSON.stringify(tech) : null,
        github,
        demo,
        featured,
        content,
      },
      create: {
        slug,
        title,
        description,
        date: new Date(dateStr),
        status,
        techJson: tech.length ? JSON.stringify(tech) : null,
        github,
        demo,
        featured,
        content,
      },
    })
    count++
    console.log(`[projects] upserted: ${slug}`)
  }
  return count
}

async function importPosts(contentDir) {
  const postsDir = path.join(contentDir, 'posts')
  if (!fs.existsSync(postsDir)) return 0
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'))
  let count = 0
  for (const file of files) {
    const slug = file.replace(/\.mdx$/i, '')
    const full = path.join(postsDir, file)
    const raw = fs.readFileSync(full, 'utf8')
    const { data, content } = matter(raw)
    const title = data.title || slug
    const description = data.description || ''
    const dateStr = data.date || new Date().toISOString()
    const tags = Array.isArray(data.tags) ? data.tags : []
    const projectSlug = typeof data.project === 'string' && data.project ? data.project : null
    const order = Number.isInteger(data.order) ? data.order : null
    const images = Array.isArray(data.images) ? data.images : []
    const readingTime = data.readingTime || calculateReadingTime(content)

    await prisma.post.upsert({
      where: { slug },
      update: {
        title,
        description,
        date: new Date(dateStr),
        readingTime,
        tagsJson: tags.length ? JSON.stringify(tags) : null,
        projectSlug,
        order,
        imagesJson: images.length ? JSON.stringify(images) : null,
        content,
      },
      create: {
        slug,
        title,
        description,
        date: new Date(dateStr),
        readingTime,
        tagsJson: tags.length ? JSON.stringify(tags) : null,
        projectSlug,
        order,
        imagesJson: images.length ? JSON.stringify(images) : null,
        content,
      },
    })
    count++
    console.log(`[posts] upserted: ${slug}`)
  }
  return count
}

async function main() {
  const contentDir = path.join(process.cwd(), 'src', 'content')
  console.log('[import] using content dir:', contentDir)
  // Import projects first so post relations are valid
  const pCount = await importProjects(contentDir)
  const sCount = await importPosts(contentDir)
  console.log(`[import] completed. projects=${pCount}, posts=${sCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

