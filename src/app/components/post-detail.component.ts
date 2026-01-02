import { Component, inject, input, computed, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { SeoService } from '../services/seo.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MarkdownComponent } from 'ngx-markdown';
import { CommentsComponent, GiscusConfig } from './comments.component';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

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
          <img
            mat-card-image
            [ngSrc]="post.coverImage"
            [alt]="post.title"
            [style.view-transition-name]="'img-' + post.slug"
            width="800"
            height="400"
            priority>

          <mat-card-header>
            <mat-card-title>{{ post.title }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon>calendar_today</mat-icon>
              {{ post.date | date: 'MMMM d, yyyy' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="summary">{{ post.summary }}</p>
            <div class="content prose">
              @defer (on viewport) {
                <markdown
                  [data]="postContent()"
                  mermaid
                ></markdown>
              } @placeholder {
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

    img {
      object-fit: cover;
      max-height: 400px;
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

    mat-card-subtitle mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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

  // Strictly typed input signal for slug
  slug = input.required<string>();

  // Computed signal to fetch post metadata based on slug
  post = computed(() => {
    const currentSlug = this.slug();
    return this.blogService.posts().find(post => post.slug === currentSlug) ?? null;
  });

  // Convert slug signal to observable, then fetch content
  // toSignal is called ONCE at initialization, not in reactive context
  postContent = toSignal(
    toObservable(this.slug).pipe(
      switchMap(slug => this.blogService.getPostContent(slug))
    ),
    { initialValue: '' }
  );

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
  }
}
