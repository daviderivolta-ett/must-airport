import { Component } from '@angular/core';
import { DialogService } from '../../observables/dialog.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {
  constructor(public dialogService: DialogService) { }

  closeDialog():void {
    this.dialogService.isOpen.set(false);
  }
}