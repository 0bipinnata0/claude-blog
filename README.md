# Claude Blog

A modern, production-ready blog built with **Angular 19** and powered by a **local file-based headless CMS**. Features a beautiful Material Design 3 UI with dark mode support and Markdown rendering.

![Angular](https://img.shields.io/badge/Angular-21-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Material](https://img.shields.io/badge/Material-21-purple?logo=material-design)
![Bun](https://img.shields.io/badge/Bun-1.3.5-black?logo=bun)

## ✨ Features

- 🚀 **Angular 19** - Latest version with standalone components
- 📝 **File-Based CMS** - Manage posts with Markdown files
- 🎨 **Material Design 3** - Beautiful, accessible UI
- 🌓 **Dark Mode** - Automatic theme switching with localStorage
- ⚡ **Signals API** - Reactive state management
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **SEO Friendly** - Semantic HTML and meta tags
- 📄 **Markdown Support** - Full markdown rendering with code highlighting
- 🎯 **Type-Safe** - Full TypeScript coverage

## 🛠️ Tech Stack

- **Framework**: Angular 21.0.0
- **UI Library**: Angular Material 21.0.5 (Material Design 3)
- **State Management**: Signals & Computed (No RxJS for state)
- **Markdown Parser**: ngx-markdown 21.0.1 + marked 17.0.1
- **Styling**: Angular Material theming system
- **Package Manager**: Bun 1.3.5
- **Build Tool**: Angular CLI with Vite

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) 1.3.5 or later
- Node.js 18+ (for Angular CLI)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd claude-blog

# Install dependencies
bun install

# Start development server (auto-generates post index)
bun start
```

The application will open at `http://localhost:4200/`

## 📝 Content Management (Headless CMS)

This blog uses a **local file-based CMS** where posts are Markdown files with YAML frontmatter.

### Creating a New Post

#### Interactive CLI (Recommended)

```bash
bun run new
```

This will prompt you for:
- **Post Title** (required)
- **Summary** (optional)
- **Tags** (optional, comma-separated)
- **Cover Image URL** (optional)

**Example:**

```
📝 Create New Blog Post

Post Title: Building a REST API with Node.js
Summary (optional): Learn how to build a scalable REST API
Tags (comma-separated, optional): Node.js, API, Backend
Cover Image URL (optional): [Press Enter for default]

✅ Post created successfully!
📄 File: 2025-01-02-building-rest-api-nodejs.md
🔗 Slug: building-rest-api-nodejs

🔄 Regenerating index...
✅ Generated index with 3 post(s)
🎉 All done! Your post is ready to edit.
```

The script will:
1. Generate a date-prefixed filename (e.g., `2025-01-02-my-post.md`)
2. Create the markdown file with frontmatter template
3. Automatically regenerate the index

#### Manual Creation

Create a file in `public/posts/` with this structure:

```markdown
---
title: "Your Post Title"
slug: "url-friendly-slug"
date: 2025-01-02T00:00:00.000Z
summary: "A brief description of your post"
coverImage: "https://images.unsplash.com/photo-xxx"
author: "Your Name"
tags: ["Tag1", "Tag2", "Tag3"]
---

# Your Post Title

Write your content here using **Markdown** syntax.

## Introduction

Start with an engaging introduction...

## Main Content

### Code Examples

\`\`\`typescript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`

## Conclusion

Wrap up your post...
```

After creating the file manually, run:

```bash
bun run gen
```

### Editing Posts

1. Open the markdown file in `public/posts/YYYY-MM-DD-slug.md`
2. Edit the content or frontmatter
3. Save the file
4. Regenerate the index:
   ```bash
   bun run gen
   ```
   Or restart the dev server (it auto-generates the index)

### Deleting Posts

1. Delete the markdown file from `public/posts/`
2. Regenerate the index:
   ```bash
   bun run gen
   ```

## 📜 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `bun start` | Generate index + start dev server |
| `new` | `bun run new` | Create new post interactively |
| `gen` | `bun run gen` | Regenerate `posts/index.json` |
| `build` | `bun run build` | Build for production |
| `test` | `bun test` | Run unit tests |

### Script Details

#### `bun start`

```bash
npm run gen && ng serve
```

- Generates/updates `public/posts/index.json`
- Starts Angular development server
- Watches for file changes
- Opens at `http://localhost:4200/`

#### `bun run new`

```bash
node scripts/new-post.js
```

Interactive CLI that:
- Prompts for post details
- Generates date-prefixed filename
- Creates markdown file with frontmatter template
- Auto-runs the indexer

#### `bun run gen`

```bash
node scripts/gen-index.js
```

- Scans all `.md` files in `public/posts/`
- Parses YAML frontmatter
- Generates `public/posts/index.json`
- Outputs summary to console

**Example output:**

```
🔍 Scanning posts directory...
📝 Found 2 markdown file(s)
✅ Generated index with 2 post(s)
📄 Index written to: /Users/.../public/posts/index.json

📚 Posts indexed:
   1. Mastering TypeScript in 2025 (mastering-typescript-2025)
   2. Getting Started with Angular 19 (getting-started-angular-19)
```

## 📁 Project Structure

```
claude-blog/
├── public/
│   └── posts/                          # Markdown blog posts
│       ├── index.json                  # Auto-generated post index
│       ├── 2025-01-01-post-one.md
│       └── 2025-01-02-post-two.md
├── scripts/
│   ├── gen-index.js                    # Index generator script
│   └── new-post.js                     # Post creator script
├── src/
│   └── app/
│       ├── layout/
│       │   ├── main-layout.component.ts
│       │   ├── navbar.component.ts     # With theme toggle
│       │   └── footer.component.ts
│       ├── components/
│       │   ├── post-list.component.ts  # Blog post grid
│       │   └── post-detail.component.ts
│       ├── services/
│       │   ├── blog.service.ts         # CMS data layer
│       │   └── theme.service.ts        # Theme management
│       ├── models/
│       │   └── post.model.ts
│       ├── app.config.ts
│       └── app.routes.ts
├── CLAUDE.md                           # Project rules & documentation
├── README.md                           # You are here
└── package.json
```

## 🎨 Frontmatter Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ Yes | Post title (displayed in UI) |
| `slug` | string | ✅ Yes | URL-friendly identifier |
| `date` | ISO 8601 | ✅ Yes | Publication date |
| `summary` | string | ✅ Yes | Brief description (meta + card) |
| `coverImage` | URL | ❌ No | Cover image URL (defaults provided) |
| `author` | string | ❌ No | Author name |
| `tags` | string[] | ❌ No | Category tags for filtering |

**Example:**

```yaml
---
title: "Building Modern Web Apps"
slug: "building-modern-web-apps"
date: 2025-01-15T10:30:00.000Z
summary: "Learn how to build scalable modern web applications"
coverImage: "https://images.unsplash.com/photo-1234567890"
author: "John Doe"
tags: ["Web Development", "JavaScript", "Best Practices"]
---
```

## 🌐 Content Workflow

### How It Works

1. **Index Generation** (`scripts/gen-index.js`)
   - Scans `public/posts/*.md`
   - Parses YAML frontmatter using `front-matter` package
   - Generates `public/posts/index.json`

2. **Data Loading** (`BlogService`)
   - Fetches `index.json` on app init
   - Converts to signals for reactivity
   - Lazy-loads markdown content on-demand

3. **Content Display**
   - Post list: Shows all posts from index
   - Post detail: Fetches individual markdown file
   - Strips frontmatter before rendering

### Request Flow

```
User visits /post/my-slug
  ↓
PostDetailComponent initializes
  ↓
HTTP GET /posts/index.json
  ↓
Find post with slug "my-slug"
  ↓
Get fileName: "2025-01-02-my-slug.md"
  ↓
HTTP GET /posts/2025-01-02-my-slug.md
  ↓
Strip YAML frontmatter
  ↓
Render Markdown content
```

## 🎯 Theme System

### Toggle Dark/Light Mode

Click the sun/moon icon in the navbar to toggle themes.

### How It Works

- **ThemeService** manages theme state with signals
- Saves preference to `localStorage`
- Detects system preference on first visit
- Applies `.dark` class to `<html>` element
- Material Design 3 auto-adjusts colors

### Programmatic Usage

```typescript
import { inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

export class MyComponent {
  private themeService = inject(ThemeService);

  // Toggle theme
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Check current theme
  isDarkMode = this.themeService.isDark();

  // Get theme signal
  currentTheme = this.themeService.theme(); // 'light' | 'dark'
}
```

## 🏗️ Development

### Code Conventions

This project follows strict Angular best practices (see `CLAUDE.md`):

- ✅ **Standalone components only** (no NgModules)
- ✅ **Signals for state** (no RxJS for state management)
- ✅ **Control flow syntax** (`@if`, `@for`, `@switch`)
- ✅ **input()/output() signals** (no @Input/@Output)
- ✅ **inject()** function (no constructor DI)

### Adding a New Feature

1. Create standalone component:
   ```bash
   ng generate component features/my-feature --standalone
   ```

2. Use signals for state:
   ```typescript
   import { signal, computed } from '@angular/core';

   count = signal(0);
   doubled = computed(() => this.count() * 2);
   ```

3. Import Material modules:
   ```typescript
   imports: [MatCardModule, MatButtonModule]
   ```

## 📦 Building for Production

```bash
bun run build
```

Output will be in `dist/` directory.

### Before Deploying

1. **Generate final index:**
   ```bash
   bun run gen
   ```

2. **Ensure all posts have valid frontmatter**

3. **Test locally:**
   ```bash
   bun start
   ```

4. **Build:**
   ```bash
   bun run build
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run the indexer (`bun run gen`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Angular Team** for the amazing framework
- **Material Design** for beautiful UI components
- **ngx-markdown** for Markdown rendering
- **Bun** for blazing-fast package management

---

**Built with ❤️ using Angular 19 & Material Design 3**

For detailed project rules and architecture, see [CLAUDE.md](./CLAUDE.md)
