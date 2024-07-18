import { Pipe, PipeTransform, effect } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { StatusDetail } from '../models/priority.model';

@Pipe({
  name: 'statusOrder',
  standalone: true
})
export class StatusOrderPipe implements PipeTransform {
  private labels: { [key: string]: StatusDetail } = {};

  constructor(private configService: ConfigService) {
    effect(() => this.labels = this.configService.config.labels.priority);
  }

  transform(order: number): string {
    let label: string = '';

    for (const key in this.labels) {
      if (Object.prototype.hasOwnProperty.call(this.labels, key)) {
        if (this.labels[key].order === order) {
          label = this.labels[key].displayName;
          break;
        }
      }
    }
    
    return label;
  }
}