import { Injectable, WritableSignal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreateCodeDialogService {
  public isOpenSignal: WritableSignal<boolean> = signal(false);

  constructor() { }
}