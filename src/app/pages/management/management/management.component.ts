import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportParent } from '../../../models/report-parent.model';
import { ReportChild } from '../../../models/report-child.model';
import { FormsModule } from '@angular/forms';
import { TechElementTag } from '../../../models/tech-element-tag.model';
import { DictionaryService } from '../../../services/dictionary.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss'
})
export class ManagementComponent {
  @Input() public techElementTags: TechElementTag[] = [];
  public id: string | null = null;
  public parentReport: ReportParent = ReportParent.createEmpty();
  public childrenReport: ReportChild[] = [];

  constructor(private route: ActivatedRoute, private dictionaryService: DictionaryService) { }

  async ngOnInit(): Promise<void> {
    await this.dictionaryService.getAll();
    this.id = this.route.snapshot.paramMap.get('id');
    this.parentReport = history.state.parentReport;
    this.childrenReport = history.state.childrenReport;    
    // console.log(this.id);
    console.log(this.parentReport);
    this.techElementTags = this.dictionaryService.techElementTags;
    console.log(this.techElementTags);
    // console.log(this.childrenReport);
  }
}
