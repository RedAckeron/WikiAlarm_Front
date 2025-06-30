import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';

interface ApiResponse {
  Status: number;
  Message: string;
  JsonResult: any[];
  ErrorMessage?: string;
}

interface CarApiResponse {
  Route: string;
  Status: number;
  jsonRequest: {
    ApiKey: string;
    IdUserOwner: number;
  };
  jsonResult: Vehicle[];
}

interface Vehicle {
  Id: number;
  Marque: string;
  MarqueModele: string;
  Immatriculation: string;
  Km: number;
  IdUserOwner: number;
  IsActive: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  public getApiKey(): string {
    const apiKey = sessionStorage.getItem('apiKey');
    if (!apiKey) {
      throw new Error('ApiKey non trouvée dans la session');
    }
    return apiKey;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'ApiKey': this.getApiKey()
    });
  }

  private isAdmin(): boolean {
    return sessionStorage.getItem('userRole') === 'Admin';
  }

  getCars(): Observable<ApiResponse> {
    const apiKey = this.getApiKey();
    const body = {
      "ApiKey": apiKey
    };

    console.log('Appel API getCars avec body:', body);

    // Si c'est un admin, on utilise car/list pour voir tous les véhicules
    if (this.isAdmin()) {
      return this.http.post<ApiResponse>(`${this.apiUrl}?route=car/list`, body).pipe(
        tap(response => {
          console.log('Réponse API brute:', response);
          console.log('Status de la réponse:', response?.Status);
          console.log('JsonResult:', response?.JsonResult);
        })
      );
    }
    
    // Sinon on utilise car/ListByUser pour voir uniquement les véhicules de l'utilisateur
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      throw new Error('UserId non trouvé dans la session');
    }

    const userBody = {
      "ApiKey": apiKey,
      "IdUserOwner": userId
    };
    
    console.log('Appel API getCars (User) avec body:', userBody);
    return this.http.post<ApiResponse>(`${this.apiUrl}?route=car/ListByUser`, userBody).pipe(
      tap(response => console.log('Réponse API getCars (User):', response))
    );
  }

  getCarById(id: string): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      id: id
    };
    return this.http.post(`${this.apiUrl}?route=car/get`, body);
  }

  assignCar(carId: number, userId: number | null): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      Id: carId,
      IdUserOwner: userId
    };
    console.log('Appel API assignCar avec body:', body);
    return this.http.post(`${this.apiUrl}?route=car/update`, body).pipe(
      tap(response => console.log('Réponse API assignCar:', response))
    );
  }

  updateCar(car: any): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      ...car
    };
    console.log('Appel API updateCar avec body:', body);
    return this.http.post(`${this.apiUrl}?route=car/update`, body).pipe(
      tap(response => console.log('Réponse API updateCar:', response))
    );
  }

  createCar(carData: any): Observable<any> {
    console.log('Appel API createCar avec body:', carData);
    return this.http.post<any>(`${this.apiUrl}?route=car/create`, carData).pipe(
      tap(response => {
        console.log('Réponse API createCar:', response);
      })
    );
  }

  deleteCar(carId: number): Observable<any> {
    const body = {
      ApiKey: this.getApiKey(),
      Id: carId
    };
    console.log('Appel API deleteCar avec body:', body);
    return this.http.post(`${this.apiUrl}?route=car/delete`, body).pipe(
      tap(response => console.log('Réponse API deleteCar:', response))
    );
  }

  getCarsByUser(userId: string): Observable<CarApiResponse> {
    const body = {
      ApiKey: this.getApiKey(),
      IdUserOwner: parseInt(userId, 10)  // L'API attend un nombre, pas une chaîne
    };
    console.log('Appel API getCarsByUser avec body:', body);
    return this.http.post<CarApiResponse>(`${this.apiUrl}?route=car/ListByUser`, body).pipe(
      tap(response => {
        console.log('Réponse API getCarsByUser:', response);
        if (response?.jsonResult && Array.isArray(response.jsonResult)) {
          console.log('Véhicules trouvés:', response.jsonResult.length);
        }
      })
    );
  }
} 