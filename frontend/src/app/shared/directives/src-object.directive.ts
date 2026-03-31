import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

/**
 * Binds a MediaStream to the srcObject property of a <video> or <audio> element.
 * Angular does not support [srcObject] natively, so this directive bridges the gap.
 *
 * Usage: <video [appSrcObject]="mediaStream" autoplay playsinline></video>
 */
@Directive({
  selector: '[appSrcObject]',
  standalone: true
})
export class SrcObjectDirective implements OnChanges {
  @Input('appSrcObject') stream: MediaStream | null = null;

  private readonly el: HTMLMediaElement;

  constructor(elementRef: ElementRef<HTMLMediaElement>) {
    this.el = elementRef.nativeElement;
  }

  ngOnChanges(): void {
    this.el.srcObject = this.stream ?? null;
  }
}
