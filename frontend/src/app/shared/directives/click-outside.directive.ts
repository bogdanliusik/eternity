import { AfterViewInit, Directive, DOCUMENT, ElementRef, EventEmitter, inject, OnDestroy, Output } from '@angular/core';
import { filter, fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
  private documentClickSubscription: Subscription | undefined;
  private readonly element = inject(ElementRef);
  private readonly document = inject(DOCUMENT);

  @Output()
  public clickOutside = new EventEmitter<void>();

  public ngAfterViewInit(): void {
    this.documentClickSubscription = fromEvent(this.document, 'click')
      .pipe(
        filter((event) => {
          return !this.isInside(event.target as HTMLElement);
        }),
      )
      .subscribe(() => {
        this.clickOutside.emit();
      });
  }

  public ngOnDestroy(): void {
    this.documentClickSubscription?.unsubscribe();
  }

  public isInside(elementToCheck: HTMLElement): boolean {
    return elementToCheck === this.element.nativeElement ||
      this.element.nativeElement.contains(elementToCheck);
  }
}
