import { Component, signal, effect, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, required, email, Field } from '@angular/forms/signals';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-comment-form',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, Field],
    templateUrl: './comment-form.component.html',
    styleUrls: ['./comment-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentFormComponent {
    // Signal providing the initial state / model
    model = signal({
        name: '',
        email: '',
        content: ''
    });

    // Signal Form Definition
    commentForm = form(this.model, (f) => {
        required(f.name);
        required(f.email);
        email(f.email);
        required(f.content);
    });

    layout = input<'compact' | 'full'>('full');
    submitComment = output<{ name: string; email: string; content: string }>();

    isSubmitting = signal(false);

    constructor() {
        effect(() => {
            // access the state to check validity
            const state = this.commentForm();
            // invalid is likely a signal
            if (state.valid && state.valid()) {
                console.log('Form is valid');
            }
        });
    }

    onSubmit() {
        // Check form validity
        // Accessing state via function call
        if (this.commentForm().invalid()) {
            // form().markAllAsTouched() might exist?
            // For now just return
            return;
        }

        this.isSubmitting.set(true);

        // Simulate async submission
        setTimeout(() => {
            // Access values from the form state or the model signal directly
            // Since model is linked, model() should have latest values?
            // Or use form.name().value() if value is signal
            // Assuming FieldState.value is the value (or signal)
            // Safest is to read from the source model signal if it's two-way bound?
            // But signals forms propagate back to model?
            // Let's assume yes.
            const val = this.model();

            this.submitComment.emit({
                name: val.name,
                email: val.email,
                content: val.content
            });

            // Reset
            this.model.set({ name: '', email: '', content: '' });
            this.isSubmitting.set(false);
        }, 1000);
    }
}
