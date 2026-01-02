import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class InteractionService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private platformId = inject(PLATFORM_ID);

    // Signals for the current post interaction state
    views = signal<number>(0);
    likes = signal<number>(0);
    hasLiked = signal<boolean>(false);
    likesLoading = signal<boolean>(false);

    /**
     * Load likes and views for a specific slug.
     * Can be called from a component's effect or afterNextRender.
     */
    loadInteractions(slug: string) {
        if (!slug || !isPlatformBrowser(this.platformId)) return;

        const isDevelopment = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (isDevelopment) {
            // Mock data for development to avoid 404 console errors
            this.views.set(0);
            this.likes.set(0);
            this.hasLiked.set(false);
            return;
        }

        // 1. Increment View
        this.http.post<{ views: number }>(`/api/visits/${slug}`, {})
            .subscribe({
                next: (response) => {
                    this.views.set(response.views);
                },
                error: (error) => {
                    console.error('Failed to increment view count:', error);
                }
            });

        // 2. Load Likes
        this.http.get<{ likes: number; hasLiked: boolean }>(`/api/likes/${slug}`)
            .subscribe({
                next: (response) => {
                    this.likes.set(response.likes);
                    this.hasLiked.set(response.hasLiked);
                },
                error: (error) => {
                    console.error('Failed to load like data:', error);
                }
            });
    }

    toggleLike(slug: string) {
        if (!this.authService.isAuthenticated()) {
            this.authService.login();
            return;
        }

        if (this.likesLoading()) return;

        this.likesLoading.set(true);

        const isDevelopment = isPlatformBrowser(this.platformId) && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (isDevelopment) {
            setTimeout(() => {
                const currentLikes = this.likes();
                const currentHasLiked = this.hasLiked();
                this.hasLiked.set(!currentHasLiked);
                this.likes.set(currentHasLiked ? currentLikes - 1 : currentLikes + 1);
                this.likesLoading.set(false);
                console.info('💡 Development mode: Like toggled locally');
            }, 300);
            return;
        }

        this.http.post<{ likes: number; hasLiked: boolean }>(`/api/likes/${slug}`, {})
            .subscribe({
                next: (response) => {
                    this.likes.set(response.likes);
                    this.hasLiked.set(response.hasLiked);
                    this.likesLoading.set(false);
                },
                error: (error) => {
                    console.error('Failed to toggle like:', error);
                    this.likesLoading.set(false);
                }
            });
    }

    reset() {
        this.views.set(0);
        this.likes.set(0);
        this.hasLiked.set(false);
    }
}
