import { Component, effect } from '@angular/core';
import { CreateCodeComponent } from '../create-code/create-code.component';
import { CodesService } from '../../../services/codes.service';
import { Code } from '../../../models/code.model';
import { CodeCardComponent } from '../code-card/code-card.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CreateCodeComponent, CodeCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  public allCodes: Code[] = [];

  constructor(private codesService: CodesService) {
    effect(() => {
      this.allCodes = this.codesService.codesSignal();
    });
  }

  async ngOnInit(): Promise<void> {
    // await this.codesService.getAllCodes();
  }
}