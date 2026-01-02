import { InjectionToken } from '@angular/core';

export interface PostMetadata {
    id: string;
    slug: string;
    title: string;
    summary: string;
    date: string;
    coverImage: string;
    author?: string;
    tags?: string[];
    fileName: string;
}

export interface BlogDataService {
    getPosts(): Promise<PostMetadata[]>;
    getPostContent(fileName: string): Promise<string>;
}

export const BLOG_DATA_SERVICE = new InjectionToken<BlogDataService>('BLOG_DATA_SERVICE');
