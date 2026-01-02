import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  /**
   * Update page title and all meta tags for SEO and social sharing
   */
  updateMetaTags(config: SeoConfig): void {
    // Update page title
    this.titleService.setTitle(config.title);

    // Basic meta tags
    this.metaService.updateTag({ name: 'description', content: config.description });

    // Open Graph tags for Facebook, LinkedIn, etc.
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:type', content: config.type || 'website' });

    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
      this.metaService.updateTag({ property: 'og:image:alt', content: config.title });
    }

    if (config.url) {
      this.metaService.updateTag({ property: 'og:url', content: config.url });
    }

    // Twitter Card tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });

    if (config.image) {
      this.metaService.updateTag({ name: 'twitter:image', content: config.image });
    }

    // Article-specific tags
    if (config.type === 'article') {
      if (config.author) {
        this.metaService.updateTag({ property: 'article:author', content: config.author });
      }

      if (config.publishedTime) {
        this.metaService.updateTag({ property: 'article:published_time', content: config.publishedTime });
      }

      if (config.tags && config.tags.length > 0) {
        // Remove existing article:tag tags
        this.metaService.removeTag('property="article:tag"');

        // Add new tags
        config.tags.forEach(tag => {
          this.metaService.addTag({ property: 'article:tag', content: tag });
        });
      }
    }
  }

  /**
   * Set default meta tags for the home page
   */
  setDefaultMetaTags(): void {
    this.updateMetaTags({
      title: 'Claude Blog - Modern Angular Blog with TypeScript',
      description: 'A modern blog built with Angular 19, TypeScript, and Material Design. Featuring articles on web development, TypeScript patterns, and Angular best practices.',
      type: 'website'
    });
  }

  /**
   * Generate full URL from relative path
   */
  getFullUrl(path: string): string {
    // In production, replace with your actual domain
    const baseUrl = 'https://yourdomain.com';
    return `${baseUrl}${path}`;
  }
}
