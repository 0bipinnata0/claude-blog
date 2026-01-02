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
        return readFile(filePath, 'utf-8');
    }
}
