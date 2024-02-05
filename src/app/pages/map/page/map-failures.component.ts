import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Failure } from '../../../models/failure.model';
import { FailureDb, FailuresService } from '../../../services/failures.service';
import { DocumentData, QuerySnapshot } from 'firebase/firestore';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-map-failures',
  standalone: true,
  imports: [MapComponent, SidebarComponent],
  templateUrl: './map-failures.component.html',
  styleUrl: './map-failures.component.scss'
})
export class MapFailuresComponent {
  public allFailures: Failure[] = [];
  public geoJsonData: any;

  constructor(private failuresService: FailuresService, private mapService: MapService) { }

  async ngOnInit() {
    const allFailuresSnapshot: QuerySnapshot<DocumentData> = await this.failuresService.getAllFailures();
    this.allFailures = allFailuresSnapshot.docs.map((item: DocumentData) => {
      const failureDb: FailureDb = item['data']() as FailureDb;
      return this.failuresService.parseFailure(failureDb);
    });
    console.log(this.allFailures);

    this.geoJsonData = this.mapService.createGeoJson(this.allFailures);   
  }
}
