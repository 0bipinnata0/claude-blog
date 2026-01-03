import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../../core/services/blog.service';
import { SeoService } from '../../../../core/services/seo.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SpotlightDirective } from '../../../../shared/directives/spotlight.directive';
import { TabsDirective, TabDirective, TabPanelDirective } from '../../../../shared/directives/a11y-tabs.directive';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NgOptimizedImage,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    SpotlightDirective,
    TabsDirective,
    TabDirective,
    TabPanelDirective
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent {
  blogService = inject(BlogService);
  private seoService = inject(SeoService);

  selectedTag = signal<string>('All');

  // Compute unique tags from all posts
  tags = computed(() => {
    const posts = this.blogService.posts();
    const allTags = posts.flatMap(post => post.tags ?? []);
    return ['All', ...new Set(allTags)].sort();
  });

  // Filter posts based on selected tag
  filteredPosts = computed(() => {
    const tag = this.selectedTag();
    const posts = this.blogService.posts();
    if (tag === 'All') return posts;
    return posts.filter(post => post.tags?.includes(tag));
  });

  constructor() {
    // Set default SEO meta tags for home page
    this.seoService.setDefaultMetaTags();
  }
}
