import { Component, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';
import { FirebaseService } from './services/firebase.service';
import { ReportsService } from './services/reports.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'must';

  constructor(private firebaseService: FirebaseService, private authService: AuthService, private reportsService: ReportsService) {
    effect(() => {
      if (this.authService.userSignal() !== null) {
        this.reportsService.getAllParentReports();
      } else {
        this.reportsService.reports = [];
      }
    });
  }

  async ngOnInit() {
    // await this.reportsService.getAllParentReports();   
  }
}
