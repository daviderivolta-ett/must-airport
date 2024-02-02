import { Component } from '@angular/core';
import { FailureDb, FailuresService } from '../../../services/failures.service';
import { QuerySnapshot, DocumentData } from 'firebase/firestore';
import { Failure } from '../../../models/failure.model';

@Component({
  selector: 'app-sidebar-content',
  standalone: true,
  imports: [],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss'
})
export class SidebarContentComponent {
  public allFailures: Failure[] = [];

  constructor(private failuresService: FailuresService) { }

  async ngOnInit() {
    const allFailuresSnapshot: QuerySnapshot<DocumentData> = await this.failuresService.getAllFailures();
    const allFailures = allFailuresSnapshot.docs.map((item: DocumentData) => {
      const failureDb: FailureDb = item['data']() as FailureDb;
      return this.failuresService.parseFailure(failureDb);
    });
    console.log(allFailures);
  }
}
