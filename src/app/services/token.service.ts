import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() {}

  public saveToken(token : string): void {
    sessionStorage.setItem('IdUser', (token))
  }

  public saveRefreshToken(refreshToken : string): void {
    sessionStorage.setItem('refreshToken', refreshToken)
  }

  public getToken(): string|null {
   return sessionStorage.getItem('IdUser');
    }
    
    public getUserId():number{
      return parseInt(sessionStorage.getItem('IdUser')??"");
    }

  public getRefreshToken(): string|null {
    return sessionStorage.getItem('refreshToken');
  }

  public getApiKey(): string {
    const apiKey = sessionStorage.getItem('apiKey');
    if (!apiKey) {
      console.error('ApiKey non trouvée dans la session');
      return '';
    }
    return apiKey;
  }

  public saveApiKey(apiKey: string): void {
    sessionStorage.setItem('apiKey', apiKey);
  }
}
