import { Component, EventEmitter, Output, effect } from '@angular/core';
import { AdditionalLayersMenuService } from '../../../observables/additional-layers-menu.service';

@Component({
  selector: 'app-addition-layers-menu-toggle',
  standalone: true,
  imports: [],
  templateUrl: './addition-layers-menu-toggle.component.html',
  styleUrl: './addition-layers-menu-toggle.component.scss'
})
export class AdditionLayersMenuToggleComponent {
  private _isOpen: boolean = false;

  public get isOpen(): boolean {
    return this._isOpen;
  }

  public set isOpen(isOpen: boolean) {
    this._isOpen = isOpen;
  }

  @Output() public isOpenEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private additionalLayersMenuService: AdditionalLayersMenuService) {
    effect(() => this.isOpen = additionalLayersMenuService.isOpenSignal())
  }

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
    this.additionalLayersMenuService.isOpenSignal.set(this.isOpen);
  }
}
