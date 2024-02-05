import { Component, effect } from '@angular/core';
import { FailuresService } from '../../../services/failures.service';
import { Failure } from '../../../models/failure.model';

@Component({
  selector: 'app-sidebar-content',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {
  public failures: Failure[] = [];

  constructor(private failuresService: FailuresService) {
    effect(() => {
      this.failures = this.failuresService.failures();      
    });
  }
}