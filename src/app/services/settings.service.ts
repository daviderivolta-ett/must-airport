import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { APPFLOW } from '../models/app-flow.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public settings: any;
  public settingsSignal: WritableSignal<any> = signal({});

  constructor(private http: HttpClient) {
    effect(() => this.settings = this.settingsSignal());
  }

  public getAllSettings(app: APPFLOW): Observable<any> {
    return this.http.get<any>('/assets/settings/settings.json');
  }

  public updateSettings(app: APPFLOW): void {
    this.getAllSettings(app).subscribe(res => {
      console.log(res);
      let settings: any = res;
      settings.apps = settings.apps.filter((item: any) => item.name === app);
      console.log(settings);
      this.settingsSignal.set(res);
    });
  }
}