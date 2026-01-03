import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BlogDataService, PostMetadata } from './blog-data.contract';

@Injectable()
export class HttpBlogDataService implements BlogDataService {
    private http = inject(HttpClient);

    getPosts(): Promise<PostMetadata[]> {
        return firstValueFrom(this.http.get<PostMetadata[]>('/posts/index.json'));
    }

    async getPostContent(fileName: string): Promise<string> {
        // Handle potential subdirectory path (e.g. "my-post/index.md")
        // We need the base path to resolve relative imports
        const basePath = fileName.includes('/') ? fileName.substring(0, fileName.lastIndexOf('/')) : '';
        const url = `/posts/${fileName}`;

        const content = await firstValueFrom(this.http.get(url, { responseType: 'text' }));
        return this.processImports(content, basePath);
    }

    /**
     * Minimal Runtime "MDX" Import Resolver
     * Parses: import Name from './file.md';
     * Replaces: <Name /> with content of file.md
     */
    private async processImports(content: string, basePath: string): Promise<string> {
        // Regex to find: import Name from './file';
        const importRegex = /import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"];?/g;
        const imports = new Map<string, string>();

        let match;
        // We must clone the regex to avoid infinite loops if we were replacing in place (but we are just collecting first)
        // Or just use matchAll if available, but manual loop is safe.
        while ((match = importRegex.exec(content)) !== null) {
            const componentName = match[1];
            const relativePath = match[2];
            imports.set(componentName, relativePath);
        }

        if (imports.size === 0) {
            return content;
        }

        // Fetch all imported contents
        // We run them in parallel
        const resolutions = await Promise.all(
            Array.from(imports.entries()).map(async ([name, file]) => {
                try {
                    // Construct URL for the partial
                    // If basePath is "demo", and file is "intro.md", url is "/posts/demo/intro.md"
                    // If basePath is empty, url is "/posts/intro.md"
                    const fullPath = basePath ? `${basePath}/${file}` : file;
                    const url = `/posts/${fullPath}`;

                    const componentContent = await firstValueFrom(this.http.get(url, { responseType: 'text' }));

                    // Recursively process imports in the partial too!
                    // Note: This assumes imports in partials are relative to the partial (which is same dir)
                    const processedComponentContent = await this.processImports(componentContent, basePath);
                    return { name, content: processedComponentContent };
                } catch (e) {
                    console.error(`Failed to load imported component ${name} from ${file}`, e);
                    return { name, content: `> [!WARNING]\n> Failed to load content: ${file}` };
                }
            })
        );

        // Replace imports and usages in the original content
        let newContent = content;

        // 1. Remove the import lines
        newContent = newContent.replace(importRegex, '');

        // 2. Replace <Name /> tags
        for (const { name, content: importedText } of resolutions) {
            // Regex for <Name /> or <Name></Name>
            const usageRegex = new RegExp(`<${name}\\s*\\/?>`, 'g');
            newContent = newContent.replace(usageRegex, importedText);
        }

        // process nested imports
        let processor = newContent;
        // 3. Rewrite relative image paths
        // Matches ![alt](./image.png) and converts to ![alt](/posts/basePath/image.png)
        if (basePath) {
            // Regex for markdown images starting with ./
            const relImageRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;
            processor = processor.replace(relImageRegex, (match, alt, uri) => {
                return `![${alt}](/posts/${basePath}/${uri})`;
            });

            // Also handle <img> tags with src="./..."
            const imgTagRegex = /<img\s+src=["']\.\/([^"']+)["']([^>]*)>/g;
            processor = processor.replace(imgTagRegex, (match, uri, attributes) => {
                return `<img src="/posts/${basePath}/${uri}"${attributes}>`;
            });
        }

        return processor;
    }
}
