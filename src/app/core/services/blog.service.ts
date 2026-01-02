import { Injectable, computed, resource, inject } from '@angular/core';
import { BlogPost } from '../../shared/models/post.model';
import { BLOG_DATA_SERVICE, PostMetadata } from './blog-data.contract';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private blogDataService = inject(BLOG_DATA_SERVICE);

  // Resource for fetching posts index using the modern resource API
  readonly postsResource = resource<PostMetadata[], unknown>({
    loader: () => this.blogDataService.getPosts()
  });

  // Expose posts as BlogPost signal (without content)
  posts = computed<BlogPost[]>(() => {
    const data = this.postsResource.value() ?? [];
    return data.map(meta => ({
      ...meta,
      date: new Date(meta.date),
      content: '' // Content loaded separately
    }));
  });

  /**
   * Get post by slug - returns computed signal with metadata
   */
  getPostBySlug(slug: string) {
    return computed(() =>
      this.posts().find(post => post.slug === slug) ?? null
    );
  }

  /**
   * Get fileName for a given slug
   */
  getFileNameForSlug(slug: string): string | null {
    const data = this.postsResource.value() ?? [];
    const post = data.find(p => p.slug === slug);
    return post?.fileName ?? null;
  }

  /**
   * Fetch post content by fileName
   */
  getPostContent(fileName: string): Promise<string> {
    return this.blogDataService.getPostContent(fileName);
  }
}

