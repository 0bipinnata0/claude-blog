import { Injectable, signal, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  userId: number;
  username: string;
  avatar: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // User signal - null means not authenticated
  user = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Check authentication status on initialization
    this.checkAuth();
  }

  /**
   * Check if user is authenticated
   */
  checkAuth() {
    // In development mode, use mock user for testing
    if (isDevMode()) {
      console.log('🔧 Development mode: Authentication is mocked');
      // Optionally set a mock user for testing UI
      // this.user.set({
      //   userId: 1,
      //   username: 'developer',
      //   avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
      //   name: 'Dev User'
      // });
      // this.isAuthenticated.set(true);
      return;
    }

    this.http.get<{ user: User | null }>('/api/auth/user')
      .subscribe({
        next: (response) => {
          this.user.set(response.user);
          this.isAuthenticated.set(response.user !== null);
        },
        error: () => {
          this.user.set(null);
          this.isAuthenticated.set(false);
        }
      });
  }

  /**
   * Redirect to GitHub OAuth login
   */
  login() {
    if (isDevMode()) {
      alert('🔧 Development Mode\n\nGitHub OAuth login is only available in production.\n\nTo test authentication:\n1. Deploy to Cloudflare Pages\n2. Configure GitHub OAuth App\n3. Set environment variables\n\nSee DEPLOY_TO_CLOUDFLARE.md for details.');
      return;
    }

    window.location.href = '/api/auth/login';
  }

  /**
   * Logout user
   */
  logout() {
    if (isDevMode()) {
      this.user.set(null);
      this.isAuthenticated.set(false);
      console.log('🔧 Development mode: Logged out (mock)');
      return;
    }

    this.http.post('/api/auth/logout', {})
      .subscribe({
        next: () => {
          this.user.set(null);
          this.isAuthenticated.set(false);
          window.location.reload();
        },
        error: (error) => {
          console.error('Logout failed:', error);
        }
      });
  }
}
