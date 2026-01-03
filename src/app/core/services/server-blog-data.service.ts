import { Injectable } from '@angular/core';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PostMetadata, BlogDataService } from './blog-data.contract';

@Injectable()
export class ServerBlogDataService implements BlogDataService {
    private readonly postsDir = join(process.cwd(), 'public', 'posts');

    async getPosts(): Promise<PostMetadata[]> {
        const indexPath = join(this.postsDir, 'index.json');
        const content = await readFile(indexPath, 'utf-8');
        return JSON.parse(content);
    }

    async getPostContent(fileName: string): Promise<string> {
        const filePath = join(this.postsDir, fileName);
        const content = await readFile(filePath, 'utf-8');

        // Resolve imports logic (similar to HTTP service but FS based)
        const basePath = fileName.includes('/') ? fileName.substring(0, fileName.lastIndexOf('/')) : '';
        return this.processImports(content, basePath);
    }

    private async processImports(content: string, basePath: string): Promise<string> {
        const importRegex = /import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)['"];?/g;
        const imports = new Map<string, string>();

        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.set(match[1], match[2]);
        }

        if (imports.size === 0) {
            return content;
        }

        const resolutions = await Promise.all(
            Array.from(imports.entries()).map(async ([name, file]) => {
                try {
                    const relativePath = basePath ? join(basePath, file) : file;
                    const fullPath = join(this.postsDir, relativePath);
                    const componentContent = await readFile(fullPath, 'utf-8');
                    const processed = await this.processImports(componentContent, basePath);
                    return { name, content: processed };
                } catch (e) {
                    console.error(`SSR: Failed to load imported component ${name} from ${file}`, e);
                    return { name, content: `> [!WARNING]\n> Failed to load content: ${file}` };
                }
            })
        );

        let newContent = content;
        newContent = newContent.replace(importRegex, '');
        for (const { name, content: importedText } of resolutions) {
            const usageRegex = new RegExp(`<${name}\\s*\\/?>`, 'g');
            newContent = newContent.replace(usageRegex, importedText);
        }

        let processor = newContent;
        // 3. Rewrite relative image paths
        if (basePath) {
            const relImageRegex = /!\[([^\]]*)\]\(\.\/([^)]+)\)/g;
            processor = processor.replace(relImageRegex, (match, alt, uri) => {
                return `![${alt}](/posts/${basePath}/${uri})`;
            });

            const imgTagRegex = /<img\s+src=["']\.\/([^"']+)["']([^>]*)>/g;
            processor = processor.replace(imgTagRegex, (match, uri, attributes) => {
                return `<img src="/posts/${basePath}/${uri}"${attributes}>`;
            });
        }

        return processor;
    }
}
