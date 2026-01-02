import { Component, input, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../services/theme.service';

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
  template: `
    <div class="comments-section">
      <div class="giscus"></div>
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
  `]
})
export class CommentsComponent {
  config = input.required<GiscusConfig>();

  private themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);
  private scriptElement?: HTMLScriptElement;

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

    // Remove existing script and iframe if present
    this.cleanup();

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

    // Find the giscus container and append script
    const container = document.querySelector('.giscus');
    if (container) {
      container.appendChild(script);
      this.scriptElement = script;
    }
  }

  private cleanup(): void {
    // Only run in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
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
