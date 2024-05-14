import { Component, effect } from '@angular/core';
import { AdditionalLayersService } from '../../../services/additional-layers.service';
import { AdditionalLayer } from '../../../models/additional-layer.model';
import { AdditionalLayersFormComponent } from '../additional-layers-form/additional-layers-form.component';
import { AdditionalLayerCheckboxComponent } from '../additional-layer-checkbox/additional-layer-checkbox.component';
import { AdditionalLayersMenuService } from '../../../observables/additional-layers-menu.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-additional-layers-menu',
  standalone: true,
  imports: [NgClass, AdditionalLayersFormComponent, AdditionalLayerCheckboxComponent],
  templateUrl: './additional-layers-menu.component.html',
  styleUrl: './additional-layers-menu.component.scss',
  animations: [
    trigger('openClose', [
      state('open', style({
        right: '10px'
      })),
      state('closed', style({
        right: '-384px'
      })),
      transition('closed => open', [
        animate('.2s ease-in-out')
      ]),
      transition('open => closed', [
        animate('.2s ease-in-out')
      ])
    ])
  ]
})
export class AdditionalLayersMenuComponent {
  public layers: AdditionalLayer[] = [];
  public isOpen: boolean = false;

  constructor(private additionalLayersService: AdditionalLayersService, private additionalLayersMenuService: AdditionalLayersMenuService) {
    effect(() => {
      if (this.additionalLayersService.layersSignal().length === 0) return;
      this.layers = this.additionalLayersService.layersSignal();
      console.log(this.layers);
    });

    effect(() => this.isOpen = this.additionalLayersMenuService.isOpenSignal());
  }

  public ngOnInit(): void {
    this.additionalLayersService.getAllAdditionalLayers();
  }
}