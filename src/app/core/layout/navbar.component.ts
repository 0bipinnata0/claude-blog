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
import { SearchModalComponent } from '../../shared/components/search-modal/search-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
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
