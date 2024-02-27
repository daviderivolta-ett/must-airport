import { Component } from '@angular/core';
import { CreateCodeComponent } from '../create-code/create-code.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CreateCodeComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {

}
