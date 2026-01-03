import { Component, input, effect, inject, PLATFORM_ID, signal, ElementRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping?: string;
  reactionsEnabled?: boolean;
  emitMetadata?: boolean;
  inputPosition?: 'top' | 'bottom';
  lang?: string;
  loading?: 'lazy' | 'eager';
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentsComponent implements OnDestroy {
  config = input.required<GiscusConfig>();

  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  private scriptElement?: HTMLScriptElement;
  private messageListener?: (event: MessageEvent) => void;
  private loadTimeout?: number;
  private intersectionObserver?: IntersectionObserver;

  // State signals
  errorState = signal<boolean>(false);
  errorMessage = signal<string>('');
  loading = signal<boolean>(true);

  constructor() {
    // Load and reload Giscus when theme or config changes
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        const currentConfig = this.config();
        const theme = this.themeService.isDark() ? 'dark' : 'light';
        this.initializeGiscus(currentConfig, theme);
      }
    });
  }

  private initializeGiscus(config: GiscusConfig, theme: string): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Reset states
    this.errorState.set(false);
    this.loading.set(true);
    this.cleanup();

    if (config.loading === 'lazy') {
      this.setupIntersectionObserver(config, theme);
    } else {
      this.loadGiscus(config, theme);
    }
  }

  private setupIntersectionObserver(config: GiscusConfig, theme: string): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Once visible, load the script and stop observing
          this.loadGiscus(config, theme);
          if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = undefined;
          }
        }
      });
    }, {
      rootMargin: '200px' // Start loading slightly before the user reaches the section
    });

    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  private loadGiscus(config: GiscusConfig, theme: string): void {
    // Set up error timeout (15 seconds)
    // We only start the timeout when we actually start loading the script
    if (this.loadTimeout) {
      window.clearTimeout(this.loadTimeout);
    }
    this.loadTimeout = window.setTimeout(() => {
      if (this.loading()) {
        this.handleError('Comments are taking too long to load. The discussion may not exist yet.');
      }
    }, 15000);

    // Listen for Giscus messages
    this.setupMessageListener();

    // Create and configure Giscus script
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', config.repo);
    script.setAttribute('data-repo-id', config.repoId);
    script.setAttribute('data-category', config.category);
    script.setAttribute('data-category-id', config.categoryId);
    script.setAttribute('data-mapping', config.mapping || 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', config.reactionsEnabled !== false ? '1' : '0');
    script.setAttribute('data-emit-metadata', config.emitMetadata !== false ? '1' : '0');
    script.setAttribute('data-input-position', config.inputPosition || 'bottom');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', config.lang || 'en');

    // If we lazy loaded via IntersectionObserver, we can set this to eager now
    // If it was configured as eager, it stays eager
    script.setAttribute('data-loading', 'eager');

    script.crossOrigin = 'anonymous';
    script.async = true;

    // Handle script load errors
    script.onerror = () => {
      this.handleError('Failed to load comments widget. Please check your internet connection.');
    };

    // Find the giscus container and append script
    const container = this.elementRef.nativeElement.querySelector('.giscus');
    if (container) {
      container.appendChild(script);
      this.scriptElement = script;
    }
  }

  private setupMessageListener(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Remove existing listener
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }

    // Create new listener
    this.messageListener = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;

      const giscusData = event.data?.giscus;
      if (!giscusData) return;

      // Handle successful load
      if (giscusData.discussion) {
        this.loading.set(false);
        this.errorState.set(false);
        if (this.loadTimeout) {
          window.clearTimeout(this.loadTimeout);
        }
      }

      // Handle errors
      if (giscusData.error) {
        const errorData = giscusData.error;
        const errorMessage = typeof errorData === 'string'
          ? errorData.toLowerCase()
          : (errorData.message || JSON.stringify(errorData)).toLowerCase();

        // If the discussion is not found, it means it's a new post.
        // Giscus handles this by showing "Write a comment" (if enabled) or just 0 comments.
        // We should treat this as a successful load.
        if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          this.loading.set(false);
          this.errorState.set(false);
          if (this.loadTimeout) {
            window.clearTimeout(this.loadTimeout);
          }
          return;
        }

        this.handleError('Unable to load comments. The discussion may not exist yet or the repository configuration is incorrect.');
      }
    };

    window.addEventListener('message', this.messageListener);
  }

  private handleError(message: string): void {
    this.loading.set(false);
    this.errorState.set(true);
    this.errorMessage.set(message);

    // Clear timeout
    if (this.loadTimeout) {
      window.clearTimeout(this.loadTimeout);
    }

    // Suppress console errors for better UX
    // The iframe 404 errors will still show, but we're providing a better UI message
    console.info('Giscus comments: ', message);
  }

  retry(): void {
    const currentConfig = this.config();
    const theme = this.themeService.isDark() ? 'dark' : 'light';
    this.initializeGiscus(currentConfig, theme);
  }

  private cleanup(): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Disconnect observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }

    // Clear timeout
    if (this.loadTimeout) {
      window.clearTimeout(this.loadTimeout);
      this.loadTimeout = undefined;
    }

    // Remove message listener
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = undefined;
    }

    // Remove the giscus iframe if it exists
    const giscusFrame = this.elementRef.nativeElement.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
      giscusFrame.remove();
    }

    // Remove the script element
    if (this.scriptElement) {
      this.scriptElement.remove();
      this.scriptElement = undefined;
    }

    // Clear the container
    const container = this.elementRef.nativeElement.querySelector('.giscus');
    if (container) {
      container.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
