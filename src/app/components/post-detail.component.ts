import { Component, inject, input, computed, effect, signal, afterNextRender, resource, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../services/blog.service';
import { SeoService } from '../services/seo.service';
import { AuthService } from '../services/auth.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MarkdownComponent } from 'ngx-markdown';
import { CommentsComponent, GiscusConfig } from './comments.component';
import { loadPrism, loadMermaid } from '../utils/prism-loader';

interface PostMetadata {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  coverImage: string;
  author?: string;
  tags?: string[];
  fileName: string;
}

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, NgOptimizedImage, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MarkdownComponent, CommentsComponent],
  template: `
    <div class="container">
      <a mat-button [routerLink]="['/']" class="back-button">
        <mat-icon>arrow_back</mat-icon>
        Back to Articles
      </a>

      @if (post(); as post) {
        <mat-card class="post-card">
          <div class="image-container">
            <img
              mat-card-image
              [ngSrc]="post.coverImage"
              [alt]="post.title"
              [style.view-transition-name]="'img-' + post.slug"
              fill
              priority>
          </div>

          <mat-card-header>
            <mat-card-title>{{ post.title }}</mat-card-title>
            <mat-card-subtitle>
              <div class="post-meta">
                <span class="meta-item">
                  <mat-icon>calendar_today</mat-icon>
                  {{ post.date | date: 'MMMM d, yyyy' }}
                </span>
                @if (views() > 0) {
                  <span class="meta-item">
                    <mat-icon>visibility</mat-icon>
                    {{ views() }} views
                  </span>
                }
                <button
                  mat-mini-fab
                  [color]="hasLiked() ? 'warn' : 'accent'"
                  (click)="toggleLike()"
                  [disabled]="likesLoading()"
                  class="like-button"
                  [attr.aria-label]="hasLiked() ? 'Unlike this post' : 'Like this post'">
                  <mat-icon>{{ hasLiked() ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
                @if (likes() > 0) {
                  <span class="meta-item">
                    {{ likes() }} {{ likes() === 1 ? 'like' : 'likes' }}
                  </span>
                }
              </div>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="summary">{{ post.summary }}</p>
            <div class="content prose">
              @if (postContentResource.isLoading()) {
                <div class="skeleton-loader">
                  <div class="skeleton-line skeleton-title"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line skeleton-short"></div>
                  <div class="skeleton-spacing"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line"></div>
                  <div class="skeleton-line skeleton-short"></div>
                </div>
              } @else {
                <markdown
                  [data]="postContent()"
                  mermaid
                ></markdown>
              }
            </div>

            <app-comments [config]="giscusConfig"></app-comments>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card class="not-found-card">
          <mat-card-content>
            <div class="not-found">
              <mat-icon>sentiment_dissatisfied</mat-icon>
              <h2>Post Not Found</h2>
              <p>The article you're looking for doesn't exist.</p>
              <a mat-raised-button color="primary" [routerLink]="['/']">
                Go to Home
              </a>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 16px;
    }

    .back-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .post-card {
      margin-bottom: 32px;
    }

    .image-container {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
    }

    img {
      object-fit: cover;
    }

    mat-card-header {
      margin: 24px 0;
    }

    mat-card-title {
      font-size: 2rem;
      line-height: 1.3;
      margin-bottom: 12px;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    mat-card-subtitle mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .like-button {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .like-button:hover {
      transform: scale(1.1);
    }

    .like-button:active {
      transform: scale(0.95);
    }

    .like-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .summary {
      font-size: 1.25rem;
      line-height: 1.6;
      color: var(--mat-sys-on-surface-variant);
      font-style: italic;
      border-left: 4px solid var(--mat-sys-primary);
      padding-left: 16px;
      margin: 24px 0;
    }

    .content {
      margin-top: 32px;
    }

    .prose {
      max-width: none;
      line-height: 1.8;
    }

    /* Markdown Typography Styles */
    .prose :deep(h1) {
      font-size: 2rem;
      font-weight: 500;
      margin: 2rem 0 1rem 0;
      line-height: 1.3;
    }

    .prose :deep(h2) {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 1.5rem 0 0.75rem 0;
      line-height: 1.4;
    }

    .prose :deep(h3) {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 1.25rem 0 0.5rem 0;
      line-height: 1.4;
    }

    .prose :deep(p) {
      margin: 1rem 0;
      line-height: 1.8;
    }

    .prose :deep(ul),
    .prose :deep(ol) {
      margin: 1rem 0;
      padding-left: 2rem;
    }

    .prose :deep(li) {
      margin: 0.5rem 0;
    }

    .prose :deep(code) {
      background-color: var(--mat-sys-surface-variant);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .prose :deep(pre) {
      background-color: var(--mat-sys-surface-variant);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
    }

    .prose :deep(pre code) {
      background-color: transparent;
      padding: 0;
    }

    .prose :deep(blockquote) {
      border-left: 4px solid var(--mat-sys-primary);
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: var(--mat-sys-on-surface-variant);
    }

    .prose :deep(a) {
      color: var(--mat-sys-primary);
      text-decoration: none;
    }

    .prose :deep(a:hover) {
      text-decoration: underline;
    }

    .prose :deep(strong) {
      font-weight: 600;
    }

    .prose :deep(em) {
      font-style: italic;
    }

    .prose :deep(hr) {
      border: none;
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin: 2rem 0;
    }

    .not-found-card {
      margin-top: 48px;
    }

    .not-found {
      text-align: center;
      padding: 48px 24px;
    }

    .not-found mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 16px;
    }

    .not-found h2 {
      font-size: 1.75rem;
      margin: 16px 0;
    }

    .not-found p {
      font-size: 1.125rem;
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 24px;
    }

    /* Skeleton Loader Styles */
    .skeleton-loader {
      padding: 2rem 0;
    }

    .skeleton-line {
      height: 16px;
      background: linear-gradient(
        90deg,
        var(--mat-sys-surface-container) 25%,
        var(--mat-sys-surface-container-high) 50%,
        var(--mat-sys-surface-container) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .skeleton-title {
      height: 32px;
      width: 60%;
      margin-bottom: 24px;
    }

    .skeleton-short {
      width: 80%;
    }

    .skeleton-spacing {
      height: 24px;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `]
})
export class PostDetailComponent {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  // Strictly typed input signal for slug
  slug = input.required<string>();

