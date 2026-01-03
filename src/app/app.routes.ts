import { Routes } from '@angular/router';
import { PostListComponent } from './features/blog/pages/post-list/post-list.component';
import { PostDetailComponent } from './features/blog/pages/post-detail/post-detail.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/blog/pages/post-list/post-list.component').then(m => m.PostListComponent)
  },
  {
    path: 'post/:slug',
    loadComponent: () => import('./features/blog/pages/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  }
];
