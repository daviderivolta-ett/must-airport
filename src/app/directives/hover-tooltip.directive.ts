import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHoverTooltip]',
  standalone: true
})
export class HoverTooltipDirective {
  @Input() public appTooltip: string = '';
  private tooltipElement: HTMLDivElement = this.renderer.createElement('div');
  private isVisible: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  public ngOnInit(): void {
    this.createTooltip();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  private createTooltip(): void {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.tooltipElement.innerHTML = this.appTooltip;
    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
    const hostRect: DOMRect = this.el.nativeElement.getBoundingClientRect();
    const top = hostRect.top;
    const right = window.innerWidth - hostRect.right;
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'right', `${right}px`);
    this.renderer.appendChild(this.el.nativeElement, this.tooltipElement);
  }

  private showTooltip(): void {
    this.renderer.setStyle(this.tooltipElement, 'display', 'block');
    this.isVisible = true;
  }

  private hideTooltip(): void {
    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    this.isVisible = false;
  }

}