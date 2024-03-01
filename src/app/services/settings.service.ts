import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { APPFLOW } from '../models/app-flow.model';
import { Observable } from 'rxjs';
import { AppSettings } from '../models/settings.model';

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
      // console.log(res);
      let allSettings: AppSettings[] = res.apps as AppSettings[];
      let appSettings: AppSettings | undefined = allSettings.find((item: AppSettings) => item.name === app);
      if (appSettings) {
        // console.log(appSettings);
        this.settingsSignal.set(appSettings);
      }
    });
  }
}