import { Component, effect } from '@angular/core';
import { ReportsService } from '../../../services/reports.service';
import { Operation } from '../../../models/operation.model';
import { OperationCardComponent } from '../../management/operation-card/operation-card.component';
import { OperationsService } from '../../../services/operations.service';
import { CalendarFiltersComponent } from '../calendar-filters/calendar-filters.component';
import { OperationCardCalendarComponent } from '../operation-card-calendar/operation-card-calendar.component';
import { OperationCardBaseComponent } from '../../../components/operation-card-base/operation-card-base.component';
import { DatePipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [KeyValuePipe, DatePipe, OperationCardComponent, CalendarFiltersComponent, OperationCardBaseComponent, OperationCardCalendarComponent],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss'
})
export class CalendarPageComponent {
  private _operations: Operation[] = [];
  private _aggregatedOperations: Record<string, Operation[]> = {};

  public set operations(value: Operation[]) {
    this._operations = value;

    let aggregatedOperations = this.aggregateByDate(this.operations);
    this.aggregatedOperations = aggregatedOperations;
  }

  public get operations(): Operation[] {
    return this._operations;
  }

  public get aggregatedOperations(): Record<string, Operation[]> {
    return this._aggregatedOperations;
  }

  public set aggregatedOperations(value: Record<string, Operation[]>) {
    this._aggregatedOperations = value;
  }

  constructor(private reportsService: ReportsService, private operationsService: OperationsService) {
    let operations: Operation[] = this.reportsService.getAllOperations();
    operations = operations.sort((a: Operation, b: Operation) => a.date.getTime() - b.date.getTime());
    this.operationsService.operationsSignal.set(operations);

    effect(() => this.operations = this.operationsService.filteredOperationsSignal());

    effect(() => this.operations = this.operationsService.operationsSignal());
  }

  private aggregateByDate(operations: Operation[]): Record<string, Operation[]> {
    return operations.reduce((acc, operation) => {
      const dateKey = operation.date.toISOString().split('T')[0];
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(operation);

      return acc;
    }, {} as Record<string, Operation[]>);
  }
}