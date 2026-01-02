import { Routes } from '@angular/router';
import { PostListComponent } from './features/blog/pages/post-list/post-list.component';
import { PostDetailComponent } from './features/blog/pages/post-detail/post-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: PostListComponent
  },
  {
    path: 'post/:slug',
    component: PostDetailComponent
  }
];
