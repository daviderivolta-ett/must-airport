import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  public isAccountMenuVisible: WritableSignal<boolean> = signal(false);

  constructor() { }
}
