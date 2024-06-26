import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, effect, signal } from '@angular/core';
import { VERTICAL } from '../models/vertical.model';
import { Observable, map } from 'rxjs';
import { AppSettings } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public settings: AppSettings = AppSettings.createEmpty();
  public settingsSignal: WritableSignal<AppSettings> = signal(AppSettings.createEmpty());

  constructor(private http: HttpClient) {
    effect(() => this.settings = this.settingsSignal());
  }

  public getAllSettings(app: VERTICAL): Observable<any> {
    return this.http.get<any>('./assets/settings/settings.json').pipe(
      map(res => {
        let allSettings: AppSettings[] = res.apps as AppSettings[];
        let appSettings: AppSettings | undefined = allSettings.find((item: AppSettings) => item.name === app);
        if (!appSettings) appSettings = allSettings[0];
        return appSettings;
      })
    )
  }
}