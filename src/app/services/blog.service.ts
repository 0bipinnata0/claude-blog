import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BlogPost } from '../models/post.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, catchError, of } from 'rxjs';

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
  private http = inject(HttpClient);

  // Fetch and convert posts index to signal
  private postsMetadata$ = this.http.get<PostMetadata[]>('/posts/index.json');

  // Convert Observable to Signal
  private postsData = toSignal(this.postsMetadata$, { initialValue: [] });

  // Expose posts as BlogPost signal (without content)
  posts = computed<BlogPost[]>(() =>
    this.postsData().map(meta => ({
      ...meta,
      date: new Date(meta.date),
      content: '' // Content loaded separately
    }))
  );

  /**
   * Get post by slug - returns computed signal with metadata
   */
  getPostBySlug(slug: string) {
    return computed(() =>
      this.posts().find(post => post.slug === slug) ?? null
    );
  }

  /**
   * Fetch full post content (markdown) by slug
   * Returns an Observable of the markdown content
   *
   * This method ALWAYS fetches index.json first to get the fileName,
   * then fetches the actual markdown content.
   */
  getPostContent(slug: string) {
    return this.http.get<PostMetadata[]>('/posts/index.json').pipe(
      map(posts => {
        const post = posts.find(p => p.slug === slug);
        if (!post) {
          throw new Error(`Post not found: ${slug}`);
        }
        return post.fileName;
      }),
      switchMap(fileName =>
        this.http.get(`/posts/${fileName}`, { responseType: 'text' })
      ),
      map(content => {
        // Remove frontmatter from content (everything between --- markers)
        const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');
        return contentWithoutFrontmatter.trim();
      }),
      catchError(error => {
        console.error('Error loading post content:', error);
        return of('Content not available');
      })
    );
  }

  /**
   * Get post content as signal
   */
  getPostContentSignal(slug: string) {
    return toSignal(this.getPostContent(slug), { initialValue: '' });
  }
}
