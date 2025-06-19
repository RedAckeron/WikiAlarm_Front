import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStockByCar(carId: number): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey,
      IdCar: carId
    };

    return this.http.post(`${this.apiUrl}?route=stock/stockcar/showstockcar`, body);
  }

  addItemToStockCar(carId: number, itemId: number, quantity: number): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey,
      IdCar: carId,
      IdItem: itemId,
      Qt: quantity
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/AddItem`, body);
  }

  getHistoryByCar(carId: number): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey,
      IdCar: carId
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/HistoryByCar`, body);
  }

  removeItemFromStockCar(carId: string, itemId: string, quantity: number, clientName: string, remarque: string = ''): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey,
      IdCar: carId,
      IdItem: itemId,
      Qt: quantity,
      ClientName: clientName,
      Remarque: remarque
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/RemoveItem`, body);
  }
} 