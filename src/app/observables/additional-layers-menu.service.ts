import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdditionalLayersMenuService {
  public isOpenSignal: WritableSignal<boolean> = signal(false);

  constructor() { }
}
