import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  // Signal to track current theme
  private readonly _theme = signal<Theme>(this.getInitialTheme());

  // Public readonly signal
  theme = this._theme.asReadonly();

  constructor() {
    // Effect to apply theme changes to DOM
    effect(() => {
      const currentTheme = this._theme();
      this.applyTheme(currentTheme);
    });
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    // Only access browser APIs if we're in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Apply theme to DOM and save to localStorage
   */
  private applyTheme(theme: Theme): void {
    // Only access browser APIs if we're in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.style.colorScheme = 'dark';
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.style.colorScheme = 'light';
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this._theme() === 'dark';
  }
}
