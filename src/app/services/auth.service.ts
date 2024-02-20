import { Injectable } from '@angular/core';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;

  constructor() {
    this.auth = getAuth();

    signInAnonymously(this.auth)
      .then(() => {
        console.log('You\'re logged in anonymously!');
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMsg = error.message;

        console.log(errorCode);
        console.log(errorMsg);
      });

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        console.log('User is signed in!');
        console.log('User: ', user);
            
      } else {
        console.log('User is signed out!');
      }
    });
  }
}
