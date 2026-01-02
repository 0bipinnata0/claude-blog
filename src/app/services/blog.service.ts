import { Injectable, computed, resource } from '@angular/core';
import { BlogPost } from '../models/post.model';

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

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  // Resource for fetching posts index using the modern resource API
  readonly postsResource = resource<PostMetadata[], unknown>({
    loader: () => fetch('/posts/index.json').then(res => res.json())
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
}
