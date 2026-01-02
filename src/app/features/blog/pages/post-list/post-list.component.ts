import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../../core/services/blog.service';
import { SeoService } from '../../../../core/services/seo.service';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SpotlightDirective } from '../../../../shared/directives/spotlight.directive';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterLink, DatePipe, NgOptimizedImage, MatCardModule, MatButtonModule, MatIconModule, SpotlightDirective],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent {
  blogService = inject(BlogService);
  private seoService = inject(SeoService);

  constructor() {
    // Set default SEO meta tags for home page
    this.seoService.setDefaultMetaTags();
  }
}
