import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkTypeService {
  private apiUrl = 'http://85.201.40.87/.api/WikiAlarm/?route=WorkType/list';

  constructor(private http: HttpClient) {}

  getWorkTypes(apiKey: string): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, { ApiKey: apiKey }).pipe(
      map(response => response.JsonResult || [])
    );
  }
} 