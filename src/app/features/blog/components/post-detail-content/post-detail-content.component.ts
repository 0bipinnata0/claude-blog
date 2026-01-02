import { Component, input, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { loadPrism, loadMermaid } from '../../../../shared/utils/prism-loader';

@Component({
    selector: 'app-post-detail-content',
    standalone: true,
    imports: [MarkdownComponent],
    templateUrl: './post-detail-content.component.html',
    styleUrls: ['./post-detail-content.component.scss']
})
export class PostDetailContentComponent {
    content = input.required<string>();
    isLoading = input<boolean>(false);
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
                        }, 100);
                    });
                }
            }
        });
    }
}
