import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { COLORMODE } from '../../models/color-mode.model';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {

  constructor(private themeService: ThemeService) { }

  public handleChange(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const isChecked: boolean = input.checked;
    isChecked ? this.themeService.colorModeSignal.set(COLORMODE.Light) : this.themeService.colorModeSignal.set(COLORMODE.Dark);
  }
}