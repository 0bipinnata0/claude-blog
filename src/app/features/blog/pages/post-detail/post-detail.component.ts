import { Component, inject, input, computed, effect, signal, afterNextRender, resource, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink } from '@angular/router';
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
import { ReadingProgressComponent } from '../../../../shared/components/reading-progress/reading-progress.component';
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
    PostDetailContentComponent,
    ReadingProgressComponent
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private interactionService = inject(InteractionService);
  authService = inject(AuthService);

  // Strictly typed input signal for slug
  slug = input.required<string>();

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





    // Increment view counter and load likes
    afterNextRender(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        this.interactionService.reset(); // Reset signals for new post
        this.interactionService.loadInteractions(currentSlug);
      }
    });
  }




}
