import { Component, Input } from '@angular/core';
import { Failure } from '../../../models/failure.model';

@Component({
  selector: 'app-sidebar-card',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-card.component.html',
  styleUrl: './sidebar-card.component.scss'
})
export class SidebarCardComponent {
  @Input() public failure!: Failure;
}
