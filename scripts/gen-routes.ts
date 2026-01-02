#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import type { PostMetadata } from './types';

const INDEX_FILE = path.join(__dirname, '../public/posts/index.json');
const ROUTES_FILE = path.join(__dirname, '../routes.txt');

console.log('🔍 Generating routes for SSG prerendering...');

// Read the index.json file
if (!fs.existsSync(INDEX_FILE)) {
  console.error('❌ Index file does not exist:', INDEX_FILE);
  console.error('   Run "bun run gen" first to generate the index.');
  process.exit(1);
}

const indexContent = fs.readFileSync(INDEX_FILE, 'utf8');
const posts: PostMetadata[] = JSON.parse(indexContent);

// Generate routes list
const routes: string[] = [
  '/',  // Home page
  ...posts.map(post => `/post/${post.slug}`)  // All post detail pages
];

// Write to routes.txt
fs.writeFileSync(ROUTES_FILE, routes.join('\n'), 'utf8');

console.log(`✅ Generated ${routes.length} route(s) for prerendering`);
console.log(`📄 Routes written to: ${ROUTES_FILE}`);

// Log routes for verification
if (routes.length > 0) {
  console.log('\n🗺️  Routes to prerender:');
  routes.forEach((route, i) => {
    console.log(`   ${i + 1}. ${route}`);
  });
}