  // View counter signal
  views = signal<number>(0);

  // Like counter with real API backend
  likes = signal<number>(0);
  hasLiked = signal<boolean>(false);
  likesLoading = signal<boolean>(false);

  // Toggle like (requires authentication)
  toggleLike() {
    if (!this.authService.isAuthenticated()) {
      // Redirect to login if not authenticated
      this.authService.login();
      return;
    }

    if (this.likesLoading()) {
      return; // Prevent double-click
    }

    this.likesLoading.set(true);
    const currentSlug = this.slug();

    this.http.post<{ likes: number; hasLiked: boolean }>(`/api/likes/${currentSlug}`, {})
      .subscribe({
        next: (response) => {
          this.likes.set(response.likes);
          this.hasLiked.set(response.hasLiked);
          this.likesLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to toggle like:', error);
          this.likesLoading.set(false);
        }
      });
  }

  // Giscus configuration
  // Configured with repository: 0bipinnata0/claude-blog
  giscusConfig: GiscusConfig = {
    repo: '0bipinnata0/claude-blog',
    repoId: 'R_kgDOQygX1Q',
    category: 'Announcements',
    categoryId: 'DIC_kwDOQygX1c4C0fZB',
    mapping: 'pathname',
    reactionsEnabled: true,
    emitMetadata: false,
    inputPosition: 'bottom',
    lang: 'en',
    loading: 'lazy'
  };

  // Computed signal to fetch post metadata based on slug
  post = computed(() => {
    const currentSlug = this.slug();
    return this.blogService.posts().find(post => post.slug === currentSlug) ?? null;
  });

  // Resource for loading post content based on slug
  postContentResource = resource({
    loader: async () => {
      const currentSlug = this.slug();

      // Directly fetch the index to get fileName, independent of BlogService
      const indexResponse = await fetch('/posts/index.json');
      if (!indexResponse.ok) {
        throw new Error('Failed to fetch posts index');
      }

      const postsIndex: PostMetadata[] = await indexResponse.json();
      const postMeta = postsIndex.find((p: PostMetadata) => p.slug === currentSlug);

      if (!postMeta) {
        throw new Error(`Post not found: ${currentSlug}`);
      }

      const fileName = postMeta.fileName;
      if (!fileName) {
        throw new Error(`fileName not found for slug: ${currentSlug}`);
      }

      const response = await fetch(`/posts/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }

      const content = await response.text();
      // Remove frontmatter from content (everything between --- markers)
      const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
      return contentWithoutFrontmatter.trim();
    }
  });

  // Computed signal for post content
  postContent = computed(() => this.postContentResource.value() ?? '');

  constructor() {
    // Update SEO meta tags when post changes
    effect(() => {
      const currentPost = this.post();

      if (currentPost) {
        this.seoService.updateMetaTags({
          title: `${currentPost.title} | Claude Blog`,
          description: currentPost.summary,
          image: currentPost.coverImage,
          url: this.seoService.getFullUrl(`/post/${currentPost.slug}`),
          type: 'article',
          author: currentPost.author,
          publishedTime: currentPost.date.toString(),
          tags: currentPost.tags
        });
      }
    });

    // Lazy-load PrismJS and Mermaid when content is ready (only in browser)
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const content = this.postContent();
        if (content) {
          // Load PrismJS and Mermaid dynamically
          Promise.all([loadPrism(), loadMermaid()]).then(() => {
            // Trigger Prism syntax highlighting after a short delay
            // to ensure DOM is updated with markdown content
            setTimeout(() => {
              if (typeof window !== 'undefined' && (window as any).Prism) {
                (window as any).Prism.highlightAll();
              }
            }, 100);
          });
        }
      }
    });

    // Increment view counter (only in browser, not during SSR/prerender)
    afterNextRender(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        // Increment view counter
        this.http.post<{ views: number }>(`/api/visits/${currentSlug}`, {})
          .subscribe({
            next: (response) => {
              this.views.set(response.views);
            },
            error: (error) => {
              console.error('Failed to increment view count:', error);
              // Silently fail - don't show error to user
            }
          });

        // Load like count and user's like status
        this.http.get<{ likes: number; hasLiked: boolean }>(`/api/likes/${currentSlug}`)
          .subscribe({
            next: (response) => {
              this.likes.set(response.likes);
              this.hasLiked.set(response.hasLiked);
            },
            error: (error) => {
              console.error('Failed to load like data:', error);
              // Silently fail
            }
          });
      }
    });
  }
}
