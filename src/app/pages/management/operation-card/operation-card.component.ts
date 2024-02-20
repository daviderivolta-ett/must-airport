import { Component, Input } from '@angular/core';
import { Operation } from '../../../models/operation.model';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-operation-card',
  standalone: true,
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './operation-card.component.html',
  styleUrl: './operation-card.component.scss'
})
export class OperationCardComponent {
  @Input() public operation: Operation = Operation.createEmpty();

  public copyToClipboard(): void {
    navigator.clipboard.writeText('pippo');
  }

}
