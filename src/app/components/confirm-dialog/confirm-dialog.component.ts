import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  public host: HTMLElement | null = document.querySelector('#confirm-dialog');

  constructor(private el: ElementRef) { }

  public confirm(): void {
    this.close();
  }

  public cancel(): void {
    this.close();
  }

  public close(): void {
    this.host?.remove();
  }
}
