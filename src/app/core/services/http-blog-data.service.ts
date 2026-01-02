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

    getPostContent(fileName: string): Promise<string> {
        return firstValueFrom(this.http.get(`/posts/${fileName}`, { responseType: 'text' }));
    }
}
