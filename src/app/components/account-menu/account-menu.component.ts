import { Component, Input, effect } from '@angular/core';
import { LoggedUser } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NgClass } from '@angular/common';
import { HeaderService } from '../../observables/header.service';

@Component({
  selector: 'app-account-menu',
  standalone: true,
  imports: [NgClass],
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

  public closeMenu(): void {
    if (this.isVisible === true) {
      this.headerService.isAccountMenuVisible.set(false);
    }   
  }
}