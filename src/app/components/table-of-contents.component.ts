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
  template: `
    <div class="toc-container">
      <div class="toc-header">
        <mat-icon>list</mat-icon>
        <h3>Table of Contents</h3>
      </div>

      <nav class="toc-nav">
        @for (item of items(); track item.id) {
          <a
            [href]="'#' + item.id"
            [class.active]="activeId() === item.id"
            [class.level-2]="item.level === 2"
            [class.level-3]="item.level === 3"
            (click)="scrollToSection($event, item.id)">
            {{ item.text }}
          </a>
        }
      </nav>
    </div>
  `,
  styles: [`
    .toc-container {
      position: sticky;
      top: 80px;
      height: fit-content;
      max-height: calc(100vh - 100px);
      overflow-y: auto;
      padding: 20px;
      border-radius: 16px;
      background: color-mix(in srgb, var(--mat-sys-surface-container) 80%, transparent);
      backdrop-filter: blur(12px);
      border: 1px solid color-mix(in srgb, var(--mat-sys-outline-variant) 30%, transparent);
    }

    .toc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: var(--mat-sys-on-surface);
    }

    .toc-header mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .toc-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .toc-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toc-nav a {
      display: block;
      padding: 8px 12px;
      border-radius: 8px;
      text-decoration: none;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
      line-height: 1.4;
      transition: all 0.2s ease;
      position: relative;
    }

    .toc-nav a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2px;
      height: 0;
      background: var(--mat-sys-primary);
      transition: height 0.2s ease;
    }

    .toc-nav a.level-3 {
      padding-left: 24px;
      font-size: 0.8125rem;
    }

    .toc-nav a:hover {
      color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 8%, transparent);
    }

    .toc-nav a.active {
      color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);
      font-weight: 600;
    }

    .toc-nav a.active::before {
      height: 100%;
    }

    /* Scrollbar styling */
    .toc-container::-webkit-scrollbar {
      width: 6px;
    }

    .toc-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .toc-container::-webkit-scrollbar-thumb {
      background: var(--mat-sys-outline-variant);
      border-radius: 3px;
    }

    .toc-container::-webkit-scrollbar-thumb:hover {
      background: var(--mat-sys-outline);
    }

    /* Dark mode enhancements */
    html.dark .toc-container {
      background: color-mix(in srgb, var(--mat-sys-surface-container) 60%, transparent);
    }
  `]
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
