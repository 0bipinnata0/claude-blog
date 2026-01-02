import { Routes } from '@angular/router';
import { PostListComponent } from './components/post-list.component';
import { PostDetailComponent } from './components/post-detail.component';

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
