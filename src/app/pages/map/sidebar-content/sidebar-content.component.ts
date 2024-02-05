import { Component } from '@angular/core';
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

  constructor(private failuresService: FailuresService) { }

  ngOnInit(): void {
    this.failuresService.failures$.subscribe(failures => {
      this.failures = failures;
      console.log(failures);
           
    });    
  }
}
