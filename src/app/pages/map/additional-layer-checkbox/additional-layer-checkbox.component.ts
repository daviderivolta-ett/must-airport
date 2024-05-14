import { Component, Input } from '@angular/core';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { VERTICAL } from '../../../models/app-flow.model';

@Component({
  selector: 'app-additional-layer-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './additional-layer-checkbox.component.html',
  styleUrl: './additional-layer-checkbox.component.scss'
})
export class AdditionalLayerCheckboxComponent {
  @Input() public set layer(value: AdditionalLayer) {
    this._layer = value;
  }

  public get layer(): AdditionalLayer {
    return this._layer;
  }

  private _layer: AdditionalLayer = new AdditionalLayer('', '', VERTICAL.Default, '', null);
}
