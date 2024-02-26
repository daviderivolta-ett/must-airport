import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickedOutside: EventEmitter<void> = new EventEmitter<void>();

  constructor(private el: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onClick(event: Event) {    
    const clickedInside = this.el.nativeElement.contains(event.target);
    if(!clickedInside) {
      this.clickedOutside.emit();
    }
  }
}