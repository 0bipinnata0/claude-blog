# Project Rules & Skills
- **Framework**: Angular 19+ (Latest)
- **Architecture**: Standalone Components ONLY.
- **State Management**: Signals & Computed ONLY (`signal()`, `computed()`, `effect()`). NO RxJS for state.
- **Control Flow**: ALWAYS use `@if`, `@for`, `@switch`.
- **Styling**: Angular Material (Material Design 3).
- **Component Inputs**: Use `input()` and `output()` signals API.
- **Routing**: Use `withComponentInputBinding` for parameters.
- **Package Manager**: Bun (v1.3.5)
- **Theme System**: Signal-based with localStorage persistence

## Production-Ready Architecture

### Layout System (src/app/layout/)
- **MainLayoutComponent**: Master layout wrapper with `<ng-content>` for page content
- **NavbarComponent**: Responsive navigation with theme toggle button
- **FooterComponent**: Professional footer with copyright and social links

### Theme Management
- **ThemeService** (src/app/services/theme.service.ts):
  - Signal-based reactive theme management
  - `toggleTheme()` - Switch between light/dark modes
  - Automatic localStorage persistence
  - System preference detection on first load
  - Effect-based DOM synchronization

**Theme Usage:**
```typescript
// In components
private themeService = inject(ThemeService);

// Check current theme
this.themeService.isDark()

// Toggle theme
this.themeService.toggleTheme()

// Get theme signal
this.themeService.theme() // 'light' | 'dark'
```

### Markdown Rendering
- **ngx-markdown** (v21.0.1) for rich content rendering
- **marked** (v17.0.1) as parser
- Custom typography styles matching Material Design
- Code syntax highlighting support

## Angular Material Configuration

### Version: 21.0.5 (Material Design 3)

**Why Angular Material:**
- Official Angular UI component library
- Perfect integration with standalone components
- Material Design 3 (M3) theming system with automatic dark mode support
- Built-in accessibility (a11y) support
- Comprehensive component library

**Installation:**
```bash
bun x ng add @angular/material --skip-confirmation --defaults
```

**Theme Configuration:**
The project uses Material 3 theming with Azure primary color and Blue tertiary color.
Theme is configured in `src/styles.scss`:

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$blue-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}

// Dark mode support
html.dark body {
  color-scheme: dark;
}
```

**Dark Mode:**
Material Design 3 automatically adjusts all colors when `color-scheme: dark` is set.
The ThemeService manages the `.dark` class on `<html>` element.

**Usage:**
- Import Material modules in standalone components (e.g., `MatCardModule`, `MatButtonModule`)
- Use Material components in templates: `<mat-card>`, `<mat-button>`, etc.
- Follow Material Design guidelines for consistent UX
- Use Material icons: `<mat-icon>icon_name</mat-icon>`

**Key Components Used:**
- `MatToolbarModule` - Navigation bar
- `MatCardModule` - Content cards
- `MatButtonModule` - Buttons and links
- `MatIconModule` - Material icons
- `MatTooltipModule` - Tooltips
- `MatChipsModule` - Tags and labels

## Project Structure

```
src/app/
├── layout/
│   ├── main-layout.component.ts    # Master layout wrapper
│   ├── navbar.component.ts          # Navigation with theme toggle
│   └── footer.component.ts          # Footer
├── components/
│   ├── post-list.component.ts      # Blog post grid
│   └── post-detail.component.ts    # Article detail view
├── services/
│   ├── blog.service.ts             # Post data management
│   └── theme.service.ts            # Theme state management
├── models/
│   └── post.model.ts               # BlogPost interface
└── app.config.ts                   # Application providers
```

## Headless CMS Workflow

### File-Based Content Management

This blog uses a **local file-based headless CMS** powered by Markdown files with frontmatter metadata.

**Content Location:** `public/posts/`

### Creating New Posts

**Interactive CLI:**
```bash
bun run new
```

This launches an interactive prompt that asks for:
- Post title (required)
- Summary (optional)
- Tags (optional, comma-separated)
- Cover image URL (optional)

The script will:
1. Generate a date-prefixed filename (e.g., `2025-01-02-my-post.md`)
2. Create the markdown file with frontmatter template
3. Automatically run the indexer to update `index.json`

**Manual Creation:**

Create a markdown file in `public/posts/` with frontmatter:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
date: 2025-01-02T00:00:00.000Z
summary: "A brief summary of your post"
coverImage: "https://example.com/image.jpg"
author: "Your Name"
tags: ["Tag1", "Tag2"]
---

# Your Post Content

Write your content here using **Markdown** syntax.
```

### Generating Index

**Automatic:** The index is automatically generated when you run `bun start`

**Manual:**
```bash
bun run gen
```

This scans all `.md` files in `public/posts/`, parses frontmatter, and generates `public/posts/index.json`.

### Content Architecture

1. **Index File** (`public/posts/index.json`):
   - Lists all posts with metadata
   - Loaded once on app initialization
   - Used for post list display

2. **Markdown Files** (`public/posts/*.md`):
   - Individual post content
   - Loaded on-demand when viewing a post
   - Frontmatter automatically stripped

3. **BlogService**:
   - Fetches `index.json` via HttpClient
   - Converts to signals for reactive state
   - Lazy-loads markdown content per post

### NPM Scripts

```json
{
  "start": "bun run gen && ng serve",  // Generate index, then start dev server
  "new": "bun scripts/new-post.ts",    // Create new post interactively (TypeScript)
  "gen": "bun scripts/gen-index.ts"    // Regenerate index.json (TypeScript)
}
```

### Script Implementation (TypeScript)

Both CMS scripts are written in TypeScript for type safety and consistency:

**Files:**
- **gen-index.ts** - Scans markdown files, validates frontmatter, generates typed index.json
- **new-post.ts** - Interactive CLI with typed prompts and error handling
- **types.ts** - Shared interfaces for PostMetadata and PostAttributes
- **front-matter.d.ts** - Type declarations for the front-matter package
- **tsconfig.scripts.json** - TypeScript configuration for scripts

**Key Features:**
- Full type safety with strict TypeScript compilation
- ESM modules with modern import/export syntax
- Comprehensive error handling with typed errors
- Bun native execution (no transpilation needed)
- Shared type definitions for consistency

### Workflow Best Practices

1. **Always run indexer after creating/editing posts** (or restart dev server)
2. **Use descriptive slugs** - they become the URL path
3. **Include quality cover images** - enhances visual appeal
4. **Write summaries** - displayed in post cards
5. **Tag appropriately** - enables future filtering features

### Example Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Post title |
| `slug` | string | Yes | URL-friendly identifier |
| `date` | ISO string | Yes | Publication date |
| `summary` | string | Yes | Brief description |
| `coverImage` | URL | No | Cover image URL |
| `author` | string | No | Author name |
| `tags` | array | No | Category tags |

