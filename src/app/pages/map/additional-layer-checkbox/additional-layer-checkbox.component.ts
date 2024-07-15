import { Component, Input } from '@angular/core';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { VERTICAL } from '../../../models/vertical.model';
import { FormsModule } from '@angular/forms';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { SnackbarService } from '../../../observables/snackbar.service';
import { SNACKBAROUTCOME, SNACKBARTYPE } from '../../../models/snackbar.model';

@Component({
  selector: 'app-additional-layer-checkbox',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './additional-layer-checkbox.component.html',
  styleUrl: './additional-layer-checkbox.component.scss'
})
export class AdditionalLayerCheckboxComponent {
  public isChecked: boolean = false;
  private _layer: AdditionalLayer = new AdditionalLayer();
  public get layer(): AdditionalLayer {
    return this._layer;
  }
  @Input() public set layer(value: AdditionalLayer) {
    this._layer = value;
  }

  constructor(
    private additionalLayersService: AdditionalLayersService,
    private snackbarService: SnackbarService
  ) { }

  public handleCheckbox(): void {
    this.isChecked ? this.additionalLayersService.addAdditionalLayer(this.layer) : this.additionalLayersService.removeAdditionalLayer(this.layer);
  }

  public deleteLayer(layer: AdditionalLayer): void {
    try {
      this.additionalLayersService.deleteGeoJSON(layer);
      this.additionalLayersService.deleteAdditionalLayer(layer.id);
      this.snackbarService.createSnackbar('Layer cancellato correttamente', SNACKBARTYPE.Loader, SNACKBAROUTCOME.Success);
    } catch (error: any) {
      if (error instanceof Error) {
        this.snackbarService.createSnackbar(error.message, SNACKBARTYPE.Loader, SNACKBAROUTCOME.Error);
      } else {
        this.snackbarService.createSnackbar('Si è verificato un errore sconosciuto', SNACKBARTYPE.Loader, SNACKBAROUTCOME.Error);
      }
    }
  }
}
