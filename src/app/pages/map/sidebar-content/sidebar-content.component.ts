import { Component } from '@angular/core';
import { FailuresService } from '../../../services/failures.service';

@Component({
  selector: 'app-sidebar-content',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {
  constructor(private failuresService: FailuresService) { }
  
  async ngOnInit() {
    // const allFailuresSnapshot = await this.failuresService.getAllFailures();    
    // const allFailures = allFailuresSnapshot.docs.map(item => item.data());    
  }
}
