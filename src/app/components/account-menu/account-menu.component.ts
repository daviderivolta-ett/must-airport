import { Component, Input, effect } from '@angular/core';
import { LoggedUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';
import { HeaderService } from '../../observables/header.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [NgClass, ClickOutsideDirective],
  templateUrl: './account-menu.component.html',
  styleUrl: './account-menu.component.scss'
})
export class AccountMenuComponent {
  @Input() public loggedUser: LoggedUser | null = null;
  public isVisible: boolean = false;

  constructor(private headerService: HeaderService, private authService: AuthService) {
    effect(() => {
      this.isVisible = this.headerService.isAccountMenuVisible();
    });
  }

  public logOut(): void {    
    this.headerService.isAccountMenuVisible.set(false);
    this.authService.auth.signOut();
  }

  public closeAccountMenu(): void {
    this.headerService.isAccountMenuVisible.set(false);
  }
}