import { Component, input, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../services/theme.service';
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
  template: `
    <div class="comments-section">
      @if (errorState()) {
        <div class="error-message">
          <mat-icon>info</mat-icon>
          <div class="error-content">
            <h3>Comments Unavailable</h3>
            <p>{{ errorMessage() }}</p>
            <button mat-button (click)="retry()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          </div>
        </div>
      } @else if (loading()) {
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      } @else {
        <div class="giscus"></div>
      }
    </div>
  `,
  styles: [`
    .comments-section {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    .giscus {
      min-height: 200px;
    }

    /* Error Message Styling */
    .error-message {
      display: flex;
      gap: 16px;
      padding: 24px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--mat-sys-error) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--mat-sys-error) 30%, transparent);
      color: var(--mat-sys-on-surface);
    }

    .error-message mat-icon {
      color: var(--mat-sys-error);
      font-size: 32px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;
    }

    .error-content h3 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--mat-sys-error);
    }

    .error-content p {
      margin: 0 0 16px 0;
      line-height: 1.6;
      color: var(--mat-sys-on-surface-variant);
    }

    .error-content button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .error-content button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--mat-sys-primary);
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 16px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
      border-top-color: var(--mat-sys-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.95rem;
    }

    /* Dark mode adjustments */
    html.dark .error-message {
      background: color-mix(in srgb, var(--mat-sys-error) 12%, transparent);
    }
  `]
})
export class CommentsComponent {
  config = input.required<GiscusConfig>();

  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);
  private scriptElement?: HTMLScriptElement;
  private messageListener?: (event: MessageEvent) => void;
  private loadTimeout?: number;

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
        this.loadGiscus(currentConfig, theme);
      }
    });
  }

  private loadGiscus(config: GiscusConfig, theme: string): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Reset states
    this.errorState.set(false);
    this.loading.set(true);

    // Remove existing script and iframe if present
    this.cleanup();

    // Set up error timeout (15 seconds)
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
    script.setAttribute('data-loading', config.loading || 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Handle script load errors
    script.onerror = () => {
      this.handleError('Failed to load comments widget. Please check your internet connection.');
    };

    // Find the giscus container and append script
    const container = document.querySelector('.giscus');
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
    this.loadGiscus(currentConfig, theme);
  }

  private cleanup(): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
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
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
      giscusFrame.remove();
    }

    // Remove the script element
    if (this.scriptElement) {
      this.scriptElement.remove();
      this.scriptElement = undefined;
    }

    // Clear the container
    const container = document.querySelector('.giscus');
    if (container) {
      container.innerHTML = '';
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }
}
