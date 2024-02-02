import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  public isOpen = signal(true);

  constructor() { }
}
