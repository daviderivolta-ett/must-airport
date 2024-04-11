import { Component, effect } from '@angular/core';
import { CreateCodeComponent } from '../create-code/create-code.component';
import { CodesService } from '../../../services/codes.service';
import { Code } from '../../../models/code.model';
import { CodeCardComponent } from '../code-card/code-card.component';
import { CreateCodeDialogService } from '../../../observables/create-code-dialog.service';
import { NgClass } from '@angular/common';
import { CodesFiltersComponent } from '../codes-filters/codes-filters.component';
import { VERTICAL } from '../../../models/app-flow.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgClass, CreateCodeComponent, CodeCardComponent, CodesFiltersComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  public allCodes: Code[] = [];
  public isDialogOpen: boolean = false;
  public apps: VERTICAL[] = [];

  constructor(private authService: AuthService, private codesService: CodesService, private createCodeDialogService: CreateCodeDialogService) {
    effect(() => this.allCodes = this.codesService.codesSignal());
    effect(() => this.isDialogOpen = this.createCodeDialogService.isOpenSignal());
    effect(() => this.allCodes = this.codesService.filteredCodesSignal());
    effect(() => {
      if (this.authService.loggedUserSignal() === null) return;
      if (!this.authService.loggedUser) return;
      this.apps = this.authService.loggedUser.apps.filter((app: VERTICAL) => app !== VERTICAL.Default);
    });
  }

  public toggleDialog(event: Event): void {
    event.stopPropagation();
    this.createCodeDialogService.isOpenSignal.set(!this.createCodeDialogService.isOpenSignal());
  }
}