import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  private _msg: string = '';

  constructor() { }

  public get msg(): string {
    return this._msg;
  }

  @Input() public set msg(value: string) {
    this._msg = value;
  }
}