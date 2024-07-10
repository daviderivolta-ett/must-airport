import { Component } from '@angular/core';
import { OperationCardBaseComponent } from '../../../components/operation-card-base/operation-card-base.component';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { DatePipe, registerLocaleData } from '@angular/common';
import { ReportsService } from '../../../services/reports.service';
import { RouterLink } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { MiniMapData } from '../../../services/map.service';

import localeIt from '@angular/common/locales/it';
import localeItExtra from '@angular/common/locales/extra/it';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';

registerLocaleData(localeIt, 'it-IT', localeItExtra);


@Component({
  selector: 'app-operation-card-calendar',
  standalone: true,
  imports: [DatePipe, LabelPipe, SentenceCasePipe, RouterLink, MiniMapComponent],
  templateUrl: './operation-card-calendar.component.html',
  styleUrl: './operation-card-calendar.component.scss'
})
export class OperationCardCalendarComponent extends OperationCardBaseComponent {
  private _minimapData: MiniMapData | null = null;

  constructor(reportsService: ReportsService) {
    super(reportsService);
  }

  public override set report(value: ReportParent) {
    this._report = value;
    console.log(value);    
    if (!this.report) return;
    this.minimapData = { location: this.report.location, priority: this.report.priority }; 
  }

  public override get report(): ReportParent | null {
    return this._report;
  }

  public get minimapData(): MiniMapData | null {
    return this._minimapData;
  }

  public set minimapData(value: MiniMapData) {
    this._minimapData = value;
  }
}