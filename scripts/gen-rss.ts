import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../public/posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');
const RSS_FILE = path.join(__dirname, '../public/feed.xml');

// Your production URL and blog metadata - update these when deploying
const SITE_URL = 'https://claude-blog.pages.dev'; // Change to your actual domain
const BLOG_TITLE = 'Claude Blog';
const BLOG_DESCRIPTION = 'A modern blog built with Angular 19, featuring technical articles on TypeScript, Angular, and web development.';
const BLOG_LANGUAGE = 'en';

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

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRssDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toUTCString();
}

function generateRssFeed(posts: PostMetadata[]): string {
  // Sort posts by date, newest first
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const items = sortedPosts.map(post => {
    const postUrl = `${SITE_URL}/post/${post.slug}`;
    const author = post.author || 'Claude Blog Team';

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.summary)}</description>
      <pubDate>${formatRssDate(post.date)}</pubDate>
      <author>${escapeXml(author)}</author>
      ${post.tags ? post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ') : ''}
    </item>`;
  }).join('\n');

  const buildDate = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(BLOG_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>${BLOG_LANGUAGE}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

try {
  console.log('📡 Generating RSS feed...');

  // Read index.json
  if (!fs.existsSync(INDEX_FILE)) {
    console.error('❌ Error: index.json not found. Run gen-index.ts first.');
    process.exit(1);
  }

  const indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
  const posts: PostMetadata[] = JSON.parse(indexContent);

  console.log(`📄 Found ${posts.length} post(s)`);

  // Generate RSS feed
  const rssFeed = generateRssFeed(posts);

  // Write feed.xml
  fs.writeFileSync(RSS_FILE, rssFeed, 'utf-8');

  console.log('✅ RSS feed generated successfully');
  console.log(`📄 Feed written to: ${RSS_FILE}`);
  console.log(`\n📡 Feed metadata:`);
  console.log(`   • Title: ${BLOG_TITLE}`);
  console.log(`   • URL: ${SITE_URL}/feed.xml`);
  console.log(`   • Items: ${posts.length}`);

  console.log(`\n📚 Latest posts in feed:`);
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  sortedPosts.slice(0, 3).forEach((post, index) => {
    console.log(`   ${index + 1}. ${post.title}`);
  });

  console.log(`\n💡 Don't forget to update SITE_URL and blog metadata in gen-rss.ts!`);
} catch (error) {
  console.error('❌ Error generating RSS feed:', error);
  process.exit(1);
}
