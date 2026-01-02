import { Directive, ElementRef, Renderer2, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[appSpotlight]',
  standalone: true
})
export class SpotlightDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Initialize CSS variables
    this.renderer.setStyle(this.el.nativeElement, '--mouse-x', '0px');
    this.renderer.setStyle(this.el.nativeElement, '--mouse-y', '0px');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();

    // Calculate mouse position relative to the card
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Update CSS variables
    this.renderer.setStyle(this.el.nativeElement, '--mouse-x', `${x}px`);
    this.renderer.setStyle(this.el.nativeElement, '--mouse-y', `${y}px`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // Reset to center when mouse leaves to avoid abrupt transitions
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.renderer.setStyle(this.el.nativeElement, '--mouse-x', `${rect.width / 2}px`);
    this.renderer.setStyle(this.el.nativeElement, '--mouse-y', `${rect.height / 2}px`);
  }
}
