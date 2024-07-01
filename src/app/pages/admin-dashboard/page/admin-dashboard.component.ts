import { Component, effect } from '@angular/core';
import { CreateCodeComponent } from '../create-code/create-code.component';
import { CodesService } from '../../../services/codes.service';
import { CreateCodeDialogService } from '../../../observables/create-code-dialog.service';
import { NgClass } from '@angular/common';
import { CodesFiltersComponent } from '../codes-filters/codes-filters.component';
import { VERTICAL } from '../../../models/vertical.model';
import { AuthService } from '../../../services/auth.service';
import { AuthCode } from '../../../models/auth-code.model';
import { AuthCodeComponent } from '../auth-code/auth-code.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgClass, CreateCodeComponent, AuthCodeComponent, CodesFiltersComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  public codes: AuthCode[] = [];
  public isDialogOpen: boolean = false;
  public apps: VERTICAL[] = [];

  constructor(
    private authService: AuthService,
    private codesService: CodesService,
    private createCodeDialogService: CreateCodeDialogService
  ) {
    effect(() => {
      let codes = this.codesService.authCodesSignal();
      this.codes = this.sortAuthCodes(codes);    
    });
    effect(() => {
      let codes = this.codesService.filteredAuthCodesSignal();
      this.codes = this.sortAuthCodes(codes);
    });
    effect(() => this.isDialogOpen = this.createCodeDialogService.isOpenSignal());
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

  private sortAuthCodes(codes: AuthCode[]): AuthCode[] {
    return codes.sort((a: AuthCode, b: AuthCode) => {
      const aDate = a.creationDate ? a.creationDate.getTime() : 0;
      const bDate = b.creationDate ? b.creationDate.getTime() : 0;
      return bDate - aDate;
    })
  }
}