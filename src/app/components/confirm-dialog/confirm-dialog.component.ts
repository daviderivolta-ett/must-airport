import { Component, ElementRef, Input } from '@angular/core';
import { ReportChild } from '../../models/report-child.model';
import { ConfirmDialogService } from '../../observables/confirm-dialog.service';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  public host: HTMLElement | null = document.querySelector('#confirm-dialog');
  public childReport: ReportChild = ReportChild.createEmpty();

  constructor(private el: ElementRef, private confirmDialogService: ConfirmDialogService, private reportsService: ReportsService) {
    this.childReport = this.confirmDialogService.childReport;
  }

  public async confirm(): Promise<void> {
    // this.childReport.detailPics.forEach(url => {
    //   let imgRef = this.reportsService.getImageReference(url);
    //   this.reportsService.deleteImage(imgRef);
    // });
    
    // let parentReport = await this.reportsService.getParentReportById(this.childReport.parentId);
    // parentReport.childrenIds = parentReport.childrenIds.filter(id => id !== this.childReport.id);
    // this.reportsService.setReportById(this.childReport.parentId, parentReport);
    // this.reportsService.deleteChildReportBydId(this.childReport.id);
    await this.reportsService.deleteChildReportBydId(this.childReport.id);
    this.close();
  }

  public cancel(): void {
    this.close();
  }

  public close(): void {
    this.host?.remove();
  }
}