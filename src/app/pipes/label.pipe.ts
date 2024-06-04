import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { WebAppConfigLabels } from '../models/config.model';

@Pipe({
  name: 'label',
  standalone: true
})
export class LabelPipe implements PipeTransform {
  private labels: WebAppConfigLabels = this.configService.config.labels;

  constructor(private configService: ConfigService) { }

  transform(value: string): string {
    return this.searchLabel(value, this.labels);
  }


  private searchLabel(value: string, object: any): string {
    let label: string = value;

    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        if (key === value) {        
          label = object[key];  
          return label;       
        }

        if (typeof object[key] === 'object') this.searchLabel(value, object[key]);
      }
    }
    
    return label;
  }
}