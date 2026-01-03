---
title: "Runtime Page Bundle Demo"
slug: "mdx-splitting-demo"
date: "2026-01-03T01:35:00.000Z"
summary: "Demonstrating content splitting and local assets in public/posts using runtime injection."
coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"
author: "Claude"
tags: ["Demo", "Architecture"]
---

import Intro from './_intro.md';

# Runtime Splitting Demo

This post lives in \`public/posts/mdx-splitting-demo/\`. 
It simulates MDX imports by fetching content at runtime (or build time for SSR).

## 1. Imported Content

Below is content loaded from \`_intro.md\`:

<Intro />

## 2. Local Images

Here is a local image in this folder:

![Hero Image](./hero.png)

## Conclusion

We achieved the goal: **Page Bundles + Split Content + Local Images** in \`public/posts\`!
