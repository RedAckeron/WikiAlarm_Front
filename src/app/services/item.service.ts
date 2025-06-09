import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Item {
  id: string;
  Name: string;
  Description: string | null;
  IdWork: string;
  IdHardwareType: string;
  AddBy: string;
  HardwareTypeName: string;
  WorkListName: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://ackeron.be/.api/WikiAlarm/?route=item/List';

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    const apiKey = sessionStorage.getItem('apiKey');
    return this.http.post<any>(this.apiUrl, { ApiKey: apiKey }).pipe(
      map(response => response.JsonResult.items)
    );
  }
} 