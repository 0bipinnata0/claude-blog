import { Component, input, signal, effect, PLATFORM_ID, inject, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for h2, 3 for h3
}

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss']
})
export class TableOfContentsComponent {
  items = input.required<TocItem[]>();
  activeId = signal<string>('');

  private platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  constructor() {
    // Set up IntersectionObserver to track active sections
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.setupIntersectionObserver();
      }
    });

    // Clean up observer when items change
    effect(() => {
      const currentItems = this.items();
      if (currentItems.length > 0 && isPlatformBrowser(this.platformId)) {
        // Small delay to ensure DOM is updated
        setTimeout(() => this.observeHeaders(), 100);
      }
    });
  }

  private setupIntersectionObserver(): void {
    const options = {
      rootMargin: '-80px 0px -80% 0px', // Trigger when header is near top
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      // Find the first intersecting entry (closest to top)
      const intersecting = entries.filter(entry => entry.isIntersecting);

      if (intersecting.length > 0) {
        // Sort by position and take the topmost
        const topmost = intersecting.sort((a, b) =>
          a.boundingClientRect.top - b.boundingClientRect.top
        )[0];

        this.activeId.set(topmost.target.id);
      }
    }, options);
  }

  private observeHeaders(): void {
    if (!this.observer) return;

    // Unobserve all previous headers
    this.observer.disconnect();

    // Observe all headers that are in the TOC
    this.items().forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        this.observer!.observe(element);
      }
    });
  }

  scrollToSection(event: Event, id: string): void {
    event.preventDefault();

    if (!isPlatformBrowser(this.platformId)) return;

    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      this.activeId.set(id);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
