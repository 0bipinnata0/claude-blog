import { Component, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';
import { SearchModalComponent } from '../components/search-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <a [routerLink]="['/']" class="logo-link">
        <mat-icon>menu_book</mat-icon>
        <span>Claude Blog</span>
      </a>
      <span class="spacer"></span>
      <a mat-button [routerLink]="['/']">Home</a>
      <a mat-button href="#">About</a>
      <button
        mat-icon-button
        (click)="openSearch()"
        matTooltip="Search (Cmd+K)"
        aria-label="Open search">
        <mat-icon>search</mat-icon>
      </button>
      <button
        mat-icon-button
        (click)="themeService.toggleTheme()"
        [matTooltip]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        aria-label="Toggle theme"
      >
        <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      @if (authService.isAuthenticated()) {
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-avatar">
          <img [src]="authService.user()?.avatar" [alt]="authService.user()?.name" />
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="user-info" mat-menu-item disabled>
            <div class="user-name">{{ authService.user()?.name }}</div>
            <div class="user-login">@{{ authService.user()?.username }}</div>
          </div>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      } @else {
        <button mat-button (click)="authService.login()">
          <mat-icon>login</mat-icon>
          Login with GitHub
        </button>
      }
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo-link {
      text-decoration: none;
      color: inherit;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .user-avatar {
      margin-left: 8px;
    }

    .user-avatar img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-info {
      padding: 8px 16px;
      cursor: default;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-login {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 2px;
    }
  `]
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService); // GitHub OAuth authentication
  private dialog = inject(MatDialog);

  openSearch(): void {
    this.dialog.open(SearchModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'search-dialog'
    });
  }

  @HostListener('document:keydown.meta.k', ['$event'])
  @HostListener('document:keydown.control.k', ['$event'])
  onSearchShortcut(event: Event): void {
    event.preventDefault();
    this.openSearch();
  }
}
