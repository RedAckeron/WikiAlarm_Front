import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorkChapitreService {
  private apiUrl = 'http://85.201.40.87/.api/WikiAlarm/index.php?route=WorkTypeChapitre/list';

  constructor(private http: HttpClient) {}

  getChapitres(apiKey: string, idWork: number): Observable<any> {
    return this.http.post<any>(this.apiUrl, { ApiKey: apiKey, IdWork: idWork });
  }
} 