import { Component, input, output, effect, inject, PLATFORM_ID, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { loadPrism, loadMermaid } from '../../../../shared/utils/prism-loader';
import { TocItem } from '../../../../shared/components/table-of-contents/table-of-contents.component';

@Component({
    selector: 'app-post-detail-content',
    standalone: true,
    imports: [MarkdownComponent],
    templateUrl: './post-detail-content.component.html',
    styleUrls: ['./post-detail-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailContentComponent {
    content = input.required<string>();
    isLoading = input<boolean>(false);
    tocFound = output<TocItem[]>();
    private platformId = inject(PLATFORM_ID);

    constructor() {
        // Lazy-load PrismJS and Mermaid when content is ready (only in browser)
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                const content = this.content();
                if (content) {
                    // Load PrismJS and Mermaid dynamically
                    Promise.all([loadPrism(), loadMermaid()]).then(() => {
                        // Trigger Prism syntax highlighting after a short delay
                        // to ensure DOM is updated with markdown content
                        setTimeout(() => {
                            if (typeof window !== 'undefined' && (window as any).Prism) {
                                (window as any).Prism.highlightAll();
                            }
                            this.parseToc();
                        }, 100);
                    });
                }
            }
        });
    }

    private parseToc(): void {
        const items: TocItem[] = [];
        const headers = document.querySelectorAll('.prose h2, .prose h3');

        headers.forEach((header) => {
            const level = header.tagName === 'H2' ? 2 : 3;
            const text = header.textContent?.trim() || '';

            if (!header.id) {
                header.id = text.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
            }

            items.push({
                id: header.id,
                text: text,
                level: level
            });
        });

        this.tocFound.emit(items);
    }

    @HostListener('click', ['$event'])
    async onCopyClick(event: MouseEvent) {
        if (!isPlatformBrowser(this.platformId)) return;

        const target = event.target as HTMLElement;
        const button = target.closest('.copy-to-clipboard-button');

        if (button) {
            const confetti = (await import('canvas-confetti')).default;
            const rect = button.getBoundingClientRect();

            // Calculate normalized coordinates (0-1) for confetti origin
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                origin: { x, y },
                particleCount: 50,
                spread: 60,
                gravity: 1.2,
                scalar: 0.7,
                colors: ['#6366f1', '#8b5cf6', '#d946ef', '#10b981'], // Tailwind-ish colors: Indigo, Violet, Fuchsia, Emerald
                ticks: 100
            });
        }
    }
}
