import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, HttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideContent, withMarkdownRenderer } from '@analogjs/content';

import { routes } from './app.routes';

// Import configured marked instance
import './shared/utils/markdown-config';
import { BLOG_DATA_SERVICE } from './core/services/blog-data.contract';
import { HttpBlogDataService } from './core/services/http-blog-data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch()),
    provideMarkdown({
      loader: HttpClient,
    }),
    provideClientHydration(withEventReplay()),
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        // Use the URL as-is for external images
        return config.src;
      },
    },
    { provide: BLOG_DATA_SERVICE, useClass: HttpBlogDataService },
    provideContent(withMarkdownRenderer())
  ]
};
