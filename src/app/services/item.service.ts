import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Item {
  Id: string;
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
  private apiUrl = environment.apiUrl + '?route=item/List';

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    const apiKey = sessionStorage.getItem('apiKey');
    return this.http.post<any>(this.apiUrl, { ApiKey: apiKey }).pipe(
      map(response => response.JsonResult.items)
    );
  }

  addItem(item: { Name: string; IdHardwareType: number; AddBy: number }): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey,
      Name: item.Name,
      IdHardwareType: item.IdHardwareType,
      AddBy: item.AddBy
    };
    return this.http.post(environment.apiUrl + '?route=item/Add', body);
  }

  getItemsByHardwareType(idHardwareType: string | number): Observable<Item[]> {
    const apiKey = sessionStorage.getItem('apiKey');
    return this.http.post<any>(environment.apiUrl + '?route=item/ListByHardwareType', {
      ApiKey: apiKey,
      IdHardwareType: idHardwareType.toString()
    }).pipe(
      map(response => {
        console.log('Réponse API ListByHardwareType:', response);
        if (response?.JsonResult && Array.isArray(response.JsonResult)) {
          return response.JsonResult;
        } else if (response?.JsonResult?.items && Array.isArray(response.JsonResult.items)) {
          return response.JsonResult.items;
        } else {
          console.error('Format de réponse inattendu:', response);
          return [];
        }
      })
    );
  }
} 