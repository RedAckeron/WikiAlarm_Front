import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _CurrentCustomerSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  get CurrentCustomer(): BehaviorSubject<number> {
    return this._CurrentCustomerSubject;
  }

  constructor(private _httpClient: HttpClient) { }

  SetCurrentCustomer(CurrentCustomer: number): void {
    sessionStorage.setItem("CurrentCustomer", CurrentCustomer.toString())
    this._CurrentCustomerSubject.next(CurrentCustomer);
  }

  GetCurrentCustomer(): number {
    let value = sessionStorage.getItem("CurrentCustomer");
    return parseInt(value ?? "");
  }

  getApiKey(): string {
    return sessionStorage.getItem('apiKey') || '';
  }

  // Récupérer un utilisateur par son ID avec la bonne URL et POST + JSON
  GetById(id: number): Observable<any> {
    const ApiKey = this.getApiKey();
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/get', { ApiKey, id });
  }

  // Mettre à jour un utilisateur selon l'API WikiAlarm
  Update(id: number, userData: any): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      id: id,
      ...userData
    };
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/update', body);
  }

  // Désactiver un utilisateur
  Deactivate(id: number): Observable<any> {
    const ApiKey = this.getApiKey();
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/deactivate', { ApiKey, id });
  }

  // Récupérer la liste des utilisateurs
  GetAll(): Observable<any> {
    const body = {
      ApiKey: this.getApiKey()
    };
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/list', body);
  }

  // Vérifie (et crée si besoin) un utilisateur WikiAlarm
  checkOrCreateUser(userId: number, email?: string, name?: string): Observable<any> {
    return this._httpClient.post<any>(
      environment.apiUrl + '?route=user/get',
      { id: userId, email, name }
    );
  }

  getUsers(): Observable<any> {
    const body = {
      ApiKey: this.getApiKey()
    };
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/list', body);
  }

  // Méthodes basiques pour ne pas casser l'interface
  createUser(userData: any): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      ...userData
    };
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/create', body);
  }

  updateUser(userId: number, userData: any): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      id: userId,
      ...userData
    };
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/update', body).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  deleteUser(userId: number): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      id: userId
    };
    return this._httpClient.post<any>(environment.apiUrl + '?route=user/delete', body);
  }
}
