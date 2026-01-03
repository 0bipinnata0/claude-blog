import { Component, signal, inject, PLATFORM_ID, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-reading-progress',
    standalone: true,
    templateUrl: './reading-progress.component.html',
    styleUrls: ['./reading-progress.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReadingProgressComponent {
    progress = signal<number>(0);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        afterNextRender(() => {
            if (isPlatformBrowser(this.platformId)) {
                this.setupScrollListener();
            }
        });
    }

    private setupScrollListener(): void {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            const scrollableDistance = documentHeight - windowHeight;
            const progress = (scrollTop / scrollableDistance) * 100;

            this.progress.set(Math.min(Math.max(progress, 0), 100));
            console.log('Scroll Progress:', progress, 'ScrollTop:', scrollTop, 'Height:', documentHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation
    }
}
