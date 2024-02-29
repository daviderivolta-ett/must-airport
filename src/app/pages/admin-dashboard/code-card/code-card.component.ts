import { Component, Input } from '@angular/core';
import { Code } from '../../../models/code.model';
import { NgClass, TitleCasePipe } from '@angular/common';
import { TooltipDirective } from '../../../directives/tooltip.directive';

@Component({
  selector: 'app-code-card',
  standalone: true,
  imports: [NgClass, TitleCasePipe, TooltipDirective],
  templateUrl: './code-card.component.html',
  styleUrl: './code-card.component.scss'
})
export class CodeCardComponent {
  @Input() public code: Code | null = null;

  public copyToClipboard(): void {
    if (this.code) {
      navigator.clipboard.writeText(this.code.code);
    }
  }
}