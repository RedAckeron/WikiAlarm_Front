import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Odp, OdpLight } from '../models/Odp';

@Injectable({
  providedIn: 'root'
})
export class OdpService
    {
    private _url: string = "https://localhost:7266/Odp/";
    constructor(private _httpClient: HttpClient) {}




    AddOdp(IdUser:number,IdCust:Number):Observable<Number>
        {
          return this._httpClient.post<Number>(this._url + "Create",{AddByUser:IdUser,IdCustomer:IdCust});
        }

    ReadAllCstOdpLight(IdCust: number):Observable<OdpLight[]>
        {
        return this._httpClient.get<OdpLight[]>(this._url + "ReadAllCstOdpLight/" + IdCust);
        }

    ReadLastOdpLight():Observable<OdpLight[]>
        {
          return this._httpClient.get<OdpLight[]>(this._url+"ReadLastOdpLight");
        }
    
    }
