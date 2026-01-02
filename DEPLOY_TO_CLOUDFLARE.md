# Cloudflare Pages Deployment Guide

This guide provides step-by-step instructions for deploying your Angular blog to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works fine)
- This repository pushed to GitHub
- GitHub repository must be accessible by Cloudflare

## Deployment Steps

### 1. Access Cloudflare Dashboard

1. Log in to your Cloudflare account at https://dash.cloudflare.com/
2. Navigate to **Workers & Pages** in the left sidebar
3. Click **Create Application**
4. Select the **Pages** tab
5. Click **Connect to Git**

### 2. Connect Your Repository

1. Click **Connect GitHub** (first time only, authorize Cloudflare)
2. Select your repository: `0bipinnata0/claude-blog`
3. Click **Begin setup**

### 3. Configure Build Settings

**CRITICAL**: Use these exact settings:

| Setting | Value |
|---------|-------|
| **Project name** | `claude-blog` (or your preferred name) |
| **Production branch** | `main` (or your default branch) |
| **Framework preset** | **Angular** |
| **Build command** | `npm run build` |
| **Build output directory** | `dist/claude-blog/browser` |

**⚠️ IMPORTANT NOTES:**

- **Build Command**: `npm run build` is crucial because it runs:
  1. `bun run gen` - Generates post index
  2. `bun run gen-routes` - Generates routes for prerendering
  3. `ng build` - Builds the Angular app with SSG

- **Build Output Directory**: Must be `dist/claude-blog/browser` (NOT just `dist/claude-blog`)
  - Angular 17+ with SSR/SSG creates a `browser` subdirectory
  - This contains the static files for Cloudflare Pages

### 4. Environment Variables (Optional)

No environment variables are required for basic deployment. The Giscus configuration is already in the code.

If you need to add any in the future:
1. Click **Add variable**
2. Set `NODE_VERSION` = `18` (if needed)

### 5. Deploy

1. Review your settings one final time
2. Click **Save and Deploy**
3. Wait for the build to complete (usually 2-3 minutes)
4. Cloudflare will provide a URL like: `https://claude-blog-xxx.pages.dev`

## Post-Deployment

### Verify Deployment

Visit your deployed site and check:
- ✅ Home page loads with blog posts
- ✅ Individual post pages work (click any article)
- ✅ Search functionality works (Cmd+K or Ctrl+K)
- ✅ Comments appear at bottom of posts
- ✅ Theme toggle works (dark/light mode)
- ✅ Direct navigation to `/post/[slug]` works (tests SPA routing)

### Custom Domain (Optional)

To use your own domain:
1. In Cloudflare Pages, go to your project settings
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Follow the DNS configuration instructions

## Automatic Deployments

Once connected, Cloudflare Pages will automatically:
- Deploy on every push to your main branch
- Create preview deployments for pull requests
- Show deployment status in GitHub

## Troubleshooting

### Build Fails

**Error**: `Command not found: bun`
- **Solution**: Cloudflare uses npm/node by default. Your `package.json` scripts use `bun run` which works because npm will execute them correctly.

**Error**: `routes.txt not found`
- **Solution**: Ensure `bun run gen-routes` runs before `ng build` in your build command

### 404 on Direct Navigation

**Error**: Navigating to `/post/some-post` directly returns 404
- **Solution**: Verify `public/_redirects` file exists and was included in build
- **Check**: The `_redirects` file should be in `dist/claude-blog/browser/_redirects` after build

### Posts Not Showing

**Error**: Home page is empty, no posts visible
- **Solution**: Check that `public/posts/index.json` exists and is populated
- **Verify**: Run `bun run gen` locally to regenerate the index

### Comments Not Loading

