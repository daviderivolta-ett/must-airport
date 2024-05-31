import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public deepClone<T>(obj: T): T {
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }
    if (obj && typeof obj === 'object') {
      const clone = Object.create(Object.getPrototypeOf(obj));      
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = this.deepClone((obj as any)[key]);
        }
      }
      return clone as T;
    }
    return obj;
  }
}
