#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

const POSTS_DIR = path.join(__dirname, '../public/posts');

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to prompt user
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(answer);
    });
  });
}

// Helper to slugify title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Main function
async function createPost(): Promise<void> {
  console.log('\n📝 Create New Blog Post (Page Bundle)\n');

  // Get post title
  const title = await prompt('Post Title: ');

  if (!title || title.trim() === '') {
    console.log('❌ Title cannot be empty');
    rl.close();
    process.exit(1);
  }

  // Get optional summary
  const summary = await prompt('Summary (optional): ');

  // Get optional tags
  const tagsInput = await prompt('Tags (comma-separated, optional): ');
  const tags: string[] = tagsInput
    ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  // Get optional cover image
  const coverImage = await prompt('Cover Image URL (optional, press Enter for default): ');

  rl.close();

  // Generate directory name and path
  const slug = slugify(title);
  const postDir = path.join(POSTS_DIR, slug);
  const filePath = path.join(postDir, 'index.mdx');

  // Check if directory already exists
  if (fs.existsSync(postDir)) {
    console.log(`❌ Directory already exists: ${slug}`);
    process.exit(1);
  }

  // Create directory
  fs.mkdirSync(postDir, { recursive: true });

  const today = new Date();

  // Create frontmatter template
  const frontmatter = `---
title: "${title}"
slug: "${slug}"
date: ${today.toISOString()}
summary: "${summary || 'Add a summary for this post'}"
coverImage: "${coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'}"
author: "Claude"
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
---

# ${title}

Write your blog post content here using **Markdown** syntax.

## Introduction

Start with an engaging introduction that hooks your readers.

> [!NOTE]
> This is a Page Bundle! You can place images in this folder (e.g., \`./hero.png\`) and reference them directly.

## Features Showcase

### Admonitions

> [!TIP]
> Use these callouts to highlight important info!

> [!WARNING]
> Be careful with these configurations.

### Code Blocks

\`\`\`typescript
// Modern Mac-style code blocks
const greeting = signal('Hello World');
effect(() => console.log(greeting()));
\`\`\`

## Main Content

### Section 1

Your content goes here...

### Section 2

More content...

## Conclusion

Wrap up your post with a compelling conclusion.

---

*Written with ❤️ using Claude Blog*
`;

  // Write file
  fs.writeFileSync(filePath, frontmatter, 'utf8');

  console.log('\n✅ Post created successfully!');
  console.log(`📂 Directory: public/posts/${slug}/`);
  console.log(`📄 File: public/posts/${slug}/index.mdx`);
  console.log(`🔗 Slug: ${slug}`);

  // Run indexer
  console.log('\n🔄 Regenerating index...');
  try {
    execSync('bun scripts/gen-index.ts', { stdio: 'inherit' });
    console.log('\n🎉 All done! Your post is ready to edit.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error running indexer:', errorMessage);
    process.exit(1);
  }
}

// Run
createPost().catch((error: Error) => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});
