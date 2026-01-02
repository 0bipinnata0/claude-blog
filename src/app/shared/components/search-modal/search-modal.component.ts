import { Component, inject, signal, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import Fuse from 'fuse.js';
import { BlogService } from '../../../core/services/blog.service';
import { BlogPost } from '../../models/post.model';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss']
})
export class SearchModalComponent {
  private blogService = inject(BlogService);
  private dialogRef = inject(MatDialogRef<SearchModalComponent>);

  searchQuery = signal('');
  results = signal<BlogPost[]>([]);

  private fuse!: Fuse<BlogPost>;

  constructor() {
    effect(() => {
      const posts = this.blogService.posts();
      if (posts.length > 0) {
        this.fuse = new Fuse(posts, {
          keys: ['title', 'summary', 'tags'],
          threshold: 0.3,
          includeScore: true,
        });
      }
    });
  }

  onSearchChange(): void {
    const query = this.searchQuery();
    if (!query.trim() || !this.fuse) {
      this.results.set([]);
      return;
    }

    const fuseResults = this.fuse.search(query);
    this.results.set(fuseResults.map(result => result.item));
  }

  close(): void {
    this.dialogRef.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
