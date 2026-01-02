import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../public/posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');
const SITEMAP_FILE = path.join(__dirname, '../public/sitemap.xml');

// Your production URL - update this when deploying
const SITE_URL = 'https://claude-blog.pages.dev'; // Change to your actual domain

interface PostMetadata {
  id: string;
  slug: string;
  title: string;
  date: string;
  summary: string;
  coverImage: string;
  author?: string;
  tags?: string[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString();
}

function generateSitemap(posts: PostMetadata[]): string {
  const now = new Date().toISOString();

  const urlEntries = [
    // Homepage - highest priority
    `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
    // Individual blog posts
    ...posts.map(post => `  <url>
    <loc>${SITE_URL}/post/${post.slug}</loc>
    <lastmod>${formatDate(post.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`)
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

try {
  console.log('🗺️  Generating sitemap...');

  // Read index.json
  if (!fs.existsSync(INDEX_FILE)) {
    console.error('❌ Error: index.json not found. Run gen-index.ts first.');
    process.exit(1);
  }

  const indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
  const posts: PostMetadata[] = JSON.parse(indexContent);

  console.log(`📄 Found ${posts.length} post(s)`);

  // Generate sitemap
  const sitemap = generateSitemap(posts);

  // Write sitemap.xml
  fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf-8');

  console.log('✅ Sitemap generated successfully');
  console.log(`📄 Sitemap written to: ${SITEMAP_FILE}`);
  console.log(`\n🔗 URLs included:`);
  console.log(`   • Homepage: ${SITE_URL}/`);
  posts.forEach(post => {
    console.log(`   • ${post.title} (${SITE_URL}/post/${post.slug})`);
  });

  console.log(`\n💡 Don't forget to update SITE_URL in gen-sitemap.ts with your production domain!`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
