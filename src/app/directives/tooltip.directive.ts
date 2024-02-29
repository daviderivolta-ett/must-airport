import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input() public appTooltip: string = '';
  private tooltipElement: HTMLDivElement = this.renderer.createElement('div');
  private isVisible: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  public ngOnInit(): void {
    this.createTooltipElement();
  }

  @HostListener('click')
  onClick(): void {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideTooltip();
  }

  private createTooltipElement(): void {
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'tooltip');
    this.tooltipElement.innerHTML = this.appTooltip;
    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    const top = -40;
    const right = 0;
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