import { Component, Input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';

@Component({
    selector: 'app-lazy-mdx-loader',
    standalone: true,
    imports: [NgComponentOutlet],
    template: `<div class="lazy-wrapper p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 my-8">
    <p class="text-sm text-gray-500 mb-4">Lazy Loaded Component Wrapper</p>
    <ng-container *ngComponentOutlet="component" />
  </div>`,
    styles: []
})
export class LazyMdxLoaderComponent {
    @Input() component!: Type<any>;
}
