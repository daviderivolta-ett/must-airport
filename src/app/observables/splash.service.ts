import { ApplicationRef, Injectable, WritableSignal, createComponent, effect, signal } from '@angular/core';
import { SplashComponent } from '../components/splash/splash.component';

@Injectable({
  providedIn: 'root'
})
export class SplashService {
  constructor(private applicationRef: ApplicationRef) { }

  public createSplash() {
    const div = document.createElement('div');
    div.id = 'splash';
    document.body.append(div);
    const componentRef = createComponent(SplashComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    this.applicationRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
  }

  public removeSplash() {
    setTimeout(() => {
      const splash = document.querySelectorAll('#splash');
      if (splash.length !== 0) splash.forEach(item => item.remove());
    }, 500);
  }
}