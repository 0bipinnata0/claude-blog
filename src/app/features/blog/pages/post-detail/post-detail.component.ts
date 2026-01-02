import { Component, inject, input, computed, effect, signal, afterNextRender, resource, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../../../../core/services/blog.service';
import { SeoService } from '../../../../core/services/seo.service';
import { InteractionService } from '../../../../core/services/interaction.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommentsComponent, GiscusConfig } from '../../../../shared/components/comments/comments.component';
import { TableOfContentsComponent, TocItem } from '../../../../shared/components/table-of-contents/table-of-contents.component';
import { PostDetailHeaderComponent } from '../../components/post-detail-header/post-detail-header.component';
import { PostDetailContentComponent } from '../../components/post-detail-content/post-detail-content.component';
import { BlogPost } from '../../../../shared/models/post.model';

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
  imports: [
    RouterLink,

    NgOptimizedImage,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CommentsComponent,
    TableOfContentsComponent,
    PostDetailHeaderComponent,
    PostDetailContentComponent
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private interactionService = inject(InteractionService);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  authService = inject(AuthService);

  // Strictly typed input signal for slug
  slug = input.required<string>();

  // Reading progress signal (0-100)
  readingProgress = signal<number>(0);

  // Table of Contents items
  tocItems = signal<TocItem[]>([]);

  // Giscus configuration
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
    // We are mapping PostMetadata to BlogPost here if needed, but BlogService does return BlogPost[]
    const currentSlug = this.slug();
    return this.blogService.posts().find(post => post.slug === currentSlug) ?? null;
  });

  // Resource for loading post content based on slug
  postContentResource = resource<string, BlogPost | null>({
    params: () => this.post(),
    loader: async ({ params: post }) => {
      if (!post) return '';

      try {
        const content = await this.blogService.getPostContent(post.fileName);
        // Remove frontmatter from content (everything between --- markers)
        const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
        return contentWithoutFrontmatter.trim();
      } catch (error) {
        console.error(`Failed to fetch post content for ${post.slug}`, error);
        throw error;
      }
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

    // Parse TOC from markdown content
    effect(() => {
      const content = this.postContent();
      if (content) {
        // Small delay to ensure markdown is rendered
        setTimeout(() => {
          this.parseToc(content);
        }, 200);
      }
    });

    // Setup scroll listener for reading progress (only in browser)
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.setupScrollListener();
      }
    });

    // Increment view counter and load likes
    afterNextRender(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        this.interactionService.reset(); // Reset signals for new post
        this.interactionService.loadInteractions(currentSlug);
      }
    });
  }

  // Parse Table of Contents from markdown content
  private parseToc(content: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const items: TocItem[] = [];
    const headers = document.querySelectorAll('.prose h2, .prose h3');

    headers.forEach((header) => {
      const level = header.tagName === 'H2' ? 2 : 3;
      const text = header.textContent?.trim() || '';

      // Generate ID if not present
      if (!header.id) {
        header.id = text.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      items.push({
        id: header.id,
        text: text,
        level: level
      });
    });

    this.tocItems.set(items);
  }

  // Setup scroll listener for reading progress bar
  private setupScrollListener(): void {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const scrollableDistance = documentHeight - windowHeight;
      const progress = (scrollTop / scrollableDistance) * 100;

      this.readingProgress.set(Math.min(Math.max(progress, 0), 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
  }
}
