import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superuserGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return new Promise((resolve, reject) => {
    if (authService.loggedUser && authService.loggedUser.level === 0) {
      resolve(true);
    } else {
      router.navigate(['/segnalazioni']);
      resolve(false);
    }
  });
};