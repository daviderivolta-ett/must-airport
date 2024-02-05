import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  public isOpen: WritableSignal<boolean> = signal(true);

  constructor() { }
}
