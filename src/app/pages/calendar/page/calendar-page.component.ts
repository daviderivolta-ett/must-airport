import { Component, effect } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Operation } from '../../../models/operation.model';
import { OperationCardComponent } from '../../management/operation-card/operation-card.component';
import { OperationsService } from '../../../services/operations.service';
import { CalendarFiltersComponent } from '../calendar-filters/calendar-filters.component';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [OperationCardComponent, CalendarFiltersComponent],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss'
})
export class CalendarPageComponent {
  public operations: Operation[] = [];

  constructor(private reportsService: ReportsService, private operationsService: OperationsService) {
    let operations: Operation[] = this.reportsService.getAllOperations();
    operations = operations.sort((a: Operation, b: Operation) => a.date.getTime() - b.date.getTime());
    this.operationsService.operationsSignal.set(operations);

    effect(() =>this.operations = this.operationsService.filteredOperationsSignal());

    effect(() => this.operations = this.operationsService.operationsSignal());

  }

  public ngOnInit(): void {
  }
}
