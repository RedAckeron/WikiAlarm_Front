import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { delay } from 'rxjs/operators';

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

  private stockItems: StockItem[] = [
    { id: 1, Label: 'BS127N', Qt: 225 },
    { id: 2, Label: 'Ordinateur portable', Qt: 1 },
    { id: 3, Label: 'Ats 1500 Ip', Qt: 1 }
  ];

  private stockHistory: StockHistory[] = [
    { date: new Date('2023-06-19T23:35'), article: 'BS127N', quantity: 100, type: 'ajout' },
    { date: new Date('2023-06-19T21:38'), article: 'Ordinateur portable', quantity: 1, type: 'ajout' },
    { date: new Date('2023-06-19T21:30'), article: 'Ats 1500 Ip', quantity: 1, type: 'ajout' },
    { date: new Date('2023-06-19T21:07'), article: 'BS127N', quantity: 6, type: 'ajout' },
    { date: new Date('2023-06-19T21:07'), article: 'BS127N', quantity: 1, type: 'retrait' }
  ];

  constructor(private http: HttpClient) {}

  private getApiKey(): string {
    const apiKey = sessionStorage.getItem('apiKey') || '';
    console.log('API Key récupérée:', apiKey);
    return apiKey;
  }

  getAvailableItems(): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey
    };
    return this.http.post(`${this.apiUrl}?route=stock/items/list.php`, body);
  }

  getStockByCar(carId: string | number): Observable<any> {
    const url = `${this.apiUrl}/?route=stock/stockcar/List`;
    const body = {
      ApiKey: this.getApiKey(),
      IdCar: typeof carId === 'string' ? parseInt(carId) : carId
    };
    console.log('Appel API getStockByCar:', { url, body });
    return this.http.post(url, body);
  }

  addItemToStockCar(carId: string, itemId: string, quantity: number): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      IdCar: carId,
      IdItem: itemId,
      Qt: quantity,
      Remarque: ""
    };
    
    console.log('Requête addItemToStockCar:', {
      url: `${this.apiUrl}?route=stock/stockcar/AddItem`,
      body: body,
      apiKey: this.getApiKey()
    });

    return this.http.post(`${this.apiUrl}?route=stock/stockcar/AddItem`, body);
  }

  getHistoryByCar(carId: string): Observable<any> {
    const url = `${this.apiUrl}/?route=stock/stockcar/History`;
    const body = {
      ApiKey: this.getApiKey(),
      IdCar: parseInt(carId)
    };
    console.log('Appel API getHistoryByCar:', { url, body });
    return this.http.post(url, body);
  }

  removeItemFromStockCar(carId: string, itemId: string, quantity: number, client: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}?route=stock/car/remove`, {
      ApiKey: this.getApiKey(),
      IdCar: carId,
      IdItem: itemId,
      Quantity: quantity,
      Client: client,
      Notes: notes || ''
    });
  }

  public getStockItems(): Observable<StockItem[]> {
    return of(this.stockItems).pipe(delay(500));
  }

  public getStockHistory(): Observable<StockHistory[]> {
    return of(this.stockHistory).pipe(delay(500));
  }

  public getStockItem(id: number): Observable<StockItem | undefined> {
    const item = this.stockItems.find(item => item.id === id);
    return of(item).pipe(delay(500));
  }

  public addStockItem(item: StockItem): Observable<void> {
    this.stockItems.push(item);
    this.stockHistory.unshift({
      date: new Date(),
      article: item.Label,
      quantity: item.Qt,
      type: 'ajout'
    });
    return of(void 0).pipe(delay(500));
  }

  public removeStockItem(id: number, quantity: number, client: string): Observable<void> {
    const item = this.stockItems.find(item => item.id === id);
    if (item) {
      item.Qt -= quantity;
      this.stockHistory.unshift({
        date: new Date(),
        article: item.Label,
        quantity: quantity,
        type: 'retrait'
      });
    }
    return of(void 0).pipe(delay(500));
  }

  getHardwareTypes(): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey
    };
    return this.http.post(`${this.apiUrl}?route=item/ListHardwareType`, body);
  }

  getItemsByHardwareType(typeId: string): Observable<any> {
    const apiKey = sessionStorage.getItem('apiKey');
    const body = {
      ApiKey: apiKey,
      IdHardwareType: typeId
    };
    return this.http.post(`${this.apiUrl}?route=item/ListByHardwareType`, body);
  }

  public addItemToVehicleStock(idCar: number, idItem: number, quantity: number): Observable<any> {
    const url = `${this.apiUrl}?route=stock/stockcar/AddItem`;
    const body = {
      ApiKey: this.getApiKey(),
      IdCar: idCar.toString(),
      IdItem: idItem.toString(),
      Qt: quantity,
      Remarque: ""
    };
    console.log('Appel API addItemToVehicleStock:', { url, body });
    return this.http.post(url, body);
  }

  public removeItemFromVehicleStock(idCar: string | number, idItem: string | number, quantity: number, remarque: string): Observable<any> {
    const url = `${this.apiUrl}?route=stock/stockcar/RemoveItem`;
    const body = {
      ApiKey: this.getApiKey(),
      IdCar: typeof idCar === 'string' ? parseInt(idCar) : idCar,
      IdItem: typeof idItem === 'string' ? parseInt(idItem) : idItem,
      Qt: quantity,
      Remarque: remarque
    };
    console.log('Appel API removeItemFromVehicleStock:', { url, body });
    return this.http.post(url, body);
  }
} 