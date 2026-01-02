import { Component } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  template: `
    <div class="layout-wrapper">
      <app-navbar />
      <main class="main-content">
        <ng-content />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class MainLayoutComponent {}
