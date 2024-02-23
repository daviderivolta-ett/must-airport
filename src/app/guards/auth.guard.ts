import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return new Promise((resolve, reject) => {
    onAuthStateChanged(getAuth(), user => {
      if (user) {
        resolve(true);
      } else {
        router.navigate(['/login']);
        resolve(false);
      }
    })
  })
  
  // const authService = inject(AuthService)
  // const router = inject(Router);

  // if (authService.userSignal()) {
  //   return true;
  // } else {
  //   router.navigate(['/login']);
  //   return false;
  // }
};
