import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface StockItem {
  id: number;
  Label: string;
  Qt: number;
}

export interface StockHistory {
  date: Date;
  article: string;
  quantity: number;
  type: 'ajout' | 'retrait';
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getApiKey(): string {
    const apiKey = sessionStorage.getItem('apiKey') || '';
    console.log('API Key récupérée:', apiKey);
    return apiKey;
  }

  getAvailableItems(): Observable<any> {
    const apiKey = this.getApiKey();
    const body = { ApiKey: apiKey };
    return this.http.post(`${this.apiUrl}?route=stock/items/list.php`, body);
  }

  getHardwareTypes(): Observable<any> {
    const apiKey = this.getApiKey();
    const body = { ApiKey: apiKey };
    return this.http.post(`${this.apiUrl}?route=item/ListHardwareType`, body);
  }

  getItemsByHardwareType(typeId: string): Observable<any> {
    const apiKey = this.getApiKey();
    const body = {
      ApiKey: apiKey,
      IdHardwareType: typeId
    };
    return this.http.post(`${this.apiUrl}?route=item/ListByHardwareType`, body);
  }

  getStockByCar(vehicleId: number): Observable<any> {
    const apiKey = this.getApiKey();
    const body = {
      ApiKey: apiKey,
      IdCar: vehicleId
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/List`, body);
  }

  getHistoryByCar(vehicleId: number): Observable<any> {
    const apiKey = this.getApiKey();
    const body = {
      ApiKey: apiKey,
      IdCar: vehicleId
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/history`, body);
  }

  addItemToVehicleStock(idCar: number, idItem: number, quantity: number): Observable<any> {
    const apiKey = this.getApiKey();
    const body = {
      ApiKey: apiKey,
      IdCar: idCar,
      IdItem: idItem,
      Qt: quantity
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/AddItem`, body);
  }

  removeItemFromVehicleStock(idCar: number, idItem: number, quantity: number): Observable<any> {
    const apiKey = this.getApiKey();
    const body = {
      ApiKey: apiKey,
      IdCar: idCar,
      IdItem: idItem,
      Qt: quantity
    };
    return this.http.post(`${this.apiUrl}?route=stock/stockcar/removeitem`, body);
  }

  addItemToStockCar(idCar: number, idItem: number, quantity: number): Observable<any> {
    return this.addItemToVehicleStock(idCar, idItem, quantity);
  }
} 