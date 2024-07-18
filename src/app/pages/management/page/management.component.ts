import { ApplicationRef, Component, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { ValidationFormComponent } from '../validation-form/validation-form.component';
import { ChildReportFiltersFormData, ReportsService } from '../../../services/reports.service';
import { DatePipe, KeyValuePipe, NgClass, TitleCasePipe } from '@angular/common';
import { ChildReportCardComponent } from '../../../components/child-report-card/child-report-card.component';
import { InspectionFormComponent } from '../inspection-form/inspection-form.component';
import { MiniMapComponent } from '../../../components/mini-map/mini-map.component';
import { MiniMapData } from '../../../services/map.service';
import { TagGroup } from '../../../models/tag.model';
import { ConfigService } from '../../../services/config.service';
import { OperationCardManagementComponent } from '../operation-card-management/operation-card-management.component';
import { Inspection, OPERATIONTYPE } from '../../../models/operation.model';
import { ChildReportsFiltersComponent } from '../../../components/child-reports-filters/child-reports-filters.component';
import { WebAppConfig } from '../../../models/config.model';
import { ControlLabelPipe } from '../../../pipes/control-label.pipe';
import { UtilsService } from '../../../services/utils.service';
import { LabelPipe } from '../../../pipes/label.pipe';
import { SentenceCasePipe } from '../../../pipes/sentence-case.pipe';
import { ReportFileMenuComponent } from '../report-file-menu/report-file-menu.component';
import { ReportFileMenuService } from '../../../observables/report-file-menu.service';
import { ConfirmDialogService } from '../../../observables/confirm-dialog.service';
import { HoverTooltipDirective } from '../../../directives/hover-tooltip.directive';
import { SnackbarService } from '../../../observables/snackbar.service';
import { OperationsService } from '../../../services/operations.service';
import { ArchiveReportComponent } from '../../../components/archive-report/archive-report.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [MiniMapComponent,
    ChildReportsFiltersComponent,
    ChildReportCardComponent,
    ValidationFormComponent,
    InspectionFormComponent,
    OperationCardManagementComponent,
    ReportFileMenuComponent,
    ArchiveReportComponent,
    HoverTooltipDirective,
    DatePipe,
    NgClass,
    TitleCasePipe,
    SentenceCasePipe,
    KeyValuePipe,
    LabelPipe,
    ControlLabelPipe],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  public config: WebAppConfig = WebAppConfig.createDefault();
  public tagGroups: TagGroup[] = this.configService.tagGroups;
  public parentTagGroups: TagGroup[] = [];
  public childTagGroups: TagGroup[] = [];

  public childrenFields: any = {};

  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];
  public filteredChildrenReport: ReportChild[] = [];

  public operations: Inspection[] = [];

  public miniMapData!: MiniMapData;

  public isReportFileMenuOpen: boolean = false;

  constructor(
    private applicationRef: ApplicationRef,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private reportsService: ReportsService,
    private operationsService: OperationsService,
    private snackbarService: SnackbarService,
    private utilsService: UtilsService,
    private reportFileMenuService: ReportFileMenuService,
    private confirmDialogService: ConfirmDialogService
  ) {
    effect(() => this.config = this.configService.configSignal());
    effect(async () => {
      this.parentReport = this.reportsService.selectedReportSignal();
      this.childrenReport = await this.reportsService.populateChildrenReports(this.parentReport.childrenIds);

      if (this.parentReport.closingChildId) this.childrenReport.unshift(await this.reportsService.getChildReportById(this.parentReport.closingChildId));

      this.miniMapData = { location: this.parentReport.location, priority: this.parentReport.priority };

      this.filteredChildrenReport = [...this.childrenReport];
      this.childrenFields = this.getCumulativeChildrenFields(this.childrenReport);

      let operations: Inspection[] = await this.operationsService.getAllInspectionsByReportId(this.parentReport.id);
      this.operations = operations.sort((a: Inspection, b: Inspection) => a.date.getTime() - b.date.getTime());
    });

    effect(() => this.parentTagGroups = this.configService.parentTagGroupsSignal());
    effect(() => this.childTagGroups = this.configService.childTagGroupsSignal());
    effect(() => this.isReportFileMenuOpen = this.reportFileMenuService.isOpenSignal());

    effect(async () => {
      if (this.confirmDialogService.deleteChildReportSignal() !== true) return;

      const id: string | null = this.confirmDialogService.childReportToDelete;
      if (id) {
        await this.reportsService.deleteChildReportById(id);
      }

      this.resetConfirmDialog();
    });

    // effect(async () => {
    //   if (this.confirmDialogService.archiveReportSignal() !== true) return;

    //   const reportDb: any = {
    //     archived: true,
    //     archivingTime: Timestamp.now()
    //   }

    //   try {
    //     await this.reportsService.setReportById(this.parentReport.id, reportDb);
    //     this.snackbarService.createSnackbar('Segnalazione archiviata con successo.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Success);
    //     this.router.navigate(['/archivio']);
    //   } catch (error) {
    //     this.snackbarService.createSnackbar('Errore nell\'archiviazione della segnalazione.', SNACKBARTYPE.Closable, SNACKBAROUTCOME.Error);
    //   }

    //   this.confirmDialogService.archiveReportSignal.set(null);
    // });
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.reportsService.selectReport(this.id);
    }
  }

  // public archiveReportClick(): void {
    // this.archiveDialogService.parentReport = this.parentReport;

    // const div = document.createElement('div');
    // div.id = 'archive-dialog';
    // document.body.append(div);
    // const componentRef = createComponent(ArchiveDialogComponent, { hostElement: div, environmentInjector: this.applicationRef.injector });
    // this.applicationRef.attachView(componentRef.hostView);
    // componentRef.changeDetectorRef.detectChanges();
  //   this.confirmDialogService.parentReportToArchive = this.parentReport;
  //   this.confirmDialogService.createConfirm('Vuoi archiviare la segnalazione?', CONFIRMDIALOG.ArchiveReport);
  // }

  public filterChildReports(filter: ChildReportFiltersFormData) {
    this.filteredChildrenReport = [];

    if (filter.inspection) {
      this.filteredChildrenReport = this.filteredChildrenReport.concat(
        this.childrenReport.filter((report: ReportChild) =>
          !report.isClosed && (
            report.flowId === OPERATIONTYPE.InspectionHorizontal ||
            report.flowId === OPERATIONTYPE.InspectionVertical ||
            report.flowId === OPERATIONTYPE.Inspection ||
            report.flowId === OPERATIONTYPE.Maintenance
          )
        )
      );
    }

    if (filter.maintenance) {
      this.filteredChildrenReport = this.filteredChildrenReport.concat(
        this.childrenReport.filter((report: ReportChild) => report.isClosed)
      );
    }

    if (filter.other) {
      this.filteredChildrenReport = this.filteredChildrenReport.concat(
        this.childrenReport.filter((report: ReportChild) =>
          report.flowId !== OPERATIONTYPE.InspectionHorizontal && report.flowId !== OPERATIONTYPE.InspectionVertical && report.flowId !== OPERATIONTYPE.Inspection && report.flowId !== OPERATIONTYPE.Maintenance
        )
      );
    }

    this.filteredChildrenReport.sort((a, b) => b.creationTime.getTime() - a.creationTime.getTime())
  }

  private getCumulativeChildrenFields(reports: ReportChild[]): { [key: string]: string[] } {
    let fields: { [key: string]: string[] } = {};
  
    reports.forEach((report: ReportChild) => {
      for (const key in report.fields) {
        if (!fields[key]) {
          fields[key] = Array.isArray(report.fields[key]) ? [...report.fields[key]] : [];
        } else {
          if (Array.isArray(report.fields[key])) {
            report.fields[key].forEach((id: string) => {
              if (!fields[key].includes(id)) {
                fields[key].push(id);
              }
            });
          }
        }
      }
    });
  
    return fields;
  }

  public hasMatchingField(groupId: string): boolean {
    return Object.keys(this.parentReport.fields).some(key => key === groupId);
  }

  public getTags(groupId: string): string[] {
    const field: string[] = this.parentReport.fields[groupId];
    return field ? field : [];
  }

  public hasChildrenMatchingFields(groupId: string): boolean {
    return Object.keys(this.childrenFields).some(key => key === groupId);
  }

  public getChildrenTags(groupId: string): string[] {
    const field: string[] = this.childrenFields[groupId];
    return field ? field : [];
  }

  public toggleReportFileMenu(event: Event): void {
    event.stopPropagation();
    this.reportFileMenuService.isOpenSignal.set(!this.reportFileMenuService.isOpenSignal());
  }

  private resetConfirmDialog(): void {
    this.confirmDialogService.childReportToDelete = null;
    this.confirmDialogService.deleteChildReportSignal.set(null);
  }
}