import { ApplicationRef, Injectable, WritableSignal, createComponent, effect, signal } from '@angular/core';
import { SplashComponent } from '../components/splash/splash.component';

@Injectable({
  providedIn: 'root'
})
export class SplashService {
  public isAppReady: boolean = false;
  public isAppReadySignal: WritableSignal<boolean> = signal(false);

  constructor(private applicationRef: ApplicationRef) {
    effect(() => {
      this.isAppReady = this.isAppReadySignal();
      this.isAppReady === false ? this.createSplash() : this.removeSplash();
    })
  }

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
      const splash = document.querySelector('#splash');
      if (splash) splash.remove();
    }, 1000);
  }
}