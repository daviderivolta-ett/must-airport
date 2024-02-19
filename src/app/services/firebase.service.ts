import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/environment';
import { getStorage } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  public app;
  public storage;
  
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
  }
}
