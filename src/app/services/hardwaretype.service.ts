import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface HardwareType {
  Id: number;
  Name: string;
  Description: string | null;
  ItemCount?: number;
}

@Injectable({ providedIn: 'root' })
export class HardwareTypeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getApiKey(): string {
    return sessionStorage.getItem('apiKey') || '';
  }

  listHardwareTypes(): Observable<HardwareType[]> {
    return this.http.post<any>(`${this.apiUrl}?route=hardwaretype/list`, { ApiKey: this.getApiKey() })
      .pipe(map(res => (res.JsonResult as any[]).map(t => ({
        ...t,
        Id: t.Id ?? t.id
      }))));
  }

  createHardwareType(name: string, description?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?route=hardwaretype/create`, {
      ApiKey: this.getApiKey(),
      Name: name,
      Description: description || ''
    });
  }
} 