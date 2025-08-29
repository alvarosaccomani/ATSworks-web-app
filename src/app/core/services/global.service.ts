import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  public url: string;

  constructor() {
    this.url = 'http://localhost:3001/api/';
  }
}
