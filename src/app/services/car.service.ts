import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class CarService {
  private apiUrl = environment.apiUrl + '?route=car/list';

  constructor(private http: HttpClient) {}

  private getApiKey(): string {
    return sessionStorage.getItem('apiKey') || '';
  }

  getCars(): Observable<any> {
    const body = {
      ApiKey: this.getApiKey()
    };
    
    return this.http.post<any>(this.apiUrl, body);
  }

  getCarById(id: string): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      id: id
    };
    
    return this.http.post<any>(environment.apiUrl + '?route=car/get', body);
  }

  assignCarToUser(carId: string, userId: string): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      carId: carId,
      userId: userId
    };
    
    return this.http.post<any>(environment.apiUrl + '?route=car/assign', body);
  }

  updateCar(car: any): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      ...car
    };
    
    return this.http.post<any>(environment.apiUrl + '?route=car/update', body);
  }

  addCar(car: any): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      ...car
    };
    
    return this.http.post<any>(environment.apiUrl + '?route=car/create', body);
  }

  getCarsByUser(userId: string): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      IdUserOwner: userId
    };
    return this.http.post<any>(environment.apiUrl + '?route=car/ListByUser', body);
  }
} 