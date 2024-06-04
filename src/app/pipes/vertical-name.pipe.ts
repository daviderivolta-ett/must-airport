import { Pipe, PipeTransform } from '@angular/core';
import { VERTICAL, verticalLabels } from '../models/vertical.model';

@Pipe({
  name: 'verticalName',
  standalone: true
})
export class VerticalNamePipe implements PipeTransform {
  private verticals: Map<VERTICAL, string> = verticalLabels;

  constructor() { }

  transform(value: VERTICAL): string {    
    const name: string | undefined = this.verticals.get(value);
    return name ? name : value;
  }
}