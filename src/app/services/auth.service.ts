import { Injectable, WritableSignal, signal } from '@angular/core';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth;
  public userSignal: WritableSignal<User | null> = signal(null);

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
        this.userSignal.set(this.auth.currentUser);
        console.log('User is signed in!');
        console.log('User: ', user);

      } else {
        this.userSignal.set(null);
        console.log('User is signed out!');
      }
    });
  }
}
