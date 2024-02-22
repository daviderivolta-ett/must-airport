import { Component } from '@angular/core';
import { TimeChartComponent } from '../time-chart/time-chart.component';


@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [TimeChartComponent],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.scss'
})
export class StatsPageComponent {

}
