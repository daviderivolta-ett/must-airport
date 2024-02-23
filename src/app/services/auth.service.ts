import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { UserService } from './user.service';
import { LoggedUser, UserData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth: Auth;
  public userSignal: WritableSignal<User | null> = signal(null);
  public loggedUserSignal: WritableSignal<LoggedUser | null> = signal(null);
  public loggedUser: LoggedUser | null = null;

  constructor(private router: Router, private userService: UserService) {
    effect(() => this.loggedUser = this.loggedUserSignal());

    this.auth = getAuth();

    // signInAnonymously(this.auth)
    //   .then(() => {
    //     console.log('You\'re logged in anonymously!');
    //   })
    //   .catch(error => {
    //     const errorCode = error.code;
    //     const errorMsg = error.message;

    //     console.log(errorCode);
    //     console.log(errorMsg);
    //   });

    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.userSignal.set(this.auth.currentUser);
        // console.log('User is signed in!');
        // console.log('User: ', user);
        let userData: UserData = await this.userService.getUserById(user.uid);
        this.loggedUserSignal.set(this.userService.parseUserData(user, userData));
      } else {
        this.userSignal.set(null);
        // console.log('User is signed out!');
      }
    });
  }

  public logInWithEmailAndPassword(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        this.userSignal.set(userCredential.user);
        console.log(`You\'re logged in with email and password`);
        console.log('User credentials:', userCredential);
        this.router.navigate(['/segnalazioni']);
      })
      .catch(error => {
        const errorCode = error.code;
        const errorMsg = error.message;

        console.log(errorCode);
        console.log(errorMsg);
      })
  }
}
