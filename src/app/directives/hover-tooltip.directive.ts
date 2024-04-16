import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { Tag } from '../models/tag.model';

@Directive({
  selector: '[appHoverTooltip]',
  standalone: true
})
export class HoverTooltipDirective {
  private _data: any = [];

  public get data(): any {
    return this._data;
  }

  @Input() public set data(value: any) {    
    if (!value || value.length === 0) return;
    this._data = value;
    this.createTooltip();
  }

  @Input() public appTooltip: string = '';
  
  private tooltipElement: HTMLDivElement = this.renderer.createElement('div');
  private isVisible: boolean = false;
  private resizeObserver: ResizeObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.resizeObserver = new ResizeObserver(entries => {
      this.updateTooltip();
    });
    this.resizeObserver.observe(document.body);
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
    this.renderer.addClass(this.tooltipElement, 'hover-tooltip');
    this.tooltipElement.innerHTML = this.getStringTags(this.data);
    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');

    const hostRect: DOMRect = this.el.nativeElement.getBoundingClientRect();
    const top: number = hostRect.top + 24;
    const right: number = window.innerWidth - hostRect.right + hostRect.width / 2;

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'right', `${right}px`);
    this.renderer.setStyle(this.tooltipElement, 'transform', `translateX(50%)`);
    this.renderer.setStyle(this.tooltipElement, 'z-index', '999');

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

  private updateTooltip(): void {
    if (this.isMobile()) {
      this.removeTooltip();
    } else {
      this.createTooltip();
    }
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(this.el.nativeElement, this.tooltipElement);
    }
  }

  private getStringTags(tags: Tag[]): string {
    let strings: string[] = [];
    tags.forEach((tag: Tag) => strings.push(tag.name));
    let tooltip: string = strings.join(', ').toLowerCase();
    return tooltip;
  }

  private isMobile(): boolean {
    return window.innerWidth <= 992;
  }
}