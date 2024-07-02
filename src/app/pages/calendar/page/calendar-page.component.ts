import { Component, effect } from '@angular/core';
import { Inspection, Operation } from '../../../models/operation.model';
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
  private _operations: Inspection[] = [];
  private _aggregatedOperations: Record<string, Inspection[]> = {};

  public set operations(value: Inspection[]) {
    this._operations = value;

    let aggregatedOperations = this.aggregateByDate(this.operations);
    this.aggregatedOperations = aggregatedOperations;
  }

  public get operations(): Inspection[] {
    return this._operations;
  }

  public get aggregatedOperations(): Record<string, Inspection[]> {
    return this._aggregatedOperations;
  }

  public set aggregatedOperations(value: Record<string, Inspection[]>) {
    this._aggregatedOperations = value;
  }

  constructor(
    private operationsService: OperationsService
  ) {   
    effect(() => this.operations = this.operationsService.filteredOperationsSignal());

    effect(() => this.operations = this.operationsService.operationsSignal());
  }

  public async ngOnInit(): Promise<void> {
    let operations: Inspection[] = await this.operationsService.getAllInspections();   
    this.operations = operations.sort((a: Inspection, b: Inspection) => a.date.getTime() - b.date.getTime());
    this.operationsService.operationsSignal.set(operations);
  }

  private aggregateByDate(operations: Inspection[]): Record<string, Inspection[]> {
    return operations.reduce((acc, operation) => {
      const dateKey = operation.date.toISOString().split('T')[0];
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(operation);

      return acc;
    }, {} as Record<string, Inspection[]>);
  }
}