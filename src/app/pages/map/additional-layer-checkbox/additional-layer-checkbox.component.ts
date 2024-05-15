import { Component, Input } from '@angular/core';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { VERTICAL } from '../../../models/app-flow.model';
import { FormsModule } from '@angular/forms';
import { AdditionalLayersService } from '../../../services/additional-layers.service';

@Component({
  selector: 'app-additional-layer-checkbox',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './additional-layer-checkbox.component.html',
  styleUrl: './additional-layer-checkbox.component.scss'
})
export class AdditionalLayerCheckboxComponent {
  public isChecked: boolean = false;

  @Input() public set layer(value: AdditionalLayer) {
    this._layer = value;
  }

  public get layer(): AdditionalLayer {
    return this._layer;
  }

  private _layer: AdditionalLayer = AdditionalLayer.createEmpty();

  constructor(private additionalLayersService: AdditionalLayersService) { }

  public handleCheckbox(): void {
    this.isChecked ? this.additionalLayersService.addAdditionalLayer(this.layer) : this.additionalLayersService.removeAdditionalLayer(this.layer);
  }
}
