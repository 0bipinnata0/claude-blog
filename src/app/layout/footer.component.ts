import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <mat-icon>menu_book</mat-icon>
          <span class="brand">Claude Blog</span>
        </div>

        <div class="footer-section">
          <p class="copyright">
            © {{ currentYear }} Claude Blog. Built with Angular {{ angularVersion }} & Material Design 3.
          </p>
        </div>

        <div class="footer-section social-links">
          <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub">
            <mat-icon>code</mat-icon>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">
            <mat-icon>tag</mat-icon>
          </a>
          <a href="mailto:contact@example.com" aria-label="Email">
            <mat-icon>email</mat-icon>
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--mat-sys-surface-container);
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin-top: auto;
      padding: 32px 0;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      text-align: center;
    }

    .footer-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .copyright {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }

    .social-links {
      gap: 16px;
    }

    .social-links a {
      color: var(--mat-sys-on-surface);
      transition: color 0.2s;
      display: flex;
      align-items: center;
    }

    .social-links a:hover {
      color: var(--mat-sys-primary);
    }

    @media (min-width: 768px) {
      .footer-content {
        flex-direction: row;
        justify-content: space-between;
        text-align: left;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  angularVersion = '21';
}
