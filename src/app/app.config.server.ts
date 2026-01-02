import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { BLOG_DATA_SERVICE } from './core/services/blog-data.contract';
import { ServerBlogDataService } from './core/services/server-blog-data.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: BLOG_DATA_SERVICE, useClass: ServerBlogDataService }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