**Error**: "giscus is not installed" error
- **Solution**: Verify your GitHub repository has:
  1. Discussions enabled (Settings > Features > Discussions)
  2. Giscus app installed (https://github.com/apps/giscus)
  3. Repository is public (Giscus doesn't work on private repos)

## Build Configuration Details

### What Happens During Build

1. **`bun run gen`** (`scripts/gen-index.ts`)
   - Scans `public/posts/*.md` files
   - Parses frontmatter metadata
   - Generates `public/posts/index.json`

2. **`bun run gen-routes`** (`scripts/gen-routes.ts`)
   - Reads `public/posts/index.json`
   - Generates `routes.txt` with all post URLs
   - Enables prerendering for SEO

3. **`ng build`**
   - Compiles TypeScript to JavaScript
   - Bundles with optimization
   - Prerenders routes from `routes.txt`
   - Outputs to `dist/claude-blog/browser/`

### Files Included in Deployment

```
dist/claude-blog/browser/
├── index.html                 # Main app shell
├── _redirects                 # SPA routing config (from public/)
├── posts/
│   ├── index.json            # Post metadata
│   └── *.md                  # Markdown files
├── post/
│   └── [slug]/
│       └── index.html        # Prerendered post pages
├── *.js                      # JavaScript bundles
├── *.css                     # Stylesheets
└── assets/                   # Static assets
```

## Performance Optimization

Cloudflare Pages provides:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ HTTP/2 and HTTP/3 support
- ✅ Brotli compression
- ✅ Unlimited bandwidth (free tier)

Your blog is already optimized with:
- ✅ Static Site Generation (SSG)
- ✅ Prerendered routes for SEO
- ✅ Lazy-loaded images
- ✅ Deferred content loading
- ✅ Code splitting

## Updating Your Blog

### Adding New Posts

1. Create a new markdown file locally:
   ```bash
   bun run new
   ```

2. Write your content in the generated `.md` file

3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Add new blog post: [Your Title]"
   git push
   ```

4. Cloudflare automatically rebuilds and deploys (2-3 minutes)

### Manual Redeploy

If you need to redeploy without code changes:
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Click **Deployments** tab
4. Click **Retry deployment** on the latest build

## Serverless View Counter Setup (KV Namespace)

Your blog includes a serverless view counter powered by Cloudflare Pages Functions and KV storage. After your first successful deployment, you need to configure the KV namespace binding:

### Step 1: Create KV Namespace

1. In your Cloudflare dashboard, go to **Workers & Pages** > **KV**
2. Click **Create namespace**
3. Name it: `BLOG_VIEWS`
4. Click **Add**

### Step 2: Bind KV to Your Project

1. Go back to your Pages project (Workers & Pages > Your Project)
2. Click **Settings** tab
3. Scroll down to **Functions** section
4. Under **KV namespace bindings**, click **Add binding**
5. Configure the binding:
   - **Variable name**: `BLOG_VIEWS` (must match exactly)
   - **KV namespace**: Select the `BLOG_VIEWS` namespace you just created
6. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. The view counter will now work!

### How It Works

- Each blog post page makes a POST request to `/api/visits/[slug]`
- The edge function increments the counter in KV storage
- The view count displays next to the publish date with an eye icon
- All processing happens at the edge (fast and free)
- Only runs in the browser (skipped during SSR/prerendering)

### Viewing Statistics

To see your view counts:
1. Go to **Workers & Pages** > **KV** > **BLOG_VIEWS**
2. Click **View** to see all post slugs and their view counts
3. You can manually edit or delete entries if needed

## GitHub OAuth Authentication & Like System

Your blog includes a complete authentication system powered by GitHub OAuth, enabling users to like posts. After deployment, you need to configure the OAuth app and environment variables.

### Step 1: Create GitHub OAuth App

1. Go to GitHub Settings: https://github.com/settings/developers
2. Click **OAuth Apps** in the left sidebar
3. Click **New OAuth App**
4. Fill in the application details:
   - **Application name**: `Claude Blog` (or your blog name)
   - **Homepage URL**: `https://your-blog.pages.dev` (your Cloudflare Pages URL)
   - **Authorization callback URL**: `https://your-blog.pages.dev/api/auth/callback`
   - **Application description**: (optional) "OAuth authentication for blog likes"
5. Click **Register application**
6. On the next page, note your **Client ID**
7. Click **Generate a new client secret** and copy the **Client Secret** immediately (you won't be able to see it again)

### Step 2: Create Another KV Namespace for Likes

1. In Cloudflare dashboard, go to **Workers & Pages** > **KV**
2. Click **Create namespace**
3. Name it: `BLOG_LIKES`
4. Click **Add**

### Step 3: Configure Environment Variables

1. Go to your Pages project: **Workers & Pages** > Your Project
2. Click **Settings** tab
3. Scroll to **Environment variables** section
4. Add the following variables for **Production** environment:

   | Variable Name | Value | Note |
   |--------------|-------|------|
   | `GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID | From Step 1 |
   | `GITHUB_CLIENT_SECRET` | Your GitHub OAuth Client Secret | From Step 1, keep secret! |
   | `JWT_SECRET` | Generate a random string | Use: `openssl rand -base64 32` |

5. Click **Save** after adding each variable

### Step 4: Bind KV Namespaces

1. Still in **Settings** > **Functions**
2. Under **KV namespace bindings**, add BOTH bindings:

   **Binding 1:**
   - **Variable name**: `BLOG_VIEWS`
   - **KV namespace**: `BLOG_VIEWS`

   **Binding 2:**
   - **Variable name**: `BLOG_LIKES`
   - **KV namespace**: `BLOG_LIKES`

3. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. Wait for build to complete

### How Authentication Works

**Login Flow:**
1. User clicks "Login with GitHub" in the navbar
2. Redirects to GitHub OAuth authorization page
3. User approves access (read:user scope only)
4. GitHub redirects back to `/api/auth/callback`
5. Edge function exchanges code for access token
6. Fetches user profile and creates JWT
7. Sets HttpOnly cookie and redirects to homepage
8. User avatar and name appear in navbar

**Like System:**
1. Authenticated users can click the heart button on posts
2. Click again to unlike (toggle behavior)
3. Like count is stored in `BLOG_LIKES` KV namespace
4. Each user can only like once per post (enforced by userId)
5. Likes persist across sessions and devices
6. Heart button shows filled (red) when liked, outline when not liked

**Security Features:**
- HttpOnly cookies prevent XSS attacks
- JWT signed with secret key
- CSRF protection with state parameter
- User data stored in encrypted JWT
- No passwords stored (OAuth delegation)

### Viewing Like Statistics

To see like data:
1. Go to **Workers & Pages** > **KV** > **BLOG_LIKES**
2. You'll see two types of keys:
   - `likes:[slug]` - Total like count for a post
   - `like:[slug]:[userId]` - Individual user's like status
3. You can manually adjust counts if needed

### Testing Authentication

1. Visit your deployed blog
2. Click **Login with GitHub** in the navbar
3. Authorize the OAuth app
4. You should be redirected back and see your avatar
5. Open any blog post
6. Click the heart button to like
7. Refresh the page - your like should persist
8. Click the heart again to unlike

### Troubleshooting Auth

**Error: "Invalid OAuth callback"**
- Check that callback URL in GitHub OAuth app matches exactly: `https://your-domain.pages.dev/api/auth/callback`
- Ensure no trailing slashes

**Error: "Unauthorized" when liking**
- Verify JWT_SECRET is set in environment variables
- Check that auth_token cookie is being set (DevTools > Application > Cookies)
- Ensure BLOG_LIKES KV binding is configured correctly

**Error: Logout doesn't work**
- Clear browser cookies manually
- Check browser console for errors
- Verify `/api/auth/logout` endpoint is accessible

**Login button doesn't appear**
- Check browser console for errors
- Verify AuthService is properly injected
- Ensure GITHUB_CLIENT_ID environment variable is set

## Support

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Angular SSR/SSG**: https://angular.dev/guide/ssr
- **Giscus Setup**: https://giscus.app/
- **Cloudflare KV**: https://developers.cloudflare.com/kv/

---

**Last Updated**: 2026-01-02
**Angular Version**: 21.0.0
**Build System**: @angular/build (application builder)
**Features**: SSG, Search, Comments, Serverless View Counter, GitHub OAuth Authentication, Like System

