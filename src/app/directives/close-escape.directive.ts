import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appCloseEscape]',
  standalone: true
})
export class CloseEscapeDirective {
  @Output() public closeEscape: EventEmitter<void> = new EventEmitter<void>();

  constructor(private el: ElementRef) { }

  @HostListener('document:keydown.escape', ['$event'])
  keydownEscape(event: KeyboardEvent): void {
    this.closeEscape.emit();    
  }
}
