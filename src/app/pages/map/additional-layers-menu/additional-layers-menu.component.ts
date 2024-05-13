import { Component, effect } from '@angular/core';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { AdditionalLayersFormComponent } from '../additional-layers-form/additional-layers-form.component';

@Component({
  selector: 'app-additional-layers-menu',
  standalone: true,
  imports: [AdditionalLayersFormComponent],
  templateUrl: './additional-layers-menu.component.html',
  styleUrl: './additional-layers-menu.component.scss'
})
export class AdditionalLayersMenuComponent {
  public layers: AdditionalLayer[] = [];

  constructor(private additionalLayersService: AdditionalLayersService) {

    effect(() => {
      if (this.additionalLayersService.layersSignal().length === 0) return;
      this.layers = this.additionalLayersService.layersSignal();
      console.log(this.layers);      
    })
  }

  public ngOnInit(): void {
    this.additionalLayersService.getAllGeoJSON();
  }
}