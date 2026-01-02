import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SpotlightDirective } from './spotlight.directive';

@Component({
    template: `<div appSpotlight style="width: 200px; height: 200px; display: block;"></div>`,
    imports: [SpotlightDirective],
    standalone: true
})
class TestComponent { }

describe('SpotlightDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let div: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SpotlightDirective, TestComponent]
        });
        fixture = TestBed.createComponent(TestComponent);
        div = fixture.debugElement.query(By.directive(SpotlightDirective));
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        const directive = div.injector.get(SpotlightDirective);
        expect(directive).toBeTruthy();
    });

    it('should initialize CSS variables to 0px', () => {
        const element = div.nativeElement as HTMLElement;
        expect(element.style.getPropertyValue('--mouse-x')).toBe('0px');
        expect(element.style.getPropertyValue('--mouse-y')).toBe('0px');
    });

    it('should update CSS variables on mousemove', () => {
        const element = div.nativeElement as HTMLElement;
        const rect = element.getBoundingClientRect();

        // Simulate mouse move to center of the 200x200 div
        const event = new MouseEvent('mousemove', {
            clientX: rect.left + 100,
            clientY: rect.top + 100
        });

        div.triggerEventHandler('mousemove', event);

        expect(element.style.getPropertyValue('--mouse-x')).toBe('100px');
        expect(element.style.getPropertyValue('--mouse-y')).toBe('100px');
    });

    it('should reset CSS variables to center on mouseleave', () => {
        const element = div.nativeElement as HTMLElement;

        // Mock getBoundingClientRect to ensure we have dimensions
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
            width: 200,
            height: 200,
            top: 0,
            left: 0,
            right: 200,
            bottom: 200,
            x: 0,
            y: 0,
            toJSON: () => { }
        });

        // First move it somewhere else
        const rect = element.getBoundingClientRect();
        const moveEvent = new MouseEvent('mousemove', {
            clientX: rect.left + 10,
            clientY: rect.top + 10
        });
        div.triggerEventHandler('mousemove', moveEvent);
        expect(element.style.getPropertyValue('--mouse-x')).toBe('10px');

        // Then trigger mouseleave
        div.triggerEventHandler('mouseleave', null);

        // Should be center (100px for 200px width)
        expect(element.style.getPropertyValue('--mouse-x')).toBe('100px');
        expect(element.style.getPropertyValue('--mouse-y')).toBe('100px');
    });
});
