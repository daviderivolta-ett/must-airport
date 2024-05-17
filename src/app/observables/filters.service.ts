import { Injectable } from '@angular/core';
import { FiltersFormData } from '../services/reports.service';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  public filtersLastState: FiltersFormData = {
      closed: true,
      notAssigned: true,
      low: true,
      medium: true,
      high: true,
      initialDate: null,
      endingDate: null
  };

  constructor() { }
}
