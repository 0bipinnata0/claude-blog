import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InteractionService } from '../../../../core/services/interaction.service';
import { BlogPost } from '../../../../shared/models/post.model';

@Component({
    selector: 'app-post-detail-header',
    standalone: true,
    imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
    templateUrl: './post-detail-header.component.html',
    styleUrls: ['./post-detail-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailHeaderComponent {
    post = input.required<BlogPost>();
    interactionService = inject(InteractionService);
}
