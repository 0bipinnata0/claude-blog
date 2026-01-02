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
import { BlogService } from '../services/blog.service';
import { BlogPost } from '../models/post.model';

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
  template: `
    <div class="search-container">
      <div class="search-header">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          #searchInput
          type="text"
          class="search-input"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange()"
          placeholder="Search articles..."
          autocomplete="off">
        <button class="close-button" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="search-results">
        @if (searchQuery() && results().length === 0) {
          <div class="no-results">
            <mat-icon>search_off</mat-icon>
            <p>No articles found</p>
          </div>
        } @else if (searchQuery()) {
          <mat-list>
            @for (post of results(); track post.id) {
              <mat-list-item
                [routerLink]="['/post', post.slug]"
                (click)="close()"
                class="result-item">
                <div class="result-content">
                  <h3 class="result-title">{{ post.title }}</h3>
                  <p class="result-summary">{{ post.summary }}</p>
                  <div class="result-meta">
                    <mat-icon class="meta-icon">calendar_today</mat-icon>
                    <span>{{ post.date | date: 'MMM d, yyyy' }}</span>
                  </div>
                </div>
              </mat-list-item>
            }
          </mat-list>
        } @else {
          <div class="search-hint">
            <mat-icon>info</mat-icon>
            <p>Start typing to search articles...</p>
          </div>
        }
      </div>

      <div class="search-footer">
        <div class="keyboard-hints">
          <kbd>↑↓</kbd> Navigate
          <kbd>↵</kbd> Select
          <kbd>Esc</kbd> Close
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      width: 600px;
      max-width: 90vw;
    }

    .search-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .search-icon {
      color: var(--mat-sys-on-surface-variant);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: 1.125rem;
      color: var(--mat-sys-on-surface);
      font-family: inherit;
    }

    .search-input::placeholder {
      color: var(--mat-sys-on-surface-variant);
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      color: var(--mat-sys-on-surface-variant);
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background-color: var(--mat-sys-surface-container);
    }

    .search-results {
      flex: 1;
      overflow-y: auto;
      min-height: 200px;
      max-height: 500px;
    }

    .no-results,
    .search-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: var(--mat-sys-on-surface-variant);
      text-align: center;
    }

    .no-results mat-icon,
    .search-hint mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .result-item {
      cursor: pointer;
      transition: background-color 0.2s;
      padding: 16px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .result-item:hover {
      background-color: var(--mat-sys-surface-container);
    }

    .result-content {
      width: 100%;
    }

    .result-title {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .result-summary {
      margin: 0 0 8px 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .result-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .meta-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .search-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      background-color: var(--mat-sys-surface-container-low);
    }

    .keyboard-hints {
      display: flex;
      gap: 16px;
      font-size: 0.75rem;
      color: var(--mat-sys-on-surface-variant);
      align-items: center;
    }

    kbd {
      padding: 2px 6px;
      border-radius: 4px;
      background-color: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline-variant);
      font-family: monospace;
      font-size: 0.75rem;
    }
  `]
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
