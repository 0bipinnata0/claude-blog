import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { SeoService } from '../services/seo.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterLink, DatePipe, NgOptimizedImage, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Latest Articles</h1>
        <p class="subtitle">Insights on Angular, Material Design, and modern web development</p>
      </div>

      <div class="posts-grid">
        @for (post of blogService.posts(); track post.id) {
          <mat-card>
            <img
              mat-card-image
              [ngSrc]="post.coverImage"
              [alt]="post.title"
              [style.view-transition-name]="'img-' + post.slug"
              width="800"
              height="400">
            <mat-card-header>
              <mat-card-title>{{ post.title }}</mat-card-title>
              <mat-card-subtitle>
                <mat-icon>calendar_today</mat-icon>
                {{ post.date | date: 'MMM d, yyyy' }}
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ post.summary }}</p>
            </mat-card-content>
            <mat-card-actions align="end">
              <a mat-raised-button color="primary" [routerLink]="['/post', post.slug]">
                Read More
                <mat-icon>arrow_forward</mat-icon>
              </a>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 16px;
    }

    .header {
      text-align: center;
      margin-bottom: 48px;
    }

    .header h1 {
      margin: 0 0 16px 0;
      font-size: 2.5rem;
      font-weight: 500;
    }

    .subtitle {
      font-size: 1.25rem;
      color: var(--mat-sys-on-surface-variant);
      margin: 0;
    }

    .posts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    mat-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      font-size: 1.5rem;
      line-height: 1.3;
      margin-bottom: 8px;
    }

    mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    mat-card-subtitle mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    mat-card-content {
      flex: 1;
    }

    mat-card-content p {
      line-height: 1.6;
      margin: 0;
    }

    mat-card-actions {
      margin: 16px 0 0 0;
      padding: 0 16px 16px 16px;
    }

    mat-card-actions a {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    mat-card-actions mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    img {
      object-fit: cover;
      height: 200px;
    }
  `]
})
export class PostListComponent {
  blogService = inject(BlogService);
  private seoService = inject(SeoService);

  constructor() {
    // Set default SEO meta tags for home page
    this.seoService.setDefaultMetaTags();
  }
}
