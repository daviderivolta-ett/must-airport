import { Component, effect } from '@angular/core';
import { CreateCodeComponent } from '../create-code/create-code.component';
import { CodesService } from '../../../services/codes.service';
import { Code } from '../../../models/code.model';
import { CodeCardComponent } from '../code-card/code-card.component';
import { CreateCodeDialogService } from '../../../observables/create-code-dialog.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CreateCodeComponent, CodeCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  public allCodes: Code[] = [];
  public isDialogOpen: boolean = false;

  constructor(private codesService: CodesService, private createCodeDialogService: CreateCodeDialogService) {
    effect(() => {
      this.allCodes = this.codesService.codesSignal();
    });
  }

  public toggleDialog(event: Event): void {
    event.stopPropagation();
    this.createCodeDialogService.isOpenSignal.set(!this.createCodeDialogService.isOpenSignal());
  }
}