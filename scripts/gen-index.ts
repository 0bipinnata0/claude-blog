#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import fm from 'front-matter';
import type { PostMetadata, PostAttributes } from './types';

const POSTS_DIR = path.join(__dirname, '../public/posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');

console.log('🔍 Scanning posts directory...');

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  console.error('❌ Posts directory does not exist:', POSTS_DIR);
  process.exit(1);
}

// Read all .md files and subdirectories with index.md
const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });

const files: string[] = entries
  .flatMap((entry) => {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      return [entry.name];
    }
    if (entry.isDirectory()) {
      const indexMdPath = path.join(POSTS_DIR, entry.name, 'index.md');
      const indexMdxPath = path.join(POSTS_DIR, entry.name, 'index.mdx');

      if (fs.existsSync(indexMdPath)) {
        return [`${entry.name}/index.md`];
      }
      if (fs.existsSync(indexMdxPath)) {
        return [`${entry.name}/index.mdx`];
      }
    }
    return [];
  })
  .sort()
  .reverse(); // Newest first

console.log(`📝 Found ${files.length} post(s)`);

// Parse frontmatter from each file
const posts: PostMetadata[] = files
  .map((file: string): PostMetadata | null => {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      const { attributes } = fm<PostAttributes>(content);

      // Extract slug from filename (remove date prefix and .md extension)
      // For Page Bundles (folder/index.md), use the folder name as the default slug
      let defaultSlug = file;
      if (file.endsWith('/index.md') || file.endsWith('/index.mdx')) {
        defaultSlug = path.dirname(file);
      } else {
        defaultSlug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      }

      const slug = attributes.slug || defaultSlug;

      return {
        id: slug,
        slug: slug,
        title: attributes.title || 'Untitled',
        summary: attributes.summary || attributes.description || '',
        date: attributes.date
          ? new Date(attributes.date).toISOString()
          : new Date().toISOString(),
        coverImage: attributes.coverImage || attributes.image ||
          'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
        author: attributes.author || 'Claude',
        tags: attributes.tags || [],
        fileName: file
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠️  Error parsing ${file}:`, errorMessage);
      return null;
    }
  })
  .filter((post): post is PostMetadata => post !== null)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Write index.json
fs.writeFileSync(INDEX_FILE, JSON.stringify(posts, null, 2), 'utf8');

console.log(`✅ Generated index with ${posts.length} post(s)`);
console.log(`📄 Index written to: ${INDEX_FILE}`);

// Log post titles for verification
if (posts.length > 0) {
  console.log('\n📚 Posts indexed:');
  posts.forEach((post, i) => {
    console.log(`   ${i + 1}. ${post.title} (${post.slug})`);
  });
}
